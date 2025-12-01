import { type Server as SocketIOServer, type Socket } from "socket.io";
import { randomBytes } from "crypto";

import { PostgresDataSource as pgdb } from "../data/PostgresDataSource";
import { Amigo, FriendRequestState, Mensaje, Usuario } from "../data/model";

/*guardaMensaje*/
async function guardaMensaje(text: string, emisor: string, receptor: string)
{
  const repo = pgdb.getRepository(Mensaje);

  const nuevoMensaje = new Mensaje();
  nuevoMensaje.text = text;

  nuevoMensaje.emisor = { correo: emisor } as Usuario;
  nuevoMensaje.receptor = { correo: receptor } as Usuario;

  await repo.save(nuevoMensaje);
  //console.log(`Mensaje de ${emisor} para ${receptor} guardado en la BD`);
}

/*misMensajes*/
async function misMensajes(miCorreo: string)
{
  const repo = pgdb.getRepository(Mensaje);

  const mensajes = await repo.find({
    where: [
      { emisor: { correo: miCorreo } }, //Mensajes que envie
      { receptor: { correo: miCorreo } }, //Menajes que recibi
    ],
    relations: ["emisor", "receptor"], //Quienes son emisor y receptor
    order: { id: "ASC" }, //Orden cronologico de los mensajes
  });

  //Se ponen los mensajes en el formato que usa el front
  return mensajes.map(m => ({
    content: m.text,
    from: m.emisor.correo,
    to: m.receptor.correo
  }));  
}

async function getFriends(miCorreo: string)
{
  const amigosRepo = pgdb.getRepository(Amigo);

  const relaciones = await amigosRepo.find({
    where: [//Muestra todos los amigos que tengo, ya sea que envie o recibi la solicitud, y la aceptaron
      { //Yo envie la solicitud de amistad y somos amigos (mandar solicitud)
        requesting_user: { correo: miCorreo },
        status: FriendRequestState.FRIEND,
      },
      { //Yo recibi la solicitud de amistad y somos amigos (enviar solicitud)
        receiving_user: { correo: miCorreo },
        status: FriendRequestState.FRIEND,
      }
    ],
    relations: ["requesting_user", "receiving_user"]
  });

  const misAmigos = relaciones.map((relacion) => {
    //Si yo envie la solicitud, mi amigo es quien la recibio.
    //Si yo recibi la solicitud, mi amigo la envio.

    // if(envie = yo)
    //   amigo = recibe
    // else
    //   amigo = envia

    const amigo = relacion.requesting_user.correo === miCorreo ? relacion.receiving_user : relacion.requesting_user;
    return{
      userID: amigo.correo,
      username: amigo.username,
    };
  });

  return misAmigos;
}

//Clases de Store
class InMemorySessionStore {
  sessions = new Map();
  findSession(id: string) { return this.sessions.get(id); }
  saveSession(id: string, session: any) { this.sessions.set(id, session); }
  findAllSessions() { return [...this.sessions.values()]; }
}

class InMemoryMessageStore {
  messages: any[] = [];
  saveMessage(message: any) { this.messages.push(message); }
  findMessagesForUser(userID: string) {
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID
    );
  }
}

const sessionStore = new InMemorySessionStore();
//const messageStore = new InMemoryMessageStore();
/**
 * Configura todos los .on y la autenticacion de Socket.io (sessionID y token).
 * @param io La instancia del servidor de Socket.io
 * @param app La instancia de la app de Elysia. Esta no se utiliza y se puso como comentario
 */

