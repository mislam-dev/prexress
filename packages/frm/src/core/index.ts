import { Server } from './server';

// class Pxr {
//   // router: Router
//   server: Server;

//   constructor() {
//     this.server = new Server();
//   }

//   get(path: string, handler: Handler) {}
//   post(path: string, handler: Handler) {}
//   put(path: string, handler: Handler) {}
//   patch(path: string, handler: Handler) {}
//   delete(path: string, handler: Handler) {}

//   listen(port: number, callback?: () => void) {
//     this.server.listen(port, callback);
//   }
// }

export const createApp = () => new Server();
