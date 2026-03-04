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
      
      if (seg.type === "straight") {
        var steps = Math.max(2, Math.floor(seg.length / 2));
        var stepLen = seg.length / steps;
        
        for (var s = 1; s <= steps; s++) {
          var t = s / steps;
          var elev = seg.elevationStart + (seg.elevationEnd - seg.elevationStart) * t;
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
        var arcSteps = Math.max(4, Math.floor(seg.angle / 5));
        var stepAngle = angleRad / arcSteps;
        
        // Calculate arc length
        var arcLength = seg.radius * angleRad;
        var stepLen = arcLength / arcSteps;
        
        for (var s = 1; s <= arcSteps; s++) {
          var t = s / arcSteps;
          var elev = seg.elevationStart + (seg.elevationEnd - seg.elevationStart) * t;
          
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
    return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.3);
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
      
      // Offset road slightly up to avoid z-fighting with ground
      leftPt.y += 0.02;
      rightPt.y += 0.02;
      
      positions.push(leftPt.x, leftPt.y, leftPt.z);
      positions.push(rightPt.x, rightPt.y, rightPt.z);
      
      // Road color: dark gray
      colors.push(0.2, 0.2, 0.2);
      colors.push(0.2, 0.2, 0.2);
      
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
      color: 0x333333,
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
      lInner.y += 0.03; lOuter.y += 0.03;
      
      leftPositions.push(lInner.x, lInner.y, lInner.z);
      leftPositions.push(lOuter.x, lOuter.y, lOuter.z);
      leftColors.push(r, g, b, r, g, b);
      
      // Right kerb
      var rInner = point.clone().add(right.clone().multiplyScalar(ROAD_HALF_WIDTH));
      var rOuter = point.clone().add(right.clone().multiplyScalar(ROAD_HALF_WIDTH + kerbWidth));
      rInner.y += 0.03; rOuter.y += 0.03;
      
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
    var railOffset = ROAD_HALF_WIDTH + 0.3;
    
    var postGeom = new THREE.BoxGeometry(0.05, 0.3, 0.05);
    var postMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    
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
      dummy.position.y += 0.15;
      dummy.updateMatrix();
      instanced.setMatrixAt(idx++, dummy.matrix);
      
      // Right guardrail
      dummy.position.copy(point.clone().add(right.clone().multiplyScalar(railOffset)));
      dummy.position.y += 0.15;
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
    var groundGeom = new THREE.PlaneGeometry(800, 800);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x1A3320 });
    var ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);
    
    // Sky
    scene.background = new THREE.Color(0x0A0A1A);
    
    // Mt. Fuji (simple cone NW of course)
    var fujiGeom = new THREE.ConeGeometry(40, 30, 8);
    var fujiMat = new THREE.MeshLambertMaterial({
      color: 0xC8D2E6,
      transparent: true,
      opacity: 0.15
    });
    var fuji = new THREE.Mesh(fujiGeom, fujiMat);
    fuji.position.set(-150, 10, -200);
    scene.add(fuji);
    
    // Snow cap
    var snowGeom = new THREE.ConeGeometry(15, 8, 8);
    var snowMat = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.2
    });
    var snow = new THREE.Mesh(snowGeom, snowMat);
    snow.position.set(-150, 22, -200);
    scene.add(snow);
    
    // Lighting
    var dirLight = new THREE.DirectionalLight(0xFFFFCC, 0.8);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);
    
    var ambLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambLight);
  }
  
  // Build the entire course and return useful data
  function build(scene) {
    var pathData = buildCoursePath(COURSE_SEGMENTS);
    var spline = createSpline(pathData.points);
    
    // Road
    var road = buildRoadMesh(spline, pathData.totalDistance);
    scene.add(road);
    
    // Kerbs
    var kerbs = buildKerbs(spline, pathData.totalDistance);
    scene.add(kerbs);
    
    // Guardrails
    var guardrails = buildGuardrails(spline, pathData.totalDistance);
    scene.add(guardrails);
    
    // Start/Finish line
    var sfLine = buildStartFinishLine(spline);
    scene.add(sfLine);
    
    // Environment
    buildEnvironment(scene, spline);
    
    // Build segment distance lookup
    // Map accumulated path distance to segment index
    var segLookup = buildSegmentLookup(pathData, spline);
    
    return {
      spline: spline,
      totalDistance: pathData.totalDistance,
      pathData: pathData,
      segLookup: segLookup
    };
  }
  
  // Build a lookup: for a given t (0-1 on spline), which segment are we in?
  function buildSegmentLookup(pathData, spline) {
    var segments = COURSE_SEGMENTS;
    var cumulDist = [];
    var d = 0;
    
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      cumulDist.push(d);
      if (seg.type === "straight") {
        d += seg.length;
      } else {
        var arcLength = seg.radius * (seg.angle * Math.PI / 180);
        d += arcLength;
      }
    }
    cumulDist.push(d); // end
    
    return {
      cumulDist: cumulDist,
      totalDist: d,
      getSegmentAt: function(distance) {
        var dist = ((distance % d) + d) % d; // wrap around
        for (var i = segments.length - 1; i >= 0; i--) {
          if (dist >= cumulDist[i]) {
            return {
              segment: segments[i],
              index: i,
              progressInSeg: (dist - cumulDist[i]) / (cumulDist[i+1] - cumulDist[i])
            };
          }
        }
        return { segment: segments[0], index: 0, progressInSeg: 0 };
      }
    };
  }
  
  return { build: build };
})();
