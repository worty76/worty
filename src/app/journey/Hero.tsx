import type { JourneyOutfit } from "@/data/journey";

/**
 * The main character — an anime-style boy drawn in SVG, side view facing right.
 * Limbs are separate groups so CSS can run a walk / run cycle (journey.css).
 * Each period of life gets its own outfit and size.
 */

interface Look {
  scale: number;
  top: string;
  topSh: string;
  pants: string;
  shoe: string;
  shorts?: boolean;
  hood?: boolean;
  backpack?: string;
  scarf?: boolean;
  headphones?: boolean;
  sling?: boolean;
  collar?: boolean;
}

const LOOKS: Record<JourneyOutfit, Look> = {
  kid: { scale: 0.78, top: "#f7f7fb", topSh: "#c9cbe0", pants: "#2f3f73", shoe: "#8a5a3c", shorts: true, scarf: true, collar: true },
  student: { scale: 0.92, top: "#f7f7fb", topSh: "#c9cbe0", pants: "#273259", shoe: "#f2f2f6", backpack: "#3d6fd1", collar: true },
  uni: { scale: 1, top: "#e8744f", topSh: "#b9543a", pants: "#3d5282", shoe: "#f2f2f6", backpack: "#2d3550", hood: true },
  engineer: { scale: 1, top: "#38446e", topSh: "#262f52", pants: "#2a2d3c", shoe: "#f2f2f6", hood: true, headphones: true, sling: true },
};

const INK = "#1b1830";
const SKIN = "#ffe0c8";
const SKIN_SH = "#f0b99a";
const HAIR = "#252a4f";
const HAIR_HI = "#4a5394";

function Leg({ look, back }: { look: Look; back?: boolean }) {
  const cls = back ? "jr-leg jr-leg-b" : "jr-leg jr-leg-f";
  const shade = back ? 0.78 : 1;
  return (
    <g className={cls} style={{ filter: back ? "brightness(0.78)" : undefined }}>
      <g transform="translate(60 140)">
        {look.shorts ? (
          <>
            <path d="M-6.5,18 L6.5,18 L5.5,62 L-5.5,62 Z" fill={SKIN} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
            <path d="M-9,-4 L9,-4 L9.5,22 L-9.5,22 Z" fill={look.pants} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          </>
        ) : (
          <path d="M-8.5,-4 L8.5,-4 L7,62 L-7,62 Z" fill={look.pants} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        )}
        <path
          d="M-8,58 Q-9,70 -2,70 L15,70 Q19,70 18,64 Q16,58 7,57 Z"
          fill={look.shoe}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <path d="M-7,67 L17,67" stroke={INK} strokeWidth={1.4} opacity={0.5 * shade} />
      </g>
    </g>
  );
}

function Arm({ look, back }: { look: Look; back?: boolean }) {
  return (
    <g className={back ? "jr-arm jr-arm-b" : "jr-arm jr-arm-f"} style={{ filter: back ? "brightness(0.78)" : undefined }}>
      <g transform="translate(60 98)">
        <path
          d={look.shorts || look.collar ? "M-6,-2 L6,-2 L5.5,20 L-5.5,20 Z" : "M-7,-2 L7,-2 L6,40 L-6,40 Z"}
          fill={look.top}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        {(look.shorts || look.collar) && (
          <path d="M-4.5,19 L4.5,19 L4,40 L-4,40 Z" fill={SKIN} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        )}
        <ellipse cx={0.5} cy={44} rx={5.6} ry={6.2} fill={SKIN} stroke={INK} strokeWidth={2.2} />
      </g>
    </g>
  );
}

