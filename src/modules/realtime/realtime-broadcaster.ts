import { WebSocket } from "ws";

type RealtimeClient = {
  clinicId: string;
  socket: WebSocket;
  userId: string;
};

type RealtimeMessage = {
  event: string;
  payload: unknown;
};

const clients = new Set<RealtimeClient>();

export function addRealtimeClient(client: RealtimeClient) {
  clients.add(client);
}

export function removeRealtimeClient(socket: WebSocket) {
  for (const client of clients) {
    if (client.socket === socket) {
      clients.delete(client);
    }
  }
}

export function broadcastToClinic(clinicId: string, message: RealtimeMessage) {
  const serializedMessage = JSON.stringify(message);

  for (const client of clients) {
    if (client.socket.readyState !== WebSocket.OPEN) {
      clients.delete(client);
      continue;
    }

    if (client.clinicId === clinicId) {
      client.socket.send(serializedMessage);
    }
  }
}

export function getRealtimeClientsCount() {
  return clients.size;
}
