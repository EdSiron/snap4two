'use client';

import { useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/pusherClient';
import type { Channel } from 'pusher-js';

// A minimal socket-like wrapper so usePeerConnection/useSyncedCapture
// don't need to change how they send/receive messages.
export interface SocketLike {
  send: (data: string) => void;
  addEventListener: (type: 'message', cb: (evt: MessageEvent) => void) => void;
  removeEventListener: (type: 'message', cb: (evt: MessageEvent) => void) => void;
}

const CLIENT_EVENTS = ['client-webrtc-signal', 'client-start-sequence', 'client-photo'];

class ChannelSocket implements SocketLike {
  private emitter = new EventTarget();

  constructor(private channel: Channel) {
    CLIENT_EVENTS.forEach((eventName) => {
      channel.bind(eventName, (data: unknown) => {
        this.emitter.dispatchEvent(
          new MessageEvent('message', { data: JSON.stringify(data) })
        );
      });
    });
  }

  send(data: string) {
    const parsed = JSON.parse(data);
    this.channel.trigger(`client-${parsed.type}`, parsed);
  }

  addEventListener(type: 'message', cb: (evt: MessageEvent) => void) {
    this.emitter.addEventListener(type, cb as EventListener);
  }

  removeEventListener(type: 'message', cb: (evt: MessageEvent) => void) {
    this.emitter.removeEventListener(type, cb as EventListener);
  }
}

export function useRoomConnection(roomId: string) {
  const [connected, setConnected] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);
  const [shouldInitiate, setShouldInitiate] = useState<boolean | null>(null);
  const [socket, setSocket] = useState<ChannelSocket | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    const channelName = `presence-room-${roomId}`;
    const channel = pusher.subscribe(channelName);
    const wrapped = new ChannelSocket(channel);
    setSocket(wrapped);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setConnected(true);
      if (members.count > 1) {
        setPeerJoined(true);
        setShouldInitiate(false);
      }
    });

    channel.bind('pusher:member_added', () => {
      setPeerJoined(true);
      setShouldInitiate(true);
    });

    channel.bind('pusher:member_removed', () => {
      setPeerJoined(false);
      setShouldInitiate(null);
    });

    return () => {
      pusher.unsubscribe(channelName);
      setSocket(null);
    };
  }, [roomId]);

  return { connected, peerJoined, shouldInitiate, socket };
}