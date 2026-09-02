/**
 * 업로드 전 서류 이미지 리사이즈/재인코딩.
 *
 * 에이전트가 올리는 서류는 대부분 휴대폰으로 찍은 사진이라 장당 3~6MB 다.
 * 원본 그대로 올리면 저장 용량과 전송량이 그대로 비용이 되고, 무엇보다
 * 회선이 불안정한 현지에서 업로드 실패가 잦다.
 *
 * 설정이 보수적인 이유:
 * - 긴 변 2400px — A4 성적증명서 기준 약 200DPI. 1600px 로 줄이면 135DPI 라
 *   작은 글씨와 도장, 여권 하단 MRZ 가 뭉갠다. 대학에 제출되는 서류라
 *   판독이 안 되면 반려 사유가 된다.
 * - JPEG — WebP 가 더 작지만, 서류를 대학·출입국에 다시 넘길 때
 *   받는 쪽 시스템이 열지 못할 수 있다.
 * - PDF 는 건드리지 않는다. 이미 압축되어 있고 재인코딩하면 텍스트가 깨진다.
 *
 * 어떤 이유로든 실패하면 원본을 그대로 돌려준다 — 압축은 최적화일 뿐이라
 * 여기서 업로드 자체를 막지 않는다.
 */

const MAX_DIMENSION = 2400;
const QUALITY = 0.82;
const OUTPUT_TYPE = "image/jpeg";

/** 이 크기 아래면 줄여봐야 이득이 없다 */
const SKIP_BELOW_BYTES = 300 * 1024;

type ImageSource = ImageBitmap | HTMLImageElement;

export async function compressImage(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  let source: ImageSource | null = null;
  try {
    source = await loadImage(file);
    const [sourceWidth, sourceHeight] = getSize(source);
    if (!sourceWidth || !sourceHeight) return file;

    const [width, height] = fitWithin(sourceWidth, sourceHeight, MAX_DIMENSION);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG 는 투명도가 없다. 깔지 않으면 투명 영역이 검게 나온다.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);

    const blob = await toBlob(canvas, OUTPUT_TYPE, QUALITY);
    // 이미 충분히 작거나 압축이 손해면 원본을 쓴다
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], toJpegName(file.name), {
      type: OUTPUT_TYPE,
      lastModified: file.lastModified,
    });
  } catch {
    // HEIC 처럼 브라우저가 디코딩하지 못하는 형식은 원본 그대로 올린다
    return file;
  } finally {
    if (source && "close" in source) source.close();
  }
}

async function loadImage(file: File): Promise<ImageSource> {
  // createImageBitmap 은 EXIF 회전 정보를 반영해준다 (세로로 찍은 사진 대응)
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // 옵션 미지원 브라우저 — 아래 <img> 경로로 폴백
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image decode failed"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getSize(source: ImageSource): [number, number] {
  return source instanceof HTMLImageElement
    ? [source.naturalWidth, source.naturalHeight]
    : [source.width, source.height];
}

/** 비율을 유지하며 긴 변을 max 이하로 맞춘다. 확대는 하지 않는다. */
function fitWithin(
  width: number,
  height: number,
  max: number,
): [number, number] {
  const longest = Math.max(width, height);
  if (longest <= max) return [width, height];
  const ratio = max / longest;
  return [Math.round(width * ratio), Math.round(height * ratio)];
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function toJpegName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, "") || "document";
  return `${base}.jpg`;
}
