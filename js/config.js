/**
 * MAZDA SOUL DRIFT - Configuration
 * Course segments, car data, and game constants
 */

// ===== Game Constants =====
var TOTAL_LAPS = 3;
var ROAD_WIDTH = 2.0;       // Game units (real 20m / 10)
var ROAD_HALF_WIDTH = 1.0;

// ===== Elevation scale factor =====
// Real Fuji ~35m elevation change. At 1/10 scale = 3.5 units.
// Raw data sums to ~7.5 units range. Scale by 0.45 for realism.
var ELEVATION_SCALE = 0.45;

// ===== Course Segments (Fuji Speedway) =====
// Scale: 1/10 of real distance
// Elevations are raw values; scaled by ELEVATION_SCALE at build time
var COURSE_SEGMENTS = [
  {
    id: "S01", type: "straight", name: "メインストレート",
    length: 100, elevationStart: 0, elevationEnd: 0
  },
  {
    id: "T01", type: "corner", name: "TGRコーナー",
    direction: "right", angle: 130, radius: 2.7,
    elevationStart: 0, elevationEnd: -2.0,
    difficulty: 5, driftRingSpeed: 1.3, driftTargetSize: 35
  },
  {
    id: "S02", type: "straight", name: "T1-T2区間",
    length: 10, elevationStart: -2.0, elevationEnd: -2.5
  },
  {
    id: "T02", type: "corner", name: "ターン2",
    direction: "right", angle: 40, radius: 7.5,
    elevationStart: -2.5, elevationEnd: -3.0,
    difficulty: 1, driftRingSpeed: 0.6, driftTargetSize: 55
  },
  {
    id: "S03", type: "straight", name: "T2-T3区間",
    length: 20, elevationStart: -3.0, elevationEnd: -2.5
  },
  {
    id: "T03", type: "corner", name: "コカ・コーラコーナー",
    direction: "left", angle: 65, radius: 5.0,
    elevationStart: -2.5, elevationEnd: -2.0,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },
  {
    id: "S04", type: "straight", name: "T3-T4区間",
    length: 15, elevationStart: -2.0, elevationEnd: -2.5
  },
  {
    id: "T04", type: "corner", name: "100Rフロント",
    direction: "right", angle: 55, radius: 17.8,
    elevationStart: -2.5, elevationEnd: -3.0,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "T05", type: "corner", name: "100Rリア",
    direction: "right", angle: 45, radius: 9.5,
    elevationStart: -3.0, elevationEnd: -3.5,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "S05", type: "straight", name: "T5-T6区間",
    length: 12, elevationStart: -3.5, elevationEnd: -3.5
  },
  {
    id: "T06", type: "corner", name: "ADVANコーナー",
    direction: "right", angle: 170, radius: 3.0,
    elevationStart: -3.5, elevationEnd: -3.0,
    difficulty: 5, driftRingSpeed: 1.4, driftTargetSize: 35
  },
  {
    id: "S06", type: "straight", name: "T6-T7区間",
    length: 5, elevationStart: -3.0, elevationEnd: -3.0
  },
  {
    id: "T07", type: "corner", name: "ターン7",
    direction: "right", angle: 30, radius: 16.5,
    elevationStart: -3.0, elevationEnd: -3.0,
    difficulty: 1, driftRingSpeed: 0.6, driftTargetSize: 55
  },
  {
    id: "S07", type: "straight", name: "T7-T8区間",
    length: 20, elevationStart: -3.0, elevationEnd: -2.5
  },
  {
    id: "T08", type: "corner", name: "300Rフロント",
    direction: "right", angle: 45, radius: 12.0,
    elevationStart: -2.5, elevationEnd: -2.0,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },
  {
    id: "T09", type: "corner", name: "300Rリア",
    direction: "right", angle: 35, radius: 23.0,
    elevationStart: -2.0, elevationEnd: -1.5,
    difficulty: 3, driftRingSpeed: 0.8, driftTargetSize: 45
  },
  {
    id: "S08", type: "straight", name: "T9-T10区間",
    length: 25, elevationStart: -1.5, elevationEnd: -0.5
  },
  {
    id: "T10", type: "corner", name: "ダンロップコーナー",
    direction: "left", angle: 90, radius: 3.5,
    elevationStart: -0.5, elevationEnd: 0.5,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 38
  },
  {
    id: "T11", type: "corner", name: "ターン11",
    direction: "right", angle: 90, radius: 3.5,
    elevationStart: 0.5, elevationEnd: 1.0,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 38
  },
  {
    id: "T12", type: "corner", name: "ターン12",
    direction: "left", angle: 90, radius: 3.5,
    elevationStart: 1.0, elevationEnd: 1.5,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 38
  },
  {
    id: "S09", type: "straight", name: "T12-T13区間",
    length: 8, elevationStart: 1.5, elevationEnd: 2.5
  },
  {
    id: "T13", type: "corner", name: "ターン13",
    direction: "right", angle: 80, radius: 5.0,
    elevationStart: 2.5, elevationEnd: 3.0,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },
  {
    id: "S10", type: "straight", name: "T13-T14区間",
    length: 6, elevationStart: 3.0, elevationEnd: 3.5
  },
  {
    id: "T14", type: "corner", name: "GR Supraフロント",
    direction: "right", angle: 70, radius: 4.5,
    elevationStart: 3.5, elevationEnd: 3.8,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "T15", type: "corner", name: "GR Supraリア",
    direction: "left", angle: 70, radius: 4.5,
    elevationStart: 3.8, elevationEnd: 4.0,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "S11", type: "straight", name: "T15-T16区間",
    length: 8, elevationStart: 4.0, elevationEnd: 4.0
  },
  {
    id: "T16", type: "corner", name: "ファイナルコーナー",
    direction: "right", angle: 90, radius: 6.0,
    elevationStart: 4.0, elevationEnd: 3.0,
    difficulty: 5, driftRingSpeed: 1.3, driftTargetSize: 35
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
// Target: 3 laps in ~2-3 minutes
var BASE_GAME_SPEED = 7;   // units per second at multiplier 1.0
var RING_SHRINK_BASE = 55; // px per second base shrink rate
var RING_START_RADIUS = 120;

// ===== Minimum drift ring display time (seconds) =====
var RING_MIN_DISPLAY_TIME = 0.8;

// ===== Corner lookahead distance (units) =====
var CORNER_LOOKAHEAD = 3.0;
