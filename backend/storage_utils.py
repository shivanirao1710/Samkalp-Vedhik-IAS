import os
import uuid
import shutil
from fastapi import UploadFile
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()

AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER", "samkalp-uploads")

# If connection string exists, we use Azure Blob Storage
IS_AZURE = bool(AZURE_CONNECTION_STRING)

def get_storage_client():
    if IS_AZURE:
        return BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    return None

def save_file(file: UploadFile, folder: str) -> str:
    """
    Saves a file and returns the URL.
    folder: 'thumbnails', 'materials', 'profiles' etc.
    """
    if not file or not file.filename:
        return None

    ext = os.path.splitext(file.filename)[-1].lower()
    filename = f"{folder[:4]}_{uuid.uuid4().hex}{ext}"
    
    if IS_AZURE:
        try:
            blob_service_client = get_storage_client()
            blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=f"{folder}/{filename}")
            
            # Read file content
            content = file.file.read()
            blob_client.upload_blob(content, overwrite=True)
            
            # Reset file pointer for any further use
            file.file.seek(0)
            
            # Return the Azure URL
            return blob_client.url
        except Exception as e:
            print(f"Azure Storage Error: {e}")
            raise e
    else:
        # Local Storage
        base_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.join(base_dir, "static", folder)
        os.makedirs(static_dir, exist_ok=True)
        
        filepath = os.path.join(static_dir, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        return f"/static/{folder}/{filename}"

def delete_file(file_url: str):
    """Deletes a file based on its URL (Local or Azure)."""
    if not file_url:
        return

    if IS_AZURE and "blob.core.windows.net" in file_url:
        try:
            # Extract blob name from URL
            # Url looks like: https://account.blob.core.windows.net/container/folder/filename
            blob_name = file_url.split(f"{AZURE_CONTAINER_NAME}/")[-1]
            blob_service_client = get_storage_client()
            blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=blob_name)
            blob_client.delete_blob()
        except Exception as e:
            print(f"Delete Azure Blob Error: {e}")
    else:
        # Local
        if file_url.startswith("/static/"):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(base_dir, file_url.lstrip("/"))
            if os.path.exists(file_path):
                os.remove(file_path)
