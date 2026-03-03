"""
Reading all the save file data
"""

from .parse_utils import read_section
from .parser import parse_save_file

__all__ = [
    "read_section",
    "parse_save_file"
]