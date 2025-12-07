import Elysia from "elysia";
import { authService } from "../services/auth.service";
import { ReporteController } from "./reporte.controller";
import { ReporteModel } from "./reporte.model";
import { CustomError } from "../../domain/CustomError";

export const reportsRoutes = new Elysia({ prefix: "/reports" })
    .decorate('reporteController', new ReporteController())
    .use(authService)
    .get("/", async ({ store, reporteController, status }) => {
        // Solo admins pueden listar
        if (store.user.role !== "admin") {
            throw new CustomError("Acceso denegado: se requiere rol admin", 403);
        }
        const data = await reporteController.getAll();
        return status(200, data);
    })
    .post("/", async ({ body, store, reporteController, status }) => {
        // Creación permitida para cualquier usuario autenticado
        const created = await reporteController.create(body as any, store.user.correo);
        return status(201, created);
    }, {
        body: ReporteModel.Create
    })
    .get("/:id", async ({ params, store, reporteController, status }) => {
        // Solo admins pueden obtener por id
        if (store.user.role !== "admin") {
            throw new CustomError("Acceso denegado: se requiere rol admin", 403);
        }
        const idNum = Number((params as any).id);
        const result = await reporteController.getById(idNum);
        if (!result) return status(404, { message: "Reporte no encontrado" });
        return status(200, result);
    }, {
        params: ReporteModel.Params
    })
    .put("/:id", async ({ params, body, store, reporteController, status }) => {
        // Solo admins pueden actualizar
        if (store.user.role !== "admin") {
            throw new CustomError("Acceso denegado: se requiere rol admin", 403);
        }
        const idNum = Number((params as any).id);
        const updated = await reporteController.update(idNum, body as any);
        if (!updated) return status(404, { message: "Reporte no encontrado" });
        return status(200, updated);
    }, {
        params: ReporteModel.Params,
        body: ReporteModel.Update
    })
    .delete("/:id", async ({ params, store, reporteController, status }) => {
        // Solo admins pueden eliminar
        if (store.user.role !== "admin") {
            throw new CustomError("Acceso denegado: se requiere rol admin", 403);
        }
        const idNum = Number((params as any).id);
        await reporteController.delete(idNum);
        return status(204);
    }, {
        params: ReporteModel.Params
    });