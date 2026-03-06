/**
 * MAZDA SOUL DRIFT - Car Model
 * Low-poly car built from BoxGeometry/CylinderGeometry (< 100 polys each)
 */

var CarBuilder = (function() {
  
  function createCarModel(carData) {
    var group = new THREE.Group();
    
    var bodyColor = carData.bodyColor;
    var bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
    var darkMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    var windowMat = new THREE.MeshPhongMaterial({
      color: 0x4488CC,
      transparent: true,
      opacity: 0.3
    });
    var headlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });
    var taillightMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    
    // Body main (approx 1.2 x 0.3 x 0.5)
    var bodyGeom = new THREE.BoxGeometry(0.5, 0.2, 1.2);
    var body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.25;
    group.add(body);
    
    // Roof / cabin (varies by car type)
    if (carData.roofStyle !== "open") {
      var roofH = 0.15;
      if (carData.roofStyle === "retractable") roofH = 0.12;
      if (carData.roofStyle === "round") roofH = 0.18;
      
      var roofGeom = new THREE.BoxGeometry(0.44, roofH, 0.5);
      var roof = new THREE.Mesh(roofGeom, bodyMat);
      roof.position.set(0, 0.25 + 0.1 + roofH/2, -0.05);
      group.add(roof);
      
      // Windshield
      var windGeom = new THREE.BoxGeometry(0.42, 0.13, 0.02);
      var windshield = new THREE.Mesh(windGeom, windowMat);
      windshield.position.set(0, 0.38, 0.22);
      group.add(windshield);
      
      // Rear window
      var rwindGeom = new THREE.BoxGeometry(0.42, 0.13, 0.02);
      var rwindshield = new THREE.Mesh(rwindGeom, windowMat);
      rwindshield.position.set(0, 0.38, -0.28);
      group.add(rwindshield);
    }
    
    // 787B rear wing
    if (carData.roofStyle === "racecar") {
      var wingGeom = new THREE.BoxGeometry(0.6, 0.02, 0.12);
      var wing = new THREE.Mesh(wingGeom, darkMat);
      wing.position.set(0, 0.5, -0.5);
      group.add(wing);
      
      // Wing supports
      var supportGeom = new THREE.BoxGeometry(0.03, 0.15, 0.03);
      var supp1 = new THREE.Mesh(supportGeom, darkMat);
      supp1.position.set(-0.2, 0.42, -0.5);
      group.add(supp1);
      var supp2 = new THREE.Mesh(supportGeom, darkMat);
      supp2.position.set(0.2, 0.42, -0.5);
      group.add(supp2);
    }
    
    // Cosmo Sport rounded front
    if (carData.roofStyle === "round") {
      var noseGeom = new THREE.SphereGeometry(0.2, 4, 4, 0, Math.PI * 2, 0, Math.PI / 2);
      var nose = new THREE.Mesh(noseGeom, bodyMat);
      nose.position.set(0, 0.25, 0.55);
      nose.rotation.x = -Math.PI / 2;
      group.add(nose);
    }
    
    // Tires (4x)
    var tireGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6);
    var tireMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    
    var tirePositions = [
      [-0.28, 0.12, 0.35],  // front-left
      [0.28, 0.12, 0.35],   // front-right
      [-0.28, 0.12, -0.40], // rear-left
      [0.28, 0.12, -0.40]   // rear-right
    ];
    
    for (var i = 0; i < tirePositions.length; i++) {
      var tire = new THREE.Mesh(tireGeom, tireMat);
      tire.position.set(tirePositions[i][0], tirePositions[i][1], tirePositions[i][2]);
      tire.rotation.z = Math.PI / 2;
      group.add(tire);
    }
    
    // Headlights
    var hlGeom = new THREE.BoxGeometry(0.08, 0.06, 0.02);
    var hl1 = new THREE.Mesh(hlGeom, headlightMat);
    hl1.position.set(-0.16, 0.28, 0.61);
    group.add(hl1);
    var hl2 = new THREE.Mesh(hlGeom, headlightMat);
    hl2.position.set(0.16, 0.28, 0.61);
    group.add(hl2);
    
    // Tail lights
    var tlGeom = new THREE.BoxGeometry(0.08, 0.06, 0.02);
    var tl1 = new THREE.Mesh(tlGeom, taillightMat);
    tl1.position.set(-0.16, 0.28, -0.61);
    group.add(tl1);
    var tl2 = new THREE.Mesh(tlGeom, taillightMat);
    tl2.position.set(0.16, 0.28, -0.61);
    group.add(tl2);
    
    // Shadow (circle on ground)
    var shadowGeom = new THREE.CircleGeometry(0.45, 8);
    var shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    var shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    group.add(shadow);
    
    // Slightly larger so the car is more readable on screen
    group.scale.set(1.05, 1.05, 1.05);
    
    return group;
  }
  
  return { createCarModel: createCarModel };
})();
