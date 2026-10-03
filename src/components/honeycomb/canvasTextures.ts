import * as THREE from 'three';

export function createBacklitTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.25, '#FFF6BD');
  grad.addColorStop(0.60, '#FCBF14');
  grad.addColorStop(0.85, '#D99F06');
  grad.addColorStop(1, '#7A5208');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const x = 256 + Math.cos(ang) * 205;
    const y = 256 + Math.sin(ang) * 205;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates high-resolution procedural canvas textures for the honeycomb display faces
 */
export function createDisplayTexture(type: 'display_chart' | 'display_kpi' | 'display_logo' | 'display_slides'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background - rich obsidian gradient with subtle inner vignette
  const bgGrad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  bgGrad.addColorStop(0, '#1c1b18');
  bgGrad.addColorStop(1, '#0e0e0f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle hexagonal guidelines
  ctx.strokeStyle = 'rgba(252, 191, 20, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const x = 256 + Math.cos(ang) * 230;
    const y = 256 + Math.sin(ang) * 230;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  if (type === 'display_chart') {
    ctx.fillStyle = '#FCBF14';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GROWTH METRICS', 256, 140);

    ctx.fillStyle = 'rgba(255, 249, 232, 0.75)';
    ctx.font = '500 16px sans-serif';
    ctx.fillText('Q3 Performance', 256, 168);

    const bars = [40, 65, 85, 115, 145, 185];
    const barWidth = 32;
    const gap = 14;
    const totalWidth = bars.length * barWidth + (bars.length - 1) * gap;
    const startX = 256 - totalWidth / 2;
    const baseY = 330;
    const points: [number, number][] = [];

    bars.forEach((h, i) => {
      const x = startX + i * (barWidth + gap);
      const y = baseY - h;
      points.push([x + barWidth / 2, y]);

      const barGrad = ctx.createLinearGradient(x, y, x, baseY);
      barGrad.addColorStop(0, '#FFE885');
      barGrad.addColorStop(0.4, '#FCBF14');
      barGrad.addColorStop(1, '#936610');
      ctx.fillStyle = barGrad;
      ctx.fillRect(x, y, barWidth, h);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y - 2, barWidth, 3);
    });

    ctx.strokeStyle = '#FFEAA7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    points.forEach(([px, py]) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#FCBF14';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('+248%', 256, 370);
  } else if (type === 'display_kpi') {
    ctx.fillStyle = 'rgba(255, 249, 232, 0.65)';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WIN RATE', 256, 150);

    ctx.fillStyle = '#FCBF14';
    ctx.font = '900 68px sans-serif';
    ctx.fillText('94.8%', 256, 235);

    ctx.strokeStyle = 'rgba(252, 191, 20, 0.2)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(256, 305, 55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FCBF14';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(256, 305, 55, -Math.PI / 2, Math.PI * 1.35);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Client Satisfaction', 256, 395);
  } else if (type === 'display_logo') {
    ctx.textAlign = 'center';

    const hexGrad = ctx.createLinearGradient(190, 160, 320, 290);
    hexGrad.addColorStop(0, '#FFE885');
    hexGrad.addColorStop(0.5, '#FCBF14');
    hexGrad.addColorStop(1, '#936610');

    ctx.fillStyle = hexGrad;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const x = 256 + Math.cos(ang) * 75;
      const y = 220 + Math.sin(ang) * 75;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('SB', 256, 238);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('SlideBEE', 256, 335);

    ctx.fillStyle = 'rgba(252, 191, 20, 0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('STUDIO DECK ENGINE', 256, 360);
  } else if (type === 'display_slides') {
    ctx.fillStyle = '#FCBF14';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXECUTIVE DECK', 256, 145);

    const slideX = 146;
    const slideY = 175;
    const slideW = 220;
    const slideH = 135;

    ctx.fillStyle = 'rgba(252, 191, 20, 0.2)';
    ctx.fillRect(slideX + 8, slideY + 8, slideW, slideH);

    ctx.fillStyle = '#222224';
    ctx.strokeStyle = '#FCBF14';
    ctx.lineWidth = 2;
    ctx.fillRect(slideX, slideY, slideW, slideH);
    ctx.strokeRect(slideX, slideY, slideW, slideH);

    ctx.fillStyle = '#FCBF14';
    ctx.fillRect(slideX + 16, slideY + 20, 80, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(slideX + 16, slideY + 36, 120, 4);
    ctx.fillRect(slideX + 16, slideY + 46, 100, 4);

    ctx.fillStyle = '#FCBF14';
    ctx.fillRect(slideX + 130, slideY + 65, 70, 50);

    ctx.fillStyle = 'rgba(255, 249, 232, 0.85)';
    ctx.font = '500 14px sans-serif';
    ctx.fillText('16:9 Master Template', 256, 350);

    ctx.fillStyle = '#FCBF14';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('POWERPOINT / KEYNOTE', 256, 375);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPollenTexture(): THREE.CanvasTexture {
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 64;
  pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d');
  if (pCtx) {
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 240, 160, 1)');
    pGrad.addColorStop(0.35, 'rgba(252, 191, 20, 0.85)');
    pGrad.addColorStop(0.8, 'rgba(252, 191, 20, 0.25)');
    pGrad.addColorStop(1, 'rgba(252, 191, 20, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(pCanvas);
}
