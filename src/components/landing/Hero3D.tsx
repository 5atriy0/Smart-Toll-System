'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Vehicle {
  group: THREE.Group;
  speed: number;
  lane: number;
}

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    try {

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#112240');
    scene.fog = new THREE.Fog('#112240', 12, 25);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 30);
    camera.position.set(4, 3.5, 6);
    camera.lookAt(0, 0, -2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.appendChild(renderer.domElement);

    // Lights — much brighter for visibility
    const ambient = new THREE.AmbientLight(0x8888cc, 0.8);
    scene.add(ambient);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(0, 10, 0);
    scene.add(fillLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const warmLight = new THREE.PointLight(0xc9950a, 0.8, 15);
    warmLight.position.set(0, 5, -5);
    scene.add(warmLight);

    const backLight = new THREE.DirectionalLight(0x99bbff, 0.4);
    backLight.position.set(-3, 5, -8);
    scene.add(backLight);

    // ───── Road ─────
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.95, metalness: 0.1 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(5, 50), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.5, 0);
    road.receiveShadow = true;
    scene.add(road);

    // Guardrails
    const guardMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    [-2.6, 2.6].forEach((x) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 50), guardMat);
      rail.position.set(x, -0.25, 0);
      scene.add(rail);

      // Reflector dots
      for (let z = -24; z <= 24; z += 2) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 6, 6),
          new THREE.MeshBasicMaterial({ color: x < 0 ? 0xff4444 : 0x44ff44, transparent: true, opacity: 0.7 })
        );
        dot.position.set(x + (x < 0 ? -0.04 : 0.04), -0.08, z);
        scene.add(dot);
      }
    });

    // Cones at the gate area
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.7 });
    for (let i = 0; i < 4; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), coneMat);
      cone.position.set(-2.2 + i * 1.47, -0.4, -7.5);
      cone.rotation.x = Math.PI;
      scene.add(cone);
      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), coneMat);
      cone2.position.set(-2.2 + i * 1.47, -0.4, 7.5);
      cone2.rotation.x = Math.PI;
      scene.add(cone2);
    }

    // Lane markings
    [-0.85, 0.85].forEach((x) => {
      const mark = new THREE.Mesh(
        new THREE.PlaneGeometry(0.03, 50),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
      );
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(x, -0.49, 0);
      scene.add(mark);
    });

    // Center dashes
    const dashGroup = new THREE.Group();
    for (let z = -30; z <= 30; z += 2.5) {
      const d = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 1.6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
      );
      d.rotation.x = -Math.PI / 2;
      d.position.set(0, -0.47, z);
      dashGroup.add(d);
    }
    scene.add(dashGroup);

    // ───── Toll Gate ─────
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, -8);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1c3557, roughness: 0.5, metalness: 0.3 });
    [-2.0, 2.0].forEach((x) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.8, 0.3), pillarMat);
      pillar.position.set(x, 0.6, 0);
      gateGroup.add(pillar);

      // Pillar base light
      const baseLightMat = new THREE.MeshBasicMaterial({ color: 0xc9950a, transparent: true, opacity: 0.3 });
      const baseLight = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.08), baseLightMat);
      baseLight.position.set(x, 0.05, 0.16);
      gateGroup.add(baseLight);
    });

    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc9950a, roughness: 0.3, metalness: 0.5 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.1, 0.6), roofMat);
    roof.position.set(0, 1.55, 0);
    gateGroup.add(roof);

    // "TOL" sign above gate
    const signMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), signMat);
    sign.position.set(0, 1.85, 0);
    gateGroup.add(sign);

    // Barrier arm
    const barMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e6, roughness: 0.4 });
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.12), barMat);
    barrier.position.set(-1.9, 0.7, 0);
    gateGroup.add(barrier);

    // Barrier stripes
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xc9950a });
    [-0.4, 0.4, 1.2].forEach((x) => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.015, 0.13), stripeMat);
      s.position.set(x, 0.7, 0);
      gateGroup.add(s);
    });

    scene.add(gateGroup);

    // ───── Road lamps ─────
    for (let z = -20; z <= 20; z += 8) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0x666666 }));
      pole.position.set(-2.8, 0.4, z);
      scene.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: 0x666666 }));
      arm.position.set(-2.55, 1.3, z);
      scene.add(arm);
      const lampGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.6 })
      );
      lampGlow.position.set(-2.3, 1.25, z);
      scene.add(lampGlow);
      // Point light from lamp
      const lampLight = new THREE.PointLight(0xffdd88, 0.15, 4);
      lampLight.position.set(-2.3, 1.2, z);
      scene.add(lampLight);
    }

    // ───── Vehicle Factory ─────
    const vehicles: Vehicle[] = [];

    function createCar(color: number | string, lane: number): THREE.Group {
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
      const glassMat = new THREE.MeshBasicMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.5 });
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

      // Body bottom
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 1.0), bodyMat);
      body.position.set(0, 0.1, 0);
      body.castShadow = true;
      group.add(body);

      // Body top / cabin
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.45), bodyMat);
      cabin.position.set(0, 0.22, -0.08);
      cabin.castShadow = true;
      group.add(cabin);

      // Windshield
      const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), glassMat);
      ws.position.set(0, 0.25, -0.3);
      group.add(ws);

      // Rear window
      const rw = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.08), glassMat);
      rw.position.set(0, 0.23, 0.28);
      rw.rotation.y = Math.PI;
      group.add(rw);

      // Headlights (emissive + glow)
      const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
      [-0.2, 0.2].forEach((x) => {
        const hl = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), headlightMat);
        hl.position.set(x, 0.08, -0.51);
        group.add(hl);
      });

      // Taillights
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
      [-0.2, 0.2].forEach((x) => {
        const tl = new THREE.Mesh(new THREE.CircleGeometry(0.03, 8), tailMat);
        tl.position.set(x, 0.08, 0.51);
        group.add(tl);
      });

      // Bumper
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.04), chromeMat);
      bumper.position.set(0, 0.04, -0.52);
      group.add(bumper);

      // Wheels
      [[-0.28, 0.02, 0.25], [0.28, 0.02, 0.25], [-0.28, 0.02, -0.25], [0.28, 0.02, -0.25]].forEach(([x, y, z]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, y, z);
        group.add(w);
      });

      group.position.set(lane, 0, 0);
      return group;
    }

    function createBus(lane: number): THREE.Group {
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdd8822, roughness: 0.6, metalness: 0.1 });
      const glassMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.4 });
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 1.4), bodyMat);
      body.position.set(0, 0.2, 0);
      body.castShadow = true;
      group.add(body);

      // Roof
      const roofBus = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 1.38), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
      roofBus.position.set(0, 0.37, 0);
      group.add(roofBus);

      // Windows
      for (let z = -0.5; z <= 0.5; z += 0.35) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.12), glassMat);
        win.position.set(0, 0.25, z);
        group.add(win);
      }

      // Stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.61, 0.02, 1.4), stripeMat);
      stripe.position.set(0, 0.1, 0);
      group.add(stripe);

      // Headlights
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
      [-0.25, 0.25].forEach((x) => {
        const hl = new THREE.Mesh(new THREE.CircleGeometry(0.05, 8), hlMat);
        hl.position.set(x, 0.15, -0.71);
        group.add(hl);
      });

      // Wheels
      [[-0.33, 0.02, 0.4], [0.33, 0.02, 0.4], [-0.33, 0.02, -0.4], [0.33, 0.02, -0.4]].forEach(([x, y, z]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, y, z);
        group.add(w);
      });

      group.position.set(lane, 0, 0);
      return group;
    }

    function createTruck(lane: number): THREE.Group {
      const group = new THREE.Group();
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x2255aa, roughness: 0.5, metalness: 0.2 });
      const trailerMat = new THREE.MeshStandardMaterial({ color: 0xcc4444, roughness: 0.7 });
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const glassMat = new THREE.MeshBasicMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.5 });

      // Cab
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.4), cabMat);
      cab.position.set(0, 0.16, -0.45);
      cab.castShadow = true;
      group.add(cab);

      // Windshield
      const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), glassMat);
      ws.position.set(0, 0.22, -0.66);
      group.add(ws);

      // Trailer
      const trailer = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.7), trailerMat);
      trailer.position.set(0, 0.2, 0.25);
      trailer.castShadow = true;
      group.add(trailer);

      // Headlights
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
      [-0.2, 0.2].forEach((x) => {
        const hl = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), hlMat);
        hl.position.set(x, 0.1, -0.66);
        group.add(hl);
      });

      // Wheels (more for truck)
      [[-0.28, 0.02, 0.5], [0.28, 0.02, 0.5], [-0.28, 0.02, -0.5], [0.28, 0.02, -0.5],
       [-0.28, 0.02, 0.0], [0.28, 0.02, 0.0]].forEach(([x, y, z]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, y, z);
        group.add(w);
      });

      group.position.set(lane, 0, 0);
      return group;
    }

    // Spawn vehicles — lane -0.45 (left / toward camera), lane 0.45 (right / away from camera)
    const leftLane = -0.45;
    const rightLane = 0.45;

    const car1 = createCar('#4a90d9', leftLane); car1.position.z = 5;  scene.add(car1); vehicles.push({ group: car1, speed: 1.8, lane: leftLane });
    const car2 = createCar('#e06040', rightLane); car2.position.z = -2; scene.add(car2); vehicles.push({ group: car2, speed: -2.0, lane: rightLane });
    const bus = createBus(leftLane); bus.position.z = -10; scene.add(bus); vehicles.push({ group: bus, speed: 1.2, lane: leftLane });
    const truck = createTruck(rightLane); truck.position.z = 8; scene.add(truck); vehicles.push({ group: truck, speed: -1.5, lane: rightLane });
    const car3 = createCar('#2ecc71', leftLane); car3.position.z = -18; scene.add(car3); vehicles.push({ group: car3, speed: 1.6, lane: leftLane });
    const car4 = createCar('#888888', rightLane); car4.position.z = 18; scene.add(car4); vehicles.push({ group: car4, speed: -1.7, lane: rightLane });

    // ───── Exhaust particles ─────
    const exhaustCount = 200;
    const exhPos = new Float32Array(exhaustCount * 3);
    const exhSizes = new Float32Array(exhaustCount);
    for (let i = 0; i < exhaustCount; i++) {
      exhPos[i * 3] = (Math.random() - 0.5) * 10;
      exhPos[i * 3 + 1] = Math.random() * 3;
      exhPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      exhSizes[i] = 0.02 + Math.random() * 0.04;
    }
    const exhGeo = new THREE.BufferGeometry();
    exhGeo.setAttribute('position', new THREE.BufferAttribute(exhPos, 3));
    exhGeo.setAttribute('size', new THREE.BufferAttribute(exhSizes, 1));
    const exhMat = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.03,
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    const exhaust = new THREE.Points(exhGeo, exhMat);
    scene.add(exhaust);

    // ───── Floating particles (gold) ─────
    const goldCount = 200;
    const goldPos = new Float32Array(goldCount * 3);
    const goldCol = new Float32Array(goldCount * 3);
    for (let i = 0; i < goldCount; i++) {
      goldPos[i * 3] = (Math.random() - 0.5) * 18;
      goldPos[i * 3 + 1] = Math.random() * 5;
      goldPos[i * 3 + 2] = (Math.random() - 0.5) * 35 - 5;
      const b = 0.3 + Math.random() * 0.7;
      goldCol[i * 3] = 0.79 * b;
      goldCol[i * 3 + 1] = 0.58 * b;
      goldCol[i * 3 + 2] = 0.04 * b;
    }
    const goldGeo = new THREE.BufferGeometry();
    goldGeo.setAttribute('position', new THREE.BufferAttribute(goldPos, 3));
    goldGeo.setAttribute('color', new THREE.BufferAttribute(goldCol, 3));
    const goldMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    const goldParticles = new THREE.Points(goldGeo, goldMat);
    scene.add(goldParticles);

    // ───── Animation ─────
    let animId: number;
    let prevTime = 0;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min((time - prevTime) / 1000, 0.05);
      prevTime = time;

      // Road dashes
      dashGroup.position.z += delta * 3;
      if (dashGroup.position.z > 2.5) dashGroup.position.z = 0;

      // Barrier animation (opens/closes every 4s)
      const cycle = time / 1000 % 4;
      const targetRot = cycle < 2 ? 0.45 : 0;
      barrier.rotation.z += (targetRot - barrier.rotation.z) * 0.05;

      // Vehicles
      vehicles.forEach((v) => {
        v.group.position.z += delta * v.speed;
        // Reset position
        if (v.speed > 0 && v.group.position.z > 30) v.group.position.z = -25;
        if (v.speed < 0 && v.group.position.z < -30) v.group.position.z = 25;
      });

      // Exhaust particles
      const exhPosAttr = exhaust.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < exhaustCount; i++) {
        exhPosAttr[i * 3 + 1] -= delta * 0.2;
        exhPosAttr[i * 3] += (Math.random() - 0.5) * delta * 0.5;
        exhPosAttr[i * 3 + 2] += (Math.random() - 0.5) * delta * 0.3;
        if (exhPosAttr[i * 3 + 1] < -0.5) {
          const v = vehicles[Math.floor(Math.random() * vehicles.length)];
          exhPosAttr[i * 3] = (Math.random() - 0.5) * 0.3 + v.group.position.x;
          exhPosAttr[i * 3 + 1] = 0.05;
          exhPosAttr[i * 3 + 2] = v.group.position.z + 0.5;
        }
      }
      exhaust.geometry.attributes.position.needsUpdate = true;

      // Gold particles falling
      const goldPosAttr = goldParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < goldCount; i++) {
        goldPosAttr[i * 3 + 1] -= delta * 0.25;
        if (goldPosAttr[i * 3 + 1] < 0) {
          goldPosAttr[i * 3 + 1] = 5;
          goldPosAttr[i * 3] = (Math.random() - 0.5) * 18;
          goldPosAttr[i * 3 + 2] = (Math.random() - 0.5) * 35 - 5;
        }
      }
      goldParticles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
    } catch (err) {
      console.error('[Hero3D] error:', err);
    }
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10" />;
}
