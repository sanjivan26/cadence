from dotenv import load_dotenv

load_dotenv()

from app.services.storage import supabase, BUCKET_NAME


result = supabase.storage.from_(BUCKET_NAME).list()

print("Storage connection successful!")
print(result)