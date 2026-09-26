'use client';

import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import type { SocketLike } from '@/hooks/useRoomConnection';

export function usePeerConnection(
  socket: SocketLike | null,
  localStream: MediaStream | null,
  shouldInitiate: boolean | null
) {
  const peerRef = useRef<Peer.Instance | null>(null);
  const pendingSignalsRef = useRef<any[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnected, setPeerConnected] = useState(false);

  // Listen for signaling messages as soon as the socket exists —
  // don't wait for the peer object, or early messages get lost.
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      if (data.type !== 'webrtc-signal') return;

      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      } else {
        // peer isn't created yet — hold onto it
        pendingSignalsRef.current.push(data.signal);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  // Create the actual Peer once we have everything we need
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

    peerRef.current = peer;

    // flush any signals that arrived before this peer existed
    pendingSignalsRef.current.forEach((sig) => peer.signal(sig));
    pendingSignalsRef.current = [];

    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [socket, localStream, shouldInitiate]);

  return { remoteStream, peerConnected };
}