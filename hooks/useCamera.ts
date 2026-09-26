'use client';

import { useEffect, useRef, useState } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: true })
      .then((stream) => {
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch(() => setError('camera-denied'));

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, stream: streamRef.current, error, ready };
}