import { t } from "elysia";

export namespace RecomendacionModel {
  export const getRecomendacion = t.Object({
    correo: t.String(),
  });
  export type GetRecomendacion = typeof getRecomendacion.static;
}
