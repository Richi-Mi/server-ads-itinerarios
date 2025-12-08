import { History, Publicacion } from "../../data/model";
import { Reporte } from "../../data/model/Reporte";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { CustomError } from "../../domain/CustomError";

export class ReporteController {
    constructor(
        private readonly reporteRepository = PostgresDataSource.getRepository(Reporte),
        private readonly publicacionRepository = PostgresDataSource.getRepository(Publicacion),
        private readonly historialRepository = PostgresDataSource.getRepository(History)
    ) {}

    async create(payload: { description: string, entity_id: number }, userCorreo: string) {
        const reporte = new Reporte();

        reporte.description = payload.description;
        const publicacion = await this.publicacionRepository.findOneBy({ id: payload.entity_id });
        
        if( !publicacion ) 
            throw new CustomError("Publicacion no encontrada", 404);

        reporte.publicacion = publicacion;
        reporte.usuario_emitente = { correo: userCorreo } as any;

        const historial = new History();
        historial.action_description = `Reporte creado por ${userCorreo} para la publicacion con id ${publicacion.id} dice qué : ${payload.description}`;
        historial.reporte = reporte;

        const [creationResult] = await Promise.all([
            this.reporteRepository.save(reporte),
            this.historialRepository.save(historial)
        ])
        
        return creationResult;
    }

    async getAll() {
        return await this.reporteRepository.find({ relations: ["usuario_emitente", "historial"] });
    }

    async getById(id: number) {
        return await this.reporteRepository.findOne({ where: { id }, relations: ["usuario_emitente", "historial"] });
    }

    async update(id: number, payload: Partial<{ description: string, entity_id: string }>) {
        const repo = this.reporteRepository;
        const existing = await repo.findOneBy({ id } as any);
        if (!existing) return null;
        const merged = Object.assign(existing, payload);
        return await repo.save(merged as any);
    }

    async delete(id: number) {
        return await this.reporteRepository.delete(id);
    }
}