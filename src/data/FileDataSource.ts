import path from "path";
import fs from "fs/promises";
import { CustomError } from "../domain/CustomError";

export class FileDataSource {

    private uploadDir: string

    constructor(environment: string = Bun.env.ENVIRONMENT) {
        this.uploadDir = environment === "development" ? path.join(import.meta.dir, '../../uploads/') : path.join('/fotos');
    }

    public saveFile = async (foto: File) : Promise<string> => {
        try {
            const buffer = Buffer.from(await foto.arrayBuffer());

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `${uniqueSuffix}-${foto.name}`;

            const filePath = path.join(this.uploadDir, filename);

            await fs.mkdir(this.uploadDir, { recursive: true });

            await fs.writeFile(filePath, buffer);

            return filePath;
        } catch (error) {
            console.error("Error al guardar la foto:", error);
            throw new CustomError("Error al guardar la foto - Comuniquese con el administrador", 500);
        }
    }
}