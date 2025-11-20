import { t } from "elysia";
export namespace AmigoModel {
    export const envioSolicitud = t.Object({
        receiving : t.String()
    }); 

    export const respondSolicitud = t.Object({
        Id: t.Number(), 
        state: t.Union([ t.Literal(0), t.Literal(1), t.Literal(2), t.Literal(3)])
        //action: t.Enum(["ACCEPT", "REJECT"]),
    }); 
}