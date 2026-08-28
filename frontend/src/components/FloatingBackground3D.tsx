import React, { useEffect, useRef } from 'react';

interface FloatingBackground3DProps {
  interactive?: boolean;
}

export const FloatingBackground3D: React.FC<FloatingBackground3DProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particleCount = Math.min(55, Math.floor((width * height) / 22000));
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      hue: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 500 - 250,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.2,
        hue: Math.random() > 0.4 ? 155 : 190, // Emerald or Cyan
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const fov = 400;

      // Update and project particles
      const projected = particles.map((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        if (p.z < -250) p.z = 250;
        if (p.z > 250) p.z = -250;

        // Slight parallax shift based on mouse
        const parallaxX = (mouseX - width / 2) * (p.z / 1200);
        const parallaxY = (mouseY - height / 2) * (p.z / 1200);

        const scale = fov / (fov + p.z);
        const px = (p.x - width / 2 + parallaxX) * scale + width / 2;
        const py = (p.y - height / 2 + parallaxY) * scale + height / 2;
        const pRadius = Math.max(0.8, p.radius * scale);

        return { px, py, scale, pRadius, p };
      });

      // Draw connection lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.22 * Math.min(p1.p.alpha, p2.p.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes with soft glow
      for (const item of projected) {
        ctx.beginPath();
        ctx.arc(item.px, item.py, item.pRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${item.p.hue}, 85%, 60%, ${item.p.alpha * item.scale})`;
        ctx.shadowColor = item.p.hue === 155 ? '#10b981' : '#06b6d4';
        ctx.shadowBlur = 10 * item.scale;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ambient glass glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full orb-emerald filter blur-3xl opacity-50 animate-glow-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full orb-cyan filter blur-3xl opacity-40 animate-pulse-slow" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full orb-indigo filter blur-3xl opacity-30 animate-glow-pulse" />
      
      {/* 3D Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
      
      {/* Subtle geometric grid backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
