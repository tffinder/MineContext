# -*- coding: utf-8 -*-

# Copyright (c) 2025 Beijing Volcano Engine Technology Co., Ltd.
# SPDX-License-Identifier: Apache-2.0

"""
Screenshot management routes
"""

from typing import List

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from opencontext.server.middleware.auth import auth_dependency
from opencontext.server.opencontext import OpenContext
from opencontext.server.utils import convert_resp, get_context_lab
from opencontext.utils.logging_utils import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["screenshots"])


class AddScreenshotRequest(BaseModel):
    path: str
    window: str
    create_time: str
    source: str = "unknown"


class AddScreenshotsRequest(BaseModel):
    screenshots: List[AddScreenshotRequest]


@router.post("/api/add_screenshot", response_class=JSONResponse)
async def add_screenshot(
    request: AddScreenshotRequest,
    opencontext: OpenContext = Depends(get_context_lab),
    _auth: str = auth_dependency,
):
    try:
        err_msg = opencontext.add_screenshot(
            request.path, request.window, request.create_time, request.source
        )
        if err_msg:
            return convert_resp(code=400, status=400, message=err_msg)
        return convert_resp(message="Screenshot added successfully")
    except Exception as e:
        logger.exception(f"Error adding screenshot: {e}")
    return convert_resp(code=500, status=500, message="Internal server error")


@router.post("/api/add_screenshots", response_class=JSONResponse)
async def add_screenshots(
    request: AddScreenshotsRequest,
    opencontext: OpenContext = Depends(get_context_lab),
    _auth: str = auth_dependency,
):
    try:
        for screenshot in request.screenshots:
            err_msg = opencontext.add_screenshot(
                screenshot.path, screenshot.window, screenshot.create_time, screenshot.source
            )
            if err_msg:
                return convert_resp(code=400, status=400, message=err_msg)
        return convert_resp(message="Screenshots added successfully")
    except Exception as e:
        logger.exception(f"Error adding screenshots: {e}")
    return convert_resp(code=500, status=500, message="Internal server error")


@router.post("/api/screenshots/retry-failed", response_class=JSONResponse)
async def retry_failed_screenshots(
    opencontext: OpenContext = Depends(get_context_lab),
    _auth: str = auth_dependency,
):
    """Retry processing of previously failed screenshots."""
    try:
        result = opencontext.retry_failed_screenshots()
        return convert_resp(
            data=result,
            message=(
                f"Retried {result.get('retried', 0)} screenshot(s)"
                if result.get("retried", 0) > 0
                else "No failed screenshots to retry"
            ),
        )
    except Exception as e:
        logger.exception(f"Error retrying failed screenshots: {e}")
    return convert_resp(code=500, status=500, message="Internal server error")
