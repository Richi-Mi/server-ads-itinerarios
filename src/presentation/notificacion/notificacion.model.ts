import { t } from "elysia";
import { NotificationType } from "../../data/model";

export namespace NotificacionModel {
  export const CrearNotificacion = t.Object({
    usuarioDestino: t.String({
      error: "El ID del usuario destino es requerido",
    }),
    usuarioOrigen: t.String({
      error: "El correo del usuario origen es requerido",
    }),
    tipo: t.Enum(NotificationType, {
      error: "El tipo de notificación no es válido",
    }),
    mensaje: t.String({ error: "El mensaje es requerido" }),
    referenciaId: t.Numeric({ error: "El ID de referencia es requerido" }),
    leido: t.Boolean({ default: false }),
  });
}
