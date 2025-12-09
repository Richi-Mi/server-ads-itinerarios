import { Notificacion, NotificationType, Usuario } from "../../data/model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { CustomError } from "../../domain/CustomError";
import { Repository } from "typeorm";

import { notificarUsuario } from "../../sockets/socketHandler";
import { NotificacionModel } from "./notificacion.model";

export class NotificacionController {
  constructor(
    private notificacionRepository: Repository<Notificacion>,
    private userRepository: Repository<Usuario>
  ) {}

  async listNotificacion(correo: string) {
    const listN = await this.notificacionRepository.find({
      where: {
        receptor: { correo },
      },
      relations: ["emisor"],
      order: {
        createdAt: "DESC",
      },
    });
    return listN;
  }
  async markAsRead(id: number, correo: string) {
    const notificacion = await this.notificacionRepository.findOne({
      where: {
        id,
        receptor: { correo },
      },
    });
    if (!notificacion) {
      throw new CustomError("Notificación no encontrada", 404);
    }
    notificacion.isRead = true;
    await this.notificacionRepository.save(notificacion);
    return notificacion;
  }
  async crear(datos: typeof NotificacionModel.CrearNotificacion.static) {
    const { usuarioOrigen, usuarioDestino, tipo, mensaje, referenciaId } =
      datos;

    // 1. Buscar el usuario que envía la notificación (emisor) por su correo
    const emisor = await this.userRepository.findOneBy({
      correo: usuarioOrigen,
    });
    if (!emisor) {
      throw new CustomError(
        `Usuario origen no encontrado: ${usuarioOrigen}`,
        404
      );
    }

    // 2. Buscar el usuario que recibe la notificación (receptor) por su ID
    const receptor = await this.userRepository.findOneBy({
      correo: usuarioDestino,
    });
    if (!receptor) {
      throw new CustomError(
        `Usuario destino no encontrado: ${usuarioDestino}`,
        404
      );
    }

    // 3. Crear la nueva instancia de Notificacion
    const nuevaNotificacion = this.notificacionRepository.create({
      emisor: emisor,
      receptor: receptor,
      type: tipo,
      previewText: mensaje,
      resourceId: referenciaId, // Asumiendo que referenceId en el modelo es string
      isRead: false,
    });

    // 4. Notificar al usuario en tiempo real vía WebSocket
    notificarUsuario(receptor.correo, nuevaNotificacion);

    // 4. Guardar en la base de datos y retornar
    return await this.notificacionRepository.save(nuevaNotificacion);
  }
}
