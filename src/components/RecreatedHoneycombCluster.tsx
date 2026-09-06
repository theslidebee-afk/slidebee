import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const RecreatedHoneycombCluster: React.FC = () => {
  const { scrollYProgress } = useScroll();

  const clusterY = useTransform(scrollYProgress, [0, 0.25], [0, 100]);
  const clusterScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  return (
    <motion.div
      style={{ y: clusterY, scale: clusterScale }}
      className="relative w-full max-w-[620px] aspect-[1/0.95] flex items-center justify-center select-none py-4"
    >
      <svg
        viewBox="0 0 680 620"
        className="w-full h-full overflow-visible drop-shadow-[0_20px_40px_rgba(17,17,17,0.12)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Honey Gold / Cyan / Amber Gradients */}
          <linearGradient id="goldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE17D" />
            <stop offset="35%" stopColor="#FCBF14" />
            <stop offset="100%" stopColor="#C98800" />
          </linearGradient>

          <linearGradient id="amberBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9F43" />
            <stop offset="50%" stopColor="#EE5A24" />
            <stop offset="100%" stopColor="#B53B00" />
          </linearGradient>

          <linearGradient id="cyanBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2D3" />
            <stop offset="60%" stopColor="#0ABDE3" />
            <stop offset="100%" stopColor="#1089A0" />
          </linearGradient>

          <linearGradient id="blueBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E86DE" />
            <stop offset="100%" stopColor="#1E3799" />
          </linearGradient>

          <linearGradient id="whiteRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2DCD0" />
          </linearGradient>

          <linearGradient id="darkBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#333333" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>

          {/* Soft Filter Drop Shadows for Hexagons */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.10" />
          </filter>

          <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#111111" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* TOP-LEFT NODE: 3D AMBER FACETED FOLDED HEXAGON */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(235, 115)" filter="url(#nodeShadow)">
          {/* Outer Bevel Rim */}
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#amberBevel)" />
          {/* Inner Recess */}
          <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24" fill="#FFFFFF" />
          {/* 3D Shaded Left Half */}
          <polygon points="0,-48 0,48 -42,24 -42,-24" fill="#E6E0D4" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* TOP NODE: WHITE BEVEL HEXAGON (STUDIO HIVE / BRAND ASSETS) */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(355, 115)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#whiteRim)" />
          <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="#FFFFFF" />
          {/* Studio Layers / Hive Icon */}
          <path d="M-14,-6 L0,-16 L14,-6 L0,4 Z" fill="#936610" opacity="0.8" />
          <path d="M-14,4 L0,-6 L14,4 L0,14 Z" fill="#FCBF14" />
          <path d="M-14,14 L0,4 L14,14 L0,24 Z" fill="#111111" />
        </g>
        {/* Top Node Annotation */}
        <text x="355" y="32" textAnchor="middle" fill="#111111" fontSize="11" fontWeight="800" letterSpacing="1">
          BRAND SYSTEMS
        </text>
        <text x="355" y="46" textAnchor="middle" fill="#726F6D" fontSize="9" fontWeight="600">
          Master Enterprise Assets
        </text>

        {/* ------------------------------------------------------------- */}
        {/* 01 OPTION NODE (TOP-RIGHT): CYAN / TEAL BEVELED HEXAGON */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(475, 115)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#cyanBevel)" />
          <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="#FFFFFF" />
          <text x="0" y="-8" textAnchor="middle" fill="#0ABDE3" fontSize="22" fontWeight="900" fontFamily="sans-serif">
            01
          </text>
          <text x="0" y="14" textAnchor="middle" fill="#111111" fontSize="10" fontWeight="900" letterSpacing="1.5">
            OPTION
          </text>
        </g>
        {/* 01 Option Callout Annotation */}
        <g transform="translate(540, 100)">
          <text x="0" y="0" fill="#111111" fontSize="12" fontWeight="900" letterSpacing="0.5">
            PITCH DECKS
          </text>
          <text x="0" y="14" fill="#726F6D" fontSize="9" fontWeight="600">
            $50M+ Client Funding
          </text>
          <text x="0" y="26" fill="#726F6D" fontSize="9" fontWeight="600">
            VC & Partner Ready
          </text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* LEFT NODE: WHITE BEVEL HEXAGON (LIGHTBULB / STRATEGY) */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(175, 255)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#whiteRim)" />
          <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="#FFFFFF" />
          {/* Lightbulb SVG Graphic */}
          <circle cx="0" cy="-6" r="13" fill="#FCBF14" opacity="0.25" />
          <path d="M-8,-8 C-8,-14 8,-14 8,-8 C8,-4 4,-2 4,2 L-4,2 C-4,-2 -8,-4 -8,-8 Z" stroke="#936610" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-3,6 L3,6 M-2,10 L2,10" stroke="#936610" strokeWidth="2" strokeLinecap="round" />
          {/* Radiating Rays */}
          <line x1="0" y1="-18" x2="0" y2="-22" stroke="#FCBF14" strokeWidth="2" strokeLinecap="round" />
          <line x1="-12" y1="-14" x2="-16" y2="-17" stroke="#FCBF14" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="-14" x2="16" y2="-17" stroke="#FCBF14" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* Strategy Annotation */}
        <g transform="translate(60, 240)">
          <text x="45" y="0" textAnchor="end" fill="#111111" fontSize="12" fontWeight="900" letterSpacing="0.5">
            C-SUITE STRATEGY
          </text>
          <text x="45" y="14" textAnchor="end" fill="#726F6D" fontSize="9" fontWeight="600">
            Ex-McKinsey Polish
          </text>
          <text x="45" y="26" textAnchor="end" fill="#726F6D" fontSize="9" fontWeight="600">
            Executive Storytelling
          </text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* CENTER HUB NODE: LARGE HONEY GOLD / CYAN CORE */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(355, 255)" filter="url(#softShadow)">
          {/* Main Beveled Rim */}
          <polygon points="0,-82 71,-41 71,41 0,82 -71,41 -71,-41" fill="url(#goldBevel)" />
          {/* Inner Accent Line */}
          <polygon points="0,-72 62,-36 62,36 0,72 -62,36 -62,-36" fill="url(#darkBevel)" />
          {/* Crisp Pure White Core */}
          <polygon points="0,-64 55,-32 55,32 0,64 -55,32 -55,-32" fill="#FFFFFF" />

          {/* Central Typography */}
          <text x="0" y="-18" textAnchor="middle" fill="#936610" fontSize="10" fontWeight="900" letterSpacing="2">
            SLIDEBEE STUDIO
          </text>
          <text x="0" y="6" textAnchor="middle" fill="#111111" fontSize="17" fontWeight="900" fontFamily="sans-serif">
            EXECUTIVE
          </text>
          <text x="0" y="22" textAnchor="middle" fill="#111111" fontSize="13" fontWeight="900" letterSpacing="1">
            DECKS
          </text>
          {/* Badge pill in center */}
          <rect x="-42" y="30" width="84" height="15" rx="7.5" fill="#111111" />
          <text x="0" y="41" textAnchor="middle" fill="#FCBF14" fontSize="8" fontWeight="900" letterSpacing="1">
            ON DEMAND
          </text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT NODE: 3D AMBER FACETED FOLDED HEXAGON */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(475, 255)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#amberBevel)" />
          <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24" fill="#FFFFFF" />
          <polygon points="0,-48 0,48 -42,24 -42,-24" fill="#E6E0D4" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* 03 OPTION NODE (LOWER-LEFT): CYAN / TEAL BEVELED HEXAGON */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(175, 395)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#cyanBevel)" />
          <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="#FFFFFF" />
          <text x="0" y="-8" textAnchor="middle" fill="#0ABDE3" fontSize="22" fontWeight="900" fontFamily="sans-serif">
            03
          </text>
          <text x="0" y="14" textAnchor="middle" fill="#111111" fontSize="10" fontWeight="900" letterSpacing="1.5">
            OPTION
          </text>
        </g>
        {/* 03 Option Annotation */}
        <g transform="translate(60, 380)">
          <text x="45" y="0" textAnchor="end" fill="#111111" fontSize="12" fontWeight="900" letterSpacing="0.5">
            CUSTOM REDESIGN
          </text>
          <text x="45" y="14" textAnchor="end" fill="#726F6D" fontSize="9" fontWeight="600">
            24h Rush Turnaround
          </text>
          <text x="45" y="26" textAnchor="end" fill="#726F6D" fontSize="9" fontWeight="600">
            1-on-1 Art Director
          </text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM-LEFT NODE: 3D AMBER FACETED FOLDED HEXAGON */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(295, 395)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#amberBevel)" />
          <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24" fill="#FFFFFF" />
          <polygon points="0,-48 0,48 -42,24 -42,-24" fill="#E6E0D4" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* LOWER-RIGHT NODE: WHITE BEVEL HEXAGON (THUMBS UP / APPROVAL) */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(415, 395)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#whiteRim)" />
          <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="#FFFFFF" />
          {/* Thumbs Up SVG */}
          <path
            d="M-10,12 L-4,12 L-4,-4 L-10,-4 Z M-2,12 L6,12 C8,12 9,11 9.5,9.5 L12,3 C12.5,1.5 11.5,0 10,0 L4,0 L5,-8 C5,-11 3,-13 1,-13 L0,-13 L-2,-4 Z"
            fill="#FCBF14"
          />
        </g>
        {/* Approval Annotation */}
        <g transform="translate(540, 380)">
          <text x="0" y="0" fill="#111111" fontSize="12" fontWeight="900" letterSpacing="0.5">
            99.8% APPROVAL
          </text>
          <text x="0" y="14" fill="#726F6D" fontSize="9" fontWeight="600">
            500+ Decks Delivered
          </text>
          <text x="0" y="26" fill="#726F6D" fontSize="9" fontWeight="600">
            Unlimited Iterations
          </text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* 02 OPTION NODE (BOTTOM-RIGHT): CYAN / TEAL BEVELED HEXAGON */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(475, 535)" filter="url(#nodeShadow)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="url(#cyanBevel)" />
          <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="#FFFFFF" />
          <text x="0" y="-8" textAnchor="middle" fill="#0ABDE3" fontSize="22" fontWeight="900" fontFamily="sans-serif">
            02
          </text>
          <text x="0" y="14" textAnchor="middle" fill="#111111" fontSize="10" fontWeight="900" letterSpacing="1.5">
            OPTION
          </text>
        </g>
        {/* 02 Option Annotation */}
        <g transform="translate(355, 560)">
          <text x="45" y="0" textAnchor="end" fill="#111111" fontSize="12" fontWeight="900" letterSpacing="0.5">
            MASTER TEMPLATES
          </text>
          <text x="45" y="14" textAnchor="end" fill="#726F6D" fontSize="9" fontWeight="600">
            PPT, Slides & Keynote
          </text>
          <text x="45" y="26" textAnchor="end" fill="#726F6D" fontSize="9" fontWeight="600">
            100% Fully Editable
          </text>
        </g>

      </svg>
    </motion.div>
  );
};

export default RecreatedHoneycombCluster;
