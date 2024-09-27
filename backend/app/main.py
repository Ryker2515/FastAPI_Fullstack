import base64
import os

import sentry_sdk
from fastapi import FastAPI, HTTPException
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.main import api_router
from app.core.config import settings
from starlette.responses import JSONResponse


def custom_generate_unique_id(route: APIRoute) -> str:
        return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

origins = [
    "http://localhost","http://localhost:5174","http://localhost:5173","https://localhost","https://localhost:5173","http://localhost.tiangolo.com"
]
# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Correctly locate the static files directory
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
app.mount("/api/v1/static", StaticFiles(directory=static_dir), name="static")

