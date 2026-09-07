"use client";

import { useEffect, useRef } from "react";

export default function DatabaseArchitectureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Database Architecture Graph Nodes
    const numNodes = 28;
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 3.5 + 2.5,
      label: i % 4 === 0 ? `table_${i}` : i % 3 === 0 ? `fk_col_${i}` : `idx_${i}`,
      isPrimary: i % 5 === 0,
    }));

    // Animated Data Packets flowing along edges
    const packets: { from: number; to: number; progress: number; speed: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const from = Math.floor(Math.random() * numNodes);
      let to = Math.floor(Math.random() * numNodes);
      while (to === from) to = Math.floor(Math.random() * numNodes);
      packets.push({ from, to, progress: Math.random(), speed: 0.003 + Math.random() * 0.005 });
    }

    function draw() {
      if (!ctx) return;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Schema Grid Pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Cursor Spotlight Beam
      const spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 380);
      spotGrad.addColorStop(0, "rgba(61, 209, 126, 0.1)");
      spotGrad.addColorStop(0.5, "rgba(240, 83, 61, 0.04)");
      spotGrad.addColorStop(1, "transparent");
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 380, 0, Math.PI * 2);
      ctx.fill();

      // 3. Update & Draw Node Positions
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // 4. Draw Connecting Relationship Lines
      for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.15;
            ctx.strokeStyle = nodes[i].isPrimary || nodes[j].isPrimary
              ? `rgba(61, 209, 126, ${alpha * 1.5})`
              : `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 5. Draw Data Stream Packets
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.from = Math.floor(Math.random() * numNodes);
          p.to = Math.floor(Math.random() * numNodes);
        }

        const n1 = nodes[p.from];
        const n2 = nodes[p.to];
        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;

        ctx.fillStyle = "#3dd17e";
        ctx.shadowColor = "#3dd17e";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 6. Draw Nodes & Labels
      nodes.forEach((n) => {
        ctx.fillStyle = n.isPrimary ? "#3dd17e" : "rgba(243, 244, 246, 0.6)";
        ctx.shadowColor = n.isPrimary ? "#3dd17e" : "transparent";
        ctx.shadowBlur = n.isPrimary ? 10 : 0;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Subtle text label
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.fillText(n.label, n.x + 8, n.y + 3);
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
