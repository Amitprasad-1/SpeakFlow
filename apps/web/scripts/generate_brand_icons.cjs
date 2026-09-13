const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function writePng(filePath, width, height, isMaskable = false) {
  const rowBytes = width * 4;
  const raw = Buffer.alloc((1 + rowBytes) * height);

  const cx = width / 2;
  const cy = height / 2;
  const cornerRadius = isMaskable ? 0 : width * 0.24;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowBytes);
    raw[rowOffset] = 0; // Filter none

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Rounded rect check
      let inBounds = true;
      if (!isMaskable) {
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const half = width / 2;
        if (dx > half - cornerRadius && dy > half - cornerRadius) {
          const cornerDist = Math.hypot(dx - (half - cornerRadius), dy - (half - cornerRadius));
          if (cornerDist > cornerRadius) {
            inBounds = false;
          }
        }
      }

      if (!inBounds) {
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
        continue;
      }

      // Gradient background (#0ea5e9 to #10b981)
      const gradRatio = (x + y) / (width + height);
      let r = Math.round(14 * (1 - gradRatio) + 16 * gradRatio);
      let g = Math.round(165 * (1 - gradRatio) + 185 * gradRatio);
      let b = Math.round(233 * (1 - gradRatio) + 129 * gradRatio);
      let a = 255;

      // Normalized coordinates inside the icon: [-1, 1]
      const scale = isMaskable ? 0.65 : 0.76;
      const nx = ((x - cx) / (width / 2)) / scale;
      const ny = ((y - cy) / (height / 2)) / scale;

      // Draw Speech Bubble: Ellipse (cx=0, cy=-0.05, rx=0.75, ry=0.62) + pointer tail at bottom left (-0.5, 0.7)
      const bubbleDist = Math.hypot(nx / 0.78, (ny + 0.06) / 0.64);
      let inBubble = bubbleDist <= 1.0;

      // Pointer tail triangle around (-0.4, 0.3) to (-0.55, 0.72) to (-0.15, 0.48)
      if (nx >= -0.62 && nx <= -0.15 && ny >= 0.25 && ny <= 0.75) {
        const dLine = (nx - (-0.2)) * (0.75 - 0.4) - (ny - 0.4) * (-0.6 - (-0.2));
        if (dLine >= -0.15 && dLine <= 0.2) {
          inBubble = true;
        }
      }

      // Speech bubble border & soft translucent fill
      const strokeThickness = 0.09;
      const isBubbleStroke = Math.abs(bubbleDist - 1.0) <= strokeThickness;

      // Soundwave 3 vertical bars inside bubble
      const inBar1 = Math.abs(nx - (-0.30)) <= 0.08 && Math.abs(ny - (-0.05)) <= 0.20;
      const inBar2 = Math.abs(nx - 0.0) <= 0.08 && Math.abs(ny - (-0.05)) <= 0.36;
      const inBar3 = Math.abs(nx - 0.30) <= 0.08 && Math.abs(ny - (-0.05)) <= 0.26;

      if (inBar1 || inBar2 || inBar3) {
        r = 255;
        g = 255;
        b = 255;
      } else if (isBubbleStroke) {
        r = 255;
        g = 255;
        b = 255;
      } else if (inBubble) {
        r = Math.round(r * 0.78 + 255 * 0.22);
        g = Math.round(g * 0.78 + 255 * 0.22);
        b = Math.round(b * 0.78 + 255 * 0.22);
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(raw);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.alloc(4)
  ]);
  ihdrChunk.writeUInt32BE(crc32(ihdrChunk.subarray(4, 17)), 17);

  // IDAT
  const idatLen = compressed.length;
  const idatChunk = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from('IDAT'),
    compressed,
    Buffer.alloc(4)
  ]);
  idatChunk.writeUInt32BE(idatLen, 0);
  idatChunk.writeUInt32BE(crc32(idatChunk.subarray(4, 4 + 4 + idatLen)), 4 + 4 + idatLen);

  // IEND
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('IEND'),
    Buffer.alloc(4)
  ]);
  iendChunk.writeUInt32BE(crc32(iendChunk.subarray(4, 8)), 8);

  const finalPng = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(filePath, finalPng);
  console.log(`Generated ${path.basename(filePath)} (${width}x${height}, ${finalPng.length} bytes)`);
}

const publicDir = path.resolve('c:/My Work/Project/SpeakFlow/apps/web/public');

writePng(path.join(publicDir, 'favicon.png'), 64, 64, false);
writePng(path.join(publicDir, 'apple-touch-icon.png'), 180, 180, false);
writePng(path.join(publicDir, 'icon-192.png'), 192, 192, false);
writePng(path.join(publicDir, 'icon-512.png'), 512, 512, false);
writePng(path.join(publicDir, 'icon-maskable-192.png'), 192, 192, true);
writePng(path.join(publicDir, 'icon-maskable-512.png'), 512, 512, true);
console.log('All brand icons updated successfully!');
