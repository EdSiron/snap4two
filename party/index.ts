import type * as Party from 'partykit/server';

export default class Snap4TwoRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
  const existingConnections = [...this.room.getConnections()].filter(
    (c) => c.id !== conn.id
  );

  if (existingConnections.length > 0) {
    // someone was already here — the newcomer does NOT initiate
    conn.send(JSON.stringify({ type: 'role', initiator: false }));
    // tell the existing peer(s) they SHOULD initiate
    for (const existing of existingConnections) {
      existing.send(JSON.stringify({ type: 'role', initiator: true }));
      existing.send(JSON.stringify({ type: 'peer-joined', id: conn.id }));
    }
    conn.send(JSON.stringify({ type: 'peer-joined', id: existingConnections[0].id }));
  } else {
    // first person in the room — wait, don't know role yet
    conn.send(JSON.stringify({ type: 'role', initiator: false }));
  }
}

  onMessage(message: string, sender: Party.Connection) {
    this.room.broadcast(message, [sender.id]);
  }

  onClose(conn: Party.Connection) {
    this.room.broadcast(
      JSON.stringify({ type: 'peer-left', id: conn.id }),
      [conn.id]
    );
  }
}