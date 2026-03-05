/**
 * MAZDA SOUL DRIFT - Main Game Loop
 * State management, rendering, input handling
 */

(function() {
  "use strict";
  
  // ===== Three.js core =====
  var scene, camera, renderer;
  var clock = new THREE.Clock();
  
  // ===== Game state =====
  var gameState = "title"; // title | select | countdown | race | result
  var selectedCarIdx = 0;
  var carData = null;
  var carModel = null;
  
  // ===== Course =====
  var courseData = null; // { spline, totalDistance, segLookup, ... }
  
  // ===== Race state =====
  var distance = 0;        // accumulated distance on course path
  var speed = 0;           // current speed multiplier
  var lateralOffset = 0;   // car's lateral position on road
  var targetOffset = 0;    // target lateral position from mouse
  var mouseX = 0.5;        // normalized mouse X (0-1)
  
  var currentLap = 1;
  var lapStartTime = 0;
  var raceStartTime = 0;
  var lapTimes = [];
  var totalScore = 0;
  var judgmentCounts = { perfect: 0, great: 0, good: 0, miss: 0 };
  
  var boostMul = 0;
  var boostTimer = 0;
  var boostDuration = 0;
  
  var prevSegmentId = null;
  var inCorner = false;
  
  // Camera shake
  var shakeIntensity = 0;
  var shakeTimer = 0;
  
  // ===== Initialization =====
  function initThree() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.insertBefore(renderer.domElement, document.body.firstChild);
    
    window.addEventListener('resize', onResize);
  }
  
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  function initCourse() {
    courseData = CourseBuilder.build(scene);
  }
  
  function initInput() {
    // Mouse move
    window.addEventListener('mousemove', function(e) {
      mouseX = e.clientX / window.innerWidth;
    });
    
    // Mouse click
    window.addEventListener('click', function(e) {
      switch (gameState) {
        case "title":
          AudioManager.init();
          goToSelect();
          break;
        case "race":
          DriftSystem.onClick();
          break;
      }
    });
    
    // Prevent right-click context menu
    window.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  }
  
  // ===== State Transitions =====
  function goToSelect() {
    gameState = "select";
    UIManager.showScreen('select');
    UIManager.buildCarSelectCards(CARS, selectedCarIdx, function(idx) {
      selectedCarIdx = idx;
      UIManager.buildCarSelectCards(CARS, selectedCarIdx, arguments.callee);
    });
    
    document.getElementById('start-race-btn').onclick = function() {
      goToCountdown();
    };
  }
  
  function goToCountdown() {
    gameState = "countdown";
    carData = CARS[selectedCarIdx];
    
    // Remove old car if exists
    if (carModel) {
      scene.remove(carModel);
    }
    
    // Create car model
    carModel = CarBuilder.createCarModel(carData);
    scene.add(carModel);
    
    // Reset race state
    resetRaceState();
    
    // Position car at start
    updateCarPosition();
    updateCamera(true);
    
    // Show race view behind countdown
    UIManager.showScreen('countdown');
    renderer.render(scene, camera);
    
    AudioManager.startEngine();
    
    UIManager.runCountdown(function() {
      startRace();
    });
  }
  
  function resetRaceState() {
    distance = 0;
    speed = carData.baseSpeed;
    lateralOffset = 0;
    targetOffset = 0;
    currentLap = 1;
    lapTimes = [];
    totalScore = 0;
    judgmentCounts = { perfect: 0, great: 0, good: 0, miss: 0 };
    boostMul = 0;
    boostTimer = 0;
    boostDuration = 0;
    prevSegmentId = null;
    inCorner = false;
    shakeIntensity = 0;
    shakeTimer = 0;
    DriftSystem.resetLap();
  }
  
  function startRace() {
    gameState = "race";
    UIManager.showScreen('race');
    raceStartTime = performance.now();
    lapStartTime = raceStartTime;
    clock.getDelta(); // reset delta
  }
  
  function finishRace() {
    gameState = "result";
    AudioManager.stopEngine();
    AudioManager.playFinish();
    
    var totalTime = 0;
    for (var i = 0; i < lapTimes.length; i++) totalTime += lapTimes[i];
    
    UIManager.showResult({
      totalTime: totalTime,
      lapTimes: lapTimes,
      score: totalScore,
      judgments: judgmentCounts
    });
    
    document.getElementById('retry-btn').onclick = function() {
      goToCountdown();
    };
    document.getElementById('change-car-btn').onclick = function() {
      goToSelect();
    };
  }
  
  // ===== Race Update =====
  function updateRace(dt) {
    if (gameState !== "race") return;
    
    var now = performance.now();
    
    // Speed calculation
    var currentSpeed = carData.baseSpeed;
    
    // Boost
    if (boostTimer > 0) {
      var boostFactor = boostMul * (boostTimer / boostDuration);
      currentSpeed *= (1.0 + boostFactor);
      boostTimer -= dt;
      if (boostTimer <= 0) {
        boostTimer = 0;
        boostMul = 0;
      }
    }
    
    // Get current segment for elevation
    var segInfo = courseData.segLookup.getSegmentAt(distance);
    var seg = segInfo.segment;
    
    // Elevation effect
    // Keep consistent with course.js where elevation is scaled for visuals
    if (seg.elevationStart !== undefined && seg.elevationEnd !== undefined) {
      var elevDiff = (seg.elevationEnd - seg.elevationStart) * ELEVATION_SCALE;
      var segLength = seg.type === "straight" ? seg.length : (seg.radius * seg.angle * Math.PI / 180);
      if (segLength > 0) {
        var grade = elevDiff / segLength;
        currentSpeed *= (1.0 - grade * 0.3);
      }
    }
    
    // Edge penalty
    if (Math.abs(lateralOffset) > ROAD_HALF_WIDTH * 0.85) {
      currentSpeed *= 0.95;
    }
    
    // Minimum speed floor — never let car appear to stop
    var minSpeed = carData.baseSpeed * 0.65;
    if (currentSpeed < minSpeed) currentSpeed = minSpeed;
    
    speed = currentSpeed;
    
    // Move forward
    distance += BASE_GAME_SPEED * speed * dt;
    
    // Wrap distance for laps
    var lapDist = courseData.segLookup.totalDist;
    if (distance >= lapDist) {
      distance -= lapDist;
      
      // Record lap time
      var lapTime = now - lapStartTime;
      lapTimes.push(lapTime);
      
      if (currentLap >= TOTAL_LAPS) {
        finishRace();
        return;
      }
      
      currentLap++;
      lapStartTime = now;
      DriftSystem.resetLap();
      
      // Lap notification
      UIManager.showLapNotification(currentLap);
      if (currentLap === TOTAL_LAPS) {
        AudioManager.playFinalLap();
      } else {
        AudioManager.playLapBeep();
      }
    }
    
    // ===== Corner / Straight detection =====
    // Use lookahead so the drift ring appears slightly before the corner (timing fix)
    var segNowInfo = courseData.segLookup.getSegmentAt(distance);
    var segNow = segNowInfo.segment;
    var segTriggerInfo = (courseData.segLookup.getSegmentAhead)
      ? courseData.segLookup.getSegmentAhead(distance, CORNER_LOOKAHEAD)
      : segNowInfo;
    var segTrigger = (segTriggerInfo.segment && segTriggerInfo.segment.type === "corner" && !segTriggerInfo.segment.noDrift)
      ? segTriggerInfo.segment
      : segNow;
    
    segInfo = segNowInfo;
    seg = segTrigger;
    
    if (seg.id !== prevSegmentId) {
      // Segment changed
      var isDriftCorner = (seg.type === "corner" && !seg.noDrift);
      
      if (isDriftCorner) {
        // Drift corner: trigger ring
        if (DriftSystem.getState() === "inactive" || DriftSystem.getState() === "judged") {
          inCorner = true;
          // Small delay for consecutive corners so player can see the next ring
          if (prevSegmentId && prevSegmentId.charAt(0) === 'T') {
            // Consecutive corner - force inactive then re-enter
            DriftSystem.forceInactive();
          }
          DriftSystem.enterCorner(seg, carData);
        } else if (DriftSystem.isActive()) {
          // Still drifting in previous corner - auto-judge it first
          DriftSystem.exitCorner();
          inCorner = true;
          DriftSystem.enterCorner(seg, carData);
        }
      } else if (seg.type === "corner" && seg.noDrift) {
        // Shape-only corner: no drift ring, but still mark as in-corner for camera
        inCorner = true;
        if (DriftSystem.isActive()) {
          DriftSystem.exitCorner();
        }
      } else if (seg.type === "straight") {
        inCorner = false;
        if (DriftSystem.isActive()) {
          DriftSystem.exitCorner();
        }
      }
      prevSegmentId = seg.id;
    }
    
    // Lateral movement (only in straight mode or when drift not active)
    if (!DriftSystem.isActive()) {
      // More responsive steering
      targetOffset = (mouseX - 0.5) * 2.4 * ROAD_HALF_WIDTH;
      var maxOff = ROAD_HALF_WIDTH * 0.95;
      targetOffset = Math.max(-maxOff, Math.min(maxOff, targetOffset));
      lateralOffset += (targetOffset - lateralOffset) * 0.12;
    } else {
      // During drift, auto-center a bit faster
      lateralOffset += (0 - lateralOffset) * 0.08;
    }
    
    // Update drift system
    DriftSystem.update(dt);
    
    // Update car position
    updateCarPosition();
    
    // Update camera
    updateCamera(false);
    
    // Camera shake
    if (shakeTimer > 0) {
      shakeTimer -= dt;
    }
    
    // Engine sound
    AudioManager.updateEngine(speed);
    
    // Update HUD
    var elapsedTime = now - raceStartTime;
    var progress = (distance % lapDist) / lapDist;
    
    UIManager.updateHUD({
      time: elapsedTime,
      lap: currentLap,
      speed: speed,
      progress: progress,
      score: totalScore,
      boosting: boostTimer > 0,
      boostMul: boostMul
    });
    
    // Update minimap
    if (courseData.minimapPoints) {
      drawMinimap(progress);
    }
  }
  
  function updateCarPosition() {
    if (!carModel || !courseData) return;
    
    var lapDist = courseData.segLookup.totalDist;
    var t = (distance % lapDist) / lapDist;
    t = Math.max(0, Math.min(t, 0.9999));
    
    var point = courseData.spline.getPointAt(t);
    var tangent = courseData.spline.getTangentAt(t);
    
    var up = new THREE.Vector3(0, 1, 0);
    var right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    
    // Position: path point + lateral offset
    carModel.position.copy(point);
    carModel.position.add(right.clone().multiplyScalar(lateralOffset));
    // Keep the car above the road mesh (road surface is slightly offset up)
    carModel.position.y = point.y + 0.15;
    
    // Rotation: face tangent direction
    var lookTarget = point.clone().add(tangent);
    lookTarget.y = carModel.position.y;
    carModel.lookAt(lookTarget);
  }
  
  function updateCamera(instant) {
    if (!carModel || !courseData) return;
    
    var lapDist = courseData.segLookup.totalDist;
    var t = (distance % lapDist) / lapDist;
    t = Math.max(0, Math.min(t, 0.9999));
    
    var tangent = courseData.spline.getTangentAt(t);
    var up = new THREE.Vector3(0, 1, 0);
    var right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    
    // Camera behind and above car — closer for better road visibility
    var camOffset = tangent.clone().multiplyScalar(-2.2);
    camOffset.y = 1.2;
    
    // Slight lateral shift in corners
    if (inCorner) {
      camOffset.add(right.clone().multiplyScalar(lateralOffset * 0.3));
    }
    
    var targetPos = carModel.position.clone().add(camOffset);
    var lookPos = carModel.position.clone().add(tangent.clone().multiplyScalar(2.5));
    lookPos.y = carModel.position.y + 0.3;
    
    // Camera shake
    if (shakeTimer > 0) {
      var shakeX = (Math.random() - 0.5) * shakeIntensity;
      var shakeY = (Math.random() - 0.5) * shakeIntensity;
      targetPos.x += shakeX;
      targetPos.y += shakeY;
    }
    
    if (instant) {
      camera.position.copy(targetPos);
    } else {
      camera.position.lerp(targetPos, 0.14);
    }
    camera.lookAt(lookPos);
  }
  
  // ===== Drift Judgment Callback =====
  function onDriftJudgment(judge, corner) {
    UIManager.showJudgment(judge);
    
    totalScore += judge.score;
    
    // Apply boost
    boostMul = judge.boostMul * (carData.driftBoostMul || 1.0);
    boostDuration = judge.boostDur;
    boostTimer = boostDuration;

    // Boost / penalty feedback
    if (UIManager.triggerBoostEffect) {
      UIManager.triggerBoostEffect(boostMul, boostDuration);
    }
    if (AudioManager.playBoost && boostMul > 0) {
      AudioManager.playBoost();
    }
    
    // Count
    if (judge.label === "PERFECT") {
      judgmentCounts.perfect++;
      AudioManager.playPerfect();
      AudioManager.playTireSqueal(0.8);
      triggerShake(0.15, 0.3);
    } else if (judge.label === "GREAT") {
      judgmentCounts.great++;
      AudioManager.playGreat();
      AudioManager.playTireSqueal(0.5);
      triggerShake(0.08, 0.2);
    } else if (judge.label === "GOOD") {
      judgmentCounts.good++;
      AudioManager.playGood();
    } else {
      judgmentCounts.miss++;
      AudioManager.playMiss();
      triggerShake(0.2, 0.5);
    }
  }
  
  function triggerShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTimer = duration;
  }
  
  // ===== Minimap =====
  var minimapCanvas = null;
  var minimapCtx = null;
  var minimapSize = 140;
  
  function initMinimap() {
    minimapCanvas = document.getElementById('minimap-canvas');
    if (!minimapCanvas) return;
    minimapCanvas.width = minimapSize;
    minimapCanvas.height = minimapSize;
    minimapCtx = minimapCanvas.getContext('2d');
  }
  
  function drawMinimap(progress) {
    if (!minimapCtx || !courseData.minimapPoints) return;
    var pts = courseData.minimapPoints;
    var ctx = minimapCtx;
    var size = minimapSize;
    var padding = 12;
    
    ctx.clearRect(0, 0, size, size);
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, size, size);
    
    // Find bounds
    var minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].x < minX) minX = pts[i].x;
      if (pts[i].x > maxX) maxX = pts[i].x;
      if (pts[i].z < minZ) minZ = pts[i].z;
      if (pts[i].z > maxZ) maxZ = pts[i].z;
    }
    
    var rangeX = maxX - minX || 1;
    var rangeZ = maxZ - minZ || 1;
    var scale = (size - padding * 2) / Math.max(rangeX, rangeZ);
    var offsetX = padding + (size - padding * 2 - rangeX * scale) / 2;
    var offsetZ = padding + (size - padding * 2 - rangeZ * scale) / 2;
    
    function toScreen(p) {
      return {
        x: offsetX + (p.x - minX) * scale,
        y: offsetZ + (p.z - minZ) * scale
      };
    }
    
    // Draw course outline
    ctx.beginPath();
    var sp = toScreen(pts[0]);
    ctx.moveTo(sp.x, sp.y);
    for (var i = 1; i < pts.length; i++) {
      sp = toScreen(pts[i]);
      ctx.lineTo(sp.x, sp.y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Start/finish marker
    var startPt = toScreen(pts[0]);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(startPt.x - 3, startPt.y - 3, 6, 6);
    
    // Car position dot
    var carIdx = Math.floor(progress * pts.length) % pts.length;
    var carPt = toScreen(pts[carIdx]);
    
    // Glow
    ctx.beginPath();
    ctx.arc(carPt.x, carPt.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 0, 0, 0.6)';
    ctx.fill();
    
    // Dot
    ctx.beginPath();
    ctx.arc(carPt.x, carPt.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FF3344';
    ctx.fill();
  }
  
  // ===== Main Loop =====
  function animate() {
    requestAnimationFrame(animate);
    
    var dt = clock.getDelta();
    dt = Math.min(dt, 0.05); // cap to prevent huge jumps
    
    if (gameState === "race") {
      updateRace(dt);
    } else if (gameState === "countdown") {
      // Keep rendering scene during countdown
      updateCarPosition();
      updateCamera(true);
    }
    
    renderer.render(scene, camera);
  }
  
  // ===== Boot =====
  function boot() {
    initThree();
    initCourse();
    UIManager.init();
    DriftSystem.init(onDriftJudgment);
    initInput();
    
    initMinimap();
    UIManager.showScreen('title');
    
    // Pre-render scene for background — position camera at start line looking down the track
    var startPt = courseData.spline.getPointAt(0);
    var startTan = courseData.spline.getTangentAt(0);
    camera.position.set(
      startPt.x - startTan.x * 3,
      startPt.y + 2.5,
      startPt.z - startTan.z * 3
    );
    camera.lookAt(startPt.x + startTan.x * 10, startPt.y + 0.5, startPt.z + startTan.z * 10);
    renderer.render(scene, camera);
    
    animate();
    
    console.log('MAZDA SOUL DRIFT initialized');
    console.log('Course total distance:', courseData.segLookup.totalDist.toFixed(1), 'units');
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  
})();
