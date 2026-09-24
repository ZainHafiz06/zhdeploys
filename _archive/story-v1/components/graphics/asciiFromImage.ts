/**
 * Build an ASCII grid from an image's alpha/luminance mask.
 * The HIGH ON JAVA mark is white-on-transparent, so alpha is the silhouette:
 * sampling it preserves proportions, the horizontal distortion, letter spacing
 * and the interior negative spaces exactly as drawn.
 */

export const DENSITY_RAMP = " .:+*#%@08";

export interface AsciiGrid {
  cols: number;
  rows: number;
  /** Row-major coverage 0..1 per cell. */
  coverage: Float32Array;
  chars: string[];
}

/** Fallback ratio of glyph advance width to line height. */
export const CELL_ASPECT = 0.5;

/**
 * Measures the real advance-to-line-height ratio of the rendered font. The
 * silhouette only matches the source artwork if the character cell used for
 * sampling is the cell the browser actually draws.
 */
export function measureCellAspect(fontFamily: string): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return CELL_ASPECT;
  ctx.font = `100px ${fontFamily}`;
  const advance = ctx.measureText("0").width;
  if (!advance) return CELL_ASPECT;
  return advance / 100;
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.src = src;
  await img.decode();
  return img;
}

/**
 * @param cols character columns in the output grid
 * @param invert treat dark pixels as ink instead of light ones
 */
export function sampleImageToGrid(
  img: HTMLImageElement,
  cols: number,
  cellAspect = CELL_ASPECT,
  invert = false,
): AsciiGrid {
  const aspect = img.naturalHeight / img.naturalWidth;
  const rows = Math.max(1, Math.round(cols * aspect * cellAspect));

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, cols, rows);
  ctx.drawImage(img, 0, 0, cols, rows);

  const { data } = ctx.getImageData(0, 0, cols, rows);
  const coverage = new Float32Array(cols * rows);
  const chars: string[] = new Array(cols * rows);

  for (let i = 0; i < coverage.length; i++) {
    const o = i * 4;
    const a = data[o + 3] / 255;
    const lum = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
    // Alpha gates the silhouette; luminance ranks density inside it.
    let v = a * (invert ? 1 - lum : lum);
    v = Math.min(1, Math.max(0, v));
    coverage[i] = v;
    chars[i] = v < 0.06 ? " " : DENSITY_RAMP[Math.round(v * (DENSITY_RAMP.length - 1))];
  }

  return { cols, rows, coverage, chars };
}

/** Glyphs used while the mark is still unstable, before it settles. */
const NOISE_GLYPHS = ".:+*#%@08/\\|-_=";

export function glyphFor(coverage: number, settle: number, rand: number): string {
  if (coverage < 0.06) {
    // Outside the mark: a few stray characters early on, none once settled.
    return rand > 0.004 * (1 - settle) ? " " : NOISE_GLYPHS[(rand * 1e4) % NOISE_GLYPHS.length | 0];
  }
  // Inside the mark: cells switch on progressively, and wobble until settled.
  if (rand > settle * 1.25) return " ";
  const jitter = (1 - settle) * (rand - 0.5) * 0.9;
  const v = Math.min(1, Math.max(0, coverage + jitter));
  return DENSITY_RAMP[Math.round(v * (DENSITY_RAMP.length - 1))];
}
