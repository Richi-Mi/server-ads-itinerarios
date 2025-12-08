import { Between, MoreThanOrEqual } from "typeorm";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Usuario, UserRole } from "../../data/model/Usuario"; 
import { Lugar } from "../../data/model/Lugar";
import { Itinerario } from "../../data/model/Itinerario";
import { Reporte } from "../../data/model/Reporte";

export class DashboardController {

    async getAdminStats() {
        
        const userRepo = PostgresDataSource.getRepository(Usuario);
        const lugarRepo = PostgresDataSource.getRepository(Lugar);
        const itinerarioRepo = PostgresDataSource.getRepository(Itinerario);
        const reporteRepo = PostgresDataSource.getRepository(Reporte);
        const totalViajeros = await userRepo.count({
            where: { role: UserRole.USER } 
        });
        const crecimientoPorcentaje = 0; 
        const nuevosEsteMes = 0;
        const totalLugares = await lugarRepo.count();
        const totalItinerarios = await itinerarioRepo.count();
        const reportesPendientes = await reporteRepo.count();

        return {
            usuarios: {
                total: totalViajeros,
                nuevosEsteMes: nuevosEsteMes, // Se enviará 0
                crecimiento: `${crecimientoPorcentaje}%` // Se enviará "0%"
            },
            metricasGenerales: {
                totalLugares: totalLugares,
                totalItinerarios: totalItinerarios,
                reportesPendientes: reportesPendientes
            },
            timestamp: new Date().toISOString()
        };
    }
}