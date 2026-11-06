from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mcp.server.transport_security import TransportSecuritySettings
from mcp.server.fastmcp import FastMCP

from server.data_models import ChunkDocument
from server.draft_store import get_draft, save_draft
from server.export import locate, produce
from server.mcp_tools import register_tools

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

MEDIA_TYPES = {
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "apkg": "application/octet-stream",
}


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
    try:
        artifacts = produce(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return DocumentResponse(
        message="Documents generated successfully",
        docx_filename=artifacts.docx,
        apkg_filename=artifacts.apkg,
    )


@app.get(
    "/api/download/{file_type}/{filename}",
    summary="下载文件",
    description="下载之前生成的.docx或.apkg文件",
)
async def download_file(file_type: str, filename: str):
    if file_type not in MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_path = locate(filename)
    if file_path is None:
        raise HTTPException(status_code=404, detail="File not found")

    return Response(
        content=file_path.read_bytes(),
        media_type=MEDIA_TYPES[file_type],
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


mcp_server = FastMCP(
    "Anki Maker",
    transport_security=TransportSecuritySettings(
        enable_dns_rebinding_protection=False
    ),
)
register_tools(mcp_server)
app.mount("/mcp", mcp_server.sse_app())
