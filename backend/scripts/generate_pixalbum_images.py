from pathlib import Path

from PIL import Image


BASE_DIR = Path(__file__).resolve().parent.parent

IMAGE_DIR = (
    BASE_DIR
    / "app"
    / "static"
    / "images"
    / "pixalbum"
)

SOURCE = IMAGE_DIR / "original.jpg"

OUTPUT_SIZE = (1000, 1000)


def pixelate(
    image: Image.Image,
    resolution: tuple[int, int],
) -> Image.Image:
    """
    Reduce the image to a low resolution and then
    scale it back to the standard game resolution.

    The resulting image always has the same dimensions,
    regardless of the input image dimensions.
    """

    small = image.resize(
        resolution,
        Image.Resampling.BILINEAR,
    )

    return small.resize(
        OUTPUT_SIZE,
        Image.Resampling.NEAREST,
    )


def normalize_image(image: Image.Image) -> Image.Image:
    """
    Convert any source image into a square 1000x1000 image.

    The image is center-cropped if it is not square.
    """

    width, height = image.size

    # Crop to a square.
    crop_size = min(width, height)

    left = (width - crop_size) // 2
    top = (height - crop_size) // 2

    right = left + crop_size
    bottom = top + crop_size

    image = image.crop(
        (left, top, right, bottom)
    )

    # Normalize to standard size.
    return image.resize(
        OUTPUT_SIZE,
        Image.Resampling.LANCZOS,
    )


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(
            f"Original image not found: {SOURCE}"
        )

    image = Image.open(SOURCE).convert("RGB")

    # Normalize every source image first.
    image = normalize_image(image)

    # Target resolutions for each difficulty level.
    #
    # Lower resolution = more pixelated.
    levels = {
        1: (6, 6),
        2: (8, 8),
        3: (12, 12),
        4: (25, 25),
        5: (50, 50),
    }


    for level, resolution in levels.items():

        if resolution == OUTPUT_SIZE:
            result = image
        else:
            result = pixelate(
                image,
                resolution,
            )

        output = IMAGE_DIR / f"level{level}.jpg"

        result.save(
            output,
            "JPEG",
            quality=90,
        )

        print(
            f"Created level {level}: "
            f"{resolution[0]}x{resolution[1]} → "
            f"{OUTPUT_SIZE[0]}x{OUTPUT_SIZE[1]}"
        )


if __name__ == "__main__":
    main()
