'use client';

import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import type { SocketLike } from '@/hooks/useRoomConnection';

export function usePeerConnection(
  socket: SocketLike | null,
  localStream: MediaStream | null,
  shouldInitiate: boolean | null,
  onData?: (data: string) => void
) {
  const peerRef = useRef<Peer.Instance | null>(null);
  const pendingSignalsRef = useRef<any[]>([]);
  const onDataRef = useRef(onData);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnected, setPeerConnected] = useState(false);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      if (data.type !== 'webrtc-signal') return;

      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      } else {
        pendingSignalsRef.current.push(data.signal);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  useEffect(() => {
    if (!socket || !localStream || shouldInitiate === null) return;

    const peer = new Peer({
      initiator: shouldInitiate,
      trickle: true,
      stream: localStream,
    });

    peer.on('signal', (data) => {
      socket.send(JSON.stringify({ type: 'webrtc-signal', signal: data }));
    });

    peer.on('stream', (stream) => setRemoteStream(stream));
    peer.on('connect', () => setPeerConnected(true));
    peer.on('close', () => {
      setPeerConnected(false);
      setRemoteStream(null);
    });
    peer.on('error', (err) => console.warn('[peer] error:', err.message));

    // photos now travel over the peer connection's own data channel,
    // completely bypassing Pusher's 10KB event size limit
    peer.on('data', (data) => {
      onDataRef.current?.(data.toString());
    });

    peerRef.current = peer;

    pendingSignalsRef.current.forEach((sig) => peer.signal(sig));
    pendingSignalsRef.current = [];

    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [socket, localStream, shouldInitiate]);

  const sendData = (data: string) => {
    try {
      peerRef.current?.send(data);
    } catch (err) {
      console.warn('[peer] send failed:', err);
    }
  };

  return { remoteStream, peerConnected, sendData };
}