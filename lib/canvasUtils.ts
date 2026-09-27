export function captureFrame(video: HTMLVideoElement, aspect?: number): string {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  let sx = 0,
    sy = 0,
    sw = vw,
    sh = vh;

  if (aspect) {
    const currentAspect = vw / vh;
    if (currentAspect > aspect) {
      // camera is wider than the target — crop the sides
      sw = vh * aspect;
      sx = (vw - sw) / 2;
    } else {
      // camera is taller than the target — crop top/bottom
      sh = vw / aspect;
      sy = (vh - sh) / 2;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function buildStrip(photos: string[]): Promise<string> {
  const canvas = document.createElement("canvas");
  const W = 600,
    PAD = 24,
    FOOTER_H = 100;
  const PHOTO_W = W - PAD * 2; // 552
  const PHOTO_H = PHOTO_W * (3 / 4); // 414 — exact 4:3 ratio, matching the solo preview box
  canvas.width = W;
  canvas.height = PAD * 5 + PHOTO_H * 4 + FOOTER_H;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff8f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i]);
    const y = PAD + i * (PHOTO_H + PAD);
    drawImageCover(ctx, img, PAD, y, PHOTO_W, PHOTO_H);
  }

  ctx.fillStyle = "#d88fa9";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("snap4two 🩷", canvas.width / 2, canvas.height - 35);

  return canvas.toDataURL("image/png");
}

// draws img into the destination box like CSS object-fit: cover (crop, no stretch)
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const imgRatio = img.width / img.height;
  const boxRatio = dw / dh;

  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (imgRatio > boxRatio) {
    // image is wider than the box — crop left/right
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    // image is taller than the box — crop top/bottom
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

export async function buildDuoStrip(
  myPhotos: string[],
  partnerPhotos: string[],
  myPosition: "left" | "right",
): Promise<string> {
  const COL_W = 280;
  const ROW_H = COL_W * (3 / 4); // 210 — exact 4:3 ratio, matching the duo preview boxes
  const OUTER_PAD = 20,
    ROW_GAP = 20,
    FOOTER_H = 100;
  const canvas = document.createElement("canvas");
  canvas.width = COL_W * 2 + OUTER_PAD * 2;
  canvas.height = OUTER_PAD * 2 + ROW_GAP * 3 + ROW_H * 4 + FOOTER_H;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff8f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const leftPhotos = myPosition === "left" ? myPhotos : partnerPhotos;
  const rightPhotos = myPosition === "left" ? partnerPhotos : myPhotos;

  for (let i = 0; i < 4; i++) {
    const y = OUTER_PAD + i * (ROW_H + ROW_GAP);
    const leftImg = await loadImage(leftPhotos[i]);
    const rightImg = await loadImage(rightPhotos[i]);
    drawImageCover(ctx, leftImg, OUTER_PAD, y, COL_W, ROW_H);
    drawImageCover(ctx, rightImg, OUTER_PAD + COL_W, y, COL_W, ROW_H);
  }

  ctx.fillStyle = "#d88fa9";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("snap4two 🩷", canvas.width / 2, canvas.height - 35);

  return canvas.toDataURL("image/png");
}
