from pathlib import Path
import sys

from app.services.pixalbum import generate_pixalbum_images


BASE_DIR = Path(__file__).resolve().parent.parent

IMAGE_DIR = (
    BASE_DIR
    / "app"
    / "static"
    / "images"
    / "pixalbum"
)


def main():

    if len(sys.argv) != 2:
        print(
            "Usage: "
            "python scripts/generate_pixalbum_images.py YYYY-MM-DD"
        )
        sys.exit(1)

    puzzle_date = sys.argv[1]

    puzzle_dir = IMAGE_DIR / puzzle_date

    if not puzzle_dir.exists():
        raise FileNotFoundError(
            f"Puzzle directory not found: {puzzle_dir}"
        )

    generate_pixalbum_images(puzzle_dir)

    print(
        f"Generated PixAlbum images for {puzzle_date}"
    )


if __name__ == "__main__":
    main()