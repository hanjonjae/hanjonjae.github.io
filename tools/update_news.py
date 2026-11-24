#!/usr/bin/env python3
"""한존재 소식 갱신 스크립트

대표님 네이버 블로그(kgc7215)의 RSS에서 최신 글을 읽어
assets/data/news.json 으로 저장합니다. 홈페이지는 이 파일을 읽어 '한존재 소식'을 보여줍니다.

실행:  python3 tools/update_news.py
(파이썬 기본 기능만 사용 — 별도 설치 필요 없음)

네이버 RSS는 브라우저에서 다른 사이트가 직접 읽을 수 없게 막혀 있어서(CORS),
이렇게 미리 받아 두는 방식이 필요합니다. 호스팅에서 하루 1~2번 자동 실행되게 걸어두면
블로그에 글을 쓰면 홈페이지에도 자동으로 올라갑니다 (README_납품안내.md 참고).
"""
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path

BLOG_ID = "kgc7215"
RSS_URL = f"https://rss.blog.naver.com/{BLOG_ID}.xml"
KEEP = 6  # 저장해 둘 글 수 (홈페이지에는 최신 3개 표시)
OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "news.json"


def clean_text(html_text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html_text or "")
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    req = urllib.request.Request(RSS_URL, headers={"User-Agent": "Mozilla/5.0 (hanjonjae-site news updater)"})
    with urllib.request.urlopen(req, timeout=20) as res:
        root = ET.fromstring(res.read())

    posts = []
    for item in root.find("channel").findall("item")[:KEEP]:
        desc = item.findtext("description") or ""
        img = re.search(r'<img[^>]+src="([^"]+)"', desc)
        link = (item.findtext("link") or "").split("?")[0]
        category = re.sub(r"\(.*?\)", "", item.findtext("category") or "").strip()
        when = parsedate_to_datetime(item.findtext("pubDate"))
        excerpt = clean_text(desc)
        posts.append({
            "title": clean_text(item.findtext("title")),
            "link": link,
            "date": when.strftime("%Y.%m.%d"),
            "category": category,
            "excerpt": excerpt[:110] + ("…" if len(excerpt) > 110 else ""),
            "image": img.group(1) if img else "",
        })

    if not posts:
        print("글을 찾지 못해 기존 파일을 그대로 둡니다.", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"blog": f"https://blog.naver.com/{BLOG_ID}", "posts": posts}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(posts)}개 저장 → {OUT}")
    for p in posts[:3]:
        print(" -", p["date"], p["title"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
