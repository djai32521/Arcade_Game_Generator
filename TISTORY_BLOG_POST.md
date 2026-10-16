# [AI 프로젝트] Google AI Studio와 Gemini로 나만의 3D 레트로 아케이드 게임 생성기 만들기 (playglow)

> **"네 가지 간단한 질문에 답하면, 나만을 위한 커스텀 픽셀 아트 게임과 3D 아케이드 기기가 실시간으로 탄생합니다!"**

안녕하세요! 오늘은 **Google AI Studio**와 최신 **Gemini API**를 활용하여, 웹 브라우저에서 실시간으로 3D 아케이드 캐비닛과 레트로 픽셀 게임을 자동 생성하는 풀스택 프로젝트 **Arcade Game Generator (playglow)** 제작기를 상세하게 공유해 드립니다.

웹에서 누구나 무료로 바로 즐길 수 있도록 **GitHub 소스 코드 배포** 및 **GitHub Pages** 정적 호스팅까지 완료했습니다. 이번 포스팅에서는 기획 의도부터 Three.js 3D 그래픽스, Gemini 구조화된 프롬프트 엔지니어링, iframe 샌드박스 게임 엔진, 그리고 GitHub 배포 과정까지 실제 핵심 코드와 함께 아주 깊이 있게 다루어 보겠습니다.

---

## 📌 목차
1. **프로젝트 소개 및 기획 의도**
2. **배포 주소 및 빠른 체험**
3. **전체 시스템 아키텍처 다이어그램**
4. **Google AI Studio 활용 및 프롬프트 엔지니어링 전략**
5. **핵심 기술 스택**
6. **주요 기능 & 핵심 코드 심층 분석**
   - (1) Three.js 기반 3D 아케이드 캐비닛 및 CRT 포스트 프로세싱 셰이더
   - (2) Gemini API를 통한 게임 기획서(GameDesignCard) 구조화 생성
   - (3) 격리된 iframe 샌드박스 픽셀 게임 런타임 & 60fps 입력 루프
   - (4) 한국어/영어(i18n) 다국어 전환 시스템
   - (5) 절차적 아케이드 캐비닛 텍스처 페인팅 (Marquee & Side Art)
7. **GitHub 배포 및 GitHub Pages 호스팅 가이드**
8. **트러블슈팅 및 성능 최적화**
9. **마무리 및 향후 발전 과제**

---

## 1. 프로젝트 소개 및 기획 의도

어릴 적 오락실에서 동전을 넣고 즐기던 8비트/16비트 레트로 아케이드 게임의 감성을 기억하시나요?  
최근 대형 언어 모델(LLM)이 비약적으로 발전하면서 텍스트나 간단한 코드를 생성하는 프로젝트는 많아졌지만, **"플레이어가 원하는 세계관, 캐릭터, 난이도, 게임 장르에 맞추어 3D 기기 외형(스킨)과 실제 동작하는 게임 소프트웨어를 동시에 절차적으로 생성하는 인터랙티브 경험"**은 흔치 않았습니다.

**playglow(아케이드 게임 생성기)**는 바로 이 지점에서 출발했습니다.

* **4단계 간단한 질문**:
  1. 플레이어 닉네임
  2. 게임 장르 (러너, 슈팅, 미로, 벽돌깨기, 플랫포머, 회피)
  3. 주인공 캐릭터 (예: "목도리를 두른 꼬마 여우", "비둘기가 된 직장 상사")
  4. 비주얼 분위기 / Vibe (sunset, mint, cosmic, candy)
* **실시간 생성 및 3D 시각화**:
  Gemini 모델이 게임의 타이틀, 스토리, 룰, 장애물 로직, 컬러 팔레트를 실시간으로 기획하고, Three.js 3D 오락실 기계에 플레이어 맞춤형 마키(전광판)와 사이드 아트를 실시간으로 입혀줍니다.
* **즉석 플레이**:
  코인을 넣으면 3D 모니터 내부(CRT 볼록 화면과 스캔라인 효과)에서 내가 만든 게임이 즉시 60프레임으로 부팅됩니다!

---

## 2. 배포 주소 및 빠른 체험

