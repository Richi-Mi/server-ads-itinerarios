const poblarDB = async () => {
    try {
        await PostgresDataSource.initialize();

        const jsonPath = path.join(__dirname, 'lugares_turisticos.json');
        
        const jsonData = await Bun.file(jsonPath).json();
        const lugaresData = jsonData.lugares;

        const lugarRepository = PostgresDataSource.getRepository(Lugar);

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

        await PostgresDataSource.destroy();
        
    } catch (error) {
        console.error('Error al poblar la base de datos:', error);
        process.exit(1);
    }
};
poblarDB()