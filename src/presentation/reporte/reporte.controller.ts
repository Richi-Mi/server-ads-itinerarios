import { Reporte } from "../../data/model/Reporte";
import { PostgresDataSource } from "../../data/PostgresDataSource";

export class ReporteController {
    constructor(
        private readonly reporteRepository = PostgresDataSource.getRepository(Reporte)
    ) {

    }

    async create(payload: { description: string, entity_id: string }, userCorreo: string) {
        const reporte = this.reporteRepository.create({
            description: payload.description,
            entity_id: payload.entity_id,
            usuario_emitente: { correo: userCorreo } as any
        } as any);
        return await this.reporteRepository.save(reporte);
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