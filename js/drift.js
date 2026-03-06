/**
 * MAZDA SOUL DRIFT - Drift Ring System
 * 2D Canvas overlay for drift ring display and judgment
 */

var DriftSystem = (function() {
  
  var canvas, ctx;
  var state = "inactive"; // inactive | ring | judged
  var ringRadius = RING_START_RADIUS;
  var targetRadius = 45;
  var currentCorner = null;
  var judgmentCallback = null;
  var shrinkSpeed = RING_SHRINK_BASE;
  var cornerName = "";
  var ringColorPhase = 0;
  
  // Minimum on-screen time to avoid consecutive-corner flakiness
  var ringElapsed = 0;
  var pendingExit = false;
  
  // Track which corners have been drifted this lap
  var driftedCorners = {};
  
  function init(onJudgment) {
    canvas = document.getElementById('drift-canvas');
    ctx = canvas.getContext('2d');
    judgmentCallback = onJudgment;
    resize();
    window.addEventListener('resize', resize);
  }
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function resetLap() {
    driftedCorners = {};
    state = "inactive";
    currentCorner = null;
    ringElapsed = 0;
    pendingExit = false;
    canvas.style.display = 'none';
    clearCanvas();
  }
  
  function enterCorner(segment, carData) {
    if (!segment || segment.type !== "corner") return;
    if (driftedCorners[segment.id]) return;
    // Don't re-enter if already showing ring for this corner
    if (state === "ring" && currentCorner && currentCorner.id === segment.id) return;
    
    // If we are switching to a new corner while a ring is active, count the previous
    // one as a MISS immediately so the next ring can be shown reliably.
    if (state === "ring" && currentCorner && currentCorner.id !== segment.id) {
      judgeAndClear(DRIFT_JUDGE.MISS);
    }
    
    state = "ring";
    currentCorner = segment;
    ringElapsed = 0;
    pendingExit = false;
    cornerName = segment.name;
    ringRadius = RING_START_RADIUS;
    targetRadius = segment.driftTargetSize || 45;
    shrinkSpeed = RING_SHRINK_BASE * (segment.driftRingSpeed || 1.0) * (carData.ringSpeed || 1.0);
    ringColorPhase = 0;
    
    canvas.style.display = 'block';
    
    // Show corner name
    var nameEl = document.getElementById('hud-corner-name');
    if (nameEl) {
      nameEl.textContent = cornerName;
      nameEl.style.opacity = '1';
      setTimeout(function() { nameEl.style.opacity = '0'; }, 1500);
    }
  }
  
  function exitCorner(force) {
    if (state === "ring") {
      // Ensure the ring stays on screen briefly so short / consecutive corners are playable
      if (!force && ringElapsed < RING_MIN_DISPLAY_TIME) {
        pendingExit = true;
        return;
      }
      // Auto-miss if didn't click
      doJudgment(999);
      return;
    }
    state = "inactive";
    canvas.style.display = 'none';
    clearCanvas();
  }
  
  function onClick() {
    if (state !== "ring") return;
    var diff = Math.abs(ringRadius - targetRadius);
    doJudgment(diff);
  }
  
  function judgeAndClear(judge) {
    if (currentCorner) {
      driftedCorners[currentCorner.id] = true;
    }
    
    if (judgmentCallback) {
      judgmentCallback(judge, currentCorner);
    }
    
    state = "inactive";
    canvas.style.display = 'none';
    clearCanvas();
    currentCorner = null;
    ringElapsed = 0;
    pendingExit = false;
  }
  
  function doJudgment(diff) {
    if (currentCorner) {
      driftedCorners[currentCorner.id] = true;
    }
    
    var judge;
    if (diff < DRIFT_JUDGE.PERFECT.maxDiff) {
      judge = DRIFT_JUDGE.PERFECT;
    } else if (diff < DRIFT_JUDGE.GREAT.maxDiff) {
      judge = DRIFT_JUDGE.GREAT;
    } else if (diff < DRIFT_JUDGE.GOOD.maxDiff) {
      judge = DRIFT_JUDGE.GOOD;
    } else {
      judge = DRIFT_JUDGE.MISS;
    }
    
    state = "judged";
    
    if (judgmentCallback) {
      judgmentCallback(judge, currentCorner);
    }
    
    // Hide ring after brief delay
    setTimeout(function() {
      state = "inactive";
      canvas.style.display = 'none';
      clearCanvas();
    }, 300);
  }
  
  function update(dt) {
    if (state !== "ring") return;
    
    ringElapsed += dt;
    ringRadius -= shrinkSpeed * dt;
    
    // If we left the corner segment too quickly, allow a delayed auto-miss after minimum display time
    if (pendingExit && ringElapsed >= RING_MIN_DISPLAY_TIME) {
      pendingExit = false;
      doJudgment(999);
      return;
    }
    ringColorPhase = 1.0 - Math.max(0, (ringRadius - targetRadius) / (RING_START_RADIUS - targetRadius));
    
    // Auto miss if ring shrinks past target
    if (ringRadius <= targetRadius * 0.6) {
      doJudgment(999);
      return;
    }
    
    drawRing();
  }
  
  function drawRing() {
    clearCanvas();
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    
    // Target ring (fixed, white)
    ctx.beginPath();
    ctx.arc(cx, cy, targetRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Shrinking ring (color changes)
    var r, g, b;
    if (ringColorPhase < 0.33) {
      r = 0; g = 255; b = 136; // green
    } else if (ringColorPhase < 0.66) {
      r = 255; g = 215; b = 0; // yellow
    } else if (ringColorPhase < 0.85) {
      r = 255; g = 136; b = 0; // orange
    } else {
      r = 255; g = 51; b = 68; // red
    }
    
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ', 0.3)';
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Corner name is shown in the HUD overlay (C-3: removed duplicate here)
    
    // "CLICK!" below
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('CLICK!', cx, cy + ringRadius + 35);
  }
  
  function clearCanvas() {
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  function getState() { return state; }
  function isActive() { return state === "ring"; }
  
  function forceInactive() {
    state = "inactive";
    clearCanvas();
  }
  
  return {
    init: init,
    update: update,
    onClick: onClick,
    enterCorner: enterCorner,
    exitCorner: exitCorner,
    resetLap: resetLap,
    getState: getState,
    isActive: isActive,
    forceInactive: forceInactive
  };
})();
