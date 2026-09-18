import sharp from "sharp";
import fs from "node:fs/promises";

/**
 * JPG 원본 샘플에서 배경을 투명화하고 ADR 규격(800x1200, y=1149 접지, x=400 중심)으로 정규화하는 함수
 * @param {string} inputPath 입력 이미지 경로 (JPG/PNG)
 * @param {string} outputPath 출력 WebP 경로
 * @param {number} targetHeight 목표 인물 높이 (성인 남성 1000, 성인 여성 950, 소년 880~900)
 */
export async function normalizeHeungbuCharacter(inputPath, outputPath, targetHeight = 1000) {
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let maxX = -1;
  let minY = info.height;
  let maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r < 245 || g < 245 || b < 245) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  const cropped = await sharp(inputPath)
    .extract({ left: minX, top: minY, width: cropWidth, height: cropHeight })
    .resize({ height: targetHeight, fit: "contain" })
    .png()
    .toBuffer();

  const { data: cData, info: cInfo } = await sharp(cropped)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const processedData = Buffer.from(cData);
  for (let y = 0; y < cInfo.height; y++) {
    for (let x = 0; x < cInfo.width; x++) {
      const idx = (y * cInfo.width + x) * 4;
      const r = processedData[idx];
      const g = processedData[idx + 1];
      const b = processedData[idx + 2];

      const brightness = (r + g + b) / 3;
      if (brightness >= 250) {
        processedData[idx + 3] = 0;
      } else if (brightness >= 240) {
        const factor = (250 - brightness) / 10;
        processedData[idx + 3] = Math.round(factor * 255);
      }
    }
  }

  const isolatedBuffer = await sharp(processedData, {
    raw: { width: cInfo.width, height: cInfo.height, channels: 4 }
  })
    .png()
    .toBuffer();

  const top = 1149 - cInfo.height + 1;
  const left = Math.round((800 - cInfo.width) / 2);

  const finalWebp = await sharp({
    create: {
      width: 800,
      height: 1200,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: isolatedBuffer, top, left }])
    .webp({ lossless: true })
    .toBuffer();

  await fs.writeFile(outputPath, finalWebp);
  console.log(`Successfully normalized: ${outputPath} (height: ${cInfo.height}, top: ${top}, left: ${left})`);
}