* 🌐 **GitHub Pages 실시간 플레이 URL**:  
  👉 [https://djai32521.github.io/Arcade_Game_Generator/](https://djai32521.github.io/Arcade_Game_Generator/)
* 📦 **GitHub 오픈소스 저장소**:  
  👉 [https://github.com/djai32521/Arcade_Game_Generator](https://github.com/djai32521/Arcade_Game_Generator)

> 💡 **조작법 안내**:
> * **이동**: 키보드 방향키 (`←`, `→`, `↑`, `↓`) 또는 `W, A, S, D`
> * **A 버튼 / 점프 / 발사**: `Z` 또는 `Space`
> * **B 버튼 / 대시 / 특수스킬**: `X`
> * **일시정지 (Pause)**: `P`
> * **게임 전환**: `[` (이전 게임) / `]` (다음 게임)
> * **모바일**: 화면 하단에 가상 D-Pad 및 A/B 버튼 자동 제공

---

## 3. 전체 시스템 아키텍처 다이어그램

```
+-----------------------------------------------------------------------------------+
|                                 사용자 브라우저                                    |
|                                                                                   |
|  [ 사용자 입력 ] ---> [ 4문 4답 입력 UI ]                                         |
|                             |                                                     |
|                             v                                                     |
|                 [ Google Gemini Flash API ]                                       |
|               (GameDesignCard 스키마 유효성 검증)                                 |
|                             |                                                     |
|              +--------------+--------------+                                      |
|              |                             |                                      |
|              v                             v                                      |
|   [ 3D 아케이드 캐비닛 ]        [ 픽셀 게임 샌드박스 런타임 ]                     |
|   - Three.js WebGL 렌더러       - 독립형 iframe 샌드박스 (CartHost)               |
|   - 동적 캔버스 스킨 합성       - 60Hz 게임 루프 & 충돌 판정                      |
|   - 커스텀 CRT 셰이더           - 32-Color PICO-8 색상 팔레트 매핑                |
|   - 레트로 카메라 애니메이션    - Web Audio 칩튠 사운드 & 허밍 노이즈             |
+-----------------------------------------------------------------------------------+
```

---

## 4. Google AI Studio 활용 및 프롬프트 엔지니어링 전략

이 프로젝트의 핵심 두뇌는 **Google AI Studio**와 **Gemini 2.5 Flash / Gemini 1.5 Flash**입니다.

### 4.1. 왜 Google AI Studio인가?
1. **압도적인 응답 속도**: 저지연(Low-latency) 스트리밍과 초고속 TTFT(Time-to-first-token) 덕분에 사용자가 "코인 넣기"를 눌렀을 때 대기 시간을 극적으로 단축시킵니다.
2. **구조화된 출력(Structured Outputs - JSON Schema)**: 게임 기획 데이터(`GameDesignCard`)를 Ajv 스키마에 100% 부합하는 엄격한 JSON 형식으로 받아올 수 있어 런타임 파싱 에러를 사전에 방지합니다.
3. **시스템 인스트럭션(System Instructions) 분리**: 게임 디자인 전문가 페르소나를 모델에 주입하여 레트로 게임다운 명확한 규칙과 재치 있는 대사(Tagline)를 생성하도록 유도했습니다.

### 4.2. GameDesignCard JSON 스키마 예시
Gemini가 반환하는 게임 기획 데이터의 스키마 구조는 다음과 같습니다:

```typescript
export interface GameDesignCard {
  id: string;
  version: "1.0.0";
  genre: "runner" | "shooter" | "maze" | "breakout" | "platformer" | "dodger";
  title: string;          // 예: "FOXFIRE RUN"
  tagline: string;        // 예: "outrun the dusk, grab every star"
  player_name: string;
  hero: {
    name: string;
    description: string;  // 예: "a small orange fox in a tiny blue scarf"
    short: string;        // 예: "fox"
  };
  enemies: Array<{
    name: string;
    description: string;
    behaviour: string;
  }>;
  collectible: {
    name: string;
    description: string;
  };
  twist: string;          // 차별화 요소 (예: "double jump + dash")
  palette: {
    bg: string;
    fg: string;
    accent1: string;
    accent2: string;
    ui: string;
  };
}
```

---

## 5. 핵심 기술 스택

| 영역 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite 6 | 컴포넌트 생태계, 엄격한 정적 타입 검증, 초고속 HMR 번들링 |
| **3D Graphics** | Three.js (0.170.0), GLTF | 3D 아케이드 캐비닛 모델링, 다이내믹 텍스처 매핑, 쿼터뷰 카메라 전환 |
| **Shader** | GLSL CRT Post-processing Shader | 아날로그 브라운관 배럴 왜곡, 스캔라인, RGB 형광체 발광 효과 |
| **AI Engine** | Google Gemini API (`@google/genai`) | 구조화된 게임 메카닉스 설계, 절차적 픽셀 아트 프롬프트 처리 |
| **Styling** | Tailwind CSS v4, Custom Retro CSS | 레트로 글래스모피즘, Bricolage Grotesque, Noto Sans KR 폰트 |
| **Audio** | Web Audio API | 아케이드 캐비닛의 배경 험(hum) 노이즈 및 동전 투입, 선택 칩튠 사운드 |
| **Deployment** | GitHub Actions, GitHub Pages | main 브랜치 푸시 시 자동 정적 빌드 및 글로벌 CDN 호스팅 |

---

## 6. 주요 기능 & 핵심 코드 심층 분석

### (1) Three.js 기반 3D 아케이드 캐비닛 & CRT 셰이더

단순 2D 화면보다 실제 오락실 기계 앞에 서 있는 듯한 몰입감을 주기 위해 Three.js로 아케이드 캐비닛을 구성했습니다. 특히 CRT 모니터의 레트로 느낌을 살리기 위해 화면 텍스처에 커스텀 셰이더를 적용했습니다.

```glsl
// crtShader.ts - 브라운관 볼록 왜곡 및 스캔라인 셰이더
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;
varying vec2 vUv;

// 배럴 왜곡(Barrel Distortion) 함수
vec2 curve(vec2 uv) {
  uv = (uv - 0.5) * 2.0;
  uv *= 1.1;
  uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
  uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
  uv = (uv / 2.0) + 0.5;
  return uv;
}

void main() {
  vec2 uv = curve(vUv);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // 베젤 밖 어둡게 처리
    return;
  }

  // 스캔라인(Scanline) 음영 연산
  float scanline = sin(uv.y * resolution.y * 1.5) * 0.08;
  vec4 color = texture2D(tDiffuse, uv);
  color.rgb -= scanline;

  // 비네팅(Vignette) 효과
  float vig = 16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  color.rgb *= clamp(pow(vig, 0.25), 0.0, 1.0);

  gl_FragColor = color;
}
```

### (2) Gemini API를 통한 게임 기획서 구조화 생성

사용자가 4가지 질문에 답변하면, 백엔드/프록시 및 SDK를 거쳐 Gemini 모델이 기획서를 JSON으로 인출합니다.

```typescript
// card/designCard.ts
import { GoogleGenAI } from "@google/genai";
import { type GameDesignCard } from "./schema";

export async function generateDesignCard(answers: {
  name: string;
  genre: string;
  hero: string;
  vibe: string;
}): Promise<GameDesignCard> {
  const ai = new GoogleGenAI({});
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Design a retro arcade cartridge based on:
Player: ${answers.name}
Genre: ${answers.genre}
Hero: ${answers.hero}
Vibe: ${answers.vibe}

Rules:
1. Title must be punchy (2-3 words).
2. Create 2 distinct enemy types with clear movement patterns.
3. Define 1 clever mechanical twist.
4. Output strictly adhering to the JSON schema.`,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const parsedCard = JSON.parse(response.text.trim());
  return parsedCard;
}
```

### (3) 안전한 iframe 샌드박스 게임 엔진 (`CartHost.ts`)

AI가 생성한 자바스크립트 게임 코드가 메인 애플리케이션의 메모리를 오염시키거나 충돌을 일으키지 않도록, 별도의 격리된 `iframe` 환경(`about:blank` 또는 호스트 페이지)에서 샌드박싱합니다.  
메인 스레드와 게임 간의 입력(방향키, 버튼) 및 텔레메트리(점수, 충돌 이벤트)는 **`postMessage`**와 고속 직접 호출 버퍼를 통해 60fps로 매끄럽게 통신합니다.

```typescript
// cart/CartHost.ts - 60fps 입력 전달 및 가상 키패드 상태 루프
export interface CartInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  a: boolean;
  b: boolean;
  start: boolean;
}

