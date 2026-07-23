import { useEffect, useRef } from "react";

import { useTheme } from "@shared/lib/theme";

import type { BufferAttribute, BufferGeometry, Material } from "three";

import "./landing-motion.css";

export type LandingMotionScene = "hero" | "burst" | "globe" | "stream";

interface LandingMotionProps {
  scene: LandingMotionScene;
}

interface SceneRuntime {
  dispose: () => void;
  render: (elapsedSeconds: number) => void;
  resize: (width: number, height: number) => void;
}

interface MotionPalette {
  background: number;
  heroBackground: number;
  primary: number;
  secondary: number;
  accent: number;
  quiet: number;
}

const palettes: Record<"light" | "dark", MotionPalette> = {
  light: {
    background: 0x102c28,
    heroBackground: 0xeaf2ef,
    primary: 0x115e59,
    secondary: 0x4ca399,
    accent: 0xd3a84f,
    quiet: 0x9db9b3,
  },
  dark: {
    background: 0x091715,
    heroBackground: 0x10201d,
    primary: 0x67c7bc,
    secondary: 0x2f8279,
    accent: 0xf1c46b,
    quiet: 0x4a6862,
  },
};

async function loadThree() {
  return import("three");
}

type ThreeModule = Awaited<ReturnType<typeof loadThree>>;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createRenderer(THREE: ThreeModule, canvas: HTMLCanvasElement) {
  return new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: "high-performance" });
}

