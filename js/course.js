/**
 * MAZDA SOUL DRIFT - Course Generation
 * Generates Fuji Speedway from segment data using THREE.js primitives
 */

var CourseBuilder = (function() {
  
  // Build the course path from explicit control points
  // Uses COURSE_CONTROL_POINTS for guaranteed spatial closure and no overlap
  function buildCoursePath() {
    var controlPts = COURSE_CONTROL_POINTS;
    var points = [];
    
    for (var i = 0; i < controlPts.length; i++) {
      var cp = controlPts[i];
      points.push(new THREE.Vector3(cp.x, cp.y, cp.z));
    }
    
    return {
      points: points,
      totalDistance: 0 // will be set from spline length
    };
  }
  
  // Create a CatmullRom spline from points
  function createSpline(points) {
    return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.05);
  }
  
  // Build road mesh from spline
  function buildRoadMesh(spline, totalDistance) {
    var numSamples = Math.floor(totalDistance * 1.5);
    numSamples = Math.max(200, Math.min(numSamples, 800));
    
    var roadGeom = new THREE.BufferGeometry();
    var positions = [];
    var indices = [];
    var colors = [];
    
    var up = new THREE.Vector3(0, 1, 0);
    
    for (var i = 0; i <= numSamples; i++) {
      var t = i / numSamples;
      var point = spline.getPointAt(t);
      var tangent = spline.getTangentAt(t);
      
      // Compute right vector (perpendicular to tangent on XZ plane)
      var right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      
      var leftPt = point.clone().add(right.clone().multiplyScalar(-ROAD_HALF_WIDTH));
      var rightPt = point.clone().add(right.clone().multiplyScalar(ROAD_HALF_WIDTH));
      
      // Offset road up to prevent z-fighting
      leftPt.y += 0.08;
      rightPt.y += 0.08;
      
      positions.push(leftPt.x, leftPt.y, leftPt.z);
      positions.push(rightPt.x, rightPt.y, rightPt.z);
      
      // Road color: dark gray asphalt
      colors.push(0.25, 0.25, 0.25);
      colors.push(0.25, 0.25, 0.25);
      
      if (i < numSamples) {
        var idx = i * 2;
        indices.push(idx, idx + 1, idx + 2);
        indices.push(idx + 1, idx + 3, idx + 2);
      }
    }
    
    roadGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    roadGeom.setIndex(indices);
    roadGeom.computeVertexNormals();
    
    var roadMat = new THREE.MeshLambertMaterial({
      color: 0x555555,
      vertexColors: false,
      side: THREE.DoubleSide
    });
    
    return new THREE.Mesh(roadGeom, roadMat);
  }
  
  // Build kerb meshes (red/white stripes on both sides)
  function buildKerbs(spline, totalDistance) {
    var group = new THREE.Group();
    var numSamples = Math.floor(totalDistance * 0.8);
    numSamples = Math.max(100, Math.min(numSamples, 500));
    var up = new THREE.Vector3(0, 1, 0);
    var kerbWidth = 0.15;
    
    var leftPositions = [], rightPositions = [];
    var leftColors = [], rightColors = [];
    var leftIndices = [], rightIndices = [];
    
    for (var i = 0; i <= numSamples; i++) {
      var t = i / numSamples;
      var point = spline.getPointAt(t);
      var tangent = spline.getTangentAt(t);
      var right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      
      var isRed = (Math.floor(t * numSamples * 2) % 2 === 0);
      var r = isRed ? 0.77 : 1.0;
      var g = isRed ? 0.12 : 1.0;
      var b = isRed ? 0.23 : 1.0;
      
      // Left kerb
      var lInner = point.clone().add(right.clone().multiplyScalar(-(ROAD_HALF_WIDTH)));
      var lOuter = point.clone().add(right.clone().multiplyScalar(-(ROAD_HALF_WIDTH + kerbWidth)));
      lInner.y += 0.09; lOuter.y += 0.09;
      
      leftPositions.push(lInner.x, lInner.y, lInner.z);
      leftPositions.push(lOuter.x, lOuter.y, lOuter.z);
      leftColors.push(r, g, b, r, g, b);
      
      // Right kerb
      var rInner = point.clone().add(right.clone().multiplyScalar(ROAD_HALF_WIDTH));
      var rOuter = point.clone().add(right.clone().multiplyScalar(ROAD_HALF_WIDTH + kerbWidth));
      rInner.y += 0.09; rOuter.y += 0.09;
      
      rightPositions.push(rInner.x, rInner.y, rInner.z);
      rightPositions.push(rOuter.x, rOuter.y, rOuter.z);
      rightColors.push(r, g, b, r, g, b);
      
      if (i < numSamples) {
        var idx = i * 2;
        leftIndices.push(idx, idx+1, idx+2, idx+1, idx+3, idx+2);
        rightIndices.push(idx, idx+1, idx+2, idx+1, idx+3, idx+2);
      }
    }
    
    var lGeom = new THREE.BufferGeometry();
    lGeom.setAttribute('position', new THREE.Float32BufferAttribute(leftPositions, 3));
    lGeom.setAttribute('color', new THREE.Float32BufferAttribute(leftColors, 3));
    lGeom.setIndex(leftIndices);
    
    var rGeom = new THREE.BufferGeometry();
    rGeom.setAttribute('position', new THREE.Float32BufferAttribute(rightPositions, 3));
    rGeom.setAttribute('color', new THREE.Float32BufferAttribute(rightColors, 3));
    rGeom.setIndex(rightIndices);
    
    var kerbMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(lGeom, kerbMat));
    group.add(new THREE.Mesh(rGeom, kerbMat));
    
    return group;
  }
  
  // Build guardrails
  function buildGuardrails(spline, totalDistance) {
    var group = new THREE.Group();
    var numPosts = Math.floor(totalDistance / 4);
    var up = new THREE.Vector3(0, 1, 0);
    var railOffset = ROAD_HALF_WIDTH + 0.4;
    
    var postGeom = new THREE.BoxGeometry(0.08, 0.5, 0.08);
    var postMat = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
    
    // Use instanced mesh for performance
    var totalPosts = numPosts * 2;
    var instanced = new THREE.InstancedMesh(postGeom, postMat, totalPosts);
    var dummy = new THREE.Object3D();
    var idx = 0;
    
    for (var i = 0; i < numPosts; i++) {
      var t = i / numPosts;
      var point = spline.getPointAt(t);
      var tangent = spline.getTangentAt(t);
      var right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      
      // Left guardrail
      dummy.position.copy(point.clone().add(right.clone().multiplyScalar(-railOffset)));
      dummy.position.y += 0.25;
      dummy.updateMatrix();
      instanced.setMatrixAt(idx++, dummy.matrix);
      
      // Right guardrail
      dummy.position.copy(point.clone().add(right.clone().multiplyScalar(railOffset)));
      dummy.position.y += 0.25;
      dummy.updateMatrix();
      instanced.setMatrixAt(idx++, dummy.matrix);
    }
    
    instanced.instanceMatrix.needsUpdate = true;
    group.add(instanced);
    
    return group;
  }
  
  // Build start/finish line
  function buildStartFinishLine(spline) {
    var point = spline.getPointAt(0);
    var tangent = spline.getTangentAt(0);
    var up = new THREE.Vector3(0, 1, 0);
    var right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    
    var lineGeom = new THREE.PlaneGeometry(ROAD_WIDTH, 0.3);
    var lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    var line = new THREE.Mesh(lineGeom, lineMat);
    line.position.copy(point);
    line.position.y += 0.04;
    line.rotation.x = -Math.PI / 2;
    
    // Align with road direction
    var angle = Math.atan2(tangent.x, tangent.z);
    line.rotation.z = angle;
    
    return line;
  }
  
  // ===== ENVIRONMENT: Ground, Sky, Lighting =====
  function buildEnvironment(scene) {
    // Ground plane (green grass)
    var groundGeom = new THREE.PlaneGeometry(1200, 1200);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x2D6B27 });
    var ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.5;
    scene.add(ground);
    
    // Inner tarmac/grass area (centered on course)
    // Course center is roughly (30, 35) - clockwise layout
    var innerGeom = new THREE.PlaneGeometry(120, 110);
    var innerMat = new THREE.MeshLambertMaterial({ color: 0x337733 });
    var inner = new THREE.Mesh(innerGeom, innerMat);
    inner.rotation.x = -Math.PI / 2;
    inner.position.set(30, -2.45, 35);
    scene.add(inner);
    
    // Sky (bright blue daytime)
    scene.background = new THREE.Color(0x7EC8E3);
    scene.fog = new THREE.Fog(0x7EC8E3, 400, 1200);
    
    // Warm sun light
    var dirLight = new THREE.DirectionalLight(0xFFF5E0, 1.2);
    dirLight.position.set(80, 150, -50);
    scene.add(dirLight);
    
    // Blue sky bounce fill light
    var dirLight2 = new THREE.DirectionalLight(0xCCDDFF, 0.4);
    dirLight2.position.set(-40, 80, 60);
    scene.add(dirLight2);
    
    var ambLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambLight);
  }
  
  // ===== MT. FUJI (large, snow-capped, prominent) =====
  // Positioned north of the track (positive Z direction from main straight)
  function buildMtFuji(scene) {
    var fujiGroup = new THREE.Group();
    var fujiX = 30, fujiZ = -280; // South of track, visible from main straight (track goes clockwise into +Z)
    
    // Mountain base (wider, darker)
    var baseGeom = new THREE.ConeGeometry(120, 20, 16);
    var baseMat = new THREE.MeshLambertMaterial({ color: 0x4A5A3A, transparent: true, opacity: 0.5 });
    var base = new THREE.Mesh(baseGeom, baseMat);
    base.position.set(fujiX, 5, fujiZ);
    fujiGroup.add(base);
    
    // Main mountain body (bluish-gray)
    var fujiGeom = new THREE.ConeGeometry(80, 55, 16);
    var fujiMat = new THREE.MeshLambertMaterial({ color: 0x6B7B9B, transparent: true, opacity: 0.75 });
    var fuji = new THREE.Mesh(fujiGeom, fujiMat);
    fuji.position.set(fujiX, 20, fujiZ);
    fujiGroup.add(fuji);
    
    // Snow cap (white, prominent)
    var snowGeom = new THREE.ConeGeometry(30, 18, 16);
    var snowMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 });
    var snow = new THREE.Mesh(snowGeom, snowMat);
    snow.position.set(fujiX, 42, fujiZ);
    fujiGroup.add(snow);
    
    scene.add(fujiGroup);
  }
  
  // ===== GRANDSTANDS with SPECTATORS =====
  // Positioned along main straight (P0 to P2, X=0..60, Z=0)
  // "Outside" of main straight = positive Z side (north, toward pit)
  // "Inside" of main straight = negative Z side (south, toward track interior)
  function buildGrandstands(scene, spline) {
    var group = new THREE.Group();
    var standColor = 0x556677;
    var seatColors = [0xDD2222, 0x2255CC, 0xFFCC00, 0x22AA44, 0xFFFFFF, 0xFF6600];
    
    // Main Grandstand (3 tiers, south side of main straight = inside track)
    // Track interior is -Z direction from main straight
    for (var tier = 0; tier < 3; tier++) {
      var width = 50 - tier * 3;
      var height = 2.5;
      var depth = 3;
      var geom = new THREE.BoxGeometry(width, height, depth);
      var mat = new THREE.MeshLambertMaterial({ color: standColor });
      var mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(30, tier * height + height / 2 - 2, -(ROAD_HALF_WIDTH + 3 + tier * (depth + 0.2)));
      group.add(mesh);
    }
    
    // Grandstand roof
    var roofGeom = new THREE.BoxGeometry(53, 0.3, 12);
    var roofMat = new THREE.MeshLambertMaterial({ color: 0x334455 });
    var roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(30, 6, -(ROAD_HALF_WIDTH + 7));
    group.add(roof);
    
    // Roof support pillars
    var pillarGeom = new THREE.CylinderGeometry(0.15, 0.15, 8, 6);
    var pillarMat = new THREE.MeshLambertMaterial({ color: 0x666677 });
    for (var p = 0; p < 7; p++) {
      var pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(6 + p * 8, 2, -(ROAD_HALF_WIDTH + 3));
      group.add(pillar);
    }
    
    // Spectators (colored cubes via InstancedMesh)
    var specGeom = new THREE.BoxGeometry(0.35, 0.5, 0.25);
    var totalSpecs = 400;
    var specsPerColor = Math.floor(totalSpecs / seatColors.length);
    
    for (var c = 0; c < seatColors.length; c++) {
      var sMat = new THREE.MeshLambertMaterial({ color: seatColors[c] });
      var inst = new THREE.InstancedMesh(specGeom, sMat, specsPerColor);
      var dummy = new THREE.Object3D();
      for (var si = 0; si < specsPerColor; si++) {
        var sTier = Math.floor(Math.random() * 3);
        var h = 2.5;
        dummy.position.set(
          5 + Math.random() * 48,
          sTier * h + h - 1.5,
          -(ROAD_HALF_WIDTH + 2 + sTier * 3.2 + Math.random() * 2)
        );
        dummy.updateMatrix();
        inst.setMatrixAt(si, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      group.add(inst);
    }
    
    // Secondary Grandstand (north side = pit side)
    var innerStandGeom = new THREE.BoxGeometry(35, 3, 3);
    var innerStandMat = new THREE.MeshLambertMaterial({ color: 0x556677 });
    var innerStand = new THREE.Mesh(innerStandGeom, innerStandMat);
    innerStand.position.set(30, -0.5, ROAD_HALF_WIDTH + 4);
    group.add(innerStand);
    
    // Inner grandstand spectators
    for (var ci = 0; ci < 3; ci++) {
      var sMat2 = new THREE.MeshLambertMaterial({ color: seatColors[ci] });
      var inst2 = new THREE.InstancedMesh(specGeom, sMat2, 40);
      var dummy2 = new THREE.Object3D();
      for (var si2 = 0; si2 < 40; si2++) {
        dummy2.position.set(
          12 + Math.random() * 30,
          1.2 + Math.random() * 0.3,
          ROAD_HALF_WIDTH + 2 + Math.random() * 2
        );
        dummy2.updateMatrix();
        inst2.setMatrixAt(si2, dummy2.matrix);
      }
      inst2.instanceMatrix.needsUpdate = true;
      group.add(inst2);
    }
    
    scene.add(group);
  }
  
  // ===== PIT BUILDINGS & CONTROL TOWER =====
  // North side of main straight (positive Z)
  function buildPitBuildings(scene, spline) {
    var group = new THREE.Group();
    
    // Main pit building (north side of main straight)
    var pitGeom = new THREE.BoxGeometry(45, 3.5, 6);
    var pitMat = new THREE.MeshLambertMaterial({ color: 0x445566 });
    var pit = new THREE.Mesh(pitGeom, pitMat);
    pit.position.set(30, -0.5, ROAD_HALF_WIDTH + 9);
    group.add(pit);
    
    // Pit roof
    var pitRoofGeom = new THREE.BoxGeometry(47, 0.2, 9);
    var pitRoofMat = new THREE.MeshLambertMaterial({ color: 0x333344 });
    var pitRoof = new THREE.Mesh(pitRoofGeom, pitRoofMat);
    pitRoof.position.set(30, 2, ROAD_HALF_WIDTH + 8);
    group.add(pitRoof);
    
    // Pit lane wall separator
    var wallGeom = new THREE.BoxGeometry(40, 0.4, 0.15);
    var wallMat = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
    var wall = new THREE.Mesh(wallGeom, wallMat);
    wall.position.set(30, -1.3, ROAD_HALF_WIDTH + 2);
    group.add(wall);
    
    // Control tower
    var towerGeom = new THREE.BoxGeometry(6, 8, 5);
    var towerMat = new THREE.MeshLambertMaterial({ color: 0x556677 });
    var tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.set(3, 1.5, ROAD_HALF_WIDTH + 7);
    group.add(tower);
    
    // Tower windows (glass front)
    var winGeom = new THREE.BoxGeometry(5.5, 2.5, 0.1);
    var winMat = new THREE.MeshLambertMaterial({ color: 0x88BBDD, transparent: true, opacity: 0.6 });
    var win = new THREE.Mesh(winGeom, winMat);
    win.position.set(3, 4, ROAD_HALF_WIDTH + 4.5);
    group.add(win);
    
    scene.add(group);
  }
  
  // ===== FOREST TREES =====
  function buildForestTrees(scene, spline) {
    var treeGeom = new THREE.ConeGeometry(1.2, 4, 5);
    var trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 1.5, 5);
    var treeMats = [
      new THREE.MeshLambertMaterial({ color: 0x1A6B2A }),
      new THREE.MeshLambertMaterial({ color: 0x145020 })
    ];
    var trunkMat = new THREE.MeshLambertMaterial({ color: 0x4A3520 });
    var up = new THREE.Vector3(0, 1, 0);
    
    var treePositions = [];
    
    // Trees scattered near the track
    for (var ti = 0; ti < 160; ti++) {
      var tt = Math.random();
      var tPoint = spline.getPointAt(tt);
      var tTangent = spline.getTangentAt(tt);
      var tRight = new THREE.Vector3().crossVectors(tTangent, up).normalize();
      var tSide = (Math.random() > 0.5) ? 1 : -1;
      var tDist = ROAD_HALF_WIDTH + 6 + Math.random() * 30;
      var treePos = tPoint.clone().add(tRight.clone().multiplyScalar(tSide * tDist));
      treePos.y = -2.5;
      // Skip trees in grandstand/pit area (main straight runs X=0..60, Z~0)
      if (treePos.x > -5 && treePos.x < 65 && treePos.z > -18 && treePos.z < 8) continue;
      treePositions.push(treePos);
    }
    
    // Extra trees for forest backdrop (further away)
    for (var bi = 0; bi < 100; bi++) {
      var bAngle = Math.random() * Math.PI * 2;
      var bDist = 60 + Math.random() * 140;
      // Center backdrop trees around course center (30, 35) - clockwise
      var bPos = new THREE.Vector3(30 + Math.cos(bAngle) * bDist, -2.5, 35 + Math.sin(bAngle) * bDist);
      if (bPos.x > -5 && bPos.x < 65 && bPos.z > -18 && bPos.z < 8) continue;
      treePositions.push(bPos);
    }
    
    var numTrees = treePositions.length;
    if (numTrees === 0) return;
    
    // Create instanced meshes for each tree color variant
    for (var mi = 0; mi < treeMats.length; mi++) {
      var count = Math.floor(numTrees / treeMats.length);
      var startIdx = mi * count;
      var treeInst = new THREE.InstancedMesh(treeGeom, treeMats[mi], count);
      var trunkInst = new THREE.InstancedMesh(trunkGeom, trunkMat, count);
      var dummyT = new THREE.Object3D();
      
      for (var fi = 0; fi < count; fi++) {
        var fIdx = startIdx + fi;
        if (fIdx >= numTrees) break;
        var fPos = treePositions[fIdx];
        var fScale = 0.6 + Math.random() * 0.8;
        
        // Tree top (cone)
        dummyT.position.set(fPos.x, fPos.y + 2.5 * fScale, fPos.z);
        dummyT.scale.set(fScale, fScale, fScale);
        dummyT.updateMatrix();
        treeInst.setMatrixAt(fi, dummyT.matrix);
        
        // Trunk (cylinder)
        dummyT.position.set(fPos.x, fPos.y + 0.75 * fScale, fPos.z);
        dummyT.updateMatrix();
        trunkInst.setMatrixAt(fi, dummyT.matrix);
      }
      
      treeInst.instanceMatrix.needsUpdate = true;
      trunkInst.instanceMatrix.needsUpdate = true;
      scene.add(treeInst);
      scene.add(trunkInst);
    }
  }
  
  // ===== TRACK-SIDE BANNERS =====
  function buildTrackBanners(scene, spline) {
    var up = new THREE.Vector3(0, 1, 0);
    var bannerColors = [0xCC0000, 0x0044CC, 0xFFCC00, 0x22AA44, 0xCC0066];
    var bannerTs = [0.22, 0.35, 0.5, 0.68, 0.85];
    
    for (var bb = 0; bb < bannerTs.length; bb++) {
      var bt = bannerTs[bb];
      var bPoint = spline.getPointAt(bt);
      var bTangent = spline.getTangentAt(bt);
      var bRight = new THREE.Vector3().crossVectors(bTangent, up).normalize();
      
      var bannerGeom = new THREE.BoxGeometry(4, 1.2, 0.1);
      var bannerMat = new THREE.MeshLambertMaterial({ color: bannerColors[bb] });
      var banner = new THREE.Mesh(bannerGeom, bannerMat);
      var bannerPos = bPoint.clone().add(bRight.clone().multiplyScalar(ROAD_HALF_WIDTH + 1));
      banner.position.copy(bannerPos);
      banner.position.y += 0.6;
      banner.rotation.y = Math.atan2(bTangent.x, bTangent.z);
      scene.add(banner);
    }
  }
  
  // ===== TIRE BARRIERS at key corners =====
  function buildTireBarriers(scene, spline) {
    var up = new THREE.Vector3(0, 1, 0);
    var barrierGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
    var blackMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    var redMat = new THREE.MeshLambertMaterial({ color: 0xCC2222 });
    
    // TGR corner area (t=0.10-0.25) and ADVAN hairpin area (t=0.55-0.65)
    var cornerRanges = [
      { start: 0.12, end: 0.22, count: 18 },
      { start: 0.56, end: 0.64, count: 22 }
    ];
    
    for (var cr = 0; cr < cornerRanges.length; cr++) {
      var range = cornerRanges[cr];
      for (var ti = 0; ti < range.count; ti++) {
        var tt = range.start + (range.end - range.start) * (ti / range.count);
        var tPoint = spline.getPointAt(tt);
        var tTangent = spline.getTangentAt(tt);
        var tRight = new THREE.Vector3().crossVectors(tTangent, up).normalize();
        var tOffset = ROAD_HALF_WIDTH + 0.4;
        for (var row = 0; row < 2; row++) {
          var tirePos = tPoint.clone().add(tRight.clone().multiplyScalar(tOffset + row * 0.35));
          var tireMat = (row === 0 && ti % 3 === 0) ? redMat : blackMat;
          var tire = new THREE.Mesh(barrierGeom, tireMat);
          tire.position.copy(tirePos);
          // Keep tires at road level
          tire.position.y = tPoint.y + 0.15 + row * 0.3;
          tire.rotation.x = Math.PI / 2;
          scene.add(tire);
        }
      }
    }
  }
  
  // ===== MAIN BUILD FUNCTION =====
  function build(scene) {
    var pathData = buildCoursePath();
    var spline = createSpline(pathData.points);
    var splineLength = spline.getLength();
    
    console.log('Course spline length: ' + splineLength.toFixed(1) + ' units');
    
    // Road
    var road = buildRoadMesh(spline, splineLength);
    scene.add(road);
    
    // Kerbs
    var kerbs = buildKerbs(spline, splineLength);
    scene.add(kerbs);
    
    // Guardrails
    var guardrails = buildGuardrails(spline, splineLength);
    scene.add(guardrails);
    
    // Start/Finish line
    var sfLine = buildStartFinishLine(spline);
    scene.add(sfLine);
    
    // Center lane dashes
    var centerDashes = buildCenterDashes(spline, splineLength);
    scene.add(centerDashes);
    
    // Environment (ground, sky, lighting)
    buildEnvironment(scene);
    
    // Mt. Fuji (large, snow-capped)
    buildMtFuji(scene);
    
    // Grandstands with spectators
    buildGrandstands(scene, spline);
    
    // Pit buildings & control tower
    buildPitBuildings(scene, spline);
    
    // Forest trees
    buildForestTrees(scene, spline);
    
    // Track-side banners
    buildTrackBanners(scene, spline);
    
    // Tire barriers at key corners
    buildTireBarriers(scene, spline);
    
    // Build segment distance lookup (t-fraction based)
    var segLookup = buildSegmentLookup(spline, splineLength);
    
    // Generate minimap 2D points
    var minimapPoints = generateMinimapPoints(spline);
    
    return {
      spline: spline,
      totalDistance: splineLength,
      pathData: pathData,
      segLookup: segLookup,
      minimapPoints: minimapPoints
    };
  }
  
  // Build a lookup: for a given distance along the course, which segment are we in?
  // Uses t-fraction based segment boundaries from COURSE_SEGMENTS.
  // Since getPointAt(t) uses arc-length parameterization, distance/totalDist = t.
  function buildSegmentLookup(spline, splineLength) {
    var segments = COURSE_SEGMENTS;
    
    // Convert t-fractions to cumulative distances
    var cumulDist = [];
    for (var i = 0; i < segments.length; i++) {
      cumulDist.push(segments[i].tStart * splineLength);
    }
    cumulDist.push(splineLength); // end
    
    return {
      cumulDist: cumulDist,
      totalDist: splineLength,
      getSegmentAt: function(distance) {
        var total = splineLength;
        var dist = ((distance % total) + total) % total;
        for (var i = segments.length - 1; i >= 0; i--) {
          if (dist >= cumulDist[i]) {
            var segLen = cumulDist[i + 1] - cumulDist[i];
            return {
              segment: segments[i],
              index: i,
              progressInSeg: segLen > 0 ? (dist - cumulDist[i]) / segLen : 0,
              distIntoSeg: dist - cumulDist[i],
              segLength: segLen
            };
          }
        }
        return {
          segment: segments[0],
          index: 0,
          progressInSeg: 0,
          distIntoSeg: 0,
          segLength: cumulDist[1] - cumulDist[0]
        };
      },
      getSegmentAhead: function(distance, lookahead) {
        return this.getSegmentAt(distance + lookahead);
      }
    };
  }
  
  // Build center lane dashes for better speed perception
  function buildCenterDashes(spline, totalDistance) {
    var group = new THREE.Group();
    var dashLength = 0.8;
    var gapLength = 1.6;
    var cycleLength = dashLength + gapLength;
    var numDashes = Math.floor(totalDistance / cycleLength);
    
    var dashGeom = new THREE.PlaneGeometry(0.08, dashLength);
    var dashMat = new THREE.MeshBasicMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    
    var instanced = new THREE.InstancedMesh(dashGeom, dashMat, numDashes);
    var dummy = new THREE.Object3D();
    
    for (var i = 0; i < numDashes; i++) {
      var t = (i * cycleLength + dashLength * 0.5) / totalDistance;
      t = t % 1.0;
      var point = spline.getPointAt(t);
      var tangent = spline.getTangentAt(t);
      
      dummy.position.copy(point);
      dummy.position.y += 0.10;
      
      // Rotate to align with road direction
      var angle = Math.atan2(tangent.x, tangent.z);
      dummy.rotation.set(-Math.PI / 2, 0, angle);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    
    instanced.instanceMatrix.needsUpdate = true;
    group.add(instanced);
    return group;
  }
  
  // Generate 2D minimap points from spline
  function generateMinimapPoints(spline) {
    var numPoints = 200;
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var t = i / numPoints;
      var p = spline.getPointAt(t);
      points.push({ x: p.x, z: p.z });
    }
    return points;
  }
  
  return { build: build };
})();
