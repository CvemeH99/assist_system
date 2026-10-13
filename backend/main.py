"""FastAPI 启动入口。"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.knowledge_base import init_knowledge_base
from app.database import register_db
from app.routers import main_router
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理：启动时初始化向量知识库。"""
    init_knowledge_base()
    yield

# 创建 FastAPI 实例
app = FastAPI(lifespan=lifespan)

# 添加跨域请求CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(main_router)

# 连接数据库
register_db(app)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
