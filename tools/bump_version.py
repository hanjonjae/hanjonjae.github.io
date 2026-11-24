#!/usr/bin/env python3
"""CSS·JS 버전 번호 올리기

왜: 방문자 브라우저는 style.css·main.js를 저장해 두고 다시 씁니다.
    index.html 안의 '?v=번호'를 바꿔야 고친 CSS·JS를 새로 받아 갑니다.
    CSS/JS를 고쳤으면 올리기 전에 꼭 실행하세요. (HTML 문구·사진만 고쳤으면 안 해도 됨)

실행 (홈페이지 폴더에서):  python3 tools/bump_version.py
"""
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

INDEX = Path(__file__).resolve().parent.parent / "index.html"


def main() -> int:
    text = INDEX.read_text(encoding="utf-8")
    new = datetime.now(timezone(timedelta(hours=9))).strftime("%Y%m%d%H%M")
    text, n = re.subn(r"\?v=[0-9a-z]+", f"?v={new}", text)
    if not n:
        print("index.html에서 ?v= 를 찾지 못했습니다.")
        return 1
    INDEX.write_text(text, encoding="utf-8")
    print(f"{n}곳을 ?v={new} 로 바꿨습니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
