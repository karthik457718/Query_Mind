"use client";

import { useEffect, useRef } from "react";

export default function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, isHovered: false };
    const ripples: { x: number; y: number; radius: number; maxRadius: number; opacity: number }[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 160,
        opacity: 0.6,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    // Muted luxury 3D Blob & Geometry Objects
    const blobs = [
      { x: width * 0.2, y: height * 0.3, radius: 240, vx: 0.3, vy: 0.2, color: "rgba(61, 209, 126, 0.25)" }, // Emerald Green
      { x: width * 0.75, y: height * 0.25, radius: 270, vx: -0.2, vy: 0.3, color: "rgba(240, 83, 61, 0.22)" }, // Coral Red
      { x: width * 0.8, y: height * 0.7, radius: 210, vx: 0.3, vy: -0.2, color: "rgba(61, 209, 126, 0.2)" },
      { x: width * 0.25, y: height * 0.75, radius: 230, vx: -0.3, vy: -0.2, color: "rgba(148, 163, 184, 0.18)" }, // Soft Slate
    ];

    // Floating 3D geometric elements
    const shapes = Array.from({ length: 14 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 20 + Math.random() * 30,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.015,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      type: i % 3 === 0 ? "ring" : i % 3 === 1 ? "pill" : "star",
      color: i % 2 === 0 ? "rgba(61, 209, 126, 0.35)" : "rgba(240, 83, 61, 0.3)",
    }));

    function draw() {
      if (!ctx) return;
      // Mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Draw Cursor Hover Spotlight Glow
      if (mouse.isHovered) {
        const hoverGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 350);
        hoverGrad.addColorStop(0, "rgba(61, 209, 126, 0.18)");
        hoverGrad.addColorStop(0.5, "rgba(240, 83, 61, 0.08)");
        hoverGrad.addColorStop(1, "transparent");

        ctx.fillStyle = hoverGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 350, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Click Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3;
        r.opacity -= 0.012;

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(61, 209, 126, ${r.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw soft fluid morphing blobs
      blobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x - b.radius < 0 || b.x + b.radius > width) b.vx *= -1;
        if (b.y - b.radius < 0 || b.y + b.radius > height) b.vy *= -1;

        // Interactive mouse magnetic pull
        const dx = mouse.x - b.x;
        const dy = mouse.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 450) {
          b.x += (dx / dist) * 0.6;
          b.y += (dy / dist) * 0.6;
        }

        const grad = ctx.createRadialGradient(b.x, b.y, 10, b.x, b.y, b.radius);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw floating 3D geometric elements with mouse push
      shapes.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.vRot;

        // Push shapes away slightly on cursor hover
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          s.x += (dx / dist) * 2;
          s.y += (dy / dist) * 2;
        }

        if (s.x < -60) s.x = width + 60;
        if (s.x > width + 60) s.x = -60;
        if (s.y < -60) s.y = height + 60;
        if (s.y > height + 60) s.y = -60;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.strokeStyle = s.color;
        ctx.fillStyle = s.color;
        ctx.lineWidth = 2.5;

        if (s.type === "ring") {
          ctx.beginPath();
          ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (s.type === "pill") {
          ctx.beginPath();
          ctx.roundRect(-s.size / 2, -s.size / 4, s.size, s.size / 2, s.size / 4);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(-s.size / 3, 0);
          ctx.lineTo(s.size / 3, 0);
          ctx.moveTo(0, -s.size / 3);
          ctx.lineTo(0, s.size / 3);
          ctx.stroke();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
