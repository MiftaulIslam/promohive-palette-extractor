// The second sample, drawn here so it needs no file: a flat screen-print landscape.
let posterUrl: string | null = null;

export function drawPoster() {
  if (posterUrl) return posterUrl;
  const cv = document.createElement('canvas');
  cv.width = 480; cv.height = 600;
  const x = cv.getContext('2d') as CanvasRenderingContext2D;
  const wave = (y: number, a: number, fill: string) => {
    x.fillStyle = fill;
    x.beginPath(); x.moveTo(0, 600); x.lineTo(0, y);
    x.bezierCurveTo(120, y - a, 300, y + a, 480, y - a * 0.4);
    x.lineTo(480, 600); x.closePath(); x.fill();
  };
  x.fillStyle = '#0F5B5E'; x.fillRect(0, 0, 480, 600);
  x.fillStyle = '#F7B32B'; x.beginPath(); x.arc(316, 214, 132, 0, Math.PI * 2); x.fill();
  wave(330, 70, '#E2522A');
  x.fillStyle = '#F6E7C8';
  x.beginPath(); x.moveTo(330, 356); x.bezierCurveTo(250, 420, 420, 470, 300, 600); x.lineTo(150, 600); x.bezierCurveTo(250, 480, 180, 420, 330, 356); x.closePath(); x.fill();
  wave(450, 60, '#E86A92');
  wave(528, 44, '#1D1A39');
  posterUrl = cv.toDataURL('image/png');
  return posterUrl;
}
