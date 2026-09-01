from pathlib import Path

from PIL import Image


OUTPUT_SIZE = (1000, 1000)


def pixelate(
    image: Image.Image,
    resolution: tuple[int, int],
) -> Image.Image:

    small = image.resize(
        resolution,
        Image.Resampling.BILINEAR,
    )

    return small.resize(
        OUTPUT_SIZE,
        Image.Resampling.NEAREST,
    )


def normalize_image(
    image: Image.Image,
) -> Image.Image:

    width, height = image.size

    crop_size = min(width, height)

    left = (width - crop_size) // 2
    top = (height - crop_size) // 2

    right = left + crop_size
    bottom = top + crop_size

    image = image.crop(
        (left, top, right, bottom)
    )

    return image.resize(
        OUTPUT_SIZE,
        Image.Resampling.LANCZOS,
    )


def generate_pixalbum_images(
    puzzle_dir: Path,
) -> None:

    source = puzzle_dir / "original.jpg"

    if not source.exists():
        raise FileNotFoundError(
            f"Original image not found: {source}"
        )

    image = Image.open(source).convert("RGB")

    image = normalize_image(image)

    # Save normalized original
    image.save(
        source,
        "JPEG",
        quality=90,
    )

    levels = {
        1: (4, 4),
        2: (6, 6),
        3: (8, 8),
        4: (16, 16),
        5: (50, 50),
    }

    for level, resolution in levels.items():

        result = pixelate(
            image,
            resolution,
        )

        output = puzzle_dir / f"level{level}.jpg"

        result.save(
            output,
            "JPEG",
            quality=90,
        )