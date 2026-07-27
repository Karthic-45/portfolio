"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  EDGES,
  NODES,
  getDomain,
  neighboursOf,
  type DomainId,
  type EdgeKind,
  type NodeKind,
} from "@/lib/system";
import styles from "./SystemScene.module.css";

/**
 * The system topology, rendered in 3D.
 *
 * Every mesh here corresponds to a real node in the shared graph — geometry is
 * chosen to read as the component it represents (a database is a cylinder, a
 * queue is a stack, a container is a box), never as decoration. Packets travel
 * edges at speeds that reflect what the edge carries.
 *
 * The camera docks at whichever domain is active; hovering a node dims
 * everything that is not one of its dependencies.
 */

/** Distinct silhouette per component type — the shape carries the meaning. */
function geometryFor(kind: NodeKind): THREE.BufferGeometry {
  switch (kind) {
    case "database":
      return new THREE.CylinderGeometry(0.72, 0.72, 1.15, 22);
    case "queue":
      return new THREE.BoxGeometry(1.9, 0.28, 0.9);
    case "container":
      return new THREE.BoxGeometry(1.15, 1.15, 1.15);
    case "storage":
      return new THREE.CylinderGeometry(0.85, 0.85, 0.42, 18);
    case "sensor":
      return new THREE.ConeGeometry(0.6, 1.0, 14);
    case "device":
    case "edge":
      return new THREE.BoxGeometry(1.25, 0.42, 1.25);
    case "gateway":
    case "loadbalancer":
      return new THREE.OctahedronGeometry(0.85, 0);
    case "auth":
      return new THREE.TetrahedronGeometry(0.95, 0);
    case "monitor":
      return new THREE.TorusGeometry(0.62, 0.14, 10, 26);
    case "actuator":
      return new THREE.TorusKnotGeometry(0.42, 0.16, 60, 8);
    case "client":
      return new THREE.SphereGeometry(0.55, 20, 16);
    default:
      return new THREE.BoxGeometry(1.0, 0.72, 1.0);
  }
}

/** Packet speed and size per edge semantic. */
const EDGE_TRAFFIC: Record<EdgeKind, { speed: number; size: number; count: number }> = {
  telemetry: { speed: 0.55, size: 4.2, count: 3 },
  request: { speed: 0.75, size: 4.8, count: 2 },
  persist: { speed: 0.45, size: 4.0, count: 1 },
  event: { speed: 0.62, size: 4.4, count: 2 },
  deploy: { speed: 0.22, size: 5.4, count: 1 },
  observe: { speed: 0.3, size: 3.2, count: 1 },
  control: { speed: 0.7, size: 4.4, count: 2 },
};

interface Packet {
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number;
  speed: number;
}

export interface SystemSceneProps {
  domain: DomainId;
  /** Node currently hovered/selected in the DOM explorer. */
  focusId: string | null;
}

