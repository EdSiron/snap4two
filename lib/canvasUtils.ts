import { StripTemplate } from "@/lib/templates";

// Strip layouts. The canvas sizes never change; photos are exact 4:3.
export const SOLO_LAYOUT = {
  W: 600,
  H: 1876,
  SIDE: 60,
  TOP: 118,
  GAP: 16,
  PHOTO_W: 480,
  PHOTO_H: 360,
};

export const DUO_LAYOUT = {
  W: 600,
  H: 1040,
  SIDE: 60,
  TOP: 118,
  GAP: 16,
  COL_W: 240,
  ROW_H: 180,
};

// 1 = download is 600px wide. Set to 2 for a sharper 1200px download.
const RENDER_SCALE = 1;

function createCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w * RENDER_SCALE;
  canvas.height = h * RENDER_SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  return { canvas, ctx };
}

// resolves null instead of hanging when a file doesn't exist yet
function tryLoadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  template: StripTemplate,
  mode: "solo" | "duo",
  W: number,
  H: number,
) {
  ctx.fillStyle = template.background; // fallback if the image is missing
  ctx.fillRect(0, 0, W, H);
  const bg = await tryLoadImage(`/templates/${mode}/${template.id}.png`);
  if (bg) ctx.drawImage(bg, 0, 0, W, H);
}

async function drawOverlay(
  ctx: CanvasRenderingContext2D,
  template: StripTemplate,
  mode: "solo" | "duo",
  W: number,
  H: number,
) {
  const overlay = await tryLoadImage(`/overlays/${mode}/${template.id}.png`);
  if (overlay) ctx.drawImage(overlay, 0, 0, W, H);
}

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

export async function buildStrip(
  photos: string[],
  template: StripTemplate,
): Promise<string> {
  const { W, H, SIDE, TOP, GAP, PHOTO_W, PHOTO_H } = SOLO_LAYOUT;
  const { canvas, ctx } = createCanvas(W, H);

  await drawBackground(ctx, template, "solo", W, H);

  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i]);
    const y = TOP + i * (PHOTO_H + GAP);
    drawImageCover(ctx, img, SIDE, y, PHOTO_W, PHOTO_H);
  }

  await drawOverlay(ctx, template, "solo", W, H);

  return canvas.toDataURL("image/png");
}

export async function buildDuoStrip(
  myPhotos: string[],
  partnerPhotos: string[],
  myPosition: "left" | "right",
  template: StripTemplate,
): Promise<string> {
  const { W, H, SIDE, TOP, GAP, COL_W, ROW_H } = DUO_LAYOUT;
  const { canvas, ctx } = createCanvas(W, H);

  await drawBackground(ctx, template, "duo", W, H);

  const leftPhotos = myPosition === "left" ? myPhotos : partnerPhotos;
  const rightPhotos = myPosition === "left" ? partnerPhotos : myPhotos;

  for (let i = 0; i < 4; i++) {
    const y = TOP + i * (ROW_H + GAP);
    const leftImg = await loadImage(leftPhotos[i]);
    const rightImg = await loadImage(rightPhotos[i]);
    drawImageCover(ctx, leftImg, SIDE, y, COL_W, ROW_H);
    drawImageCover(ctx, rightImg, SIDE + COL_W, y, COL_W, ROW_H);
  }

  await drawOverlay(ctx, template, "duo", W, H);

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
