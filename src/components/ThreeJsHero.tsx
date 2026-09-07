import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSlideBeeHoneycombModel } from './createSlideBeeHoneycombModel';

export default function ThreeJsHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Three.js Full Hero Section Interactive 3D Honeycomb Structure & Golden Floating Particles
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 19);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Force canvas styling
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.objectFit = 'cover';
    container.appendChild(renderer.domElement);

    // Magnetic Repulsion Setup
    const raycaster = new THREE.Raycaster();
    const invisiblePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    scene.add(invisiblePlane);

    // Lighting setup - warm honey amber & gold atmospheric illumination
    const ambientLight = new THREE.AmbientLight(0xfff5dd, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(12, 16, 14);
    scene.add(dirLight);

    const goldPointLight = new THREE.PointLight(0xfcbf14, 4.5, 36);
    goldPointLight.position.set(2, 3, 10);
    scene.add(goldPointLight);

    const rimLight = new THREE.DirectionalLight(0xd99f06, 1.6);
    rimLight.position.set(-14, -8, -6);
    scene.add(rimLight);

    // Master Procedural Honeycomb Model (SlideBEE 3D Architecture)
    const honeycombModel = createSlideBeeHoneycombModel();
    scene.add(honeycombModel.rootGroup);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 2.1;
      const y = Math.sin(angle) * 2.1;
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15
    };
    const hexGeo = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    hexGeo.center();
    
    // Honey Gold Material
    const hexGoldMat = new THREE.MeshStandardMaterial({
      color: 0xfcbf14,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x936610,
      emissiveIntensity: 0.15
    });

    // Dark Charcoal Material
    const hexDarkMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.4,
      metalness: 0.6
    });

    // Ambient background peripheral floating hexagons
    const positions = [
      { x: -5.8, y: 3.2, z: -4.0, scale: 1.0, rot: -0.3 },
      { x: -7.5, y: -3.5, z: -3.2, scale: 1.1, rot: 0.2 }
    ];

    // Distribute 25 more hexagons deep down the page for the other sections
    for (let i = 0; i < 25; i++) {
      // Keep them strictly on the left/right peripheral edges to maintain a center safe zone for text readability
      const isLeft = Math.random() > 0.5;
      const xOffset = isLeft ? -(8 + Math.random() * 12) : (8 + Math.random() * 12);
      
      positions.push({
        x: xOffset,
        y: -(Math.random() * 85) - 6, // Spread from Y=-6 down to Y=-91
        z: -(Math.random() * 15) - 4, // Push deeper (-4 to -19)
        scale: 0.5 + Math.random() * 1.2,
        rot: Math.random() * Math.PI
      });
    }

    const hexPrisms: THREE.Group[] = [];

    positions.forEach((pos, idx) => {
      const group = new THREE.Group();
      group.position.set(pos.x, pos.y, pos.z);
      group.scale.setScalar(pos.scale);

      const isGold = (idx % 3 === 0); // Mix gold and dark hexagons
      const baseMesh = new THREE.Mesh(hexGeo, isGold ? hexGoldMat : hexDarkMat);
      baseMesh.rotation.z = Math.PI / 6;
      group.add(baseMesh);

      // Floating ambient motion parameters
      group.userData = {
        initialX: pos.x,
        initialY: pos.y,
        initialZ: pos.z,
        targetX: pos.x,
        targetY: pos.y,
        targetZ: pos.z,
        vx: 0,
        vy: 0,
        vz: 0,
        speed: 0.5 + (idx % 4) * 0.15,
        phase: idx * 0.9,
        rotSpeed: (idx % 2 === 0 ? 1 : -1) * 0.0018
      };

      rootGroup.add(group);
      hexPrisms.push(group);
    });

    // Ambient Golden Floating Particles throughout the page height space
    const particleCount = 250;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 40;     // X spread
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 80; // Y spread (taller to cover scrolling)
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 20; // Z spread
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      pGrad.addColorStop(0, 'rgba(252, 191, 20, 1)');
      pGrad.addColorStop(0.5, 'rgba(252, 191, 20, 0.45)');
      pGrad.addColorStop(1, 'rgba(252, 191, 20, 0)');
      pCtx.fillStyle = pGrad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const pTex = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.2, // Reduced size
      map: pTex,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Interactive mouse parallax across the entire hero viewport
    const mouseVector = new THREE.Vector2(-9999, -9999);
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let scrollY = window.scrollY;

    function onPointerMove(e: PointerEvent) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (rect.width || 1);
      const y = (e.clientY - rect.top) / (rect.height || 1);
      mouseX = (x - 0.5) * 2;
      mouseY = (y - 0.5) * 2;
      mouseVector.x = mouseX;
      mouseVector.y = -mouseY;
    }

    function onScroll() {
      scrollY = window.scrollY;
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    function onResize() {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      // Responsive Honeycomb Positioning & Scale
      if (w < 1024) {
        honeycombModel.rootGroup.position.set(0, -3.2, -1.5);
        honeycombModel.rootGroup.scale.setScalar(0.70);
      } else if (w < 1440) {
        honeycombModel.rootGroup.position.set(4.8, 0.25, 0.4);
        honeycombModel.rootGroup.scale.setScalar(0.95);
      } else {
        honeycombModel.rootGroup.position.set(5.3, 0.4, 0.8);
        honeycombModel.rootGroup.scale.setScalar(1.05);
      }
    }
    window.addEventListener('resize', onResize);
    onResize();

    const clock = new THREE.Clock();
    let reqId: number;

    function animate() {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Parallax rotation
      targetRotY = mouseX * 0.16;
      targetRotX = -mouseY * 0.12;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.045;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.045;

      // Parallax scroll for Hexagons (they move up as you scroll down)
      const scrollOffset = scrollY * 0.015;
      rootGroup.position.y = scrollOffset;

      // Honeycomb Model Parallax & Scroll
      const targetHCX = -mouseY * 0.14;
      const targetHCY = mouseX * 0.18;
      honeycombModel.rootGroup.rotation.x += (targetHCX - honeycombModel.rootGroup.rotation.x) * 0.05;
      honeycombModel.rootGroup.rotation.y += (targetHCY - honeycombModel.rootGroup.rotation.y) * 0.05;
      honeycombModel.rootGroup.position.y = (container.clientWidth < 1024 ? -3.2 : 0.25) + scrollOffset * 0.5;

      // Raycaster for Honeycomb Cell Hover
      raycaster.setFromCamera(mouseVector, camera);
      const hcIntersects = raycaster.intersectObjects(honeycombModel.rootGroup.children, true);
      let foundCellIdx: number | null = null;
      if (hcIntersects.length > 0) {
        for (const hit of hcIntersects) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== honeycombModel.rootGroup) {
            if (curr.userData && typeof curr.userData.cellIndex === 'number') {
              foundCellIdx = curr.userData.cellIndex;
              break;
            }
            curr = curr.parent;
          }
          if (foundCellIdx !== null) break;
        }
      }
      honeycombModel.setHoveredCell(foundCellIdx);
      honeycombModel.update(delta, elapsedTime);

      // Raycaster for magnetic repulsion on background hexagons
      const intersects = raycaster.intersectObject(invisiblePlane);
      let targetPoint: THREE.Vector3 | null = null;
      if (intersects.length > 0) {
        targetPoint = intersects[0].point;
      }

      // 3D Hexagon Bounce Physics (Collision Detection)
      for (let i = 0; i < hexPrisms.length; i++) {
        for (let j = i + 1; j < hexPrisms.length; j++) {
          const pA = hexPrisms[i];
          const pB = hexPrisms[j];
          const dist = pA.position.distanceTo(pB.position);
          const rA = pA.scale.x * 2.2;
          const rB = pB.scale.x * 2.2;
          const minDist = rA + rB;
          
          if (dist < minDist && dist > 0.01) {
            const overlap = minDist - dist;
            const dir = pA.position.clone().sub(pB.position).normalize();
            
            pA.userData.vx += dir.x * overlap * 0.08;
            pA.userData.vy += dir.y * overlap * 0.08;
            pA.userData.vz += dir.z * overlap * 0.08;
            
            pB.userData.vx -= dir.x * overlap * 0.08;
            pB.userData.vy -= dir.y * overlap * 0.08;
            pB.userData.vz -= dir.z * overlap * 0.08;
          }
        }
      }

      hexPrisms.forEach((prism) => {
        const { initialX, initialY, initialZ, speed, phase, rotSpeed } = prism.userData;
        
        let tx = initialX;
        let ty = initialY + Math.sin(elapsedTime * speed + phase) * 0.24;
        let tz = initialZ;
        
        if (targetPoint) {
          const worldPos = new THREE.Vector3(tx, ty + rootGroup.position.y, tz);
          const dist = worldPos.distanceTo(targetPoint);
          const repelRadius = 6.0;
          
          if (dist < repelRadius) {
            const force = Math.pow((repelRadius - dist) / repelRadius, 1.5) * 2.5;
            const dir = worldPos.clone().sub(targetPoint).normalize();
            
            tx += dir.x * force;
            ty += dir.y * force;
            tz -= force * 1.5;
            
            prism.rotation.z += rotSpeed * (force * 10);
            prism.rotation.x += rotSpeed * force * 5;
            prism.rotation.y += rotSpeed * force * 5;
          }
        }

        tx += prism.userData.vx;
        ty += prism.userData.vy;
        tz += prism.userData.vz;
        
        prism.userData.vx *= 0.85;
        prism.userData.vy *= 0.85;
        prism.userData.vz *= 0.85;
        
        prism.position.x += (tx - prism.position.x) * 0.08;
        prism.position.y += (ty - prism.position.y) * 0.08;
        prism.position.z += (tz - prism.position.z) * 0.08;
        
        prism.rotation.z += rotSpeed;
        prism.rotation.x += (0 - prism.rotation.x) * 0.05;
        prism.rotation.y += (0 - prism.rotation.y) * 0.05;
      });

      goldPointLight.position.x = Math.sin(elapsedTime * 0.7) * 5 + 2;
      goldPointLight.position.y = Math.cos(elapsedTime * 0.6) * 3 + 1;

      // Particles rotate slowly, and also scroll slightly
      particles.rotation.y = elapsedTime * 0.025;
      particles.rotation.x = elapsedTime * 0.012;
      particles.position.y = scrollOffset * 0.3;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      honeycombModel.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}
