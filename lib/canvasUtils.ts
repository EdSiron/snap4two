export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d')!;

  // mirror the frame so it matches what the user sees in the preview
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export async function buildStrip(photos: string[]): Promise<string> {
  const canvas = document.createElement('canvas');
  const W = 600, PAD = 24, PHOTO_H = 450, FOOTER_H = 100;
  canvas.width = W;
  canvas.height = PAD * 5 + PHOTO_H * 4 + FOOTER_H;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff8f3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i]);
    const y = PAD + i * (PHOTO_H + PAD);
    ctx.drawImage(img, PAD, y, W - PAD * 2, PHOTO_H);
  }

  ctx.fillStyle = '#d88fa9';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('snap4two 🩷', canvas.width / 2, canvas.height - 35);

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}