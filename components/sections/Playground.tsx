"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { Avatar } from "@/components/motion/Avatar";
import { InteractiveType } from "@/components/motion/InteractiveType";
import { ImageTrail } from "@/components/motion/ImageTrail";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useMediaQuery } from "@/components/motion/useMotionCapabilities";

type Body = { x: number; y: number; vx: number; vy: number; homeX: number; homeY: number; size: number; angle: number; spin: number; shape: number; color: string };

export function Playground() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const force = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, active: false });
  const brush = useRef(0);
  const burst = useRef(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const paint = useCallback((progress: number) => { brush.current = progress; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = root.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !section || !ctx) return;
    let width = 0;
    let height = 0;
    let visible = false;
    let bodies: Body[] = [];
    let previousTime = 0;
    const colors = ["#d4ee75", "#eeeee7", "#b59aff", "#32392a"];
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bodies = Array.from({ length: width < 600 ? 11 : 17 }, (_, index) => {
        const homeX = width * (0.28 + (index % 5) * 0.135);
        const homeY = height * (0.24 + Math.floor(index / 5) * 0.18);
        return { x: homeX, y: homeY, vx: 0, vy: 0, homeX, homeY, size: 18 + index % 4 * 10, angle: index * 0.5, spin: 0, shape: index % 4, color: colors[index % colors.length] };
      });
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      bodies.forEach((body) => {
        ctx.save(); ctx.translate(body.x, body.y); ctx.rotate(body.angle);
        ctx.fillStyle = body.color; ctx.strokeStyle = body.color; ctx.lineWidth = 2;
        if (body.shape === 0) {
          ctx.beginPath(); ctx.arc(0, 0, body.size, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#10110f"; ctx.beginPath(); ctx.arc(0, 0, body.size * 0.48, 0, Math.PI * 2); ctx.stroke();
        } else if (body.shape === 1) {
          ctx.strokeRect(-body.size, -body.size, body.size * 2, body.size * 2);
          ctx.fillRect(-4, -4, 8, 8);
        } else if (body.shape === 2) {
          for (let spoke = 0; spoke < 8; spoke++) {
            ctx.rotate(Math.PI / 4); ctx.fillRect(-2, -body.size, 4, body.size * 2);
          }
        } else {
          ctx.beginPath(); ctx.moveTo(0, -body.size); ctx.lineTo(body.size, body.size);
          ctx.lineTo(-body.size, body.size); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      });
    };
    const tick = (time: number, deltaMs: number) => {
      if (!visible || document.hidden) return;
      if (reduced) {
        if (burst.current) {
          burst.current = false;
          bodies.forEach((body, index) => {
            body.x = width * (0.12 + ((index * 7) % 17) / 22);
            body.y = height * (0.15 + ((index * 5) % 13) / 18);
          });
          draw();
        }
        return;
      }
      const delta = Math.min(deltaMs / 16.67, 2);
      const scatter = burst.current;
      burst.current = false;
      const brushX = width * (0.25 + Math.sin(brush.current * Math.PI * 2) * 0.025);
      const brushY = height * (0.56 + Math.cos(brush.current * Math.PI * 2) * 0.08);
      bodies.forEach((body, index) => {
        if (scatter) {
          body.vx += Math.cos(index * 2.4) * 28;
          body.vy += Math.sin(index * 2.4) * 28;
          body.spin += 0.2;
        }
        if (force.current.active) {
          const dx = body.x - force.current.x;
          const dy = body.y - force.current.y;
          const distance = Math.max(8, Math.hypot(dx, dy));
          const influence = Math.max(0, 1 - distance / 170);
          body.vx += dx / distance * influence * 3 + force.current.vx * influence * 0.025;
          body.vy += dy / distance * influence * 3 + force.current.vy * influence * 0.025;
          body.spin += influence * force.current.vx * 0.0005;
        }
        // The brush's sweep pushes nearby shapes; cursor force can interrupt it.
        if (time - previousTime > 0.07) {
          const distance = Math.hypot(body.x - brushX, body.y - brushY);
          if (distance < 100) { body.vx += 0.65; body.vy -= 0.3; }
        }
        body.vx += (body.homeX - body.x) * 0.004 * delta;
        body.vy += (body.homeY - body.y) * 0.004 * delta;
        body.vx *= Math.pow(0.935, delta); body.vy *= Math.pow(0.935, delta);
        body.x += body.vx * delta; body.y += body.vy * delta;
        body.angle += body.spin * delta; body.spin *= Math.pow(0.94, delta);
        if (body.x < body.size || body.x > width - body.size) body.vx *= -0.75;
        if (body.y < body.size || body.y > height - body.size) body.vy *= -0.75;
        body.x = Math.max(body.size, Math.min(width - body.size, body.x));
        body.y = Math.max(body.size, Math.min(height - body.size, body.y));
      });
      previousTime = time;
      canvas.dataset.energy = bodies.reduce((sum, body) => sum + Math.hypot(body.vx, body.vy), 0).toFixed(2);
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      canvas.dataset.animating = String(visible && !reduced);
    });
    observer.observe(canvas);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); observer.disconnect(); resizeObserver.disconnect(); };
  }, [reduced]);

  return (
    <section ref={root} id="playground" className="playground-scene visual-scene" aria-labelledby="playground-heading">
      <div className="playground-intro page-gutter">
        <SectionLabel number="05">A little room to play</SectionLabel>
        <h2 id="playground-heading" className="playground-title" aria-label="Make it move.">
          <span aria-hidden="true"><InteractiveType text="MAKE IT" strength={34} /><br /><InteractiveType text="MOVE." strength={38} /></span>
        </h2>
        <p className="scene-note">Push the shapes. Disturb the type.<br />Let curiosity do its thing.</p>
      </div>
      <div className="playground-surface">
        <canvas
          ref={canvasRef}
          className="physics-canvas"
          aria-label="Interactive geometric shapes that respond to pointer movement."
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            force.current = { x, y, vx: force.current.active ? Math.max(-80, Math.min(80, x - force.current.x)) : 0, vy: force.current.active ? Math.max(-80, Math.min(80, y - force.current.y)) : 0, active: true };
          }}
          onPointerLeave={() => { force.current.active = false; }}
          onPointerDown={() => { burst.current = true; }}
        />
        <div className="painting-character"><Avatar pose="painting" onPaint={paint} /></div>
        <div className="playground-actions page-gutter">
          <button className="outline-button" type="button" data-cursor="link" onClick={() => { burst.current = true; }}>Stir things up <span aria-hidden="true">↗</span></button>
          <p className="eyebrow muted">No right answer. Just a response.</p>
        </div>
      </div>
      <ImageTrail />
    </section>
  );
}
