from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import httpx
import os
import mimetypes

router = APIRouter(
    prefix="/view-file",
    tags=["file-viewer"]
)

ALLOWED_HOSTS = [
    "blob.core.windows.net",
    "localhost",
    "127.0.0.1",
]

def is_allowed_url(url: str) -> bool:
    """Only proxy URLs from trusted sources."""
    return any(host in url for host in ALLOWED_HOSTS)


@router.get("/")
async def view_file(url: str = Query(..., description="Full URL of the file to view")):
    """
    Proxy a file and serve it with Content-Disposition: inline so that
    browsers render it (PDF, images, etc.) instead of downloading it.
    Works for both Azure Blob Storage URLs and local /static/ paths.
    """
    if not url:
        raise HTTPException(status_code=400, detail="URL parameter is required")

    if not is_allowed_url(url):
        raise HTTPException(status_code=403, detail="URL not allowed by proxy")

    # Detect MIME type from URL
    ext = os.path.splitext(url.split("?")[0])[-1].lower()
    mime_type, _ = mimetypes.guess_type(f"file{ext}")
    if not mime_type:
        mime_type = "application/octet-stream"

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch file: HTTP {response.status_code}"
                )

            content = response.content

        headers = {
            # Force inline (browser display) instead of attachment (download)
            "Content-Disposition": "inline",
            "Content-Type": mime_type,
            "Content-Length": str(len(content)),
            # Cache for 1 hour to reduce repeated proxy fetches
            "Cache-Control": "public, max-age=3600",
        }

        return StreamingResponse(
            iter([content]),
            status_code=200,
            headers=headers,
            media_type=mime_type,
        )

    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Proxy fetch error: {str(e)}")
