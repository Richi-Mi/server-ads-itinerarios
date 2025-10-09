import { PostgresDataSource } from "./data/PostgresDataSource";
import { Server } from "./presentation/Server";

(async () => {
  await PostgresDataSource.initialize()
  console.log('Base de datos conectada');
  
  Server.start()
})()