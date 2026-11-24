# 한존재 홈페이지 — 납품 안내

> 수정 작업을 맡은 분은 **`인수인계_작업자용.md`** 를 먼저 읽어주세요.

정적 HTML 사이트입니다. 빌드 과정 없이 폴더째 웹호스팅(카페24·가비아·Netlify·GitHub Pages 등)에 올리면 됩니다.

## 구성

```
index.html            홈페이지 (국문·영문이 한 페이지에 함께 들어 있음)
en/index.html         예전 영문 주소용 — 자동으로 index.html?lang=en 으로 이동
assets/css/style.css  공통 스타일
assets/css/motion.css 모션 (인트로·첫 화면 장면 전환·제목 효과·메뉴 이동 막) — 이 파일 링크를 빼면 모션만 꺼짐
assets/js/main.js     국문/영문 전환·메뉴·슬라이더·상세 팝업·스크롤 효과
assets/fonts/         웹폰트 (woff2, 자체 호스팅)
assets/img/           사진·로고 (각 사진은 원본 2000px + 모바일용 -1000.jpg)
assets/img/gallery/   공간 상세 갤러리 (room·numaru·kitchen·agungi·deck-번호.jpg, -t.jpg는 미리보기)
assets/video/         첫 화면 영상 (hero.mp4 데스크톱 / hero_m.mp4 모바일)
```

## 국문 / 영문 전환

- 상단 KR / EN(또는 하단 메뉴의 English / 한국어)을 누르면 페이지 이동 없이 그 자리에서 글이 바뀝니다.
- 처음 들어올 때 언어: 주소에 `?lang=en`이 있으면 영문 → 지난번에 고른 언어 → 브라우저 언어가 한국어가 아니면 영문.
- 영문 링크를 따로 공유할 때는 `https://도메인/?lang=en` 을 쓰면 됩니다.
- 문구 수정: 국문은 태그 안의 글, 영문은 같은 태그의 `data-en="..."` 속성 안에 있습니다. 둘 다 고쳐주세요.

## 서체 (브랜드 가이드 v1.0)

- 영문 타이틀: Marcellus
- 국문 헤드라인: 세방고딕 (HJSebang)
- 본문: G마켓 산스 Light / Medium

국문 폰트는 용량을 줄이려고 **자주 쓰는 한글 2,350자 + 현재 페이지에 쓰인 글자**만 담았습니다.
문구를 고치다가 드문 글자(예: 똠, 햏)가 기본 고딕으로 보이면 폰트를 다시 변환해야 합니다.

## 로고

- `logo_white.png` — 첫 화면 영상 위, 하단(어두운 바탕)
- `logo_ink.png` — 스크롤 후 한지색 헤더
- 둘 다 투명 배경 원본입니다.

## 호스팅 (GitHub Pages)

- 주소: https://hanjonjae.github.io  (영문: https://hanjonjae.github.io/?lang=en)
- 저장소: https://github.com/hanjonjae/hanjonjae.github.io  (공개 저장소, 한존재 GitHub 계정)
- 수정 방법: 이 폴더에서 파일을 고친 뒤 커밋해서 `git push` 하면 1분 안에 홈페이지에 반영됩니다.
- 나중에 개인 도메인을 연결하면 `index.html`의 og:image · og:url · canonical 주소도 새 도메인으로 바꿔주세요.

## 하단 사업자 정보

상호 한존재 · 대표 유우미 · 사업자등록번호 451-07-03198 (사업자등록증 2026-10-14 발급본 기준)

## 연결된 링크

- 예약: 네이버 예약 '한존재 독채' — https://m.booking.naver.com/booking/3/bizes/1751857/items/8156945
- 인스타그램 @hanjonjae, 네이버 블로그 wm10004
- 지도: 네이버·카카오(국문), 구글·네이버(영문)

## 콘텐츠 메모

- "머문 분들의 이야기" 후기 3개는 에어비앤비 실제 후기(2025.12 · 2026.1 · 2026.9)에서 발췌했습니다. 이름은 가렸습니다.
- 공간 사진을 바꾸려면 `assets/img/gallery/`의 같은 이름 파일을 교체하고, 장수가 바뀌면 `index.html`의 `<template ... data-count="숫자">`를 맞춰주세요.
- 요금은 홈페이지에 표시하지 않습니다 (네이버 예약에서 안내).

## 한존재 소식 (대표님 블로그 자동 연결)

- 홈페이지의 "한존재 소식"은 `assets/data/news.json`에 저장된 블로그(blog.naver.com/kgc7215) 최신 글 6개를 보여줍니다.
- 새 글을 반영하려면 홈페이지 폴더에서 아래를 실행한 뒤, 바뀐 `assets/data/news.json`을 서버에 올리면 됩니다.
  `python3 tools/update_news.py`
- **자동 갱신 설정됨**: GitHub Actions(`.github/workflows/update-news.yml`)가 매일 오전 8시·오후 8시(한국시간)에 블로그를 확인하고, 새 글이 있으면 홈페이지에 반영합니다.
  - 바로 반영하고 싶으면 저장소의 Actions 탭 → "한존재 소식 갱신" → Run workflow.
  - 매달 1일에 `.github/last-check.txt`에 "확인함" 기록을 남겨, 블로그를 오래 쉬어도 GitHub가 예약 실행을 멈추지 않게 해 두었습니다 (GitHub는 60일간 변화가 없으면 멈춤). 혹시 멈췄다는 메일이 오면 Actions 탭에서 다시 켜(Enable) 주세요.
- 네이버가 다른 사이트에서 RSS를 직접 읽지 못하게 막아 두어서(CORS) 이 "미리 받아두기" 방식이 필요합니다.
- 블로그 사진은 네이버 서버에서 바로 불러옵니다(파일을 복사하지 않음). 파일을 열 수 없으면 섹션은 자동으로 숨겨집니다.
