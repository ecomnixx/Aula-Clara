import React from 'react';

interface TacticalCourtDiagramProps {
  tipoQuadra?: string;
  nomeAtividade?: string;
}

export const TacticalCourtDiagram: React.FC<TacticalCourtDiagramProps> = ({
  tipoQuadra = 'queimada',
  nomeAtividade = 'Atividade em Quadra',
}) => {
  return (
    <div className="bg-auguste-cream border border-auguste-sand rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col items-center justify-between h-full">
      <div className="w-full flex items-center justify-between text-xs font-black text-auguste-slate uppercase tracking-wider pb-2 border-b border-auguste-sand">
        <span className="flex items-center gap-1.5 text-auguste-slate">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Esquema Tático de Quadra / Posições
        </span>
        <span className="text-[10px] bg-white text-auguste-slate border border-auguste-sand px-2 py-0.5 rounded-full font-extrabold">
          Ilustração Prática
        </span>
      </div>

      {/* Court Canvas Area */}
      <div className="w-full relative aspect-4/3 sm:aspect-square max-h-[380px] bg-[#1e40af] rounded-xl border-4 border-auguste-slate shadow-md overflow-hidden p-2 flex items-center justify-center">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full text-white font-sans select-none"
        >
          {/* Court Outer Boundary Line */}
          <rect
            x="15"
            y="15"
            width="370"
            height="270"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            rx="4"
          />

          {/* Half Court Line */}
          <line
            x1="200"
            y1="15"
            x2="200"
            y2="285"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Center Circle */}
          <circle
            cx="200"
            cy="150"
            r="40"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <circle cx="200" cy="150" r="3" fill="#ffffff" />

          {/* Left Base / Goal Area (Base do Time 1) */}
          <rect
            x="15"
            y="90"
            width="45"
            height="120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Right Base / Goal Area (Base do Time 2) */}
          <rect
            x="340"
            y="90"
            width="45"
            height="120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Cones (Orange Triangles) in the 4 corners / bases */}
          <polygon points="30,22 24,36 36,36" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
          <polygon points="30,278 24,264 36,264" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
          <polygon points="370,22 364,36 376,36" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
          <polygon points="370,278 364,264 376,264" fill="#f97316" stroke="#ffffff" strokeWidth="1" />

          {/* Team 1 Players (Cyan - Left Side) */}
          <g transform="translate(110, 80)">
            <circle cx="0" cy="0" r="11" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">
              1
            </text>
          </g>

          <g transform="translate(135, 150)">
            <circle cx="0" cy="0" r="11" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">
              1
            </text>
          </g>

          <g transform="translate(110, 220)">
            <circle cx="0" cy="0" r="11" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">
              1
            </text>
          </g>

          <g transform="translate(362, 150)">
            <circle cx="0" cy="0" r="9" fill="#38bdf8" stroke="#fbbf24" strokeWidth="2" />
            <text x="0" y="3" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">
              1
            </text>
          </g>

          {/* Team 2 Players (Amber/Orange - Right Side) */}
          <g transform="translate(290, 80)">
            <circle cx="0" cy="0" r="11" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              2
            </text>
          </g>

          <g transform="translate(265, 150)">
            <circle cx="0" cy="0" r="11" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              2
            </text>
          </g>

          <g transform="translate(290, 220)">
            <circle cx="0" cy="0" r="11" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              2
            </text>
          </g>

          <g transform="translate(38, 150)">
            <circle cx="0" cy="0" r="9" fill="#a855f7" stroke="#fbbf24" strokeWidth="2" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
              2
            </text>
          </g>

          {/* Balls */}
          <g transform="translate(190, 135)">
            <circle cx="0" cy="0" r="6" fill="#facc15" stroke="#000000" strokeWidth="1" />
            <line x1="-3" y1="-3" x2="3" y2="3" stroke="#000000" strokeWidth="1" />
            <line x1="3" y1="-3" x2="-3" y2="3" stroke="#000000" strokeWidth="1" />
          </g>

          <g transform="translate(230, 200)">
            <circle cx="0" cy="0" r="6" fill="#facc15" stroke="#000000" strokeWidth="1" />
            <line x1="-3" y1="-3" x2="3" y2="3" stroke="#000000" strokeWidth="1" />
            <line x1="3" y1="-3" x2="-3" y2="3" stroke="#000000" strokeWidth="1" />
          </g>

          {/* Tactical Movement Arrow */}
          <path
            d="M 150 145 Q 210 130 260 150"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <polygon points="263,151 254,145 256,155" fill="#ffffff" />
        </svg>
      </div>

      {/* Legend Bar */}
      <div className="w-full bg-white p-2.5 rounded-xl border border-auguste-sand grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-auguste-text">
        <div className="flex items-center gap-1.5">
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-orange-500"></div>
          <span>Cones (Demarcação)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-sky-400 border border-white flex items-center justify-center text-[9px] text-slate-950 font-black">
            1
          </div>
          <span>Time 01 (Azul)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-purple-500 border border-white flex items-center justify-center text-[9px] text-white">
            2
          </div>
          <span>Time 02 (Roxo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-slate-900 flex items-center justify-center text-[8px] text-black font-black">
            x
          </div>
          <span>Bolas em Jogo</span>
        </div>
      </div>
    </div>
  );
};
