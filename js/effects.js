/**
 * MAZDA SOUL DRIFT - Visual Effects System
 * 3D particle effects: drift sparks, boost flames, speed lines
 */

var EffectsSystem = (function() {
  "use strict";

  var scene = null;
  var sparksPool = [];
  var boostPool = [];
  var speedLinePool = [];
  var SPARK_COUNT = 60;
  var BOOST_COUNT = 30;
  var SPEED_LINE_COUNT = 40;

  // Spark state
  var sparksActive = false;
  var sparkTimer = 0;

  // Boost state
  var boostActive = false;
  var boostIntensity = 0;

  // Speed line state
  var speedLinesActive = false;

  // Shared geometries & materials
  var sparkGeom = null;
  var sparkMats = [];
  var boostGeom = null;
  var boostMat = null;
  var lineGeom = null;
  var lineMat = null;

  // Reusable vectors (avoid per-frame allocation)
  var _up = new THREE.Vector3(0, 1, 0);
  var _right = new THREE.Vector3();
  var _lookTarget = new THREE.Vector3();

  function init(sceneRef) {
    scene = sceneRef;

    // --- Spark particles (small bright cubes) ---
    sparkGeom = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    sparkMats = [
      new THREE.MeshBasicMaterial({ color: 0xFFAA00 }),
      new THREE.MeshBasicMaterial({ color: 0xFF6600 }),
      new THREE.MeshBasicMaterial({ color: 0xFFDD44 }),
      new THREE.MeshBasicMaterial({ color: 0xFF4400 })
    ];

    for (var i = 0; i < SPARK_COUNT; i++) {
      var mat = sparkMats[i % sparkMats.length];
      var spark = new THREE.Mesh(sparkGeom, mat);
      spark.visible = false;
      spark.userData = { vx: 0, vy: 0, vz: 0, life: 0, maxLife: 0 };
      scene.add(spark);
      sparksPool.push(spark);
    }

    // --- Boost flame particles (orange/red spheres behind car) ---
    boostGeom = new THREE.SphereGeometry(0.06, 4, 4);
    boostMat = new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.8 });

    for (var b = 0; b < BOOST_COUNT; b++) {
      var flame = new THREE.Mesh(boostGeom, boostMat.clone());
      flame.visible = false;
      flame.userData = { vx: 0, vy: 0, vz: 0, life: 0, maxLife: 0 };
      scene.add(flame);
      boostPool.push(flame);
    }

    // --- 3D Speed lines (thin elongated boxes that fly past camera) ---
    lineGeom = new THREE.BoxGeometry(0.02, 0.02, 1.5);
    lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.3 });

    for (var s = 0; s < SPEED_LINE_COUNT; s++) {
      var line = new THREE.Mesh(lineGeom, lineMat.clone());
      line.visible = false;
      line.userData = { speed: 0, life: 0, active: false };
      scene.add(line);
      speedLinePool.push(line);
    }
  }

  // --- DRIFT SPARKS ---
  // Called when drift judgment happens (PERFECT/GREAT show more sparks)
  function triggerSparks(position, tangent, intensity) {
    if (!scene) return;
    sparksActive = true;
    sparkTimer = 0.6 * intensity; // Duration scales with intensity

    _right.crossVectors(tangent, _up).normalize();

    var count = Math.floor(SPARK_COUNT * Math.min(intensity, 1.0));
    for (var i = 0; i < count; i++) {
      var spark = sparksPool[i];
      spark.visible = true;

      // Start near rear wheels of car
      var side = (Math.random() > 0.5) ? 1 : -1;
      spark.position.set(
        position.x + _right.x * side * 0.3 + (Math.random() - 0.5) * 0.2,
        position.y + 0.05 + Math.random() * 0.1,
        position.z + _right.z * side * 0.3 + (Math.random() - 0.5) * 0.2
      );

      // Random velocity: mostly backward + sideways + up
      var speed = 2 + Math.random() * 4;
      spark.userData.vx = (-tangent.x + (Math.random() - 0.5) * 1.5) * speed;
      spark.userData.vy = (0.5 + Math.random() * 2) * speed * 0.5;
      spark.userData.vz = (-tangent.z + (Math.random() - 0.5) * 1.5) * speed;
      spark.userData.life = 0.3 + Math.random() * 0.5;
      spark.userData.maxLife = spark.userData.life;

      // Random scale
      var sc = 0.5 + Math.random() * 1.5;
      spark.scale.set(sc, sc, sc);
    }
  }

  // --- BOOST FLAMES ---
  // Called continuously while boosting
  function triggerBoostFlames(position, tangent, intensity) {
    if (!scene) return;
    boostActive = true;
    boostIntensity = intensity;

    // Emit a few particles each frame
    var emitCount = Math.floor(3 * intensity);
    for (var i = 0; i < BOOST_COUNT; i++) {
      var flame = boostPool[i];
      if (flame.userData.life <= 0 && emitCount > 0) {
        flame.visible = true;
        emitCount--;

        // Start behind car
        flame.position.set(
          position.x - tangent.x * 0.5 + (Math.random() - 0.5) * 0.15,
          position.y + 0.1 + Math.random() * 0.05,
          position.z - tangent.z * 0.5 + (Math.random() - 0.5) * 0.15
        );

        var speed = 1.5 + Math.random() * 2;
        flame.userData.vx = -tangent.x * speed + (Math.random() - 0.5) * 0.5;
        flame.userData.vy = 0.3 + Math.random() * 0.5;
        flame.userData.vz = -tangent.z * speed + (Math.random() - 0.5) * 0.5;
        flame.userData.life = 0.2 + Math.random() * 0.3;
        flame.userData.maxLife = flame.userData.life;

        // Color variation
        var hue = Math.random();
        if (hue < 0.4) {
          flame.material.color.setHex(0xFF6600); // orange
        } else if (hue < 0.7) {
          flame.material.color.setHex(0xFF3300); // red-orange
        } else {
          flame.material.color.setHex(0xFFAA00); // yellow-orange
        }
      }
    }
  }

  // --- 3D SPEED LINES ---
  function activateSpeedLines(carPosition, tangent, speed) {
    if (!scene) return;
    speedLinesActive = (speed > 1.05); // Only show at higher speeds

    if (!speedLinesActive) {
      for (var i = 0; i < speedLinePool.length; i++) {
        speedLinePool[i].visible = false;
        speedLinePool[i].userData.active = false;
      }
      return;
    }

    _right.crossVectors(tangent, _up).normalize();

    for (var i = 0; i < speedLinePool.length; i++) {
      var line = speedLinePool[i];

      if (!line.userData.active || line.userData.life <= 0) {
        // Respawn
        line.userData.active = true;
        line.visible = true;

        // Position ahead and around the car
        var ahead = 3 + Math.random() * 8;
        var lateral = (Math.random() - 0.5) * 6;
        var vertical = -0.5 + Math.random() * 3;

        line.position.set(
          carPosition.x + tangent.x * ahead + _right.x * lateral,
          carPosition.y + vertical,
          carPosition.z + tangent.z * ahead + _right.z * lateral
        );

        // Align with tangent direction
        _lookTarget.copy(line.position).add(tangent);
        line.lookAt(_lookTarget);

        line.userData.speed = 15 + Math.random() * 10;
        line.userData.life = 0.3 + Math.random() * 0.4;

        // Opacity based on speed
        var opacity = Math.min((speed - 1.05) * 2, 0.4);
        line.material.opacity = opacity;

        // Scale length with speed
        var len = 1.0 + (speed - 1.0) * 3;
        line.scale.set(1, 1, len);
      }
    }
  }

  // --- UPDATE (called every frame) ---
  function update(dt) {
    // Update sparks
    for (var i = 0; i < sparksPool.length; i++) {
      var spark = sparksPool[i];
      if (!spark.visible) continue;

      spark.userData.life -= dt;
      if (spark.userData.life <= 0) {
        spark.visible = false;
        continue;
      }

      // Physics: gravity + velocity
      spark.userData.vy -= 9.8 * dt; // gravity
      spark.position.x += spark.userData.vx * dt;
      spark.position.y += spark.userData.vy * dt;
      spark.position.z += spark.userData.vz * dt;

      // Fade out (deterministic scale to avoid per-frame random jitter)
      var lifeRatio = spark.userData.life / spark.userData.maxLife;
      spark.scale.setScalar(lifeRatio);
    }

    // Update boost flames
    for (var b = 0; b < boostPool.length; b++) {
      var flame = boostPool[b];
      if (!flame.visible) continue;

      flame.userData.life -= dt;
      if (flame.userData.life <= 0) {
        flame.visible = false;
        continue;
      }

      flame.position.x += flame.userData.vx * dt;
      flame.position.y += flame.userData.vy * dt;
      flame.position.z += flame.userData.vz * dt;

      // Scale up and fade
      var fLife = flame.userData.life / flame.userData.maxLife;
      var sc = (1 - fLife) * 2 + 0.5;
      flame.scale.setScalar(sc);
      flame.material.opacity = fLife * 0.8;
    }

    // Update speed lines
    for (var s = 0; s < speedLinePool.length; s++) {
      var line = speedLinePool[s];
      if (!line.visible || !line.userData.active) continue;

      line.userData.life -= dt;
      if (line.userData.life <= 0) {
        line.visible = false;
        line.userData.active = false;
        continue;
      }

      // Move backward past camera
      line.position.x -= line.userData.speed * dt * 0.5;
      line.position.z -= line.userData.speed * dt * 0.3;

      // Fade
      var sLife = line.userData.life / 0.5;
      line.material.opacity = Math.min(sLife, 0.35);
    }

    // Decay spark timer
    if (sparkTimer > 0) {
      sparkTimer -= dt;
      if (sparkTimer <= 0) sparksActive = false;
    }
  }

  // --- CLEANUP ---
  function hideAll() {
    for (var i = 0; i < sparksPool.length; i++) sparksPool[i].visible = false;
    for (var b = 0; b < boostPool.length; b++) boostPool[b].visible = false;
    for (var s = 0; s < speedLinePool.length; s++) {
      speedLinePool[s].visible = false;
      speedLinePool[s].userData.active = false;
    }
    sparksActive = false;
    boostActive = false;
    speedLinesActive = false;
  }

  return {
    init: init,
    update: update,
    triggerSparks: triggerSparks,
    triggerBoostFlames: triggerBoostFlames,
    activateSpeedLines: activateSpeedLines,
    hideAll: hideAll
  };
})();
