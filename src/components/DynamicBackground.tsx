'use client';

import { useEffect, useState } from 'react';

interface BlobConfig {
  path: string;
  color1: string;
  color2: string;
  opacity: number;
  animDuration: number;
  animDx: number;
  animDy: number;
}

interface GradientPreset {
  name: string;
  light: { base: string; blobs: BlobConfig[] };
  dark: { base: string; blobs: BlobConfig[] };
}

interface DynamicBackgroundProps {
  preset: string;
  darkMode: boolean;
}

const gradientPresets: Record<string, GradientPreset> = {
  'purple-sunset': {
    name: '晨曦柔光',
    light: {
      base: '#F5F0FB',
      blobs: [
        {
          // 左上大光晕 —— 清晨第一缕粉紫色晨光
          path: 'M -60,-60 C 260,-120 480,-40 560,140 C 640,300 520,440 340,460 C 160,480 20,400 -40,240 C -80,120 -40,40 -60,-60 Z',
          color1: '#C8A8E8', color2: '#F0E4FA', opacity: 0.85,
          animDuration: 50, animDx: 40, animDy: -20,
        },
        {
          // 右下大色块 —— 温暖的淡紫晨曦
          path: 'M 540,480 C 740,460 920,540 1020,680 C 1100,800 1020,940 860,1000 C 700,1040 540,980 460,840 C 400,720 420,520 540,480 Z',
          color1: '#D8BFE8', color2: '#F5EEFA', opacity: 0.75,
          animDuration: 55, animDx: -30, animDy: 25,
        },
        {
          // 左下方暖色点缀 —— 温暖的朝阳橙色
          path: 'M -120,640 C 80,600 280,680 340,820 C 380,920 300,1040 160,1060 C 20,1060 -120,1000 -180,860 C -220,740 -200,660 -120,640 Z',
          color1: '#F4D4A8', color2: '#FDF1DF', opacity: 0.7,
          animDuration: 45, animDx: 25, animDy: -15,
        },
      ],
    },
    dark: {
      base: '#1B1630',
      blobs: [
        {
          // 左上 —— 深紫晨光
          path: 'M -60,-60 C 260,-120 480,-40 560,140 C 640,300 520,440 340,460 C 160,480 20,400 -40,240 C -80,120 -40,40 -60,-60 Z',
          color1: '#6B4EA8', color2: '#2A1F4D', opacity: 0.9,
          animDuration: 50, animDx: 40, animDy: -20,
        },
        {
          // 右下 —— 柔紫色霞
          path: 'M 540,480 C 740,460 920,540 1020,680 C 1100,800 1020,940 860,1000 C 700,1040 540,980 460,840 C 400,720 420,520 540,480 Z',
          color1: '#5C3D8E', color2: '#231A3E', opacity: 0.85,
          animDuration: 55, animDx: -30, animDy: 25,
        },
        {
          // 左下 —— 温暖橙晖
          path: 'M -120,640 C 80,600 280,680 340,820 C 380,920 300,1040 160,1060 C 20,1060 -120,1000 -180,860 C -220,740 -200,660 -120,640 Z',
          color1: '#D8936A', color2: '#2E1F2A', opacity: 0.8,
          animDuration: 45, animDx: 25, animDy: -15,
        },
      ],
    },
  },
  'ocean-depth': {
    name: '雾蓝静谧',
    light: {
      base: '#F2F6FA',
      blobs: [
        {
          // 左上 —— 雾蒙蒙的淡蓝
          path: 'M -80,-80 C 240,-140 500,-60 580,120 C 660,280 540,420 360,440 C 180,460 40,380 -40,220 C -100,100 -60,20 -80,-80 Z',
          color1: '#B8D0E8', color2: '#E8F0F8', opacity: 0.85,
          animDuration: 50, animDx: 35, animDy: -25,
        },
        {
          // 右下 —— 偏冷的蓝白色雾气
          path: 'M 520,460 C 720,440 920,520 1020,680 C 1100,820 1000,960 840,1000 C 680,1020 520,960 440,820 C 380,700 400,500 520,460 Z',
          color1: '#A8C4DC', color2: '#E0EBF4', opacity: 0.75,
          animDuration: 55, animDx: -35, animDy: 25,
        },
        {
          // 中下 —— 白色浓雾带
          path: 'M 60,640 C 260,600 460,680 520,820 C 560,940 460,1060 300,1060 C 140,1060 0,980 -40,840 C -80,720 -40,660 60,640 Z',
          color1: '#E4EEF8', color2: '#FFFFFF', opacity: 0.65,
          animDuration: 45, animDx: 20, animDy: -20,
        },
      ],
    },
    dark: {
      base: '#0E1A2A',
      blobs: [
        {
          path: 'M -80,-80 C 240,-140 500,-60 580,120 C 660,280 540,420 360,440 C 180,460 40,380 -40,220 C -100,100 -60,20 -80,-80 Z',
          color1: '#3F6A9A', color2: '#142338', opacity: 0.9,
          animDuration: 50, animDx: 35, animDy: -25,
        },
        {
          path: 'M 520,460 C 720,440 920,520 1020,680 C 1100,820 1000,960 840,1000 C 680,1020 520,960 440,820 C 380,700 400,500 520,460 Z',
          color1: '#4F7BAE', color2: '#12203A', opacity: 0.85,
          animDuration: 55, animDx: -35, animDy: 25,
        },
        {
          path: 'M 60,640 C 260,600 460,680 520,820 C 560,940 460,1060 300,1060 C 140,1060 0,980 -40,840 C -80,720 -40,660 60,640 Z',
          color1: '#6A8FB8', color2: '#16243A', opacity: 0.75,
          animDuration: 45, animDx: 20, animDy: -20,
        },
      ],
    },
  },
  'aurora': {
    name: '极光流动',
    light: {
      base: '#EEF5F0',
      blobs: [
        {
          // 左上 —— 翠绿色极光
          path: 'M -100,-60 C 240,-140 520,-60 600,120 C 680,280 560,420 380,440 C 200,460 60,380 -20,220 C -80,100 -40,20 -100,-60 Z',
          color1: '#8ED8B8', color2: '#E4F5EB', opacity: 0.85,
          animDuration: 50, animDx: 40, animDy: -20,
        },
        {
          // 右下 —— 蓝紫色极光
          path: 'M 500,480 C 700,460 920,540 1020,700 C 1100,840 1000,960 840,1000 C 680,1020 520,980 440,840 C 380,720 400,520 500,480 Z',
          color1: '#A0B8E0', color2: '#E8EEF8', opacity: 0.8,
          animDuration: 55, animDx: -40, animDy: 30,
        },
        {
          // 中央偏右下 —— 淡青色极光带
          path: 'M 120,580 C 320,540 520,620 580,760 C 620,880 540,1000 380,1020 C 220,1020 80,960 20,820 C -20,700 20,600 120,580 Z',
          color1: '#B8E8DC', color2: '#E8F8F2', opacity: 0.7,
          animDuration: 48, animDx: 30, animDy: -25,
        },
      ],
    },
    dark: {
      base: '#0A1818',
      blobs: [
        {
          path: 'M -100,-60 C 240,-140 520,-60 600,120 C 680,280 560,420 380,440 C 200,460 60,380 -20,220 C -80,100 -40,20 -100,-60 Z',
          color1: '#2EA878', color2: '#0E2E22', opacity: 0.9,
          animDuration: 50, animDx: 40, animDy: -20,
        },
        {
          path: 'M 500,480 C 700,460 920,540 1020,700 C 1100,840 1000,960 840,1000 C 680,1020 520,980 440,840 C 380,720 400,520 500,480 Z',
          color1: '#4F6BBF', color2: '#141E3A', opacity: 0.85,
          animDuration: 55, animDx: -40, animDy: 30,
        },
        {
          path: 'M 120,580 C 320,540 520,620 580,760 C 620,880 540,1000 380,1020 C 220,1020 80,960 20,820 C -20,700 20,600 120,580 Z',
          color1: '#3EA8A0', color2: '#0E2A2A', opacity: 0.8,
          animDuration: 48, animDx: 30, animDy: -25,
        },
      ],
    },
  },
  'rose-dawn': {
    name: '暖日微光',
    light: {
      base: '#FBEFE7',
      blobs: [
        {
          // 左上 —— 温暖的橙粉红色阳光
          path: 'M -60,-60 C 260,-120 480,-40 560,140 C 640,300 520,440 340,460 C 160,480 20,400 -40,240 C -80,120 -40,40 -60,-60 Z',
          color1: '#F2B898', color2: '#FDE8D8', opacity: 0.9,
          animDuration: 50, animDx: 40, animDy: -20,
        },
        {
          // 右下 —— 柔和的桃色光晕
          path: 'M 540,500 C 740,480 940,560 1020,720 C 1080,860 980,980 820,1020 C 660,1040 500,980 420,840 C 360,720 400,540 540,500 Z',
          color1: '#F4C8B0', color2: '#FDEEDF', opacity: 0.8,
          animDuration: 55, animDx: -30, animDy: 25,
        },
        {
          // 中央偏右 —— 金黄色日光带
          path: 'M 80,640 C 280,600 480,680 540,820 C 580,940 480,1060 320,1080 C 160,1080 20,1020 -40,880 C -80,760 -40,660 80,640 Z',
          color1: '#F8D898', color2: '#FDF0D8', opacity: 0.75,
          animDuration: 48, animDx: 25, animDy: -20,
        },
      ],
    },
    dark: {
      base: '#1F1412',
      blobs: [
        {
          path: 'M -60,-60 C 260,-120 480,-40 560,140 C 640,300 520,440 340,460 C 160,480 20,400 -40,240 C -80,120 -40,40 -60,-60 Z',
          color1: '#D97E58', color2: '#2E1A14', opacity: 0.9,
          animDuration: 50, animDx: 40, animDy: -20,
        },
        {
          path: 'M 540,500 C 740,480 940,560 1020,720 C 1080,860 980,980 820,1020 C 660,1040 500,980 420,840 C 360,720 400,540 540,500 Z',
          color1: '#C86E58', color2: '#2A1614', opacity: 0.85,
          animDuration: 55, animDx: -30, animDy: 25,
        },
        {
          path: 'M 80,640 C 280,600 480,680 540,820 C 580,940 480,1060 320,1080 C 160,1080 20,1020 -40,880 C -80,760 -40,660 80,640 Z',
          color1: '#D89858', color2: '#2E1E14', opacity: 0.8,
          animDuration: 48, animDx: 25, animDy: -20,
        },
      ],
    },
  },
  'deep-space': {
    name: '深空幻境',
    light: {
      base: '#F0EDF8',
      blobs: [
        {
          // 左上 —— 深紫蓝色星云
          path: 'M -60,-60 C 260,-120 500,-40 580,140 C 660,300 540,440 360,460 C 180,480 40,400 -40,240 C -80,120 -40,40 -60,-60 Z',
          color1: '#A898D8', color2: '#E8E0F5', opacity: 0.85,
          animDuration: 50, animDx: 35, animDy: -25,
        },
        {
          // 右下 —— 深蓝紫色星河
          path: 'M 540,480 C 740,460 940,540 1020,700 C 1080,840 980,960 820,1000 C 660,1020 520,980 440,840 C 380,720 420,520 540,480 Z',
          color1: '#8A98D0', color2: '#E0E2F0', opacity: 0.8,
          animDuration: 55, animDx: -35, animDy: 30,
        },
        {
          // 中央 —— 神秘暗紫色星尘
          path: 'M -80,620 C 120,580 320,660 380,800 C 420,920 340,1040 180,1060 C 20,1060 -120,1000 -180,860 C -220,740 -180,640 -80,620 Z',
          color1: '#B8A8E8', color2: '#ECE4F8', opacity: 0.7,
          animDuration: 48, animDx: 30, animDy: -20,
        },
      ],
    },
    dark: {
      base: '#080818',
      blobs: [
        {
          path: 'M -60,-60 C 260,-120 500,-40 580,140 C 660,300 540,440 360,460 C 180,480 40,400 -40,240 C -80,120 -40,40 -60,-60 Z',
          color1: '#4A3D8E', color2: '#140E2A', opacity: 0.9,
          animDuration: 50, animDx: 35, animDy: -25,
        },
        {
          path: 'M 540,480 C 740,460 940,540 1020,700 C 1080,840 980,960 820,1000 C 660,1020 520,980 440,840 C 380,720 420,520 540,480 Z',
          color1: '#3F4F8E', color2: '#0E142A', opacity: 0.85,
          animDuration: 55, animDx: -35, animDy: 30,
        },
        {
          path: 'M -80,620 C 120,580 320,660 380,800 C 420,920 340,1040 180,1060 C 20,1060 -120,1000 -180,860 C -220,740 -180,640 -80,620 Z',
          color1: '#5E4EA8', color2: '#18143A', opacity: 0.8,
          animDuration: 48, animDx: 30, animDy: -20,
        },
      ],
    },
  },
};

