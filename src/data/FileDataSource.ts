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

    private uploadDir: string;

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

      return filename;
    } catch (error) {
      console.error("Error al guardar la foto:", error);
      throw new CustomError("Error al guardar la foto", 500);
    }
  };

  public deleteFile = async (filename: string): Promise<void> => {
    try {
      const filePath = path.join(this.uploadDir, filename || "");
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error al eliminar la foto:", error);
      throw new CustomError("Error al eliminar la foto", 500);
    }
  }; 

  public getFileFromSource = async (
    filename: string
  ): Promise<{ mimeType: string; buffer: Buffer }> => {
    const filePath = path.join(this.uploadDir, filename);
    try {
      
      const file = Bun.file(filePath);
      const buffer = Buffer.from(await file.arrayBuffer());

      if (!buffer || buffer.length === 0) {
        throw new Error("Buffer vacío"); 
      } 
      return { mimeType: file.type, buffer };
    } catch (error) {
      throw new CustomError("Archivo no encontrado", 404);
    }
  };
}
