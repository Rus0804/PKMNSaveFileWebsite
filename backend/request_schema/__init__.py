"""
All Request Models for Correct Request Validation
"""

from .save_data_requests import *
from .user_data_requests import *

__all__ = [
    "RenameRequest",
    "ResetPasswordRequest",
    "LoginRequest",
    "ResetRequest",
    "MonUpdateRequest",
    "BadgesUpdateRequest",
]