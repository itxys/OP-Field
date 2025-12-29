
import React, { useEffect, useState } from 'react';
import { AppMode, SynthParams, TapeTrack } from '../types';

interface DisplayProps {
  mode: AppMode;
  params: SynthParams;
  tapeSpeed: number;
  isPlaying: boolean;
  isRecording: boolean;
  activeTrackIndex: number;
  tracks: TapeTrack[];
}

const Display: React.FC<DisplayProps> = ({
  mode,
  params,
  tapeSpeed,
  isPlaying,
  isRecording,
  activeTrackIndex,
  tracks
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const update = () => {
      if (isPlaying || isRecording) {
        setRotation(prev => (prev + (tapeSpeed * 5)) % 360);
      }
      animationFrame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, isRecording, tapeSpeed]);

  const renderVisualizer = () => {
    switch (mode) {
      case AppMode.SYNTH:
        return (
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="synthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4fbefd" stopOpacity="0" />
                <stop offset="50%" stopColor="#4fbefd" stopOpacity="1" />
                <stop offset="100%" stopColor="#4fbefd" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g stroke="#ffffff" fill="none" strokeWidth="0.5" opacity="0.1">
              <line x1="0" y1="100" x2="400" y2="100" />
              <line x1="200" y1="0" x2="200" y2="200" />
              {Array.from({ length: 12 }).map((_, i) => (
                <rect key={i} x={40 + i * 30} y="95" width="2" height="10" fill="white" opacity="0.1" />
              ))}
            </g>
            <path
              d={`M 50 100 Q 125 ${100 - params.blue} 200 100 T 350 100`}
              fill="none"
              stroke="url(#synthGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <circle
              cx={200 + (params.green - 50) * 2.5}
              cy={100 + (params.red - 50) * 1.5}
              r={Math.max(10, params.white / 2)}
              stroke="#24d982"
              strokeWidth="2"
              fill="#24d982"
              fillOpacity="0.15"
              style={{ filter: 'blur(1px)' }}
            />
            <text x="20" y="30" className="fill-[#ffffff] text-[10px] font-mono font-black tracking-[0.2em] opacity-80">SYNTH ENGINE // {params.white}%</text>
            <g transform="translate(320, 165)">
              <text x="0" y="0" className="fill-[#4fbefd] text-[8px] font-mono font-bold">MODE: OP-FIELD</text>
              <rect x="-5" y="5" width="60" height="2" fill="#4fbefd" opacity="0.4" />
            </g>
          </svg>
        );
      case AppMode.TAPE:
        return (
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
              </pattern>
            </defs>

            {/* Background Texture */}
            <rect width="400" height="200" fill="#0c0c0c" />
            <g style={{ animation: (isPlaying || isRecording) ? `gridMove ${2 / tapeSpeed}s infinite linear` : 'none' }}>
              <rect width="440" height="200" x="-20" fill="url(#grid)" />
            </g>

            {/* Reels */}
            <g transform={`rotate(${rotation}, 70, 100)`}>
              <circle cx="70" cy="100" r="55" stroke="#222" fill="#111" strokeWidth="2" />
              <circle cx="70" cy="100" r="48" stroke="#333" fill="none" strokeWidth="1" />
              <circle cx="70" cy="100" r="40" stroke="#444" fill="none" strokeWidth="0.5" strokeDasharray="10 5" />
              {[0, 60, 120, 180, 240, 300].map(angle => (
                <line
                  key={angle}
                  x1={70 + Math.cos(angle * Math.PI / 180) * 12}
                  y1={100 + Math.sin(angle * Math.PI / 180) * 12}
                  x2={70 + Math.cos(angle * Math.PI / 180) * 45}
                  y2={100 + Math.sin(angle * Math.PI / 180) * 45}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="70" cy="100" r="12" fill="#ff6d00" />
              <circle cx="70" cy="100" r="4" fill="#000" />
            </g>

            <g transform={`rotate(${rotation}, 330, 100)`}>
              <circle cx="330" cy="100" r="55" stroke="#222" fill="#111" strokeWidth="2" />
              <circle cx="330" cy="100" r="48" stroke="#333" fill="none" strokeWidth="1" />
              <circle cx="330" cy="100" r="40" stroke="#444" fill="none" strokeWidth="0.5" strokeDasharray="10 5" />
              {[30, 90, 150, 210, 270, 330].map(angle => (
                <line
                  key={angle}
                  x1={330 + Math.cos(angle * Math.PI / 180) * 12}
                  y1={100 + Math.sin(angle * Math.PI / 180) * 12}
                  x2={330 + Math.cos(angle * Math.PI / 180) * 45}
                  y2={100 + Math.sin(angle * Math.PI / 180) * 45}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="330" cy="100" r="12" fill="#ff6d00" />
              <circle cx="330" cy="100" r="4" fill="#000" />
            </g>

            {/* 4 Tracks Visualization */}
            <g transform="translate(100, 44)">
              {tracks.map((track, i) => (
                <g key={i} transform={`translate(0, ${i * 30})`}>
                  <rect
                    width="200"
                    height="24"
                    fill={activeTrackIndex === i ? '#1a1a1a' : '#080808'}
                    stroke={activeTrackIndex === i ? (isRecording ? '#ff3333' : '#4fbefd') : '#222'}
                    strokeWidth={activeTrackIndex === i ? 2 : 1}
                    rx="3"
                  />

                  {/* Active Indicator Pulse */}
                  {activeTrackIndex === i && (
                    <circle
                      cx="-12"
                      cy="12"
                      r="4"
                      fill={isRecording ? '#ff3333' : '#4fbefd'}
                      className={isPlaying || isRecording ? 'animate-pulse' : ''}
                      filter={isRecording ? 'url(#glow)' : ''}
                    />
                  )}

                  {/* Track Label */}
                  <text x="6" y="15" className="fill-zinc-700 text-[7px] font-mono font-black italic opacity-50">T{i + 1}</text>

                  {/* Waveform Visualization */}
                  {track.buffer ? (
                    <g opacity={activeTrackIndex === i ? 1 : 0.3}>
                      <path
                        d={`M 30 12 Q 50 ${12 + (i % 2 === 0 ? 8 : -8)} 80 12 T 130 12 T 180 12`}
                        stroke={i % 2 === 0 ? "#4fbefd" : "#24d982"}
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{
                          transformOrigin: 'center',
                          animation: isPlaying ? 'waveformMove 1s infinite linear' : 'none'
                        }}
                      />
                    </g>
                  ) : activeTrackIndex === i && isRecording ? (
                    <line
                      x1="30" y1="12" x2="190" y2="12"
                      stroke="#ff3333"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      className="animate-pulse"
                    />
                  ) : (
                    <line x1="30" y1="12" x2="190" y2="12" stroke="#111" strokeWidth="1" />
                  )}
                </g>
              ))}
            </g>

            {/* Playhead Center Line */}
            <g transform="translate(200, 30)">
              <line x1="0" y1="0" x2="0" y2="140" stroke={isRecording ? "#ff3333" : "#ff6d00"} strokeWidth="2" filter="url(#glow)" />
              <circle cx="0" y="0" r="3" fill={isRecording ? "#ff3333" : "#ff6d00"} />
              <circle cx="0" y="140" r="3" fill={isRecording ? "#ff3333" : "#ff6d00"} />
            </g>

            {/* Status Overlays */}
            <g transform="translate(15, 25)">
              <rect width="80" height="15" rx="2" fill="#1a1a1a" opacity="0.8" />
              <text x="5" y="11" className={`font-mono text-[9px] font-black tracking-widest ${isRecording ? 'fill-red-500' : isPlaying ? 'fill-green-400' : 'fill-zinc-500'}`}>
                {isRecording ? '● REC' : isPlaying ? '▶ PLAY' : '■ STOP'}
              </text>
            </g>

            <g transform="translate(385, 25)" textAnchor="end">
              <text x="0" y="0" className="fill-zinc-600 font-mono text-[8px] font-black tracking-tighter uppercase">Tape Velocity</text>
              <text x="0" y="10" className="fill-[#4fbefd] font-mono text-[10px] font-black">{tapeSpeed.toFixed(2)}x</text>
            </g>

            <text x="200" y="20" textAnchor="middle" className="fill-zinc-800 text-[10px] font-mono font-black tracking-[0.5em] uppercase opacity-30">Field Recorder Unit</text>
          </svg>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full bg-[#050505]">
            <span className="text-[#4fbefd] font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">Initializing Data Stream...</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full relative group">
      {renderVisualizer()}
      <style>{`
        @keyframes waveformMove {
          0% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
          100% { transform: scaleY(1); }
        }
        @keyframes gridMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Display;