function createHeroRuntime(THREE: ThreeModule, canvas: HTMLCanvasElement, palette: MotionPalette): SceneRuntime {
  const renderer = createRenderer(THREE, canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPrimary: { value: new THREE.Color(palette.primary) },
      uSecondary: { value: new THREE.Color(palette.secondary) },
      uAccent: { value: new THREE.Color(palette.accent) },
      uBackground: { value: new THREE.Color(palette.heroBackground) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uAccent;
      uniform vec3 uBackground;

      float field(vec2 p, float phase) {
        float a = sin(p.x * 3.1 + phase);
        float b = cos(p.y * 4.3 - phase * 0.7);
        float c = sin((p.x + p.y) * 2.4 + phase * 0.45);
        return 0.5 + 0.5 * sin(a + b + c);
      }

      void main() {
        vec2 p = (vUv - 0.5) * vec2(1.7, 1.0);
        float drift = uTime * 0.18;
        float first = field(p + vec2(drift * 0.12, -drift * 0.08), drift);
        float second = field(p * 1.35 + vec2(-0.35, 0.21), -drift * 0.72);
        float edge = smoothstep(0.15, 0.92, first);
        vec3 color = mix(uBackground, uSecondary, edge * 0.78);
        color = mix(color, uPrimary, smoothstep(0.48, 0.94, second) * 0.82);
        float accentBand = smoothstep(0.72, 0.96, first * second);
        color = mix(color, uAccent, accentBand * 0.34);
        float vignette = smoothstep(0.9, 0.15, length(p * vec2(0.74, 1.0)));
        color = mix(uBackground, color, 0.58 + vignette * 0.42);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    render: (elapsed) => {
      material.uniforms.uTime!.value = elapsed;
      renderer.render(scene, camera);
    },
    resize: (width, height) => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(width, height, false);
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}

function createPerspectiveRuntime(
  THREE: ThreeModule,
  canvas: HTMLCanvasElement,
  palette: MotionPalette,
  sceneType: Exclude<LandingMotionScene, "hero">,
): SceneRuntime {
  const renderer = createRenderer(THREE, canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.background);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 8.4);
  const disposables: Array<BufferGeometry | Material> = [];
  let update: (elapsed: number) => void;

  if (sceneType === "burst") {
    const count = 220;
    const positions = new Float32Array(count * 6);
    const colors = new Float32Array(count * 6);
    const lengths = new Float32Array(count);
    const phases = new Float32Array(count);
    const random = seededRandom(1701);
    const base = new THREE.Color(palette.quiet);
    const active = new THREE.Color(palette.primary);
    const accent = new THREE.Color(palette.accent);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 6;
      const angle = Math.PI * (0.08 + random() * 0.84);
      lengths[index] = 2.4 + random() * 4.1;
      phases[index] = random() * Math.PI * 2;
      positions[offset] = 0;
      positions[offset + 1] = -3;
      positions[offset + 2] = 0;
      positions[offset + 3] = Math.cos(angle) * lengths[index]!;
      positions[offset + 4] = -3 + Math.sin(angle) * lengths[index]!;
      positions[offset + 5] = (random() - 0.5) * 1.2;
      const color = random() > 0.91 ? accent : random() > 0.55 ? active : base;
      for (let point = 0; point < 2; point += 1) {
        colors[offset + point * 3] = color.r;
        colors[offset + point * 3 + 1] = color.g;
        colors[offset + point * 3 + 2] = color.b;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.78 });
    const lines = new THREE.LineSegments(geometry, material);
    scene.add(lines);
    disposables.push(geometry, material);
    update = (elapsed) => {
      const attribute = geometry.getAttribute("position") as BufferAttribute;
      for (let index = 0; index < count; index += 1) {
        const offset = index * 6;
        const x = positions[offset + 3]!;
        const y = positions[offset + 4]! + 3;
        const pulse = 0.93 + Math.sin(elapsed * 0.62 + phases[index]!) * 0.07;
        attribute.array[offset + 3] = x * pulse;
        attribute.array[offset + 4] = -3 + y * pulse;
      }
      attribute.needsUpdate = true;
      lines.rotation.y = Math.sin(elapsed * 0.16) * 0.08;
    };
  } else if (sceneType === "globe") {
    const count = 2200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const random = seededRandom(3117);
    const primary = new THREE.Color(palette.primary);
    const quiet = new THREE.Color(palette.quiet);
    const accent = new THREE.Color(palette.accent);
    for (let index = 0; index < count; index += 1) {
      const phi = Math.acos(1 - 2 * (index + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      const radius = 2.75;
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      const color = random() > 0.965 ? accent : random() > 0.46 ? primary : quiet;
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
    const globe = new THREE.Points(geometry, material);
    globe.rotation.x = -0.18;
    scene.add(globe);
    disposables.push(geometry, material);
    update = (elapsed) => {
      globe.rotation.y = elapsed * 0.085;
      globe.rotation.x = -0.18 + Math.sin(elapsed * 0.13) * 0.035;
    };
  } else {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const random = seededRandom(9021);
    const primary = new THREE.Color(palette.primary);
    const quiet = new THREE.Color(palette.quiet);
    const accent = new THREE.Color(palette.accent);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (random() - 0.5) * 7.2;
      positions[index * 3 + 1] = (random() - 0.5) * 7.2;
      positions[index * 3 + 2] = (random() - 0.5) * 3.6;
      speeds[index] = 0.16 + random() * 0.34;
      const color = random() > 0.97 ? accent : random() > 0.58 ? primary : quiet;
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.046, vertexColors: true, transparent: true, opacity: 0.88, sizeAttenuation: true });
    const stream = new THREE.Points(geometry, material);
    stream.rotation.z = -0.08;
    scene.add(stream);
    disposables.push(geometry, material);
    update = () => {
      const attribute = geometry.getAttribute("position") as BufferAttribute;
      for (let index = 0; index < count; index += 1) {
        const offset = index * 3 + 1;
        attribute.array[offset] = (attribute.array[offset] as number) - speeds[index]! * 0.025;
        if (attribute.array[offset] < -3.7) attribute.array[offset] = 3.7;
      }
      attribute.needsUpdate = true;
    };
  }

  return {
    render: (elapsed) => {
      update(elapsed);
      renderer.render(scene, camera);
    },
    resize: (width, height) => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    },
    dispose: () => {
      disposables.forEach((resource) => resource.dispose());
      renderer.dispose();
    },
  };
}

function createRuntime(THREE: ThreeModule, canvas: HTMLCanvasElement, scene: LandingMotionScene, palette: MotionPalette) {
  return scene === "hero" ? createHeroRuntime(THREE, canvas, palette) : createPerspectiveRuntime(THREE, canvas, palette, scene);
}

export function LandingMotion({ scene }: LandingMotionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return undefined;
    if (typeof WebGLRenderingContext === "undefined") {
      canvas.dataset.webglStatus = "unavailable";
      return undefined;
    }

    let disposed = false;
    let cleanup = () => undefined;
    void loadThree().then((THREE) => {
      if (disposed) return;
      let runtime: SceneRuntime;
      try {
        runtime = createRuntime(THREE, canvas, scene, palettes[resolvedTheme]);
      } catch {
        canvas.dataset.webglStatus = "unavailable";
        return;
      }

      const container = canvas.parentElement;
      if (container === null) {
        runtime.dispose();
        return;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let isInView = false;
      let frame = 0;
      const startedAt = performance.now();
      const resize = () => runtime.resize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1));
      const draw = (now: number) => {
        runtime.render((now - startedAt) / 1000);
        if (isInView && !document.hidden && !reducedMotion) frame = window.requestAnimationFrame(draw);
      };
      const syncAnimation = () => {
        window.cancelAnimationFrame(frame);
        frame = 0;
        if (isInView && !document.hidden) frame = window.requestAnimationFrame(draw);
      };

      resize();
      runtime.render(0);
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        isInView = entry?.isIntersecting ?? false;
        syncAnimation();
      }, { rootMargin: "120px", threshold: 0.01 });
      intersectionObserver.observe(container);
      document.addEventListener("visibilitychange", syncAnimation);
      canvas.dataset.webglStatus = "ready";

      cleanup = () => {
        window.cancelAnimationFrame(frame);
        document.removeEventListener("visibilitychange", syncAnimation);
        intersectionObserver.disconnect();
        resizeObserver.disconnect();
        runtime.dispose();
      };
      if (disposed) cleanup();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [resolvedTheme, scene]);

  return <canvas ref={canvasRef} className="landing-motion" data-motion-scene={scene} aria-hidden="true" />;
}
