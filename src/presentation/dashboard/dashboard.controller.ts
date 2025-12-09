import { Between, MoreThanOrEqual } from "typeorm";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Usuario, UserRole } from "../../data/model/Usuario"; 
import { Lugar } from "../../data/model/Lugar";
import { Itinerario } from "../../data/model/Itinerario";
import { Reporte } from "../../data/model/Reporte";

export class DashboardController {

    async getAdminStats() {
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const userRepo = PostgresDataSource.getRepository(Usuario);
        const lugarRepo = PostgresDataSource.getRepository(Lugar);
        const itinerarioRepo = PostgresDataSource.getRepository(Itinerario);
        const reporteRepo = PostgresDataSource.getRepository(Reporte);
        const totalViajeros = await userRepo.count({
            where: { role: UserRole.USER } 
        });
        const nuevosEsteMes = await userRepo.count({
            where: {
                role: UserRole.USER,
                createdAt: MoreThanOrEqual(firstDayCurrentMonth) 
            }
        });
        const nuevosMesPasado = await userRepo.count({
            where: {
                role: UserRole.USER,
                createdAt: Between(firstDayLastMonth, firstDayCurrentMonth)
            }
        });
        let crecimientoPorcentaje = 0;
        
        if (nuevosMesPasado > 0) {
            crecimientoPorcentaje = ((nuevosEsteMes - nuevosMesPasado) / nuevosMesPasado) * 100;
        } else if (nuevosEsteMes > 0) {
            crecimientoPorcentaje = 100; 
        }
        const totalLugares = await lugarRepo.count();
        const totalItinerarios = await itinerarioRepo.count();
        const reportesPendientes = await reporteRepo.count(); 
        return {
            usuarios: {
                total: totalViajeros,
                nuevosEsteMes: nuevosEsteMes, 
                crecimiento: `${crecimientoPorcentaje.toFixed(2)}%` 
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