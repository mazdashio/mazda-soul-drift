/**
 * MAZDA SOUL DRIFT - Configuration
 * Course segments, car data, and game constants
 */

// ===== Game Constants =====
var TOTAL_LAPS = 3;
var ROAD_WIDTH = 3.0;       // Game units – wider for better visibility
var ROAD_HALF_WIDTH = 1.5;

// ===== Elevation scale factor =====
// Real Fuji ~35m elevation change. At 1/10 scale = 3.5 units.
// Raw data sums to ~7.5 units range. Scale by 0.45 for realism.
var ELEVATION_SCALE = 0.45;

// ===== Course Segments (Fuji Speedway) =====
// Scale: 1/10 of real distance
// Elevations are raw values; scaled by ELEVATION_SCALE at build time
var COURSE_SEGMENTS = [
  // ===== 富士スピードウェイ 実コースレイアウト =====
  // 実際のコース形状を忠実に再現。5つのドリフトポイント + 3つの形状コーナー。
  // 右回り（時計回り）。~30秒/周目標。
  // Net turning: R(105+25+70+140+35+80) - L(60+35) = 455-95 = 360° ✓

  // メインストレート（富士の象徴、1,475m → 簡略70単位）
  {
    id: "S01", type: "straight", name: "メインストレート",
    length: 70, elevationStart: 0, elevationEnd: 0
  },

  // T01: TGRコーナー（旧1コーナー）- 急角度の右、フルブレーキングポイント
  {
    id: "T01", type: "corner", name: "TGRコーナー",
    direction: "right", angle: 105, radius: 4.0,
    elevationStart: 0, elevationEnd: -1.0,
    difficulty: 5, driftRingSpeed: 1.3, driftTargetSize: 38
  },

  // S02: T01→T02 接続直線
  {
    id: "S02", type: "straight", name: "T1-T2接続",
    length: 12, elevationStart: -1.0, elevationEnd: -1.0
  },

  // T02: 第2コーナー（緩い右、形状再現用・ドリフトなし）
  {
    id: "T02", type: "corner", name: "第2コーナー",
    direction: "right", angle: 25, radius: 8.0,
    elevationStart: -1.0, elevationEnd: -1.2,
    noDrift: true
  },

  // S03: 第1セクター直線
  {
    id: "S03", type: "straight", name: "第1セクター",
    length: 15, elevationStart: -1.2, elevationEnd: -1.2
  },

  // T03: コカ・コーラコーナー（左コーナー）- ドリフトポイント
  {
    id: "T03", type: "corner", name: "コカ・コーラコーナー",
    direction: "left", angle: 60, radius: 6.0,
    elevationStart: -1.2, elevationEnd: -1.5,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },

  // S04: 100Rアプローチ
  {
    id: "S04", type: "straight", name: "100Rアプローチ",
    length: 18, elevationStart: -1.5, elevationEnd: -1.5
  },

  // T04: 100R（高速右コーナー複合）- ドリフトポイント
  {
    id: "T04", type: "corner", name: "100R",
    direction: "right", angle: 70, radius: 7.0,
    elevationStart: -1.5, elevationEnd: -2.0,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },

  // S05: ヘアピンブレーキングゾーン
  {
    id: "S05", type: "straight", name: "ヘアピンアプローチ",
    length: 15, elevationStart: -2.0, elevationEnd: -2.2
  },

  // T05: ADVANコーナー（ヘアピン）- 最低速ポイント、ドリフトポイント
  {
    id: "T05", type: "corner", name: "ADVANコーナー",
    direction: "right", angle: 140, radius: 3.0,
    elevationStart: -2.2, elevationEnd: -2.0,
    difficulty: 5, driftRingSpeed: 1.4, driftTargetSize: 36
  },

  // S06: バックストレート（加速区間）
  {
    id: "S06", type: "straight", name: "バックストレート",
    length: 30, elevationStart: -2.0, elevationEnd: -1.0
  },

  // T06: 300R（高速右、形状再現用・ドリフトなし）
  {
    id: "T06", type: "corner", name: "300R",
    direction: "right", angle: 35, radius: 10.0,
    elevationStart: -1.0, elevationEnd: -0.5,
    noDrift: true
  },

  // S07: 全開区間
  {
    id: "S07", type: "straight", name: "全開区間",
    length: 18, elevationStart: -0.5, elevationEnd: 0
  },

  // T07: ダンロップシケイン方向（左、形状再現用・ドリフトなし）
  {
    id: "T07", type: "corner", name: "ダンロップコーナー",
    direction: "left", angle: 35, radius: 8.0,
    elevationStart: 0, elevationEnd: 0.5,
    noDrift: true
  },

  // S08: セクター3（急上り区間）
  {
    id: "S08", type: "straight", name: "セクター3",
    length: 12, elevationStart: 0.5, elevationEnd: 1.0
  },

  // T08: 最終コーナー - ドリフトポイント（脱出速度がストレートに直結）
  {
    id: "T08", type: "corner", name: "最終コーナー",
    direction: "right", angle: 80, radius: 5.0,
    elevationStart: 1.0, elevationEnd: 0.5,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 40
  },

  // S09: 最終ストレート（メインストレートに合流）
  {
    id: "S09", type: "straight", name: "最終ストレート",
    length: 25, elevationStart: 0.5, elevationEnd: 0
  }
];

