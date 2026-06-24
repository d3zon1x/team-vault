from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def get_error_code_for_status(status_code: int) -> str:
    error_codes = {
        status.HTTP_400_BAD_REQUEST: "bad_request",
        status.HTTP_401_UNAUTHORIZED: "unauthorized",
        status.HTTP_403_FORBIDDEN: "forbidden",
        status.HTTP_404_NOT_FOUND: "not_found",
        status.HTTP_409_CONFLICT: "conflict",
        status.HTTP_422_UNPROCESSABLE_ENTITY: "validation_error",
        status.HTTP_429_TOO_MANY_REQUESTS: "rate_limited",
        status.HTTP_500_INTERNAL_SERVER_ERROR: "internal_server_error",
    }

    return error_codes.get(status_code, "error")


async def http_exception_handler(
    request: Request,
    exc: HTTPException,
) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": get_error_code_for_status(exc.status_code),
                "message": message,
                "details": None if isinstance(exc.detail, str) else exc.detail,
            }
        },
        headers=exc.headers,
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "validation_error",
                "message": "Validation error",
                "details": exc.errors(),
            }
        },
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "internal_server_error",
                "message": "Internal server error",
                "details": None,
            }
        },
    )