export default function SystemScene({ domain, focusId }: SystemSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Latest props for the animation loop, without tearing down the scene on
  // every prop change. Synced in an effect — never written during render.
  const stateRef = useRef({ domain, focusId });

  useEffect(() => {
    stateRef.current = { domain, focusId };
  }, [domain, focusId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // No WebGL — the DOM explorer alone carries the content.
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070a, 0.021);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      260
    );
    const startCam = getDomain(domain).camera;
    camera.position.set(...startCam.position);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(6, 12, 10);
    scene.add(key);

    const disposables: { dispose: () => void }[] = [];

    // ------------------------------------------------------------- nodes
    const nodeMeshes = new Map<string, THREE.Mesh>();
    const nodeMaterials = new Map<string, THREE.MeshStandardMaterial>();

    NODES.forEach((node) => {
      const geo = geometryFor(node.kind);
      disposables.push(geo);

      const mat = new THREE.MeshStandardMaterial({
        color: 0x9fc4e8,
        emissive: 0x0a84ff,
        emissiveIntensity: 0.18,
        roughness: 0.45,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
      });
      disposables.push(mat);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.pos);
      mesh.userData.id = node.id;
      scene.add(mesh);

      nodeMeshes.set(node.id, mesh);
      nodeMaterials.set(node.id, mat);
    });

    // ------------------------------------------------------------- edges
    const edgePts: number[] = [];
    EDGES.forEach((e) => {
      const a = nodeMeshes.get(e.from);
      const b = nodeMeshes.get(e.to);
      if (!a || !b) return;
      edgePts.push(a.position.x, a.position.y, a.position.z);
      edgePts.push(b.position.x, b.position.y, b.position.z);
    });

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePts, 3));
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x2f6da8,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    disposables.push(edgeGeo, edgeMat);
    scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

    // ----------------------------------------------------------- packets
    const packets: Packet[] = [];
    EDGES.forEach((e) => {
      const a = nodeMeshes.get(e.from);
      const b = nodeMeshes.get(e.to);
      if (!a || !b) return;
      const traffic = EDGE_TRAFFIC[e.kind];
      for (let i = 0; i < traffic.count; i++) {
        packets.push({
          from: a.position.clone(),
          to: b.position.clone(),
          t: Math.random(),
          speed: traffic.speed * (0.85 + Math.random() * 0.3),
        });
      }
    });

    const packetGeo = new THREE.BufferGeometry();
    const packetPos = new Float32Array(packets.length * 3);
    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
    const packetMat = new THREE.PointsMaterial({
      color: 0x8ec9ff,
      size: 0.3,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    disposables.push(packetGeo, packetMat);
    scene.add(new THREE.Points(packetGeo, packetMat));

    // ------------------------------------------------------- interaction
    const pointer = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let visible = true;
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ---------------------------------------------------------------- loop
    const camPos = new THREE.Vector3(...startCam.position);
    const camTarget = new THREE.Vector3(...startCam.target);
    const desiredPos = camPos.clone();
    const desiredTarget = camTarget.clone();
    const packetAttr = packetGeo.getAttribute("position") as THREE.BufferAttribute;
    const scratch = new THREE.Vector3();

    let last = performance.now();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;

      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const { domain: activeDomain, focusId: focus } = stateRef.current;

      // Camera docks at the active domain rather than cutting between scenes.
      const dock = getDomain(activeDomain).camera;
      desiredPos.set(...dock.position);
      desiredTarget.set(...dock.target);
      camPos.lerp(desiredPos, 1 - Math.pow(0.0015, dt));
      camTarget.lerp(desiredTarget, 1 - Math.pow(0.0015, dt));

      camera.position.copy(camPos);
      camera.position.x += pointer.x * 1.6;
      camera.position.y += -pointer.y * 1.0;
      camera.lookAt(camTarget);

      // Focus dims everything that is not a dependency of the focused node.
      const related = focus ? neighboursOf(focus) : null;
      NODES.forEach((node) => {
        const mat = nodeMaterials.get(node.id);
        const mesh = nodeMeshes.get(node.id);
        if (!mat || !mesh) return;

        const isFocus = focus === node.id;
        const isRelated = related?.has(node.id) ?? false;
        const inDomain = node.domain === activeDomain;

        let targetEmissive = inDomain ? 0.34 : 0.1;
        let targetOpacity = inDomain ? 0.95 : 0.4;

        if (focus) {
          targetEmissive = isFocus ? 1.25 : isRelated ? 0.6 : 0.05;
          targetOpacity = isFocus ? 1 : isRelated ? 0.85 : 0.16;
        }

        mat.emissiveIntensity +=
          (targetEmissive - mat.emissiveIntensity) * Math.min(dt * 7, 1);
        mat.opacity += (targetOpacity - mat.opacity) * Math.min(dt * 7, 1);

        const targetScale = isFocus ? 1.45 : 1;
        mesh.scale.lerp(
          scratch.set(targetScale, targetScale, targetScale),
          Math.min(dt * 7, 1)
        );

        if (!reduced) mesh.rotation.y += dt * (node.kind === "monitor" ? 0.6 : 0.16);
      });

      // Traffic.
      if (!reduced) {
        for (let i = 0; i < packets.length; i++) {
          const p = packets[i];
          p.t += p.speed * dt * 0.35;
          if (p.t > 1) p.t -= 1;
          scratch.lerpVectors(p.from, p.to, p.t);
          packetPos[i * 3] = scratch.x;
          packetPos[i * 3 + 1] = scratch.y;
          packetPos[i * 3 + 2] = scratch.z;
        }
        packetAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [domain]);

  return <div ref={containerRef} className={styles.scene} aria-hidden="true" />;
}
