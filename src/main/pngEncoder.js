// Vanta Suite — Minimal PNG Encoder for tray icon.
// Generates a valid PNG from raw RGBA pixel data.
// Used only for the programmatic tray icon; replace with a proper .png file in production.

import zlib from 'zlib';

export function createPNG(width, height, rgbaData) {

  // Build raw scanlines (filter byte 0 + RGBA per pixel)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const offset = y * (1 + width * 4);
    rawData[offset] = 0; // filter: none
    rgbaData.copy(rawData, offset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(rawData);

  // Build PNG file
  function crc32(buf) {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([length, typeAndData, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  return 'data:image/png;base64,' + png.toString('base64');
}
