'use client';

import { useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/pusherClient';

export function useRetakeRequest(roomId: string | null) {
  const [incomingRequest, setIncomingRequest] = useState(false);
  const [partnerAgreed, setPartnerAgreed] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const pusher = getPusherClient();
    const channelName = `presence-room-${roomId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('client-retake-request', () => setIncomingRequest(true));
    channel.bind('client-retake-agreed', () => setPartnerAgreed(true));

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [roomId]);

  const requestRetake = () => {
    if (!roomId) return;
    const pusher = getPusherClient();
    const channel = pusher.channel(`presence-room-${roomId}`) || pusher.subscribe(`presence-room-${roomId}`);
    channel.trigger('client-retake-request', {});
  };

  const agreeToRetake = () => {
    if (!roomId) return;
    const pusher = getPusherClient();
    const channel = pusher.channel(`presence-room-${roomId}`) || pusher.subscribe(`presence-room-${roomId}`);
    channel.trigger('client-retake-agreed', {});
  };

  return { incomingRequest, partnerAgreed, requestRetake, agreeToRetake };
}