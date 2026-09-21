import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../types';
import {
  Activity,
  Zap,
  Radio,
  Crosshair,
  Shield,
  Cpu,
  Eye,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCw,
  Layers,
  Compass
} from 'lucide-react';

interface CyberHudCenterpieceProps {
  student?: StudentProfile;
  isAmbient?: boolean;
  onToggleAmbient?: () => void;
}

export const CyberHudCenterpiece: React.FC<CyberHudCenterpieceProps> = ({
  student,
  isAmbient = false,
  onToggleAmbient,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);

  // Parallax 3D tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    // Max tilt angles (+-12 deg)
    const rx = -dy * 12;
    const ry = dx * 14;

    setMousePos({ x: dx, y: dy, rx, ry });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0, rx: 0, ry: 0 });
  };

  // Live telemetry pulse ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick((p) => (p + 1) % 1000);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Compute live student stats or high-tech fallbacks
  const theta = student ? student.theta.toFixed(2) : '+0.42';
  const masteryAvg = student
    ? Math.round(
        (Object.values(student.conceptMastery).reduce((a, b) => a + b, 0) /
          Math.max(1, Object.values(student.conceptMastery).length)) *
          100
      )
    : 76;

  // Waveform data generation (simulated sine/oscillator telemetry)
  const wavePoints = Array.from({ length: 24 })
    .map((_, i) => {
      const angle = (i / 24) * Math.PI * 4 + pulseTick * 0.15;
      const y = 30 + Math.sin(angle) * 14 + Math.cos(angle * 0.5) * 6;
      return `${i * 9},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden transition-all duration-300 select-none ${
        isAmbient
          ? 'h-64 sm:h-80 opacity-40 hover:opacity-85 pointer-events-auto'
          : 'min-h-[460px] sm:min-h-[540px] p-4 sm:p-6'
      }`}
      style={{ perspective: '1200px' }}
    >
      {/* Dynamic 3D Transform Layer */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-150 ease-out preserve-3d"
        style={{
          transform: `rotateX(${mousePos.rx}deg) rotateY(${mousePos.ry}deg) translateZ(0px)`,
        }}
      >
        {/* Holographic Backing Grid & Glow */}
        <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />
        <div className="absolute w-[600px] h-[340px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-cyber-glow" />

        {/* Ambient Eye Wings (Horizontal Tech Frame matching Reference) */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full max-w-5xl mx-auto drop-shadow-[0_0_20px_rgba(0,245,255,0.35)]"
        >
          <defs>
            <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. HORIZONTAL EYE-CONTOUR LINES (The iconic outer shape from reference image) */}
          <g stroke="#00f5ff" strokeWidth="1.5" fill="none" opacity="0.75">
            {/* Upper Frame Arc */}
            <path
              d="M 50 250 Q 250 180 480 60 L 500 50 L 520 60 Q 750 180 950 250"
              strokeDasharray="6 3"
            />
            {/* Lower Frame Arc */}
            <path
              d="M 50 250 Q 250 320 480 440 L 500 450 L 520 440 Q 750 320 950 250"
              strokeDasharray="6 3"
            />
            {/* Center horizontal split lines */}
            <line x1="30" y1="250" x2="220" y2="250" strokeWidth="2" />
            <line x1="780" y1="250" x2="970" y2="250" strokeWidth="2" />
          </g>

          {/* 2. CENTRAL CONCENTRIC 3D ROTATING HUD RINGS */}
          <g transform="translate(500, 250)">
            
            {/* Radar Beam Sweep */}
            <circle
              r="170"
              fill="url(#cyanGlowGrad)"
              opacity="0.05"
            />
            <g className="animate-radar-sweep">
              <path
                d="M 0 0 L 160 -60 A 170 170 0 0 1 170 0 Z"
                fill="url(#radarSweepGrad)"
              />
              <line x1="0" y1="0" x2="170" y2="0" stroke="#00f5ff" strokeWidth="1.8" />
            </g>

            {/* Outer Segmented Ring (Rotating Clockwise) */}
            <g className="animate-hud-cw">
              <circle
                r="165"
                stroke="#00f5ff"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="14 8 28 8 60 12"
                opacity="0.85"
              />
              {/* Segmented Cyan Blocks */}
              <path
                d="M 120 -115 A 165 165 0 0 1 155 -55 L 140 -50 A 150 150 0 0 0 110 -105 Z"
                fill="#00f5ff"
                opacity="0.8"
              />
              <path
                d="M -155 55 A 165 165 0 0 1 -120 115 L -110 105 A 150 150 0 0 0 -140 50 Z"
                fill="#00f5ff"
                opacity="0.75"
              />
              <path
                d="M -155 -55 A 165 165 0 0 1 -115 -120 L -105 -110 A 150 150 0 0 0 -140 -50 Z"
                fill="#06b6d4"
                opacity="0.6"
              />
            </g>

            {/* Middle Counter-Rotating Ring (Rotating CCW) */}
            <g className="animate-hud-ccw">
              <circle
                r="130"
                stroke="#38bdf8"
                strokeWidth="1.8"
                fill="none"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <circle
                r="118"
                stroke="#00f5ff"
                strokeWidth="3"
                fill="none"
                strokeDasharray="45 15 90 20"
                opacity="0.9"
              />
              {/* Thick High-Tech Calibrated Arcs */}
              <path
                d="M 80 85 A 118 118 0 0 1 -40 110"
                stroke="#00f5ff"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>

            {/* Degree Ticks Ring */}
            <g opacity="0.75">
              {Array.from({ length: 36 }).map((_, idx) => {
                const rot = idx * 10;
                const isMajor = idx % 3 === 0;
                return (
                  <line
                    key={idx}
                    x1="94"
                    y1="0"
                    x2={isMajor ? "106" : "100"}
                    y2="0"
                    stroke={isMajor ? "#00f5ff" : "#0284c7"}
                    strokeWidth={isMajor ? "1.8" : "1"}
                    transform={`rotate(${rot})`}
                  />
                );
              })}
            </g>

            {/* Inner Core: Crosshairs & Target Reactor */}
            <g className="animate-hud-cw-fast">
              <circle
                r="68"
                stroke="#00f5ff"
                strokeWidth="2"
                fill="none"
                strokeDasharray="30 10 15 10"
                opacity="0.85"
              />
            </g>

            {/* Center Core Dot & Crosshairs */}
            <circle r="44" fill="#041b33" stroke="#00f5ff" strokeWidth="2" opacity="0.9" />
            <circle r="28" fill="#06b6d4" opacity="0.25" className="animate-pulse" />
            <circle r="12" fill="#00f5ff" filter="url(#glow)" />
            <circle r="5" fill="#ffffff" />

            {/* Crosshair Spikes */}
            <line x1="-50" y1="0" x2="-32" y2="0" stroke="#00f5ff" strokeWidth="2" />
            <line x1="32" y1="0" x2="50" y2="0" stroke="#00f5ff" strokeWidth="2" />
            <line x1="0" y1="-50" x2="0" y2="-32" stroke="#00f5ff" strokeWidth="2" />
            <line x1="0" y1="32" x2="0" y2="50" stroke="#00f5ff" strokeWidth="2" />

            {/* Telemetry Core Text */}
            <text
              x="0"
              y="58"
              textAnchor="middle"
              className="text-[9px] font-mono fill-cyan-300 font-bold tracking-widest"
              opacity="0.8"
            >
              AI_AXIOM_CORE // {masteryAvg}%
            </text>
          </g>

          {/* 3. TOP-LEFT HUD TELEMETRY (Oscilloscope & Grid Bars from Reference) */}
          <g transform="translate(60, 60)">
            {/* Packet bars */}
            <g opacity="0.85">
              <rect x="0" y="0" width="30" height="4" fill="#00f5ff" />
              <rect x="35" y="0" width="50" height="4" fill="#00f5ff" />
              <rect x="90" y="0" width="20" height="4" fill="#0284c7" />
              <rect x="115" y="0" width="60" height="4" fill="#00f5ff" />

              <rect x="0" y="8" width="70" height="4" fill="#0284c7" />
              <rect x="75" y="8" width="40" height="4" fill="#00f5ff" />
              <rect x="120" y="8" width="45" height="4" fill="#0284c7" />

              <rect x="0" y="16" width="45" height="4" fill="#00f5ff" />
              <rect x="50" y="16" width="80" height="4" fill="#00f5ff" />
              <rect x="135" y="16" width="30" height="4" fill="#38bdf8" />
            </g>

            {/* Mini Oscilloscope Box */}
            <g transform="translate(0, 40)" opacity="0.85">
              <rect
                x="0"
                y="0"
                width="190"
                height="65"
                fill="#020e1f"
                stroke="#00f5ff"
                strokeWidth="1.2"
                rx="6"
              />
              {/* Inner grid lines */}
              <line x1="0" y1="20" x2="190" y2="20" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="40" x2="190" y2="40" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
              <line x1="60" y1="0" x2="60" y2="65" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
              <line x1="120" y1="0" x2="120" y2="65" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />

              {/* Dynamic Waveform Polyline */}
              <polyline
                fill="none"
                stroke="#00f5ff"
                strokeWidth="2"
                points={wavePoints}
                filter="url(#glow)"
              />
              <text x="8" y="14" fill="#38bdf8" className="text-[8px] font-mono font-bold tracking-wider">
                BKT_COGNITIVE_FLUX // REALTIME
              </text>
            </g>

            {/* Angled Data Block */}
            <g transform="translate(205, 30)" opacity="0.85">
              <polygon
                points="0,0 70,0 85,25 15,25"
                fill="#00f5ff"
                opacity="0.3"
              />
              <polygon
                points="10,4 65,4 78,21 23,21"
                fill="#00f5ff"
                opacity="0.6"
              />
            </g>
          </g>

          {/* 4. TOP-RIGHT HUD TELEMETRY (Timer, Reticle & Battery Cells from Reference) */}
          <g transform="translate(730, 60)">
            {/* Mission Clock / Reticle Box */}
            <g opacity="0.9">
              <rect
                x="0"
                y="0"
                width="200"
                height="45"
                fill="#020e1f"
                stroke="#00f5ff"
                strokeWidth="1.2"
                rx="6"
              />
              <text x="14" y="20" fill="#00f5ff" className="text-[10px] font-mono font-black tracking-widest">
                SYS_TENSORA: 2026.09.21
              </text>
              <text x="14" y="34" fill="#38bdf8" className="text-[9px] font-mono font-bold">
                THETA_LATENT: {theta}
              </text>

              {/* Mini Target Crosshairs */}
              <g transform="translate(160, 22)">
                <circle r="14" stroke="#00f5ff" strokeWidth="1.5" fill="none" />
                <line x1="-18" y1="0" x2="18" y2="0" stroke="#00f5ff" strokeWidth="1" />
                <line x1="0" y1="-18" x2="0" y2="18" stroke="#00f5ff" strokeWidth="1" />
                <circle r="3" fill="#00f5ff" />
              </g>
            </g>

            {/* Battery / Energy Cells */}
            <g transform="translate(210, 0)" opacity="0.85">
              <rect x="0" y="0" width="16" height="45" fill="none" stroke="#00f5ff" strokeWidth="1.2" rx="2" />
              <rect x="3" y="32" width="10" height="9" fill="#00f5ff" />
              <rect x="3" y="20" width="10" height="9" fill="#00f5ff" />
              <rect x="3" y="8" width="10" height="9" fill="#00f5ff" />
            </g>

            {/* Complex Angled Aircraft / Subsystem Contour from Reference */}
            <g transform="translate(-10, 58)" opacity="0.85">
              <polygon
                points="0,10 60,10 80,0 170,0 200,20 180,45 130,45 110,65 20,65 0,40"
                fill="#021429"
                stroke="#00f5ff"
                strokeWidth="1.4"
              />
              <rect x="15" y="22" width="10" height="10" fill="#00f5ff" />
              <line x1="40" y1="26" x2="90" y2="26" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="40" y1="34" x2="80" y2="34" stroke="#38bdf8" strokeWidth="1.5" />
            </g>
          </g>

          {/* 5. BOTTOM-LEFT HUD TELEMETRY (Hex Target, Speed & Radar Mini) */}
          <g transform="translate(60, 310)">
            {/* Hexagon Target Node */}
            <g opacity="0.85">
              <polygon
                points="30,0 70,0 90,35 70,70 30,70 10,35"
                fill="#031a33"
                stroke="#00f5ff"
                strokeWidth="1.5"
              />
              <polygon
                points="37,12 63,12 76,35 63,58 37,58 24,35"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <circle r="5" cx="50" cy="35" fill="#00f5ff" />
              <text x="50" y="84" textAnchor="middle" fill="#38bdf8" className="text-[8px] font-mono">
                NODE_ACTIVE
              </text>
            </g>

            {/* Percentage Radar Mini-Reticle from Reference */}
            <g transform="translate(110, 20)" opacity="0.85">
              <polygon
                points="0,0 90,0 120,40 10,40"
                fill="#021024"
                stroke="#00f5ff"
                strokeWidth="1.2"
              />
              <circle cx="35" cy="20" r="14" stroke="#00f5ff" strokeWidth="2" strokeDasharray="30 10" fill="none" />
              <text x="58" y="25" fill="#00f5ff" className="text-[13px] font-mono font-black">
                {masteryAvg}.8%
              </text>
            </g>

            {/* Diagonal Speed / Packet Lines */}
            <g transform="translate(0, 105)" opacity="0.6">
              {Array.from({ length: 18 }).map((_, i) => (
                <line
                  key={i}
                  x1={i * 9}
                  y1="0"
                  x2={i * 9 + 8}
                  y2="14"
                  stroke="#00f5ff"
                  strokeWidth="2"
                />
              ))}
            </g>
          </g>

          {/* 6. BOTTOM-RIGHT HUD TELEMETRY (Chamfered Warning & Slider Data Buses) */}
          <g transform="translate(730, 310)">
            {/* Chamfered Box with Warning Triangle */}
            <g opacity="0.9">
              <polygon
                points="0,20 25,0 130,0 130,55 0,55"
                fill="#021326"
                stroke="#00f5ff"
                strokeWidth="1.4"
              />
              {/* Alert Triangle */}
              <polygon
                points="85,15 105,42 65,42"
                fill="none"
                stroke="#00f5ff"
                strokeWidth="1.8"
              />
              <circle cx="85" cy="35" r="2" fill="#00f5ff" />
              <line x1="85" y1="23" x2="85" y2="30" stroke="#00f5ff" strokeWidth="1.8" />
              <line x1="15" y1="20" x2="55" y2="20" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="15" y1="28" x2="45" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
            </g>

            {/* Slider Data Buses (Horizontal Nodes from Reference) */}
            <g transform="translate(0, 75)" opacity="0.85">
              <line x1="0" y1="5" x2="160" y2="5" stroke="#0284c7" strokeWidth="1.2" />
              <circle cx="30" cy="5" r="3.5" fill="#00f5ff" />
              <circle cx="110" cy="5" r="3.5" fill="#00f5ff" />

              <line x1="0" y1="20" x2="160" y2="20" stroke="#0284c7" strokeWidth="1.2" />
              <circle cx="80" cy="20" r="3.5" fill="#00f5ff" />
              <circle cx="140" cy="20" r="3.5" fill="#00f5ff" />

              <line x1="0" y1="35" x2="160" y2="35" stroke="#0284c7" strokeWidth="1.2" />
              <circle cx="50" cy="35" r="3.5" fill="#00f5ff" />
              <circle cx="95" cy="35" r="3.5" fill="#00f5ff" />
            </g>

            {/* Speed Arc Gauge */}
            <g transform="translate(135, 10)" opacity="0.85">
              <polygon
                points="0,15 25,0 90,0 90,55 20,55 0,35"
                fill="#021021"
                stroke="#00f5ff"
                strokeWidth="1.2"
              />
              <path d="M 35 45 A 25 25 0 0 1 70 20" stroke="#00f5ff" strokeWidth="3" fill="none" />
              <path d="M 42 45 A 18 18 0 0 1 68 28" stroke="#06b6d4" strokeWidth="2" fill="none" />
            </g>
          </g>
        </svg>

        {/* Floating Quick Action Tactical HUD Overlay (Visible in Expanded Mode) */}
        {!isAmbient && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
            {onToggleAmbient && (
              <button
                onClick={onToggleAmbient}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-lg transition-all cursor-pointer"
                title="Toggle Ambient Background Mode"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Ambient HUD</span>
              </button>
            )}
          </div>
        )}

        {/* Status Coordinate Ribbon at bottom */}
        {!isAmbient && (
          <div className="absolute bottom-2 left-6 right-6 hidden sm:flex items-center justify-between text-[10px] font-mono text-cyan-400/80 border-t border-cyan-900/60 pt-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>A.X.I.O.M. HUD ACTIVE // 3D PARALLAX GYRO: [{mousePos.rx.toFixed(1)}°, {mousePos.ry.toFixed(1)}°]</span>
            </span>
            <span className="text-cyan-300 font-bold">
              SYS.INTEGRITY: 100% • TENSORA EDU-01 • LATENCY: 12ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
