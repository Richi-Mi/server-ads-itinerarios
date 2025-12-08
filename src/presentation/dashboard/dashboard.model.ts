import { t } from "elysia";

export const DashboardModel = {
    statsResponse: t.Object({
        usuarios: t.Object({
            total: t.Numeric(),
            nuevosEsteMes: t.Numeric(),
            crecimiento: t.String() // Lo enviamos como string "15%" o numero, usaremos string para facilitar formato
        }),
        metricasGenerales: t.Object({
            totalLugares: t.Numeric(),
            totalItinerarios: t.Numeric(),
            reportesPendientes: t.Numeric() // Dato vital para admin
        }),
        timestamp: t.String() // Fecha de corte
    })
};