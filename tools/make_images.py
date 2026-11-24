#!/usr/bin/env python3
"""사진을 홈페이지용 크기로 변환

실행 (홈페이지 폴더에서):
    pip3 install pillow                                  # 처음 한 번만

    # 일반 사진: assets/img/<이름>.jpg (긴 변 2000px) + <이름>-1000.jpg (모바일용, 가로 1000px)
    python3 tools/make_images.py photo <원본 사진> <이름>
    예) python3 tools/make_images.py photo ~/Desktop/새앞마당.jpg front

    # 공간 상세 갤러리: assets/img/gallery/<공간>-<번호>.jpg (긴 변 1800px) + -t.jpg (미리보기 360px)
    python3 tools/make_images.py gallery <원본 사진> <공간>-<번호>
    예) python3 tools/make_images.py gallery ~/Desktop/누마루3.jpg numaru-3

같은 이름으로 만들면 기존 사진을 덮어씁니다 (HTML은 고칠 필요 없음).
휴대폰 사진의 회전 정보는 반영하고, 촬영 위치 같은 메타데이터는 지웁니다.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"


def save(im: Image.Image, path: Path, long_edge: int = 0, width: int = 0, quality: int = 82) -> None:
    im = im.copy()
    if width:
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    elif long_edge:
        im.thumbnail((long_edge, long_edge), Image.LANCZOS)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"{path.relative_to(ROOT)}  {im.width}×{im.height}  {path.stat().st_size // 1024}KB")


def main() -> int:
    if len(sys.argv) != 4 or sys.argv[1] not in ("photo", "gallery"):
        print(__doc__)
        return 1
    mode, src, name = sys.argv[1], Path(sys.argv[2]).expanduser(), sys.argv[3].removesuffix(".jpg")
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if mode == "photo":
        save(im, IMG / f"{name}.jpg", long_edge=2000)
        save(im, IMG / f"{name}-1000.jpg", width=1000, quality=80)
    else:
        save(im, IMG / "gallery" / f"{name}.jpg", long_edge=1800)
        save(im, IMG / "gallery" / f"{name}-t.jpg", long_edge=360, quality=78)
    print("완료 — tools/bump_version.py 를 실행한 뒤 올려주세요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
