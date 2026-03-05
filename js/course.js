/**
 * MAZDA SOUL DRIFT - Course Generation
 * Generates Fuji Speedway from segment data using THREE.js primitives
 */

var CourseBuilder = (function() {
  
  // Build the course path from segments
  function buildCoursePath(segments) {
    var points = [];
    var elevations = [];
    var segmentMeta = []; // maps point index to segment info
    
    var pos = new THREE.Vector3(0, 0, 0);
    var dir = new THREE.Vector3(0, 0, -1); // initial direction: negative Z
    var up = new THREE.Vector3(0, 1, 0);
    
    var totalDistance = 0;
    var segmentStartDistances = [];
    
    points.push(pos.clone());
    elevations.push(0);
    
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      segmentStartDistances.push(totalDistance);
      
      // Apply elevation scaling to reduce extreme height changes
      var elevStart = seg.elevationStart * ELEVATION_SCALE;
      var elevEnd = seg.elevationEnd * ELEVATION_SCALE;
      
      if (seg.type === "straight") {
        var steps = Math.max(2, Math.floor(seg.length / 2));
        var stepLen = seg.length / steps;
        
        for (var s = 1; s <= steps; s++) {
          var t = s / steps;
          var elev = elevStart + (elevEnd - elevStart) * t;
          var newPos = pos.clone().add(dir.clone().multiplyScalar(stepLen));
          newPos.y = elev;
          points.push(newPos.clone());
          elevations.push(elev);
          segmentMeta.push({ segIndex: i, segId: seg.id, type: "straight" });
          pos.copy(newPos);
          totalDistance += stepLen;
        }
        
      } else if (seg.type === "corner") {
        var angleRad = (seg.angle * Math.PI) / 180;
        var sign = (seg.direction === "right") ? -1 : 1;
        
        // Number of arc steps
        var arcSteps = Math.max(6, Math.floor(seg.angle / 3));
        var stepAngle = angleRad / arcSteps;
        
        // Calculate arc length
        var arcLength = seg.radius * angleRad;
        var stepLen = arcLength / arcSteps;
        
        for (var s = 1; s <= arcSteps; s++) {
          var t = s / arcSteps;
          var elev = elevStart + (elevEnd - elevStart) * t;
          
          // Rotate direction
          var rotAxis = up;
          var rotAngle = sign * stepAngle;
          dir.applyAxisAngle(rotAxis, rotAngle);
          dir.normalize();
          
          var newPos = pos.clone().add(dir.clone().multiplyScalar(stepLen));
          newPos.y = elev;
          points.push(newPos.clone());
          elevations.push(elev);
          segmentMeta.push({ segIndex: i, segId: seg.id, type: "corner", cornerName: seg.name, difficulty: seg.difficulty });
          pos.copy(newPos);
          totalDistance += stepLen;
        }
      }
    }
    
    return {
      points: points,
      elevations: elevations,
      segmentMeta: segmentMeta,
      totalDistance: totalDistance,
      segmentStartDistances: segmentStartDistances
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
  
  // Build environment (ground, sky, Mt. Fuji, lighting)
  function buildEnvironment(scene, spline) {
    // Ground plane
    var groundGeom = new THREE.PlaneGeometry(900, 900);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x2D5A27 });
    var ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.0;
    scene.add(ground);
    
    // Sky (bright daytime)
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 300, 900);
    
    // Mt. Fuji (simple cone NW of course)
    var fujiGeom = new THREE.ConeGeometry(42, 32, 10);
    var fujiMat = new THREE.MeshLambertMaterial({
      color: 0xC8D2E6,
      transparent: true,
      opacity: 0.35
    });
    var fuji = new THREE.Mesh(fujiGeom, fujiMat);
    fuji.position.set(-160, 10, -210);
    scene.add(fuji);
    
    // Snow cap
    var snowGeom = new THREE.ConeGeometry(16, 9, 10);
    var snowMat = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.45
    });
    var snow = new THREE.Mesh(snowGeom, snowMat);
    snow.position.set(-160, 23, -210);
    scene.add(snow);
    
    // Lighting (daylight)
    var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    dirLight.position.set(50, 120, 30);
    scene.add(dirLight);
    
    var ambLight = new THREE.AmbientLight(0xFFFFFF, 0.55);
    scene.add(ambLight);
  }
  
  // Build the entire course and return useful data
  function build(scene) {
    var pathData = buildCoursePath(COURSE_SEGMENTS);
    var spline = createSpline(pathData.points);
    var splineLength = spline.getLength();
    
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
    
    // Environment
    buildEnvironment(scene, spline);
    
    // Center lane dashes for speed perception
    var centerDashes = buildCenterDashes(spline, splineLength);
    scene.add(centerDashes);
    
    // Build segment distance lookup
    // CRITICAL: use spline arc length as canonical distance to match getPointAt(t)
    var segLookup = buildSegmentLookup(pathData, spline, splineLength);
    
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
  // NOTE: CatmullRomCurve3.getPointAt(t) uses arc-length parameterization, so we must
  // also treat spline arc length as the canonical distance.
  function buildSegmentLookup(pathData, spline, splineLength) {
    var segments = COURSE_SEGMENTS;
    var rawCumulDist = [];
    var d = 0;
    
    // Raw cumulative distances based on segment definitions
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      rawCumulDist.push(d);
      if (seg.type === "straight") {
        d += seg.length;
      } else {
        d += seg.radius * (seg.angle * Math.PI / 180);
      }
    }
    rawCumulDist.push(d);
    var rawTotal = d;
    
    // Scale to match spline arc length
    var scale = (rawTotal > 0) ? (splineLength / rawTotal) : 1;
    var cumulDist = [];
    for (var j = 0; j < rawCumulDist.length; j++) {
      cumulDist.push(rawCumulDist[j] * scale);
    }
    
    return {
      cumulDist: cumulDist,
      totalDist: splineLength,
      rawTotal: rawTotal,
      scale: scale,
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
