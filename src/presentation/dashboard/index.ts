import Elysia from "elysia";
import { DashboardController } from "./dashboard.controller";
import { DashboardModel } from "./dashboard.model";
import { authService } from "../services/auth.service"; 
import { CustomError } from "../../domain/CustomError"; 

export const dashboardRoutes = new Elysia({ prefix: "/admin/dashboard", name: "Dashboard" })
    .decorate('dashboardController', new DashboardController())
    .use(authService) 
    
    .get("/stats", async ({ store, dashboardController, status }) => {
       
        if (store.user.role !== "admin") { 
            throw new CustomError("Acceso denegado", 403);
        }

        const stats = await dashboardController.getAdminStats();
        return status(200, stats);
    }, {
        response: {
            200: DashboardModel.statsResponse
        },
        detail: {
            summary: "Estadísticas del Dashboard"
        }
    });