export default function DynamicBackground({ preset, darkMode }: DynamicBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = gradientPresets[preset] || gradientPresets['purple-sunset'];
  const theme = darkMode ? config.dark : config.light;

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: theme.base }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1000 1000"
      >
        <defs>
          {theme.blobs.map((blob, index) => (
            <radialGradient
              key={`grad-${preset}-${index}`}
              id={`blob-grad-${preset}-${index}`}
              cx="50%"
              cy="45%"
              r="70%"
              fx="45%"
              fy="40%"
            >
              <stop offset="0%" stopColor={blob.color1} stopOpacity={blob.opacity} />
              <stop offset="55%" stopColor={blob.color1} stopOpacity={blob.opacity * 0.6} />
              <stop offset="100%" stopColor={blob.color2} stopOpacity="0" />
            </radialGradient>
          ))}

          <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>

          <filter id="noise-texture" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feComponentTransfer in="grayNoise" result="subtleNoise">
              <feFuncA type="linear" slope="0.01" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="subtleNoise" mode="overlay" />
          </filter>
        </defs>

        <g filter="url(#soft-blur)">
          {theme.blobs.map((blob, index) => (
            <path
              key={`blob-${preset}-${index}`}
              d={blob.path}
              fill={`url(#blob-grad-${preset}-${index})`}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`
                  0 0;
                  ${blob.animDx} ${blob.animDy};
                  ${-blob.animDx * 0.5} ${-blob.animDy * 0.5};
                  0 0
                `}
                dur={`${blob.animDuration}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}
        </g>

        <rect width="1000" height="1000" filter="url(#noise-texture)" opacity="0.15" />
      </svg>
    </div>
  );
}

export const gradientPresetNames: Record<string, string> = Object.fromEntries(
  Object.entries(gradientPresets).map(([key, val]) => [key, val.name])
);
