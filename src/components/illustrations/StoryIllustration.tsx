"use client";

import React from "react";

interface StoryIllustrationProps {
  theme: "nature" | "adventure" | "history" | "science" | "morals" | "space";
  className?: string;
}

export function StoryIllustration({ theme, className = "w-full h-48" }: StoryIllustrationProps) {
  switch (theme) {
    case "nature":
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 flex items-center justify-center ${className}`}>
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>

            {/* Sun */}
            <circle cx="80" cy="50" r="32" fill="url(#sunGrad)" opacity="0.95" />
            <circle cx="80" cy="50" r="44" fill="#FEF08A" opacity="0.25" />

            {/* Sand Dunes */}
            <path d="M-20 200 C80 150 180 170 260 160 C340 150 390 170 420 180 L420 220 L-20 220 Z" fill="url(#sandGrad)" opacity="0.6" />
            <path d="M-20 200 C60 165 140 185 240 175 C340 165 380 185 420 190 L420 220 L-20 220 Z" fill="url(#sandGrad)" />

            {/* Sidr / Palm Tree Trunk */}
            <path d="M260 175 Q265 120 275 80" stroke="#78350F" strokeWidth="12" strokeLinecap="round" />

            {/* Tree Foliage */}
            <circle cx="275" cy="70" r="36" fill="url(#treeGrad)" />
            <circle cx="250" cy="75" r="28" fill="url(#treeGrad)" opacity="0.9" />
            <circle cx="295" cy="80" r="28" fill="url(#treeGrad)" opacity="0.9" />
            <circle cx="275" cy="45" r="24" fill="#10B981" />

            {/* Golden Berries */}
            <circle cx="265" cy="70" r="4" fill="#FBBF24" />
            <circle cx="285" cy="75" r="4" fill="#FBBF24" />
            <circle cx="275" cy="55" r="4" fill="#FBBF24" />

            {/* Singing Bird */}
            <g transform="translate(195, 60)">
              {/* Body */}
              <ellipse cx="20" cy="18" rx="14" ry="10" fill="#38BDF8" />
              {/* Head */}
              <circle cx="30" cy="12" r="8" fill="#0284C7" />
              {/* Eye */}
              <circle cx="32" cy="10" r="1.5" fill="#FFFFFF" />
              <circle cx="32.5" cy="10" r="0.8" fill="#0F172A" />
              {/* Beak */}
              <polygon points="37,12 43,14 37,16" fill="#F59E0B" />
              {/* Wing */}
              <ellipse cx="17" cy="16" rx="9" ry="5" fill="#0369A1" transform="rotate(-15 17 16)" />
              {/* Tail */}
              <polygon points="7,20 0,16 2,24" fill="#0284C7" />
              {/* Musical Notes */}
              <path d="M42 6 Q46 2 48 5" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
              <path d="M47 0 Q51 -4 53 -1" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Distant Birds */}
            <path d="M120 70 Q124 66 128 70 Q132 66 136 70" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M145 80 Q148 77 151 80 Q154 77 157 80" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6" />
          </svg>
        </div>
      );

    case "adventure":
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800 flex items-center justify-center ${className}`}>
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0C4A6E" />
              </linearGradient>
            </defs>

            {/* Clouds */}
            <ellipse cx="90" cy="40" rx="30" ry="12" fill="#FFFFFF" opacity="0.35" />
            <ellipse cx="290" cy="50" rx="45" ry="16" fill="#FFFFFF" opacity="0.25" />

            {/* Waves */}
            <path d="M0 130 C60 120 120 140 180 130 C240 120 300 140 360 130 C380 125 400 128 420 130 L420 220 L0 220 Z" fill="url(#seaGrad)" />
            <path d="M0 155 C70 145 130 165 200 155 C270 145 330 165 400 155 L420 160 L420 220 L0 220 Z" fill="#0369A1" opacity="0.6" />

            {/* Traditional Arabian Dhow / Ship */}
            <g transform="translate(180, 80)">
              {/* Hull */}
              <path d="M-40 45 Q-15 52 25 50 Q55 48 70 30 Q30 42 -40 45 Z" fill="#78350F" />
              {/* Mast */}
              <line x1="15" y1="48" x2="15" y2="0" stroke="#451A03" strokeWidth="3" />
              {/* Triangular Sail */}
              <path d="M15 5 L-25 40 L15 38 Z" fill="#FEF3C7" opacity="0.95" />
              <path d="M15 5 L55 35 L15 36 Z" fill="#FFFFFF" opacity="0.85" />
            </g>

            {/* Sparkling Pearl Clam */}
            <g transform="translate(70, 140)">
              {/* Shell bottom */}
              <path d="M10 25 C10 15 35 15 45 25 C35 32 15 30 10 25 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
              {/* Shell top open */}
              <path d="M10 23 C15 5 40 5 45 22 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" />
              {/* Pearl */}
              <circle cx="27" cy="20" r="6" fill="#FFFFFF" />
              <circle cx="29" cy="18" r="2" fill="#BAE6FD" />
              {/* Sparkle */}
              <polygon points="27,10 29,14 33,14 30,17 31,21 27,18 23,21 24,17 21,14 25,14" fill="#FDE047" transform="scale(0.6) translate(15, 5)" />
            </g>
          </svg>
        </div>
      );

    case "science":
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-600 to-blue-800 flex items-center justify-center ${className}`}>
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glowing Tech Grid */}
            <circle cx="200" cy="100" r="70" stroke="#A5F3FC" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
            <circle cx="200" cy="100" r="45" stroke="#67E8F9" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

            {/* Atoms / Orbitals */}
            <ellipse cx="200" cy="100" rx="75" ry="25" stroke="#38BDF8" strokeWidth="2" transform="rotate(30 200 100)" opacity="0.8" />
            <ellipse cx="200" cy="100" rx="75" ry="25" stroke="#34D399" strokeWidth="2" transform="rotate(-30 200 100)" opacity="0.8" />

            {/* Electrons */}
            <circle cx="260" cy="70" r="5" fill="#38BDF8" />
            <circle cx="140" cy="70" r="5" fill="#34D399" />
            <circle cx="200" cy="170" r="5" fill="#FDE047" />

            {/* Glowing Nucleus */}
            <circle cx="200" cy="100" r="16" fill="#38BDF8" opacity="0.3" />
            <circle cx="200" cy="100" r="10" fill="#FFFFFF" />

            {/* Floating Water Droplet */}
            <g transform="translate(60, 60)">
              <path d="M25 5 C25 5 10 25 10 35 C10 44 17 50 25 50 C33 50 40 44 40 35 C40 25 25 5 25 5 Z" fill="#E0F2FE" opacity="0.9" />
              <ellipse cx="20" cy="35" rx="3" ry="6" fill="#FFFFFF" opacity="0.8" transform="rotate(-20 20 35)" />
            </g>

            {/* Green Leaf Innovation */}
            <g transform="translate(300, 70)">
              <path d="M10 40 Q25 10 45 15 Q40 40 10 40 Z" fill="#10B981" />
              <line x1="12" y1="38" x2="38" y2="18" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
            </g>
          </svg>
        </div>
      );

    case "space":
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 flex items-center justify-center ${className}`}>
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stars */}
            <circle cx="50" cy="30" r="1.5" fill="#FFFFFF" />
            <circle cx="120" cy="60" r="2" fill="#FDE047" />
            <circle cx="280" cy="40" r="1.5" fill="#FFFFFF" />
            <circle cx="340" cy="80" r="2.5" fill="#FFFFFF" />
            <circle cx="80" cy="120" r="1.5" fill="#93C5FD" />
            <circle cx="330" cy="150" r="1.5" fill="#FFFFFF" />

            {/* Earth Horizon */}
            <circle cx="200" cy="320" r="200" fill="#1E3A8A" stroke="#38BDF8" strokeWidth="4" />
            <circle cx="200" cy="320" r="206" stroke="#60A5FA" strokeWidth="2" opacity="0.4" />

            {/* Saudi Satellite CubeSat */}
            <g transform="translate(170, 50)">
              {/* Cube body */}
              <polygon points="25,10 50,22 50,47 25,35" fill="#0284C7" />
              <polygon points="25,10 0,22 25,35" fill="#38BDF8" />
              <polygon points="0,22 25,35 25,60 0,47" fill="#0369A1" />
              {/* Solar Panels */}
              <rect x="-35" y="22" width="30" height="18" rx="2" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
              <rect x="55" y="22" width="30" height="18" rx="2" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
              {/* Antenna */}
              <line x1="25" y1="10" x2="25" y2="-8" stroke="#E2E8F0" strokeWidth="2" />
              <circle cx="25" cy="-8" r="2" fill="#EF4444" />
            </g>

            {/* Crescent Moon */}
            <g transform="translate(70, 40)">
              <path d="M25 5 C15 5 7 13 7 23 C7 33 15 41 25 41 C20 37 17 30 17 23 C17 16 20 9 25 5 Z" fill="#FEF08A" />
            </g>
          </svg>
        </div>
      );

    case "history":
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-stone-700 to-amber-950 flex items-center justify-center ${className}`}>
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Andalusian / Islamic Arch */}
            <path d="M140 200 L140 90 Q140 40 200 20 Q260 40 260 90 L260 200 Z" fill="#292524" opacity="0.6" stroke="#D97706" strokeWidth="2" />
            <path d="M150 200 L150 95 Q150 50 200 32 Q250 50 250 95 L250 200 Z" fill="#1C1917" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />

            {/* Ancient Scroll / Manuscript */}
            <g transform="translate(160, 65)">
              <rect x="0" y="0" width="80" height="95" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
              {/* Lines of ancient script */}
              <line x1="12" y1="20" x2="68" y2="20" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="35" x2="68" y2="35" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="50" x2="68" y2="50" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="65" x2="50" y2="65" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              {/* Golden Seal */}
              <circle cx="62" cy="75" r="8" fill="#DC2626" />
            </g>

            {/* Traditional Quill / Pen & Ink */}
            <g transform="translate(255, 90)">
              <path d="M0 45 Q20 20 40 0 Q30 25 15 50 Z" fill="#F8FAFC" opacity="0.9" />
              <line x1="0" y1="45" x2="25" y2="20" stroke="#CBD5E1" strokeWidth="1" />
            </g>
          </svg>
        </div>
      );

    case "morals":
    default:
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-slate-900 flex items-center justify-center ${className}`}>
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glowing Lantern of Wisdom (الفانوس التراثي) */}
            <g transform="translate(180, 30)">
              {/* Chain */}
              <line x1="20" y1="0" x2="20" y2="15" stroke="#FBBF24" strokeWidth="2" />
              {/* Top Cap */}
              <polygon points="20,15 5,28 35,28" fill="#B45309" stroke="#FDE68A" strokeWidth="1" />
              {/* Glass body */}
              <polygon points="5,28 35,28 30,70 10,70" fill="#FEF08A" opacity="0.75" />
              {/* Inner Flame */}
              <path d="M20 40 Q25 52 20 60 Q15 52 20 40 Z" fill="#EA580C" />
              <circle cx="20" cy="52" r="3" fill="#FEF08A" />
              {/* Bottom Base */}
              <rect x="8" y="70" width="24" height="8" rx="2" fill="#78350F" stroke="#FDE68A" strokeWidth="1" />
            </g>

            {/* Open Book of Ethics */}
            <g transform="translate(130, 125)">
              <path d="M70 20 Q40 10 5 15 L5 45 Q40 40 70 50 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
              <path d="M70 20 Q100 10 135 15 L135 45 Q100 40 70 50 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Ribbon bookmark */}
              <path d="M70 20 L70 55 L75 52 L80 55 L80 20 Z" fill="#EF4444" />
            </g>

            {/* Glowing Aura Stars */}
            <circle cx="100" cy="60" r="2" fill="#FDE047" />
            <circle cx="300" cy="80" r="2" fill="#FDE047" />
            <circle cx="280" cy="40" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      );
  }
}

