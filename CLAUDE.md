# 한존재 홈페이지 — AI 작업 안내 (Claude Code 등)

영덕 독채 한옥스테이 **한존재(閑存齋)** 의 공식 홈페이지. 정적 단일 페이지, 국문·영문 전환.
이 파일은 AI 코딩 도구가 이 저장소를 열었을 때 바로 이어서 작업할 수 있도록 맥락을 정리한 것이다.

- 라이브: https://hanjonjae.github.io  (영문 `?lang=en`)
- 저장소: `hanjonjae/hanjonjae.github.io` — `main`에 push하면 GitHub Pages가 약 1분 뒤 배포
- 사람용 문서: `인수인계_작업자용.md`(작업 방법) · `작업이력_결정사항.md`(확정 사항·이력) · `README_납품안내.md`(사장님용 요약)

## 먼저 읽을 것

1. **`작업이력_결정사항.md`의 "확정 사항" 표** — 요금 미표시, 전화번호 숨김 버튼, 패럴랙스 금지, 국문판 영어 최소화 등. 이 결정을 되돌리는 변경은 하지 말고 사용자에게 먼저 확인한다.
2. `인수인계_작업자용.md`의 3장 "꼭 알아야 할 규칙".

## 기술 구성

- 빌드 없음. `index.html` 한 파일 + `assets/css/style.css`, `assets/css/motion.css`, `assets/js/main.js` (바닐라 JS).
- 웹폰트는 브랜드 서체를 서브셋한 woff2 (`assets/fonts/`). 원본은 저작권 때문에 저장소에 없음.
- 블로그 소식: `tools/update_news.py`가 네이버 RSS(kgc7215) → `assets/data/news.json`. GitHub Actions(`.github/workflows/update-news.yml`)가 매일 KST 08:00/20:00 + 매달 1일 출석 체크 커밋.

## 작업 규칙

- **국문·영문 동시 수정**: 국문은 요소 안의 글, 영문은 같은 요소의 `data-en`(블록 단위는 이스케이프된 HTML), `alt`↔`data-en-alt`, `aria-label`↔`data-en-aria-label`. 한쪽만 고치지 않는다.
- **CSS/JS 수정 후** `python3 tools/bump_version.py`로 `?v=` 캐시 버전을 올린다.
- **새 한글이 들어가면** 웹폰트에 없는 글자일 수 있다 → `python3 tools/build_fonts.py <원본 폰트 폴더>` (원본은 사용자에게 요청).
- **사진**은 `python3 tools/make_images.py photo|gallery <원본> <이름>`으로 변환 (큰 화면 2000px + `-1000` 모바일, 갤러리 1800px + `-t` 360px). 갤러리 장수 변경 시 `<template data-count>` 수정.
- 스크롤 등장 모션: `.reveal` / 사진은 `.reveal-img`이며 **clip-path는 안쪽 `img`에만** (틀에 걸면 IntersectionObserver가 동작 안 함).
- `main h1, main h2`는 `<br>` 기준으로 줄 분리 모션이 붙는다.
- 브레이크포인트: 1360(상단 메뉴 글자) · 820(모바일) · 620 · 420(여백 28px). `style.css` 뒤쪽 블록이 앞쪽을 덮어쓰는 보정 규칙이다.
- 블로그 썸네일 `img`의 `referrerpolicy="no-referrer"`를 지우지 않는다 (네이버가 403).
- push 전 `git pull --rebase` (자동 갱신 봇이 `news.json`을 커밋함).

## 확인 방법

- 로컬: `python3 -m http.server 5190` → http://localhost:5190 (파일 직접 열기는 news.json fetch가 안 됨)
- 수정 후 **375px 모바일 + 1440px 데스크톱**, **국문 + 영문**을 모두 확인한다. 모바일 가독성(좌우 여백, 겹침, 줄바꿈)을 특히 꼼꼼히 본다.
- 배포 후 https://hanjonjae.github.io 에서 실제 반영 확인.

## 계정·권한

- 저장소 주인은 한존재 `hanjonjae` GitHub 계정이며, 작업자도 **한존재 구글 계정으로 GitHub에 로그인**해서 작업한다.
- 로그인·인증·결제·도메인 구매는 **항상 사용자가 직접** 한다. AI는 비밀번호·인증 코드를 받거나 입력하지 않는다.

## 이미지 생성

새 이미지가 필요하면 SVG·플레이스홀더로 대체하지 말고, 사용자에게 실제 사진(인스타 피드 정리본 등)을 요청하거나 사용자의 이미지 생성 방식(이전 작업에서는 Codex `codex exec`, ChatGPT 구독)으로 발주한다.

## 남은 일

개인 도메인 연결(구매 후 Pages Custom domain + `og:image`/`og:url`/`canonical` 교체), 서치어드바이저·서치콘솔 등록, 통계 도입 여부 — 모두 한존재 측 결정 대기.
