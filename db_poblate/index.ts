import "reflect-metadata"; 
import { PostgresDataSource } from "../src/data/PostgresDataSource";
import { Lugar } from "../src/data/model/Lugar";
import path from "path";

const poblarDB = async () => {
    try {
        await PostgresDataSource.initialize();
        console.log("Conexión a la base de datos establecida para poblar datos...");
        const jsonPath = path.join(import.meta.dir, 'lugares_turisticos.json');
        
        const jsonData = await Bun.file(jsonPath).json();
        const lugaresData = jsonData.lugares;

        const lugarRepository = PostgresDataSource.getRepository(Lugar);

        console.log(`Iniciando la inserción de ${lugaresData.length} lugares...`);

        for (const lugarData of lugaresData) {
            const lugar = new Lugar();
            
            lugar.id_api_place = lugarData.place_id;
            lugar.category = lugarData.categoria;
            lugar.mexican_state = lugarData.estado;
            lugar.nombre = lugarData.nombre;
            lugar.latitud = lugarData.lat;
            lugar.longitud = lugarData.lng;
            lugar.foto_url = lugarData.imagen_url || null;
            lugar.google_score = lugarData.puntaje || 0;
            lugar.total_reviews = lugarData.total_ratings || 0;

            await lugarRepository.save(lugar);
        }

        console.log("¡Éxito! Base de datos poblada con lugares.");
        await PostgresDataSource.destroy();
        
    } catch (error) {
        console.error('Error al poblar la base de datos:', error);
        
        process.exit(1);
    }
};
poblarDB();