export function HeroSVG({ outfit }: { outfit: JourneyOutfit }) {
  const look = LOOKS[outfit];
  return (
    <svg viewBox="0 0 120 220" className="jr-hero-svg" overflow="visible" aria-hidden>
      <ellipse className="jr-hero-shadow" cx={62} cy={211} rx={30} ry={5} fill="#000" opacity={0.28} />
      <g className="jr-hero-body">
        {/* back side */}
        {look.backpack && (
          <g>
            <rect x={26} y={96} width={22} height={44} rx={7} fill={look.backpack} stroke={INK} strokeWidth={2.4} />
            <rect x={23} y={112} width={8} height={20} rx={3} fill={look.backpack} stroke={INK} strokeWidth={2} style={{ filter: "brightness(0.8)" }} />
          </g>
        )}
        {look.sling && <rect x={30} y={126} width={18} height={20} rx={4} fill="#5a4636" stroke={INK} strokeWidth={2.2} />}
        <Leg look={look} back />
        <Arm look={look} back />

        {/* torso */}
        <path
          d="M44,94 Q60,86 77,94 L80,146 Q60,152 40,146 Z"
          fill={look.top}
          stroke={INK}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        <path d="M44,96 Q46,124 42,146 Q52,149 56,149 Q52,122 52,94 Z" fill={look.topSh} opacity={0.75} />
        {look.hood && (
          <path d="M42,100 Q34,86 46,82 Q54,80 58,90 Z" fill={look.top} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        )}
        {look.hood && <path d="M68,100 L66,122 M73,100 L72,118" stroke={look.topSh} strokeWidth={2} strokeLinecap="round" />}
        {look.collar && <path d="M56,90 L64,100 L72,90" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />}
        {look.backpack && <path d="M50,92 Q48,116 50,140" fill="none" stroke={look.backpack} strokeWidth={5} style={{ filter: "brightness(0.85)" }} />}
        {look.sling && <path d="M74,94 L44,134" stroke="#5a4636" strokeWidth={4.5} strokeLinecap="round" />}
        <Leg look={look} />

        {/* neck + head */}
        <rect x={55} y={80} width={11} height={14} fill={SKIN_SH} stroke={INK} strokeWidth={2.2} />
        <g className="jr-head">
          {look.scarf && (
            <g>
              <path className="jr-scarf-tail" d="M50,92 L34,100 L38,108 L52,98 Z" fill="#e2352b" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
              <path d="M50,88 L72,90 L66,104 L60,96 Z" fill="#e2352b" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
            </g>
          )}
          {/* face */}
          <path
            d="M40,50 C40,30 55,23 66,23 C82,23 91,35 91,50 C91,60 90,66 87,72 C83,80 75,86 66,86 C54,86 44,78 41,68 Z"
            fill={SKIN}
            stroke={INK}
            strokeWidth={2.6}
            strokeLinejoin="round"
          />
          <ellipse cx={54} cy={61} rx={4.4} ry={6} fill={SKIN} stroke={INK} strokeWidth={2} />
          <path d="M53.5,58 Q51.5,61 54,64" fill="none" stroke={SKIN_SH} strokeWidth={1.8} strokeLinecap="round" />
          <ellipse cx={79} cy={73} rx={5} ry={2.6} fill="#ff8f8f" opacity={0.45} />
          {/* eye */}
          <g className="jr-eye">
            <ellipse cx={80} cy={61} rx={3.8} ry={6.2} fill="#2a2140" />
            <ellipse cx={80.2} cy={63.4} rx={2.7} ry={3.4} fill="#6a56c8" />
            <circle cx={81.3} cy={58.2} r={1.5} fill="#fff" />
            <circle cx={79} cy={65} r={0.7} fill="#fff" opacity={0.8} />
          </g>
          <path d="M74.5,54.2 Q80,51.8 85.5,55" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M75,49 L86,48" stroke={HAIR} strokeWidth={2.2} strokeLinecap="round" />
          <path d="M89.5,63 L91.5,66" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
          <path d="M83.5,77 Q85.5,78 87.5,76.6" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
          {/* hair */}
          <path
            className="jr-hair"
            d="M36,74 C27,60 26,42 33,31 L29,21 L41,24 L44,11 L54,19 L63,7 L69,19 L81,11 L81,23 L95,23 L89,33 L97,41 L87,41 L89,49 L81,44 L77,52 L73,42 L67,50 L63,41 L57,52 L52,46 L49,60 L45,56 L43,74 Z"
            fill={HAIR}
            stroke={INK}
            strokeWidth={2.6}
            strokeLinejoin="round"
          />
          <path d="M40,32 Q54,22 72,22 Q62,27 60,32 Q50,29 40,36 Z" fill={HAIR_HI} opacity={0.9} />
          {look.headphones && (
            <g>
              <path d="M46,88 Q60,104 76,90" fill="none" stroke="#17172a" strokeWidth={4.5} strokeLinecap="round" />
              <ellipse cx={45} cy={88} rx={6} ry={8} fill="#2b2b44" stroke={INK} strokeWidth={2} />
              <ellipse cx={77} cy={90} rx={5} ry={7} fill="#2b2b44" stroke={INK} strokeWidth={2} />
            </g>
          )}
        </g>
        <Arm look={look} />
      </g>
    </svg>
  );
}

export const heroScale = (o: JourneyOutfit) => LOOKS[o].scale;
