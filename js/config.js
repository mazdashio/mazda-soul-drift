/**
 * MAZDA SOUL DRIFT - Configuration
 * Course segments, car data, and game constants
 */

// ===== Game Constants =====
var TOTAL_LAPS = 3;
var ROAD_WIDTH = 3.0;       // Game units – wider for better visibility
var ROAD_HALF_WIDTH = 1.5;

// ===== Course Control Points (Fuji Speedway) =====
// Explicit 2D control points forming a closed Fuji Speedway shape.
// CatmullRom spline interpolation with closed=true for smooth loop.
// This approach guarantees no overlap and proper spatial closure.
var COURSE_CONTROL_POINTS = [
  { x:   0, z:   0, y:  0.00 },  // P0:  Start/Finish
  { x:  30, z:   0, y:  0.00 },  // P1:  Mid main straight
  { x:  60, z:   0, y:  0.00 },  // P2:  End main straight
  { x:  75, z:   3, y: -0.30 },  // P3:  T1 entry (TGR corner)
  { x:  82, z:  14, y: -0.60 },  // P4:  T1 mid
  { x:  80, z:  28, y: -0.90 },  // P5:  T1 exit
  { x:  75, z:  38, y: -1.05 },  // P6:  T2 area (gentle right)
  { x:  68, z:  48, y: -1.20 },  // P7:  T3 entry (Coca-Cola)
  { x:  58, z:  55, y: -1.35 },  // P8:  T3 exit
  { x:  45, z:  65, y: -1.55 },  // P9:  100R approach
  { x:  32, z:  75, y: -1.75 },  // P10: T4 (100R)
  { x:  20, z:  82, y: -1.95 },  // P11: Hairpin approach
  { x:  10, z:  80, y: -1.75 },  // P12: T5 hairpin apex
  { x:   5, z:  70, y: -1.55 },  // P13: T5 exit
  { x:   0, z:  55, y: -1.30 },  // P14: Back straight start
  { x:  -5, z:  38, y: -1.05 },  // P15: Back straight mid
  { x: -10, z:  22, y: -0.80 },  // P16: T6 area (300R)
  { x: -13, z:  10, y: -0.55 },  // P17: T7 area (Dunlop)
  { x: -12, z:  -2, y: -0.30 },  // P18: T8 entry (Final corner)
  { x:  -6, z:  -8, y: -0.05 },  // P19: T8 exit
];

// ===== Segment Definitions =====
// Maps spline t-fractions to named segments with drift properties.
// t-fractions are based on control point indices / total points.
var COURSE_SEGMENTS = [
  {
    id: "S01", type: "straight", name: "メインストレート",
    tStart: 0.000, tEnd: 0.100
  },
  {
    id: "T01", type: "corner", name: "TGRコーナー",
    tStart: 0.100, tEnd: 0.250,
    difficulty: 5, driftRingSpeed: 1.3, driftTargetSize: 38
  },
  {
    id: "T02", type: "corner", name: "第2コーナー",
    tStart: 0.250, tEnd: 0.300,
    noDrift: true
  },
  {
    id: "T03", type: "corner", name: "コカ・コーラコーナー",
    tStart: 0.300, tEnd: 0.400,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },
  {
    id: "S04", type: "straight", name: "100Rアプローチ",
    tStart: 0.400, tEnd: 0.450
  },
  {
    id: "T04", type: "corner", name: "100R",
    tStart: 0.450, tEnd: 0.500,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "S05", type: "straight", name: "ヘアピンアプローチ",
    tStart: 0.500, tEnd: 0.550
  },
  {
    id: "T05", type: "corner", name: "ADVANコーナー",
    tStart: 0.550, tEnd: 0.650,
    difficulty: 5, driftRingSpeed: 1.4, driftTargetSize: 36
  },
  {
    id: "S06", type: "straight", name: "バックストレート",
    tStart: 0.650, tEnd: 0.750
  },
  {
    id: "T06", type: "corner", name: "300R",
    tStart: 0.750, tEnd: 0.800,
    noDrift: true
  },
  {
    id: "T07", type: "corner", name: "ダンロップコーナー",
    tStart: 0.800, tEnd: 0.850,
    noDrift: true
  },
  {
    id: "T08", type: "corner", name: "最終コーナー",
    tStart: 0.850, tEnd: 0.950,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 40
  },
  {
    id: "S09", type: "straight", name: "最終ストレート",
    tStart: 0.950, tEnd: 1.000
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
// Reduced to trigger drift ring closer to corner entry (not during straight)
var CORNER_LOOKAHEAD = 2.5;
