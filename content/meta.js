window.WORLD = window.WORLD || { pages: [] };

WORLD.pages.push({
  id: 'references',
  group: '자료',
  title: '레퍼런스 대조표',
  subtitle: '게임 · 지역 · 가져온 것',
  md: `
## 지역별 대조
| 관륜 세계 | 참고한 게임 · 지역 |
|---|---|
| 세베랴 연방 | 명일방주 우르수스 제국 / 젠레스 존 제로 뉴에리두 |
| 흐림헤임 피오르 연합 | 명일방주 쉐라그 · 사미 / 룬테라 프렐요드 / 카제나 아카이브 룸 |
| 청운국 | 메이플스토리 무릉 / (대비) 명조 금주 |
| 적막대 | 명조 폐허 탐사 / 카제나 카오스 |
| 자르카 칼리프령 | 룬테라 슈리마 / 명일방주 사르곤 |
| 카스카라 자유항 | 룬테라 빌지워터 / 젠레스 존 제로 뉴에리두 |
| 아우라 부유군도 | 메이플스토리 오르비스 · 루디브리엄 |
| 철새 선단 | 카제나 스텔라 파밀리아 |

## 우주 위계 대조
| 관륜 세계 | 참고 |
|---|---|
| 조문객 · 체류자 | 퍼니싱 그레이 레이븐 관측자 · 관리자 / 명조 프롤로그의 정체불명 여성 (팬 추측) |
| 집례자 | 퍼니싱 그레이 레이븐 '그들' (문명의 시험) |
| 관륜의 방송 · 혼선 | 퍼니싱 적조 / 명조 비명재해 · 잔상 |
| 상주 | 참고작 없음. 한 단계 위의 오리지널 |

## 겹침 주의 목록
- 명조의 핵심은 소리 · 공명. 관륜 방송은 소리가 아니라 **신호와 인프라**로 정의한다.
- 명조 라하이로이는 동토 지하사회 → 세베랴는 지하 도시를 쓰지 않는다.
- 명조 세티넬은 국가 수호신 + 지정 공명자 → 체류자는 공인되지 않고, 국가와 무관하며, 개인에게 집착한다.
- 명일방주 쉐라그 · 룬테라 프렐요드는 북방 전근대 사회 → 흐림헤임은 근미래 기업 피오르.

## 자료 출처
- [akgcc Arknights Story Reader](https://akgcc.github.io/story/#main&main_0&0)
- [Timo's Arknights Story Reader](https://arknights.timo.beer/)
- [ArknightsStoryTextReader](https://050644zf.github.io/ArknightsStoryTextReader/) (점검 중)
- [나무위키 · 카오스 제로 나이트메어](https://namu.wiki/w/카오스%20제로%20나이트메어)
- [나무위키 · 카오스 제로 나이트메어/등장인물 및 세력](https://namu.wiki/w/카오스%20제로%20나이트메어/등장인물%20및%20세력)
- [Wuthering Waves Wiki · Jué](https://wutheringwaves.fandom.com/wiki/Ju%C3%A9)
- [아카라이브 명조 채널 · 관측자에 관하여 및 명조와의 연관성](https://arca.live/b/wutheringwaves/187001430)
`
});

WORLD.pages.push({
  id: 'images',
  group: '자료',
  title: '이미지 작업',
  subtitle: 'Gemini로 썸네일 만들기',
  md: `
## 이미지 넣는 규칙
- 지역 이미지는 \`images/<지역id>.png\` 로 저장하면 자동으로 표시된다.
- 지역 id: severya, hrimheim, cheongun, silent, zarqa, cascara, aura, migrants
- 각 지역 페이지 아래에 **Gemini용 프롬프트**와 복사 버튼이 있다.

## 방법 A: Gemini 앱에서 직접 (구독만으로 가능)
1. 지역 페이지에서 프롬프트를 복사한다.
2. Gemini 앱 또는 gemini.google.com에 붙여 넣고 이미지를 생성한다.
3. 저장한 파일을 \`images/<지역id>.png\` 로 이름을 바꿔 넣는다.

## 방법 B: Gemini API로 자동 생성
> Gemini 앱 구독(Google AI Pro 등)과 Gemini API는 **별개**다. API는 Google AI Studio에서 발급한 키로 쓰며, 이미지 모델의 무료 사용 범위와 요금은 AI Studio에서 확인해야 한다.

1. [Google AI Studio](https://aistudio.google.com/apikey)에서 API 키를 발급한다.
2. PowerShell에서 키를 환경변수로 설정한다.
\`\`\`
$env:GEMINI_API_KEY = "여기에_키"
\`\`\`
3. 사이트 폴더에서 실행한다.
\`\`\`
python tools/gemini_images.py --list-models
python tools/gemini_images.py
python tools/gemini_images.py --only severya --force
\`\`\`
- 기본 모델은 \`gemini-3.1-flash-image\`. \`--model\` 로 바꿀 수 있다.
- 이미 있는 이미지는 건너뛴다. 다시 만들려면 \`--force\`.

## 프롬프트 수정
- 프롬프트는 \`content/prompts.js\` 한 곳에서 관리한다. 사이트와 스크립트가 같은 파일을 읽는다.
- 모든 프롬프트 끝에 공통 화풍 문장(STYLE)이 붙는다. 화풍을 통일하려면 그 문장만 고치면 된다.
`
});
