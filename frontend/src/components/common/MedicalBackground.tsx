import React from 'react';

export const MedicalBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* 1. Medical Precision Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 149, 134, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 149, 134, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 90%)',
        }}
      />

      {/* 2. Living Ambient Mesh Gradient Orbs */}
      <div 
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[110px] opacity-40 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.25) 0%, rgba(220, 199, 184, 0.35) 70%, transparent 100%)',
          animationDuration: '8s',
        }}
      />
      <div 
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[130px] opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(168, 181, 160, 0.4) 0%, rgba(200, 173, 154, 0.25) 60%, transparent 100%)',
          animation: 'floatSlow 14s ease-in-out infinite alternate',
        }}
      />
      <div 
        className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full blur-[140px] opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(220, 199, 184, 0.45) 0%, rgba(13, 148, 136, 0.15) 70%, transparent 100%)',
          animation: 'floatSlow 18s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* 3. Continuous Animated ECG Heartbeat Monitor Wave */}
      <div className="absolute top-[18%] left-0 right-0 h-28 opacity-45 overflow-hidden">
        <svg
          className="w-[200%] h-full ecg-wave-motion"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.05" />
              <stop offset="30%" stopColor="#0D9488" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#0D9488" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#0D9488" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.05" />
            </linearGradient>
            <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Repeating Clinical ECG Wave: Baseline -> P -> Q -> R peak -> S dip -> T -> Baseline */}
          <path
            d="
              M 0 50
              L 120 50
              Q 135 44, 150 50
              L 180 50
              L 190 56
              L 205 10
              L 220 85
              L 230 46
              L 245 50
              Q 275 36, 305 50
              L 400 50
              L 520 50
              Q 535 44, 550 50
              L 580 50
              L 590 56
              L 605 10
              L 620 85
              L 630 46
              L 645 50
              Q 675 36, 705 50
              L 800 50
              L 920 50
              Q 935 44, 950 50
              L 980 50
              L 990 56
              L 1005 10
              L 1020 85
              L 1030 46
              L 1045 50
              Q 1075 36, 1105 50
              L 1200 50
              L 1320 50
              Q 1335 44, 1350 50
              L 1380 50
              L 1390 56
              L 1405 10
              L 1420 85
              L 1430 46
              L 1445 50
              Q 1475 36, 1505 50
              L 1600 50
              L 1720 50
              Q 1735 44, 1750 50
              L 1780 50
              L 1790 56
              L 1805 10
              L 1820 85
              L 1830 46
              L 1845 50
              Q 1875 36, 1905 50
              L 2000 50
            "
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ecgGlow)"
          />
        </svg>
      </div>

      {/* 4. Second Subtle Lower ECG Wave (Offset for rhythmic depth) */}
      <div className="absolute bottom-[14%] left-0 right-0 h-24 opacity-25 overflow-hidden">
        <svg
          className="w-[200%] h-full ecg-wave-motion-reverse"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="
              M 0 50
              L 150 50
              Q 165 46, 180 50
              L 210 50
              L 218 55
              L 230 18
              L 242 78
              L 250 48
              L 262 50
              Q 288 38, 315 50
              L 450 50
              L 550 50
              Q 565 46, 580 50
              L 610 50
              L 618 55
              L 630 18
              L 642 78
              L 650 48
              L 662 50
              Q 688 38, 715 50
              L 850 50
              L 950 50
              Q 965 46, 980 50
              L 1010 50
              L 1018 55
              L 1030 18
              L 1042 78
              L 1050 48
              L 1062 50
              Q 1088 38, 1115 50
              L 1250 50
              L 1350 50
              Q 1365 46, 1380 50
              L 1410 50
              L 1418 55
              L 1430 18
              L 1442 78
              L 1450 48
              L 1462 50
              Q 1488 38, 1515 50
              L 1650 50
              L 1750 50
              Q 1765 46, 1780 50
              L 1810 50
              L 1818 55
              L 1830 18
              L 1842 78
              L 1850 48
              L 1862 50
              Q 1888 38, 1915 50
              L 2000 50
            "
            fill="none"
            stroke="#A89586"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* 5. Floating Medical Telemetry Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Medical Crosses */}
        <div className="floating-particle" style={{ top: '15%', left: '8%', animationDelay: '0s', animationDuration: '14s' }}>
          <span className="text-teal-700/25 text-2xl font-light select-none">✚</span>
        </div>
        <div className="floating-particle" style={{ top: '65%', left: '12%', animationDelay: '4s', animationDuration: '18s' }}>
          <span className="text-taupe-500/20 text-3xl font-light select-none">✚</span>
        </div>
        <div className="floating-particle" style={{ top: '25%', right: '10%', animationDelay: '2s', animationDuration: '16s' }}>
          <span className="text-teal-600/30 text-xl font-light select-none">✚</span>
        </div>
        <div className="floating-particle" style={{ top: '75%', right: '15%', animationDelay: '6s', animationDuration: '20s' }}>
          <span className="text-sage-500/25 text-2xl font-light select-none">✚</span>
        </div>

        {/* Micro Telemetry Data Nodes */}
        <div className="floating-particle" style={{ top: '45%', left: '22%', animationDelay: '1s', animationDuration: '12s' }}>
          <div className="w-2 h-2 rounded-full bg-teal-600/20 border border-teal-600/40" />
        </div>
        <div className="floating-particle" style={{ top: '80%', left: '48%', animationDelay: '5s', animationDuration: '15s' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-nude-500/30 border border-nude-500/50" />
        </div>
        <div className="floating-particle" style={{ top: '35%', right: '28%', animationDelay: '3s', animationDuration: '13s' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500/15 border border-teal-500/30" />
        </div>
      </div>
    </div>
  );
};
