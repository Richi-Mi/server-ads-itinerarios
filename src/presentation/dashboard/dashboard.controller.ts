import { Between, MoreThanOrEqual } from "typeorm";
import { PostgresDataSource } from "../../data/PostgresDataSource"; // Ajuste de ruta basado en tus carpetas
import { Usuario, UserRole } from "../../data/model/Usuario";       // Ajuste de ruta
import { Lugar } from "../../data/model/Lugar";
import { Itinerario } from "../../data/model/Itinerario";
import { Reporte } from "../../data/model/Reporte";

export class DashboardController {

    async getAdminStats() {
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Repositorios
        const userRepo = PostgresDataSource.getRepository(Usuario);
        const lugarRepo = PostgresDataSource.getRepository(Lugar);
        const itinerarioRepo = PostgresDataSource.getRepository(Itinerario);
        const reporteRepo = PostgresDataSource.getRepository(Reporte);

        // 1. Datos de Usuarios (Viajeros)
        const totalViajeros = await userRepo.count({
            where: { role: UserRole.USER } 
        });

        // Usuarios creados este mes (Usando tu nueva columna createdAt)
        const nuevosEsteMes = await userRepo.count({
            where: {
                role: UserRole.USER,
                createdAt: MoreThanOrEqual(firstDayCurrentMonth)
            }
        });

        // Usuarios creados el mes PASADO
        const nuevosMesPasado = await userRepo.count({
            where: {
                role: UserRole.USER,
                createdAt: Between(firstDayLastMonth, firstDayCurrentMonth)
            }
        });

        // Cálculo Matemático de Crecimiento
        let crecimientoPorcentaje = 0;
        
        if (nuevosMesPasado > 0) {
            crecimientoPorcentaje = ((nuevosEsteMes - nuevosMesPasado) / nuevosMesPasado) * 100;
        } else if (nuevosEsteMes > 0) {
            crecimientoPorcentaje = 100; 
        }

        // 2. Conteo de Lugares
        const totalLugares = await lugarRepo.count();

        // 3. Métricas adicionales
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