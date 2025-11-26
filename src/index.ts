/*======================== Elysia y Postgres =====================*/
import Elysia, { t } from "elysia"; 
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { PostgresDataSource } from "./data/PostgresDataSource";
/*================================================================*/

/*============================ Rutas =============================*/
import { userRoutes } from "./presentation/usuario";
import { lugarRoutes } from "./presentation/lugares";
import { itinerarioRoutes } from "./presentation/itinerario"
import { actividadRoutes } from "./presentation/actividad"
import { authRoutes } from "./presentation/auth";
import { publicacionRoutes } from "./presentation/publicacion";
import { preferenciasRoutes } from "./presentation/preferencias";
/*================================================================*/

/*============================ Otros =============================*/
import { CustomError } from "./domain/CustomError";
import { FileDataSource } from "./data/FileDataSource";
/*================================================================*/

/*===================== Para usar Socketio =======================*/
import { Server } from "socket.io";
import { createServer } from "http";
import { funcionesSockets } from "./sockets/socketHandler";
/*================================================================*/

const app = new Elysia()
  .decorate('pgdb', PostgresDataSource)
  .onStop(async ({ decorator }) => { 
    // * Cuando el servidor se detenga: Destruir la conexión a la base de datos.
    await decorator.pgdb.destroy();
  })
  .error({ 'custom': CustomError })
  .onError(({ code, error, status }) => {     
    // * Control de errores.
    console.log(error);
    if (code === 'custom') {
      const customError = error as CustomError;
      return status( customError.statusCode, customError.toResponse());
    }

    if (code === 'VALIDATION')
      return status(400, { message: error.customError });

    if (code === 'NOT_FOUND')
      return status(404, { message: "Recurso no encontrado" });

    return status(500, { message: "Internal Server Error" });

  })
  .use(cors())
  .use(staticPlugin())

  .use(authRoutes)
  .use(userRoutes)
  .use(preferenciasRoutes)
  .use(lugarRoutes)
  .use(itinerarioRoutes)
  .use(actividadRoutes)
  .get('/fotos/:file', async ({ params, set }) => {
      const fileDataSource = FileDataSource.getInstance();
      const { mimeType, buffer } = await fileDataSource.getFileFromSource(`/fotos/${params.file}`);

    set.headers['Content-Type'] = mimeType;
    set.status = 200; 
    return buffer;
  })


  .get("*", ({ status }) => {
    return status(404, { message: "Ruta no encontrada" });
  })

//Se inicia la base de datos manualmente
try{
  await PostgresDataSource.initialize();
  console.log('Base de datos conectada');
} catch(error){
  console.error(`Error al conectar con la base de datos: ${error}`);
  process.exit(1);
}

//Servidor HTTP
const server = createServer(async (req, res) => {
  try{
    // Convierte {IncomingMessage} a {Request}
    //Convierte la peticion HTTP de Node.js a una Request de Elysia
    const url = `http://${req.headers.host}${req.url}`;
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: req.method !== "GET" && req.method !== "HEAD" ? req: undefined,
    });

    const response = await app.handle(request); //wait for elysia handle request

    //Envia la respuesta {Response} de Elysia de vuelta al cliente
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    const body = Buffer.from(await response.arrayBuffer());
    res.end(body);
  } catch (err){
    console.error("Error procesando solicitud HTTP: ", err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

//Servidor de Socket.io unido al servidor HTTP
const io = new Server(server, {
  //Cors para Socket.io
  //cors: {
  //  origin: '*',
  //  methods: ["GET", "POST"],
  //},
  cors:{}
});

//Funciones que utilizan Socket.io
funcionesSockets(io);
//funcionesSockets(io, app);

//Puerto donde estara el servidor HTTP con Elysia y Socketio
const PORT = Number(Bun.env.PORT ?? 4000);

//Se inicia el servidor HTTP que comparten ELysia y Socketio
server.listen(PORT, () => {
  // console.log(`🦊 Elysia and Socket.io is running at http://localhost:${PORT}`);
  console.log(`🦊 Elysia and Socket.io is running at https://harol-lovers.up.railway.app${PORT}`);
});
//console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);