//export function funcionesSockets(io: SocketIOServer, app: Elysia<any, any> | void) {
export function funcionesSockets(io: SocketIOServer) {
  
  // Middleware de Autenticación "Proxy"
  io.use(async (socket: Socket, next) => {
    //Reconexion con sessionID, es decir, si hay sessionID utilizala para la reconexcion, si no hay sessionID asigna una nueva
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
      //console.log('Hola desde sesion existente')
      const session = sessionStore.findSession(sessionID);
      if (session) {
        //console.log('Sesion ID: ', session);
        //console.log('User ID: ', session.userID);
        //console.log('Username:  ', session.username);
        (socket as any).sessionID = sessionID;
        (socket as any).userID = session.userID;
        (socket as any).username = session.username;
        return next();
      }
    }

    //Conexion nueva con token
    const token = socket.handshake.auth.token; //Token que envia el cliente
    if (!token) {
      return next(new Error("No se proporcionó token"));
    }

    //Se hace una consulta a la base para verificar si el token existe, es valido o ya expiro
    //Se puede quitar y leer los datos que vienen en el token, pero debe agregarse una nueva
    //biblioteca (jsonwebtoken)
    try {
      //const res = await fetch("http://localhost:4000/user", {
      const res = await fetch("https://harol-lovers.up.railway.app/user", {
        method: "GET", 
        headers: {
          'Content-Type': 'application.json',
          'token': token 
        }
      });

      if (!res.ok) {
        throw new Error("Token inválido (rechazado por el backend)");
      }

      //JSON que se envia: { token: "...", usuario: { ... } }
      const userData = await res.json();

      if (!userData || !userData.correo || !userData.username) {
        return next(new Error("Datos de usuario incompletos del backend"));
      }
      
      //Asigna nueva sessionID porque no hay
      //console.log('Hola desde nueva sesion');
      //Asignar datos al socket
      (socket as any).sessionID = randomBytes(8).toString("hex"); //8 bytes aleatorios en forma de cadena hexadecimal (16 digitos hexadecimales)
      //(socket as any).sessionID = userData.correo; //Anterior
      (socket as any).userID = userData.correo;
      (socket as any).username = userData.username;
      next();

    } catch (err: any) {
      //console.error("Error al asignar datos al socket:", err.message);
      return next(new Error("Error al asignar datos al socket"));
    }
  });

  //Conexion de Socketio
  io.on("connection", async (socket: Socket) => {
    //Se obtienen los datos del socket
    const { userID, username, sessionID } = (socket as any);

    //console.log(`Socket AUTENTICADO conectado: ${username} (ID: ${userID})`);

    //Guardar sesion
    sessionStore.saveSession(sessionID, { sessionID: sessionID, userID: userID, username: username, connected: true });

    //Emitir sesion
    socket.emit("session", { sessionID, userID, username });

    //Unirse a la sala privada
    socket.join(userID);
    
    const listaAmigos = await getFriends(userID); //Obtener amigos de la BD

    const allOnlineSessions = sessionStore.findAllSessions();
   
    listaAmigos.forEach((amigo) => {
      const friendSession = allOnlineSessions.find((s: any) => s.userID === amigo.userID);
      if(friendSession && friendSession.connected)
      {
        socket.to(amigo.userID).emit("user connected", {
          userID: userID,
          username: username,
          connected: true,
          messages: [],
        });
      }
    });

    socket.on("get friends list", async () => {
        //console.log(`Buscando amigos y mensajes de ${userID} en la BD. get friends list recibido`);

        const listaAmigos = await getFriends(userID); //Obtener amigos de la BD

        const allMyMessages = await misMensajes(userID); //Obtener todos los mensajes del usuario de la BD

        const allSessions = sessionStore.findAllSessions();
        const usersMap = new Map<string, any>();
        
        for(const amigo of listaAmigos) {
          const friendID = amigo.userID;
          const friendName = amigo.username;

            const friendSession = allSessions.find((s: any) => s.userID === friendID);
            //La sesion friendSession debe existir y tener la propiedad connected en true
            const isConnected = (friendSession?.connected === true);

            //De todos los mensajes que envio el usuario, filta los de este amigo especifico
            const chatHistory = allMyMessages.filter(
              (m) => (m.from === userID && m.to === friendID) ||
                      (m.from === friendID && m.to === userID)
            );

            usersMap.set(friendID, {
                userID: friendID,
                username: friendName, //Username del amigo en la BD
                connected: isConnected,
                // messages: friendMessages,
                messages: chatHistory,
            });
        }

        const users = Array.from(usersMap.values());
        //console.log(`[Friends] Enviando ${users.length} amigos al cliente.`);

        socket.emit("users", users); //Enviar la lista de amigos como respuesta
    });

//Logs de deupracion
  // console.log("debug de amigos");
  // console.log(`Buscando amigos para el userID: ${userID}`);
  // console.log("Claves disponibles en friendListsDB:", Object.keys(friendListsDB));
//Logs de depuracion

    //Escuchar mensajes privados
    socket.on("private message", async ({ content, to }) => {
      const message = {
        content,
        from: userID,
        to,
      };
      socket.to(to).to(userID).emit("private message", message); //Enviar al destinatario

      //messageStore.saveMessage(message);
      await guardaMensaje(content, userID, to); //Guarda el mensaje en la Base de Datos
    });

    //Desconexion
    socket.on("disconnect", async () => {
      //userID y sessionID
      const { userID, username, sessionID } = (socket as any);

      //await new Promise(resolve => setTimeout(resolve, 1000)); Para quitar el parpadeo de desconectado/conectado (se recarga la pagina)

      //Revisa si hay otras pestanas abiertas del mismo usuario
      const matchingSockets = await io.in(userID).allSockets();
      const isDisconnected = matchingSockets.size === 0;
      if (isDisconnected) {
        //console.log(`Disconnected - Usuario $username (${userID}) totalmente desconectado`);
        const listaAmigos = await getFriends(userID); //Obtener amigos de la BD
        listaAmigos.forEach((friendID) => {
          //No usar 'socket.to()' porque el socket esta muerto, no hay socket. Si se envian mensajes y el destinatario se desconecto, no vera los mensajes
          //socket.to(friendID).emit("user disconnected", userID);

          //Usar 'io.to()' (el servidor principal). Si se envian mensajes y el destinatario se desconecto, al conectarse de nuevo vera esos mensajes
          io.to(friendID.userID).emit("user disconnected", userID);
          //console.log('Usuario desconectado', userID);
        });
        sessionStore.saveSession(sessionID, {
          sessionID: sessionID,
          userID: userID,
          username: username,
          connected: false, //Se marca como desconectado
        });
      }
    });
  });
}