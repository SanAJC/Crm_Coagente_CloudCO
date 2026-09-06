import { io, type Socket } from "socket.io-client";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  socket ??= io(baseURL, {
    withCredentials: true,
    autoConnect: false,
  });
  return socket;
}
