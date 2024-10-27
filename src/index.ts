import sharp from "sharp";

const [imagePath, horizontal, vertical] = process.argv.slice(2);

if (!imagePath) {
  console.error("Please provide a path to an image");
  process.exit(1);
}
console.log({ imagePath });

if (!horizontal || !vertical) {
  console.warn(
    "\nYou not provided any horizontal or vertical number of tiles. Assuming 1x1"
  );
}

const horizontalTiles = horizontal ? parseInt(horizontal) : 1;
const verticalTiles = vertical ? parseInt(vertical) : 1;
console.log({ horizontalTiles, verticalTiles });

const getRegions = (
  width: number,
  height: number,
  horizontalTiles: number,
  verticalTiles: number
) => {
  const tileWidth = Math.floor(width / horizontalTiles);
  const tileHeight = Math.floor(height / verticalTiles);
  const dimensions = { width: tileWidth, height: tileHeight };
  const regions = [];
  for (let i = 0; i < verticalTiles; i++) {
    for (let j = 0; j < horizontalTiles; j++) {
      const left = j * tileWidth;
      const top = i * tileHeight;
      regions.push({ left, top, ...dimensions });
    }
  }
  return regions;
};

const main = async () => {
  const metadata = await sharp(imagePath).metadata();
  if (!metadata) {
    console.error("Could not read metadata of the image");
    process.exit(1);
  }
  console.log(`\nImage Dimensions: ${metadata.width}x${metadata.height}`);
  const { width, height } = metadata;
  if (!width || !height) {
    console.error("Could not read width or height of the image");
    process.exit(1);
  }
  const pathParts = imagePath.split("/");
  const outputBasePath = pathParts.slice(0, -1).join("/");
  const outputFileName = pathParts[pathParts.length - 1].split(".")[0];
  const regions = getRegions(width, height, horizontalTiles, verticalTiles);
  regions.forEach((region, index) => {
    const { left, top, width, height } = region;
    const outputPath = `${outputBasePath}/${outputFileName}-${index}.webp`;
    sharp(imagePath)
      .extract({ left, top, width, height })
      .toFile(outputPath, (err, info) => {
        if (err) {
          console.error(`Error extracting region ${index}: ${err}`);
          process.exit(1);
        }
        console.log(`Region ${index} extracted to ${outputPath}`);
      });
  });
};
main();
