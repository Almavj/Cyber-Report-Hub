import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    // Floating nodes for network graph
    const nodeCount = 60;
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    // 3D wireframe sphere
    const spherePoints: { x: number; y: number; z: number }[] = [];
    const rings = 18;
    const pointsPerRing = 32;
    for (let i = 0; i <= rings; i++) {
      const phi = (Math.PI * i) / rings;
      for (let j = 0; j < pointsPerRing; j++) {
        const theta = (2 * Math.PI * j) / pointsPerRing;
        spherePoints.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.cos(phi),
          z: Math.sin(phi) * Math.sin(theta),
        });
      }
    }

    // Particles
    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * 2 - 1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.01,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    let rotX = 0;
    let rotY = 0;
    let t = 0;

    const project = (
      px: number,
      py: number,
      pz: number,
      cx: number,
      cy: number,
      r: number
    ) => {
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const y1 = py * cosX - pz * sinX;
      const z1 = py * sinX + pz * cosX;
      const x1 = px * cosY + z1 * sinY;
      const z2 = -px * sinY + z1 * cosY;

      const fov = 3.5;
      const scale = fov / (fov + z2 + 1.5);
      return {
        sx: cx + x1 * r * scale,
        sy: cy + y1 * r * scale,
        scale,
        z: z2,
      };
    };

    const draw = () => {
      t += 0.008;
      rotX += 0.003;
      rotY += 0.005;

      ctx.clearRect(0, 0, width, height);

      // Draw network nodes and connections
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      // Draw node dots
      for (const n of nodes) {
        ctx.fillStyle = "rgba(0, 255, 65, 0.4)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw wireframe sphere
      const cx = width * 0.75;
      const cy = height * 0.45;
      const r = Math.min(width, height) * 0.22;

      const projected = spherePoints.map((p) => project(p.x, p.y, p.z, cx, cy, r));

      // Sphere edges (ring connections)
      for (let i = 0; i <= rings; i++) {
        for (let j = 0; j < pointsPerRing; j++) {
          const idx = i * pointsPerRing + j;
          if (idx >= projected.length) continue;
          const next = i * pointsPerRing + ((j + 1) % pointsPerRing);
          if (next >= projected.length) continue;
          const p1 = projected[idx];
          const p2 = projected[next];
          const alpha = Math.max(0, (p1.z + p2.z) / 4 + 0.3) * 0.5;
          ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();

          // Meridian connections
          if (i < rings) {
            const downIdx = (i + 1) * pointsPerRing + j;
            if (downIdx < projected.length) {
              const p3 = projected[downIdx];
              const alpha2 = Math.max(0, (p1.z + p3.z) / 4 + 0.3) * 0.4;
              ctx.strokeStyle = `rgba(0, 200, 255, ${alpha2})`;
              ctx.lineWidth = 0.4;
              ctx.beginPath();
              ctx.moveTo(p1.sx, p1.sy);
              ctx.lineTo(p3.sx, p3.sy);
              ctx.stroke();
            }
          }
        }
      }

      // Sphere glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
      grad.addColorStop(0, "rgba(0, 255, 65, 0.04)");
      grad.addColorStop(0.6, "rgba(0, 255, 65, 0.02)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Floating particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        const halfW = width / 2;
        const halfH = height / 2;

        if (p.x < -halfW) p.x = halfW;
        if (p.x > halfW) p.x = -halfW;
        if (p.y < -halfH) p.y = halfH;
        if (p.y > halfH) p.y = -halfH;
        if (p.z < -1) p.z = 1;
        if (p.z > 1) p.z = -1;

        const sx = halfW + p.x;
        const sy = halfH + p.y;
        const scale = (p.z + 1.5) / 2.5;

        ctx.fillStyle = `rgba(0, 255, 65, ${p.opacity * scale * 0.6})`;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scanline effect
      for (let y = 0; y < height; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.03)";
        ctx.fillRect(0, y, width, 1);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
