import time
from os import getenv
from pathlib import Path
from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from nanoid import generate

from server.data_models import ChunkDocument
from server.anki_utils import gen_anki
from server.document_utils import create_document, generate_tables, generate_footer
from server.draft_store import save_draft, get_draft
from server.mcp_tools import register_tools
from mcp.server.fastmcp import FastMCP

app = FastAPI(
    title="Anki Maker API",
    description="一个将文本内容转换为Anki卡片和Word文档的API服务",
    version="1.0.1",
    contact={
        "name": "API Support",
        "url": "https://github.com/cup113/anki_maker",
        "email": "support@ankimaker.com",
    },
    license_info={
        "name": "Apache 2.0 License",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


PRODUCTION = getenv("APP_ENV") == "production"


def cleanup_old_files(max_age_hours: int = 24):
    output_dir = Path("/app/output") if PRODUCTION else Path("./temp")
    cutoff = time.time() - max_age_hours * 3600
    for pattern in ("*.docx", "*.apkg"):
        for f in output_dir.glob(pattern):
            if f.stat().st_mtime < cutoff:
                f.unlink(missing_ok=True)


class DocumentResponse(BaseModel):
    message: str = "Documents generated successfully"
    docx_filename: str
    apkg_filename: str


@app.post(
    "/api/generate",
    response_model=DocumentResponse,
    summary="生成文档",
    description="根据提供的内容生成Word文档(.docx)和Anki卡组(.apkg)文件",
)
async def generate_documents(request: ChunkDocument):
    cleanup_old_files()
    output_dir = Path("/app/output") if PRODUCTION else Path("./temp")
    file_id = generate()

    try:
        document = request
        doc = create_document(document)
        generate_tables(doc, document.records)
        generate_footer(doc, document.footer)

        docx_file_path = output_dir / f"{file_id}.docx"
        doc.save(str(docx_file_path))

        apkg_file_path = output_dir / f"{file_id}.apkg"
        gen_anki(
            document.records,
            document.deckType,
            apkg_file_path,
        )

        final_docx_path = Path(output_dir) / f"{file_id}.docx"
        final_apkg_path = Path(output_dir) / f"{file_id}.apkg"

        docx_file_path.rename(final_docx_path)
        apkg_file_path.rename(final_apkg_path)

        return DocumentResponse(
            message="Documents generated successfully",
            docx_filename=f"{file_id}.docx",
            apkg_filename=f"{file_id}.apkg",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/download/{file_type}/{filename}",
    summary="下载文件",
    description="下载之前生成的.docx或.apkg文件",
)
async def download_file(file_type: str, filename: str):
    if file_type not in ["docx", "apkg"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_path = Path("/app/output" if PRODUCTION else "./temp") / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    media_types = {
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "apkg": "application/octet-stream",
    }

    content = file_path.read_bytes()

    return Response(
        content=content,
        media_type=media_types[file_type],
        headers={"Content-Disposition": "attachment"},
    )


@app.get("/api/", summary="API根路径", description="检查API是否正在运行")
async def root():
    return {"message": "Anki Maker API is running"}


@app.post(
    "/api/drafts",
    summary="保存草稿",
    description="保存卡片数据为草稿，返回可编辑的草稿ID",
)
async def save_draft_endpoint(request: ChunkDocument):
    draft_id = save_draft(request.model_dump())
    return {"id": draft_id, "edit_url": f"/edit/{draft_id}"}


@app.get(
    "/api/drafts/{draft_id}",
    summary="获取草稿",
    description="通过草稿ID获取之前保存的卡片数据",
)
async def get_draft_endpoint(draft_id: str):
    data = get_draft(draft_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Draft not found or expired")
    return data


mcp_server = FastMCP("Anki Maker")
register_tools(mcp_server)
app.mount("/mcp", mcp_server.sse_app())


@app.get('/')
async def serve_root():
    return FileResponse('client/dist/index.html')


@app.get('/{full_path:path}')
async def serve_frontend(full_path: str):
    if full_path.startswith(('api/', 'mcp/')):
        raise HTTPException(404)
    static_dir = Path('client/dist')
    file_path = static_dir / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    return FileResponse(str(static_dir / 'index.html'))
