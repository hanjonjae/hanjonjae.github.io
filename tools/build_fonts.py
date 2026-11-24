#!/usr/bin/env python3
"""웹폰트 다시 만들기 (브랜드 폰트 원본 → 용량을 줄인 woff2)

언제: 문구를 고쳤는데 일부 한글만 기본 고딕으로 보일 때
      (폰트에 그 글자가 없어서 생기는 일 — 자주 쓰는 한글 2,350자 + 페이지에 쓰인 글자만 담아 둠)

실행 (홈페이지 폴더에서):
    pip3 install fonttools brotli        # 처음 한 번만
    python3 tools/build_fonts.py <브랜드 폰트 원본 폴더>

원본 폴더에 있어야 하는 파일 (저작권 때문에 저장소에는 넣지 않음 — 별도 전달):
    HJGmarketLight.otf, HJGmarketMedium.otf, HJSebangRegular.ttf, Marcellus-Regular.ttf
"""
import html
import re
import sys
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "fonts"

# 원본 파일 → 홈페이지에서 쓰는 파일 이름, 한글 포함 여부
FONTS = [
    ("HJGmarketLight.otf", "GmarketSans-Light.woff2", True),
    ("HJGmarketMedium.otf", "GmarketSans-Medium.woff2", True),
    ("HJSebangRegular.ttf", "HJSebang-Regular.woff2", True),
    ("Marcellus-Regular.ttf", "Marcellus-Regular.woff2", False),
]


def ks_hangul() -> str:
    """자주 쓰는 한글 2,350자 (KS X 1001 완성형)"""
    chars = []
    for hi in range(0xB0, 0xC9):
        for lo in range(0xA1, 0xFF):
            try:
                chars.append(bytes([hi, lo]).decode("euc-kr"))
            except UnicodeDecodeError:
                pass
    return "".join(chars)


def page_text() -> str:
    """index.html 안의 모든 글자 (영문판 data-en 속성 포함) + 블로그 소식 제목"""
    text = html.unescape(html.unescape((ROOT / "index.html").read_text(encoding="utf-8")))
    news = ROOT / "assets" / "data" / "news.json"
    if news.exists():
        text += news.read_text(encoding="utf-8")
    return text


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    src = Path(sys.argv[1]).expanduser()
    latin = "".join(chr(c) for c in range(0x20, 0x7F)) + "".join(chr(c) for c in range(0xA0, 0x100))
    marks = "‘’“”·…–—→←↑↓※°×·「」『』〈〉《》【】〜～・"
    used = set(page_text())
    hangul = set(ks_hangul()) | {c for c in used if "가" <= c <= "힣" or "ㄱ" <= c <= "ㆎ"}
    hanja = {c for c in used if "一" <= c <= "鿿"}  # 閑存齋 같은 한자

    for src_name, out_name, korean in FONTS:
        path = src / src_name
        if not path.exists():
            print(f"원본이 없습니다: {path}")
            return 1
        chars = set(latin) | set(marks)
        if korean:
            chars |= hangul | hanja | {c for c in used if not c.isspace()}
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        font = subset.load_font(str(path), opts)
        sub = subset.Subsetter(opts)
        sub.populate(text="".join(sorted(chars)))
        sub.subset(font)
        out = OUT / out_name
        subset.save_font(font, str(out), opts)
        print(f"{out_name}: {len(font.getBestCmap())}자, {out.stat().st_size // 1024}KB")
    print("완료 — tools/bump_version.py 를 실행한 뒤 올려주세요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
