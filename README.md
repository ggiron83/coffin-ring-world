# 관륜 세계관

게임·미디어용 세계관 설정 사이트. 빌드 없이 `index.html`을 열면 바로 보이고, 그대로 GitHub Pages에 올릴 수 있다.

## 구조
- `content/world.js`: 세계 개요, 규칙, 인물 축, 체류자, 전개 구조
- `content/regions.js`: 지역 문서
- `content/meta.js`: 레퍼런스 대조표, 이미지 작업 안내
- `content/prompts.js`: Gemini 이미지 프롬프트 (사이트와 스크립트가 함께 사용)
- `images/<지역id>.png`: 지역 썸네일 (없으면 색 블록으로 표시)
- `tools/gemini_images.py`: Gemini API 이미지 생성 스크립트

## 문서 추가
`content/*.js`에 `WORLD.pages.push({ id, group, title, subtitle, md })` 블록을 하나 더 붙이면 사이드바와 홈에 자동으로 나타난다. 지역이면 `group: '지역'`, `tone`, `image`, `refs`를 함께 적는다.

## GitHub Pages 배포
1. GitHub에서 새 저장소를 만든다.
2. 이 폴더의 파일을 전부 올린다 (웹에서 Add file → Upload files로 드래그해도 된다).
3. Settings → Pages → Branch를 `main` / `(root)`로 지정한다.
4. 잠시 후 `https://<아이디>.github.io/<저장소>/` 에서 열린다.

무료 플랜에서 Pages를 쓰려면 저장소가 공개(public)여야 한다.
