/**
 * MAZDA SOUL DRIFT - Configuration
 * Course segments, car data, and game constants
 */

// ===== Game Constants =====
var TOTAL_LAPS = 3;
var ROAD_WIDTH = 2.0;       // Game units (real 20m / 10)
var ROAD_HALF_WIDTH = 1.0;

// ===== Course Segments (Fuji Speedway) =====
// Scale: 1/10 of real distance
var COURSE_SEGMENTS = [
  {
    id: "S01", type: "straight", name: "Main Straight",
    length: 147.5, elevationStart: 0, elevationEnd: 0
  },
  {
    id: "T01", type: "corner", name: "TGR Corner",
    direction: "right", angle: 130, radius: 2.7,
    elevationStart: 0, elevationEnd: -2.0,
    difficulty: 5, driftRingSpeed: 1.3, driftTargetSize: 35
  },
  {
    id: "S02", type: "straight", name: "T1-T2 Straight",
    length: 10, elevationStart: -2.0, elevationEnd: -2.5
  },
  {
    id: "T02", type: "corner", name: "Turn 2",
    direction: "right", angle: 40, radius: 7.5,
    elevationStart: -2.5, elevationEnd: -3.0,
    difficulty: 1, driftRingSpeed: 0.6, driftTargetSize: 55
  },
  {
    id: "S03", type: "straight", name: "T2-T3 Straight",
    length: 20, elevationStart: -3.0, elevationEnd: -2.5
  },
  {
    id: "T03", type: "corner", name: "Coca-Cola Corner",
    direction: "left", angle: 65, radius: 5.0,
    elevationStart: -2.5, elevationEnd: -2.0,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },
  {
    id: "S04", type: "straight", name: "T3-T4 Straight",
    length: 15, elevationStart: -2.0, elevationEnd: -2.5
  },
  {
    id: "T04", type: "corner", name: "100R Front",
    direction: "right", angle: 55, radius: 17.8,
    elevationStart: -2.5, elevationEnd: -3.0,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "T05", type: "corner", name: "100R Rear",
    direction: "right", angle: 45, radius: 9.5,
    elevationStart: -3.0, elevationEnd: -3.5,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "S05", type: "straight", name: "T5-T6 Straight",
    length: 12, elevationStart: -3.5, elevationEnd: -3.5
  },
  {
    id: "T06", type: "corner", name: "ADVAN Corner",
    direction: "right", angle: 170, radius: 3.0,
    elevationStart: -3.5, elevationEnd: -3.0,
    difficulty: 5, driftRingSpeed: 1.4, driftTargetSize: 35
  },
  {
    id: "S06", type: "straight", name: "T6-T7 Straight",
    length: 5, elevationStart: -3.0, elevationEnd: -3.0
  },
  {
    id: "T07", type: "corner", name: "Turn 7",
    direction: "right", angle: 30, radius: 16.5,
    elevationStart: -3.0, elevationEnd: -3.0,
    difficulty: 1, driftRingSpeed: 0.6, driftTargetSize: 55
  },
  {
    id: "S07", type: "straight", name: "T7-T8 Straight",
    length: 20, elevationStart: -3.0, elevationEnd: -2.5
  },
  {
    id: "T08", type: "corner", name: "300R Front",
    direction: "right", angle: 45, radius: 12.0,
    elevationStart: -2.5, elevationEnd: -2.0,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },
  {
    id: "T09", type: "corner", name: "300R Rear",
    direction: "right", angle: 35, radius: 23.0,
    elevationStart: -2.0, elevationEnd: -1.5,
    difficulty: 3, driftRingSpeed: 0.8, driftTargetSize: 45
  },
  {
    id: "S08", type: "straight", name: "T9-T10 Straight",
    length: 25, elevationStart: -1.5, elevationEnd: -0.5
  },
  {
    id: "T10", type: "corner", name: "Dunlop Corner",
    direction: "left", angle: 90, radius: 3.5,
    elevationStart: -0.5, elevationEnd: 0.5,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 38
  },
  {
    id: "T11", type: "corner", name: "Turn 11",
    direction: "right", angle: 90, radius: 3.5,
    elevationStart: 0.5, elevationEnd: 1.0,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 38
  },
  {
    id: "T12", type: "corner", name: "Turn 12",
    direction: "left", angle: 90, radius: 3.5,
    elevationStart: 1.0, elevationEnd: 1.5,
    difficulty: 4, driftRingSpeed: 1.2, driftTargetSize: 38
  },
  {
    id: "S09", type: "straight", name: "T12-T13 Straight",
    length: 8, elevationStart: 1.5, elevationEnd: 2.5
  },
  {
    id: "T13", type: "corner", name: "Turn 13",
    direction: "right", angle: 80, radius: 5.0,
    elevationStart: 2.5, elevationEnd: 3.0,
    difficulty: 3, driftRingSpeed: 1.0, driftTargetSize: 45
  },
  {
    id: "S10", type: "straight", name: "T13-T14 Straight",
    length: 6, elevationStart: 3.0, elevationEnd: 3.5
  },
  {
    id: "T14", type: "corner", name: "GR Supra Front",
    direction: "right", angle: 70, radius: 4.5,
    elevationStart: 3.5, elevationEnd: 3.8,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "T15", type: "corner", name: "GR Supra Rear",
    direction: "left", angle: 70, radius: 4.5,
    elevationStart: 3.8, elevationEnd: 4.0,
    difficulty: 4, driftRingSpeed: 1.1, driftTargetSize: 42
  },
  {
    id: "S11", type: "straight", name: "T15-T16 Straight",
    length: 8, elevationStart: 4.0, elevationEnd: 4.0
  },
  {
    id: "T16", type: "corner", name: "Final Corner",
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
    year: "2015~",
    bodyColor: 0xA80000,
    accentColor: 0xFFFFFF,
    baseSpeed: 1.00,
    acceleration: 1.00,
    driftBoostMul: 1.10,
    ringSpeed: 1.00,
    desc: "Balanced. Recommended for beginners.",
    roofStyle: "open"
  },
  {
    id: "rx7_fd3s",
    name: "RX-7 FD3S",
    year: "1991~2002",
    bodyColor: 0xB8B8B8,
    accentColor: 0x3344FF,
    baseSpeed: 1.10,
    acceleration: 1.10,
    driftBoostMul: 1.00,
    ringSpeed: 1.15,
    desc: "Fast in straights, faster rings.",
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
    desc: "Fastest. Expert difficulty.",
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
    desc: "Slow but highest drift boost.",
    roofStyle: "round"
  },
  {
    id: "mazda3",
    name: "MAZDA3",
    year: "2019~",
    bodyColor: 0x3A3A3A,
    accentColor: 0xA80000,
    baseSpeed: 0.95,
    acceleration: 1.15,
    driftBoostMul: 1.00,
    ringSpeed: 1.00,
    desc: "Quick acceleration out of corners.",
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
  { min: 20000, title: "Jinba Ittai" },
  { min: 12000, title: "Rotary Master" },
  { min: 6000,  title: "Corner Artist" },
  { min: 3000,  title: "Street Slider" },
  { min: 0,     title: "Beginner Driver" }
];

// ===== Game speed tuning =====
// Target: 3 laps in ~2-3 minutes → ~40-60s per lap
// Course is ~403 units. At speed 7 * 1.0 = 7 units/s → ~57s per lap → ~2:51 for 3 laps
var BASE_GAME_SPEED = 7;   // units per second at multiplier 1.0
var RING_SHRINK_BASE = 55; // px per second base shrink rate (slower for playability)
var RING_START_RADIUS = 130;
