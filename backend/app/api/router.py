from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.workspaces import router as workspaces_router
from app.api.routes.pages import router as pages_router
from app.api.routes.attachments import router as attachments_router
from app.api.routes.audit_logs import router as audit_logs_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(workspaces_router)
api_router.include_router(pages_router)
api_router.include_router(attachments_router)
api_router.include_router(audit_logs_router)