// ===== Car Data =====
var CARS = [
  {
    id: "roadster_nd",
    name: "Roadster ND",
    year: "2015〜",
    bodyColor: 0xA80000,
    accentColor: 0xFFFFFF,
    baseSpeed: 1.00,
    acceleration: 1.00,
    driftBoostMul: 1.10,
    ringSpeed: 1.00,
    desc: "バランス型。初心者におすすめ。",
    roofStyle: "open"
  },
  {
    id: "rx7_fd3s",
    name: "RX-7 FD3S",
    year: "1991〜2002",
    bodyColor: 0xB8B8B8,
    accentColor: 0x3344FF,
    baseSpeed: 1.10,
    acceleration: 1.10,
    driftBoostMul: 1.00,
    ringSpeed: 1.15,
    desc: "直線が速い。リングも速い。",
    roofStyle: "retractable"
  },
  {
    id: "787b",
    name: "787B",
    year: "1991",
    bodyColor: 0x1A5C2A,
    accentColor: 0xFF6600,
    baseSpeed: 1.20,
    acceleration: 1.05,
    driftBoostMul: 1.15,
    ringSpeed: 1.30,
    desc: "最速。上級者向け。",
    roofStyle: "racecar"
  },
  {
    id: "cosmo_sport",
    name: "Cosmo Sport",
    year: "1967",
    bodyColor: 0xF5F5F0,
    accentColor: 0xCC0000,
    baseSpeed: 0.85,
    acceleration: 0.90,
    driftBoostMul: 1.20,
    ringSpeed: 0.80,
    desc: "遅いがドリフトブースト最大。",
    roofStyle: "round"
  },
  {
    id: "mazda3",
    name: "MAZDA3",
    year: "2019〜",
    bodyColor: 0x3A3A3A,
    accentColor: 0xA80000,
    baseSpeed: 0.95,
    acceleration: 1.15,
    driftBoostMul: 1.00,
    ringSpeed: 1.00,
    desc: "加速重視。コーナー脱出が速い。",
    roofStyle: "sedan"
  }
];

// ===== Drift Judgment Thresholds =====
var DRIFT_JUDGE = {
  PERFECT: { maxDiff: 8,  score: 1000, boostMul: 0.40, boostDur: 3.0, color: "#00FF88", label: "PERFECT" },
  GREAT:   { maxDiff: 18, score: 600,  boostMul: 0.25, boostDur: 2.0, color: "#FFD700", label: "GREAT" },
  GOOD:    { maxDiff: 30, score: 300,  boostMul: 0.10, boostDur: 1.0, color: "#FF8800", label: "GOOD" },
  MISS:    { maxDiff: 999,score: 0,    boostMul: -0.20,boostDur: 2.0, color: "#FF3344", label: "MISS" }
};

// ===== Title Thresholds =====
var TITLES = [
  { min: 20000, title: "人馬一体" },
  { min: 12000, title: "ロータリーマスター" },
  { min: 6000,  title: "コーナーアーティスト" },
  { min: 3000,  title: "ストリートスライダー" },
  { min: 0,     title: "ビギナードライバー" }
];

// ===== Game speed tuning =====
// Target: ~30 sec per lap, 3 laps in ~90 seconds
var BASE_GAME_SPEED = 10;   // units per second at multiplier 1.0
var RING_SHRINK_BASE = 55; // px per second base shrink rate
var RING_START_RADIUS = 120;

// ===== Minimum drift ring display time (seconds) =====
var RING_MIN_DISPLAY_TIME = 0.8;

// ===== Corner lookahead distance (units) =====
var CORNER_LOOKAHEAD = 5.0;
