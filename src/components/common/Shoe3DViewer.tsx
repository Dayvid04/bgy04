import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Layers, Sparkles } from 'lucide-react';

interface Shoe3DViewerProps {
  colorHex?: string;
  accentHex?: string;
  shoeName?: string;
}

export const Shoe3DViewer: React.FC<Shoe3DViewerProps> = ({
  colorHex = '#111111',
  accentHex = '#E50914',
  shoeName = 'BGY 3D View',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shoeGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth || 600;
    const height = currentMount.clientHeight || 400;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      currentMount.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL is not available in current environment:', err);
      setWebGlSupported(false);
      return;
    }

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 3.8);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff3333, 1.5);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 1.2, 10);
    fillLight.position.set(0, -2, 2);
    scene.add(fillLight);

    // Build 3D Sneaker Geometry Group
    const shoeGroup = new THREE.Group();
    shoeGroupRef.current = shoeGroup;

    materialsRef.current = [];

    // Sole Material
    const soleMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.1,
    });
    materialsRef.current.push(soleMat);

    // Sole Geometry (Curved ergonomic sneaker midsole)
    const soleGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.22, 32);
    soleGeo.scale(1.8, 1, 0.9);
    const soleMesh = new THREE.Mesh(soleGeo, soleMat);
    soleMesh.position.set(0, -0.2, 0);
    soleMesh.castShadow = true;
    soleMesh.receiveShadow = true;
    shoeGroup.add(soleMesh);

    // Upper Body Material
    const upperColor = new THREE.Color(colorHex);
    const upperMat = new THREE.MeshStandardMaterial({
      color: upperColor,
      roughness: 0.5,
      metalness: 0.2,
    });
    materialsRef.current.push(upperMat);

    // Upper Geometry (Sculpted foot shape)
    const upperGeo = new THREE.BoxGeometry(1.6, 0.45, 0.75, 16, 8, 8);
    // Taper front toe box
    const pos = upperGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      if (x > 0.3) {
        pos.setY(i, y * 0.75); // Lower toe
        pos.setZ(i, pos.getZ(i) * 0.75); // Taper front
      }
    }
    pos.needsUpdate = true;
    const upperMesh = new THREE.Mesh(upperGeo, upperMat);
    upperMesh.position.set(0.1, 0.12, 0);
    upperMesh.castShadow = true;
    shoeGroup.add(upperMesh);

    // Collar / Ankle Ring
    const collarGeo = new THREE.TorusGeometry(0.32, 0.12, 16, 32);
    collarGeo.rotateX(Math.PI / 2);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.6,
    });
    materialsRef.current.push(collarMat);
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.set(-0.35, 0.38, 0);
    collarMesh.scale.set(1.1, 1, 0.85);
    shoeGroup.add(collarMesh);

    // Tongue & Lacing Structure
    const tongueGeo = new THREE.BoxGeometry(0.65, 0.1, 0.35);
    tongueGeo.rotateZ(0.25);
    const tongueMesh = new THREE.Mesh(tongueGeo, collarMat);
    tongueMesh.position.set(0.1, 0.35, 0);
    shoeGroup.add(tongueMesh);

    // Signature BGY Crimson Accent Stripe
    const stripeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentHex),
      emissive: new THREE.Color(accentHex),
      emissiveIntensity: 0.25,
      roughness: 0.2,
      metalness: 0.8,
    });
    materialsRef.current.push(stripeMat);

    const stripeGeo = new THREE.BoxGeometry(0.85, 0.06, 0.8);
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.set(-0.05, 0.05, 0);
    shoeGroup.add(stripeMesh);

    // Heel Pull Tab (Red loop)
    const tabGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 16);
    tabGeo.rotateY(Math.PI / 2);
    const tabMesh = new THREE.Mesh(tabGeo, stripeMat);
    tabMesh.position.set(-0.85, 0.35, 0);
    shoeGroup.add(tabMesh);

    scene.add(shoeGroup);

    // Shadow Floor
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.32;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Interaction Controls (Drag to rotate)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !shoeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      shoeGroupRef.current.rotation.y += deltaX * 0.01;
      shoeGroupRef.current.rotation.x += deltaY * 0.005;
      shoeGroupRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, shoeGroupRef.current.rotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !shoeGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      shoeGroupRef.current.rotation.y += deltaX * 0.015;
      shoeGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    currentMount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    currentMount.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Resize observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(currentMount);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (shoeGroupRef.current && isRotating && !isDragging) {
        shoeGroupRef.current.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      currentMount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      currentMount.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      resizeObserver.disconnect();
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [colorHex, accentHex]);

  // Toggle wireframe
  useEffect(() => {
    materialsRef.current.forEach(mat => {
      mat.wireframe = wireframe;
    });
  }, [wireframe]);

  const resetAngle = () => {
    if (shoeGroupRef.current) {
      shoeGroupRef.current.rotation.set(0.1, -0.4, 0);
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] bg-neutral-950/80 border border-neutral-800/80 rounded-2xl overflow-hidden group">
      {/* 3D Canvas Mount */}
      {webGlSupported ? (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop"
            alt={shoeName}
            className="w-72 h-auto object-contain drop-shadow-2xl mb-4"
          />
          <div className="text-xs font-mono uppercase text-neutral-400">
            Interactive High-Definition Silhouette Render
          </div>
        </div>
      )}

      {/* Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
            Interactive 3D Stage
          </span>
        </div>
        <span className="text-sm font-display font-bold text-white tracking-tight">{shoeName}</span>
      </div>

      {/* Interactive Controls Bar */}
      {webGlSupported && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] uppercase font-mono tracking-[0.15em] text-neutral-400 hidden sm:inline-block">
            Drag to orbit 360°
          </span>

          <div className="flex items-center gap-2 pointer-events-auto ml-auto">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                isRotating
                  ? 'bg-[#E50914] text-white border-[#E50914]'
                  : 'bg-neutral-900/90 text-neutral-300 border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              Auto-Spin
            </button>

            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                wireframe
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900/90 text-neutral-300 border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {wireframe ? 'Shaded' : 'Wireframe'}
            </button>

            <button
              onClick={resetAngle}
              className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-neutral-900/90 text-neutral-300 border border-neutral-700 hover:border-neutral-500 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
