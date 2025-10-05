"use client";
import React, { useEffect, useRef } from "react";

/**
 * LoadingSpinner
 * A reusable animated loader styled like an atom with orbiting electrons.
 * Suitable for inline usage (e.g., inside buttons or cards).
 */
const LoadingSpinner = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let animationFrameId: number;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Config ---
    const NUCLEUS_RADIUS = 20;
    const ELECTRON_RADIUS = 5;
    const NUCLEUS_COLOR = "#60a5fa"; // Blue-400
    const ELECTRON_COLOR = "#facc15"; // Yellow-400
    const ORBIT_COLOR = "rgba(250, 204, 21, 0.3)";

    let centerX = 0,
      centerY = 0;

    const electrons = [
      {
        angle: 0,
        speed: 0.015,
        orbitRadiusX: 100,
        orbitRadiusY: 40,
        rotation: Math.PI / 6,
        rotationSpeed: 0.01,
      },
      {
        angle: Math.PI,
        speed: 0.01,
        orbitRadiusX: 30,
        orbitRadiusY: 120,
        rotation: 0,
        rotationSpeed: -0.008,
      },
      {
        angle: Math.PI / 2,
        speed: 0.02,
        orbitRadiusX: 80,
        orbitRadiusY: 70,
        rotation: Math.PI / 3,
        rotationSpeed: 0.005,
      },
    ];

    function resizeCanvas() {
      if (!canvas) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      const size = Math.min(window.innerWidth, window.innerHeight) * 0.5;
      canvas.width = size;
      canvas.height = size;

      centerX = canvas.width / 2;
      centerY = canvas.height / 2;

      animate();
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      electrons.forEach((electron) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(electron.rotation);

        // Orbit path
        ctx.beginPath();
        ctx.strokeStyle = ORBIT_COLOR;
        ctx.lineWidth = 1;
        ctx.ellipse(
          0,
          0,
          electron.orbitRadiusX,
          electron.orbitRadiusY,
          0,
          0,
          2 * Math.PI
        );
        ctx.stroke();

        // Electron
        const electronX = electron.orbitRadiusX * Math.cos(electron.angle);
        const electronY = electron.orbitRadiusY * Math.sin(electron.angle);

        ctx.beginPath();
        ctx.fillStyle = ELECTRON_COLOR;
        ctx.arc(electronX, electronY, ELECTRON_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
      });

      // Nucleus
      ctx.beginPath();
      ctx.fillStyle = NUCLEUS_COLOR;
      ctx.arc(centerX, centerY, NUCLEUS_RADIUS, 0, 2 * Math.PI);
      ctx.shadowColor = NUCLEUS_COLOR;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function animate() {
      electrons.forEach((electron) => {
        electron.angle += electron.speed;
        electron.rotation += electron.rotationSpeed;
      });

      draw();
      animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="block" />;
};

/**
 * FullPageLoader
 * Displays the LoadingSpinner centered on the screen.
 * Best for page-level or full-screen loading states.
 */
const FullPageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700">
      <LoadingSpinner />
    </div>
  );
};

export { LoadingSpinner, FullPageLoader };



// Bigger ATOM size

{
  /*
'use client';
import React, { useEffect, useRef } from 'react';


const LoadingSpinner = ({ scale = 2 }: { scale?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let animationFrameId: number;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Config (scaled by `scale`) ---
    const NUCLEUS_RADIUS = 20 * scale;
    const ELECTRON_RADIUS = 5 * scale;
    const ORBIT_LINE_WIDTH = 2 * scale;

    const NUCLEUS_COLOR = '#60a5fa'; // Blue-400
    const ELECTRON_COLOR = '#facc15'; // Yellow-400
    const ORBIT_COLOR = 'rgba(250, 204, 21, 0.4)';

    let centerX = 0,
      centerY = 0;

    const electrons = [
      { angle: 0, speed: 0.015, orbitRadiusX: 100 * scale, orbitRadiusY: 40 * scale, rotation: Math.PI / 6, rotationSpeed: 0.01 },
      { angle: Math.PI, speed: 0.01, orbitRadiusX: 30 * scale, orbitRadiusY: 120 * scale, rotation: 0, rotationSpeed: -0.008 },
      { angle: Math.PI / 2, speed: 0.02, orbitRadiusX: 80 * scale, orbitRadiusY: 70 * scale, rotation: Math.PI / 3, rotationSpeed: 0.005 }
    ];

    function resizeCanvas() {
      if (!canvas) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      // canvas size scaled up
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
      canvas.width = size;
      canvas.height = size;

      centerX = canvas.width / 2;
      centerY = canvas.height / 2;

      animate();
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      electrons.forEach((electron) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(electron.rotation);

        // Orbit path
        ctx.beginPath();
        ctx.strokeStyle = ORBIT_COLOR;
        ctx.lineWidth = ORBIT_LINE_WIDTH;
        ctx.ellipse(0, 0, electron.orbitRadiusX, electron.orbitRadiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Electron
        const electronX = electron.orbitRadiusX * Math.cos(electron.angle);
        const electronY = electron.orbitRadiusY * Math.sin(electron.angle);

        ctx.beginPath();
        ctx.fillStyle = ELECTRON_COLOR;
        ctx.arc(electronX, electronY, ELECTRON_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
      });

      ctx.beginPath();
      ctx.fillStyle = NUCLEUS_COLOR;
      ctx.arc(centerX, centerY, NUCLEUS_RADIUS, 0, 2 * Math.PI);
      ctx.shadowColor = NUCLEUS_COLOR;
      ctx.shadowBlur = 20 * scale;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function animate() {
      electrons.forEach((electron) => {
        electron.angle += electron.speed;
        electron.rotation += electron.rotationSpeed;
      });

      draw();
      animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [scale]);

  return <canvas ref={canvasRef} className="block" />;
};


const FullPageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <LoadingSpinner scale={2.5} /> 
    </div>
  );
};

export { LoadingSpinner, FullPageLoader };


*/
}
