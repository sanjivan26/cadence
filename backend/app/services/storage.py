import os

from supabase import create_client, Client


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured"
    )


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
)


BUCKET_NAME = "pixalbum"


def upload_image(
    local_path,
    storage_path: str,
) -> str:

    with open(local_path, "rb") as file:
        file_data = file.read()

    supabase.storage.from_(BUCKET_NAME).upload(
        path=storage_path,
        file=file_data,
        file_options={
            "content-type": "image/jpeg",
            "upsert": True,
        },
    )

    return (
        f"{SUPABASE_URL}/storage/v1/object/public/"
        f"{BUCKET_NAME}/{storage_path}"
    )