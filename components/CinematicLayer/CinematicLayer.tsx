"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./CinematicLayer.module.css";

const PARTICLE_COUNT = 140;

function createBokehTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function CinematicLayer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const drifts = new Float32Array(PARTICLE_COUNT);

    const accent = new THREE.Color("#0a84ff");
    const white = new THREE.Color("#ffffff");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 22;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 14;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      const depth = (z + 7) / 14;
      const isAccent = Math.random() > 0.78;
      const finalColor = isAccent
        ? accent.clone().lerp(white, Math.random() * 0.3)
        : white.clone().lerp(accent, Math.random() * 0.12);
      colors[i * 3] = finalColor.r;
      colors[i * 3 + 1] = finalColor.g;
      colors[i * 3 + 2] = finalColor.b;

      sizes[i] = (0.35 + Math.random() * 1.1) * (0.5 + depth * 0.9);
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.15 + Math.random() * 0.25;
      drifts[i] = 0.3 + Math.random() * 0.6;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const texture = createBokehTexture();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        pixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float pixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * pixelRatio * (140.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        varying vec3 vColor;
        void main() {
          vec4 texColor = texture2D(map, gl_PointCoord);
          gl_FragColor = vec4(vColor, 1.0) * texColor;
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const mouse = { x: 0, y: 0 };
    const targetCamera = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    window.addEventListener("resize", handleResize);

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);

    let rafId = 0;
    const startTime = performance.now();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = prefersReducedMotion
        ? 0
        : (performance.now() - startTime) / 1000;
      const positionAttr = geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        positionAttr.array[idx] =
          basePositions[idx] + Math.sin(elapsed * speeds[i] + phases[i]) * drifts[i];
        positionAttr.array[idx + 1] =
          basePositions[idx + 1] +
          Math.cos(elapsed * speeds[i] * 0.8 + phases[i]) * drifts[i] * 1.2;
      }
      positionAttr.needsUpdate = true;

      targetCamera.x += (mouse.x * 0.9 - targetCamera.x) * 0.04;
      targetCamera.y += (-mouse.y * 0.6 - targetCamera.y) * 0.04;
      camera.position.x = targetCamera.x;
      camera.position.y = targetCamera.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={styles.canvas} aria-hidden="true" />;
}
