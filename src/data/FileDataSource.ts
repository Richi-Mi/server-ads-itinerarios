import path from "path";
import fs from "fs/promises";
import { CustomError } from "../domain/CustomError";
import { file } from "bun";

export class FileDataSource {

    static instance : FileDataSource | null = null;

    public static getInstance(environment: string = Bun.env.ENVIRONMENT): FileDataSource {
        if (this.instance === null) {
            this.instance = new FileDataSource(environment);
        }
        return this.instance;
    }

    private uploadDir: string
    private hostUrl: string = Bun.env.HOST || "http://localhost:4000";

    private constructor(environment: string = Bun.env.ENVIRONMENT) {
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

            // TODO: Ajustar la URL según la configuración del servidor
            console.log(this.hostUrl);
            
            return path.join("http://localhost:4000/", 'fotos', filename);
        } catch (error) {
            console.error("Error al guardar la foto:", error);
            throw new CustomError("Error al guardar la foto - Comuniquese con el administrador", 500);
        }
    }
    public deleteFile = async (filePath: string) : Promise<void> => {
        try {
            const fileName = filePath.split('/').pop();
            
            await fs.unlink( path.join(this.uploadDir, fileName || '') );
        } catch (error) {
            console.error("Error al eliminar la foto:", error);
            throw new CustomError("Error al eliminar la foto - Comuniquese con el administrador", 500);
        }
    }
    public getFileFromSource = async (filePath : string) : Promise<{ mimeType: string, buffer: Buffer }> => {
        const foto = await fs.readFile( path.join(this.uploadDir, filePath) );
        if( !foto ) {
            throw new CustomError("Archivo no encontrado", 404)
        }
        // Determinar el tipo de contenido (MIME type) basado en la extensión del archivo
        const extension = filePath.split('.').pop()?.toLowerCase()
        let mimeType = 'application/octet-stream';

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                mimeType = 'image/jpeg';
            break;
            case 'png':
                mimeType = 'image/png';
            break;
        }
        return {
            mimeType,
            buffer: foto
        }
    }
}