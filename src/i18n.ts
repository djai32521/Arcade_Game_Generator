export type Language = "ko" | "en";

export interface I18nDict {
  wordmark: string;
  credit: string;
  crtWarmup: string;
  langBtn: string;
  stepName: string;
  questionName: string;
  placeholderName: string;
  stepGenre: string;
  questionGenre: string;
  genreLabels: Record<string, { label: string; desc: string }>;
  stepHero: string;
  questionHero: string;
  heroPlaceholders: string[];
  stepVibe: string;
  questionVibe: string;
  vibeLabels: Record<string, string>;
  stepReady: string;
  sayReady: string;
  sayWarming: string;
  insertCoin: string;
  insertingCoin: string;
  playClassics: string;
  buildingPct: (pct: number) => string;
  playClassicsWhileWaiting: string;
  watchBuild: (pct: number) => string;
  buildingBanner: (title: string, pct: number, caption: string) => string;
  stageCaptions: Record<string, string[]>;
  marqueeInterjection: string;
  sideInterjection: string;
  offlineNotice: string;
  busyNotice: string;
  back: string;
  share: string;
  prevGame: string;
  nextGame: string;
  nextUp: string;
  oops: string;
  errorMessage: string;
  resetBtn: string;
}

export const DICTIONARY: Record<Language, I18nDict> = {
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
      maze: { label: "미로 (탈출)", desc: "빛나는 도트 수집과 유령 회피" },
      breakout: { label: "벽돌깨기", desc: "탱탱볼로 컵케이크 블록 타격" },
      platformer: { label: "플랫포머 (점프)", desc: "용암을 피해 깃발까지 도약" },
      dodger: { label: "회피 (낙하물)", desc: "하늘에서 쏟아지는 불타는 운석 회피" },
    },
    stepHero: "3 / 4",
    questionHero: "게임의 주인공은 누구인가요?",
    heroPlaceholders: [
      "목도리를 두른 꼬마 여우",
      "비둘기가 된 직장 상사",
      "꿈 많은 치즈 샌드위치",
      "제트팩 탄 용감한 할머니",
      "우주를 유영하는 아기 고양이",
      "왕관을 쓴 귀여운 슬라임",
    ],
    stepVibe: "4 / 4",
    questionVibe: "게임의 분위기(Vibe)를 골라주세요",
    vibeLabels: {
      sunset: "sunset (노을빛 황혼)",
      mint: "mint (청량한 민트)",
      cosmic: "cosmic (은하수 우주)",
      candy: "candy (달콤한 캔디)",
    },
    stepReady: "준비 완료",
    sayReady: "준비되셨으면 코인을 넣어주세요!",
    sayWarming: "아케이드 캐비닛을 가동하는 중…",
    insertCoin: "코인 넣기 →",
    insertingCoin: "코인 투입 중…",
    playClassics: "클래식 게임 하기 →",
    buildingPct: (pct: number) => `게임 제작 중 · ${pct}%`,
    playClassicsWhileWaiting: "기다리는 동안 클래식 게임 즐기기 →",
    watchBuild: (pct: number) => `← 제작 과정 지켜보기 (${pct}%)`,
    buildingBanner: (title: string, pct: number, caption: string) =>
      `${title} 제작 중 · ${pct}% — ${caption}`,
    stageCaptions: {
      designing: [
        "주인공 {hero} 콘셉트 스케치 중…",
        "게임 이름과 세계관 구상 중. 작명이 제일 어렵죠.",
      ],
      coding: [
        "주인공 {hero}에게 움직임과 물리 엔진 코딩 중.",
        "게임 규칙 작성 중. 치트키 금지!",
        "몬스터와 장애물 스폰 로직 배치 중.",
      ],
      playtesting: [
        "플레이테스트 중! 주인공이 2번 쓰러졌어요. 난이도 수정 중.",
        "적당히 아슬아슬하게 밸런스 조율 중.",
      ],
      testing: [
        "플레이테스트 중! 주인공이 2번 쓰러졌어요. 난이도 수정 중.",
        "적당히 아슬아슬하게 밸런스 조율 중.",
      ],
      finishing: ["픽셀 도트와 복고풍 사운드 칩튠 조율 중."],
      painting: ["3D 아케이드 캐비닛 측면 아트를 칠하는 중."],
      ready: ["완성되었습니다! 바로 플레이해 보세요!"],
    },
    marqueeInterjection: "상단 마키 전광판이 화려해지고 있어요!",
    sideInterjection: "캐비닛 측면 사이드 아트를 칠하는 중입니다.",
    offlineNotice: "오프라인 상태입니다. 클래식 하우스 게임으로 실행합니다.",
    busyNotice: "아케이드에 손님이 몰렸네요! 미리 준비된 엄선작으로 안내합니다.",
    back: "← 뒤로",
    share: "공유하기 →",
    prevGame: "이전 게임",
    nextGame: "다음 게임",
    nextUp: "다음 게임",
    oops: "이런!",
    errorMessage: "예기치 않은 문제가 생겼습니다. 새로고침 후 다시 시도해 주세요.",
    resetBtn: "다시 시작",
  },
  en: {
    wordmark: "playglow",
    credit: "built with gemini",
    crtWarmup: "warming up the crt…",
    langBtn: "한국어",
    stepName: "1 / 4",
    questionName: "what should we call you?",
    placeholderName: "your name or a handle",
    stepGenre: "2 / 4",
    questionGenre: "what kind of game?",
    genreLabels: {
      runner: { label: "runner", desc: "outrun the dusk, grab every star" },
      shooter: { label: "shooter", desc: "blast through the jelly nebula" },
      maze: { label: "maze", desc: "chase the glow, dodge the ghosts" },
      breakout: { label: "breakout", desc: "smash the stack, catch the crumbs" },
      platformer: { label: "platformer", desc: "hop high before the lava rises" },
      dodger: { label: "dodger", desc: "weave through the falling sky" },
    },
    stepHero: "3 / 4",
    questionHero: "who's the hero?",
    heroPlaceholders: [
      "a fox in a tiny scarf",
      "your boss, but a pigeon",
      "a sandwich with dreams",
      "grandma in a jetpack",
    ],
    stepVibe: "4 / 4",
    questionVibe: "pick a vibe",
    vibeLabels: {
      sunset: "sunset",
      mint: "mint",
      cosmic: "cosmic",
      candy: "candy",
    },
    stepReady: "ready",
    sayReady: "ready when you are.",
    sayWarming: "warming up the cabinet…",
    insertCoin: "insert coin →",
    insertingCoin: "inserting coin…",
    playClassics: "play classics →",
    buildingPct: (pct: number) => `building · ${pct}%`,
    playClassicsWhileWaiting: "play classics while waiting →",
    watchBuild: (pct: number) => `← watch build (${pct}%)`,
    buildingBanner: (title: string, pct: number, caption: string) =>
      `building ${title} · ${pct}% — ${caption}`,
    stageCaptions: {
      designing: [
        "sketching your {hero}…",
        "naming things. naming is hard.",
      ],
      coding: [
        "teaching your {hero} to move.",
        "writing the rules. no cheating.",
        "adding bad guys. sorry.",
      ],
      playtesting: [
        "playtesting. your {hero} died twice. fixing.",
        "making it fair-ish.",
      ],
      testing: [
        "playtesting. your {hero} died twice. fixing.",
        "making it fair-ish.",
      ],
      finishing: ["polishing the pixels."],
      painting: ["painting the sides now."],
      ready: ["it's alive. go go go."],
    },
    marqueeInterjection: "your marquee is getting fancy.",
    sideInterjection: "painting the sides now.",
    offlineNotice: "you're offline. house games still work.",
    busyNotice: "the arcade's packed. here's one we made earlier.",
    back: "← back",
    share: "share it →",
    prevGame: "previous game",
    nextGame: "next game",
    nextUp: "next up",
    oops: "oops",
    errorMessage: "that one got away from us. try a house game while we reset?",
    resetBtn: "restart",
  },
};

const LANG_STORAGE_KEY = "playglow_lang";

export function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ko";
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "ko") return saved;
  } catch {}
  return "ko"; // 기본값 한글
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {}
}
