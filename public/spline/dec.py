#!/usr/bin/env python3
"""
decode_splinecode.py – fully expand a .splinecode file and dump it as JSON.

Usage:
    python decode_splinecode.py scene.splinecode > scene.json

Dependencies:
    pip install msgpack
"""
import json, sys, base64, msgpack
from pathlib import Path

TOKEN = 114  # Spline's custom MessagePack ExtType ID


# ---------------------------------------------------------------------------
#  Low-level: read one logical object, handling the token/key-table trick
# ---------------------------------------------------------------------------
def _read(u: msgpack.Unpacker, tables: dict):
    obj = u.unpack()

    if isinstance(obj, msgpack.ExtType) and obj.code == TOKEN:
        tok = obj.data
        if tok not in tables:                 # first time → next item is key-table
            tables[tok] = u.unpack()
        keys = tables[tok]
        return {k: _read(u, tables) for k in keys}

    if isinstance(obj, list):
        return [_read(u, tables) if isinstance(x, msgpack.ExtType) and x.code == TOKEN else x
                for x in obj]

    if isinstance(obj, dict):
        return {k: _read(u, tables) if isinstance(v, msgpack.ExtType) and v.code == TOKEN else v
                for k, v in obj.items()}

    return obj                                # primitive value


def decode(path: Path):
    roots, tables = [], {}
    with path.open("rb") as fh:
        u = msgpack.Unpacker(fh, raw=False, strict_map_key=False)
        try:
            while True:
                roots.append(_read(u, tables))
        except msgpack.OutOfData:
            pass
    return roots


# ---------------------------------------------------------------------------
#  Custom JSON encoder that turns bytes → base64 strings
# ---------------------------------------------------------------------------
class BytesAsBase64(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (bytes, bytearray)):
            return {"__bytes__": base64.b64encode(obj).decode("ascii")}
        return super().default(obj)


# ---------------------------------------------------------------------------
#  CLI entry-point
# ---------------------------------------------------------------------------
def main():
    if len(sys.argv) != 2 or not sys.argv[1].endswith(".splinecode"):
        sys.exit("Usage: python decode_splinecode.py <file.splinecode>")

    src = Path(sys.argv[1])
    if not src.is_file():
        sys.exit(f"File not found: {src}")

    json.dump(decode(src), sys.stdout,
              cls=BytesAsBase64, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