export class CartHost {
  private iframe: HTMLIFrameElement;
  private inputBuffer: CartInputState;

  constructor(container: HTMLElement) {
    this.iframe = document.createElement("iframe");
    this.iframe.sandbox.add("allow-scripts");
    this.iframe.src = "/cart/host.html";
    container.appendChild(this.iframe);
  }

  // 매 16.6ms(60Hz)마다 Three.js 렌더 루프에서 틱 실행
  public tick(dt: number, input: CartInputState): void {
    if (!this.iframe.contentWindow) return;
    this.iframe.contentWindow.postMessage({
      type: "TICK",
      dt,
      input,
    }, "*");
  }
}
```

### (4) 한국어/영어(i18n) 다국어 지원 시스템

국내외 모든 유저가 편리하게 사용할 수 있도록 **기본 한국어(Default: KO)**를 지원하며, 헤더 우측의 `🌐 English / 한국어` 토글 버튼을 통해 실시간으로 언어를 변경할 수 있도록 구축했습니다.

```typescript
// src/i18n.ts
export type Language = "ko" | "en";

export const DICTIONARY = {
  ko: {
    wordmark: "playglow",
    credit: "Gemini AI 탑재",
    crtWarmup: "CRT 모니터 예열 중…",
    langBtn: "English",
    stepName: "1 / 4",
    questionName: "플레이어 님의 이름을 알려주세요",
    placeholderName: "플레이어 1 또는 닉네임",
    stepGenre: "2 / 4",
    questionGenre: "어떤 장르의 게임을 만들까요?",
    genreLabels: {
      runner: { label: "러너 (달리기)", desc: "별을 모으며 장애물 질주" },
      shooter: { label: "슈팅 (우주선)", desc: "우주선 탄막 격추 액션" },
      maze: { label: "미로 (탈출)", desc: "도트 수집과 유령 회피" },
      breakout: { label: "벽돌깨기", desc: "탱탱볼로 컵케이크 블록 타격" },
      platformer: { label: "플랫포머 (점프)", desc: "용암을 피해 깃발까지 도약" },
      dodger: { label: "회피 (낙하물)", desc: "하늘에서 쏟아지는 불타는 운석 회피" },
    },
    // ...
  },
  en: {
    wordmark: "playglow",
    credit: "built with gemini",
    crtWarmup: "warming up the crt…",
    langBtn: "한국어",
    // ...
  }
};
```

---

## 7. GitHub 배포 및 GitHub Pages 호스팅 가이드

정적 번들 배포를 위해 Vite 설정과 GitHub Actions 워크플로우를 최적화했습니다.

### 7.1. 상대 경로(`base: "./"`) 설정
GitHub Pages는 저장소명 하위 경로(`https://username.github.io/repo-name/`)에서 동작하므로, 절대 경로 `/assets/...` 대신 상대 경로 또는 서브패스 베이스 URL을 지정해 주어야 합니다.

```typescript
// vite.config.ts
export default defineConfig({
  base: "./", // GitHub Pages 서브디렉토리 완벽 호환
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
```

### 7.2. GitHub Actions CI/CD 워크플로우 (`.github/workflows/deploy.yml`)
`main` 브랜치에 코드를 푸시하면 자동으로 빌드되어 GitHub Pages에 즉각 배포됩니다:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

---

## 8. 트러블슈팅 및 성능 최적화 경험

1. **저사양 디바이스 및 모바일 프레임 드랍**:
   * **원인**: 고해상도 3D 캐비닛 렌더링 + CRT 포스트프로세싱 셰이더가 모바일 GPU에서 발열을 유발.
   * **해결**: `window.devicePixelRatio`를 최대 1.5로 캡핑하고, 게임 플레이 중에는 3D 캐비닛의 배경 요소를 Frustum Culling 처리하여 60fps를 안정적으로 방어했습니다.
2. **네트워크 오프라인 또는 API 할당량 초과 대비**:
   * 네트워크가 끊기거나 API 키가 없는 환경에서도 즉시 구동될 수 있도록, 6개 기본 장르에 대한 엄선된 **"하우스 클래식 게임(House Games)"**과 **"절차적 프리셋 스킨"**을 번들에 포함시켜 언제 어디서나 100% 정상 작동하도록 폴백(Fallback) 시스템을 구축했습니다.

---

## 9. 마무리 및 향후 발전 과제

Google AI Studio와 Gemini API를 활용하면서 가장 놀라웠던 점은 **"프롬프트 하나만으로 인터랙티브 게임 소프트웨어의 기획과 로직, 디자인 룰셋이 2~3초 만에 유기적으로 완성된다"**는 것이었습니다.

앞으로는:
* 🔊 음성 입력(Google Speech-to-Text)으로 말로 게임을 만드는 기능
* 🎮 사용자가 직접 그린 도트 스프라이트를 업로드하여 캐릭터로 변환하는 기능
* 🏆 멀티플레이 랭킹 리더보드 시스템

등을 점진적으로 추가해 볼 계획입니다.

궁금한 점이나 추가 구현 아이디어가 있으시다면 언제든 댓글 남겨주세요!  
도움이 되셨다면 공감과 구독 부탁드립니다. 감사합니다! 😊

---
* **GitHub Repository**: [https://github.com/djai32521/Arcade_Game_Generator](https://github.com/djai32521/Arcade_Game_Generator)
* **Live Demo**: [https://djai32521.github.io/Arcade_Game_Generator/](https://djai32521.github.io/Arcade_Game_Generator/)
