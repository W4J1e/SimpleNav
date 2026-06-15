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

interface StarConfig {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

interface PlanetConfig {
  cx: number;
  cy: number;
  r: number;
  color1: string;
  color2: string;
  opacity: number;
  hasRing?: boolean;
  ringColor?: string;
  ringOpacity?: number;
}

interface GradientPreset {
  name: string;
  light: { base: string; blobs: BlobConfig[]; stars?: StarConfig[]; planets?: PlanetConfig[] };
  dark: { base: string; blobs: BlobConfig[]; stars?: StarConfig[]; planets?: PlanetConfig[] };
}

interface DynamicBackgroundProps {
  preset: string;
  darkMode: boolean;
}

const gradientPresets: Record<string, GradientPreset> = {
  'purple-sunset': {
    name: '晨曦柔光',
    light: {
      base: '#F8F2FC',
      blobs: [
        {
          // 左上 —— 柔和的薰衣草晨光
          path: 'M -80,-80 C 200,-160 520,-80 620,100 C 720,280 600,460 380,500 C 160,540 -20,420 -80,260 C -140,100 -80,-20 -80,-80 Z',
          color1: '#D4B0F0', color2: '#F5ECFC', opacity: 0.9,
          animDuration: 60, animDx: 45, animDy: -25,
        },
        {
          // 右侧 —— 蜜桃粉晨霞
          path: 'M 680,-40 C 900,-80 1100,60 1120,240 C 1140,420 980,540 780,540 C 580,540 440,440 420,280 C 400,120 520,-20 680,-40 Z',
          color1: '#F0B8C8', color2: '#FDE8EE', opacity: 0.8,
          animDuration: 55, animDx: -35, animDy: 30,
        },
        {
          // 右下 —— 淡金色暖阳
          path: 'M 560,560 C 760,520 960,600 1040,760 C 1100,880 1000,1000 840,1040 C 680,1060 540,980 480,840 C 420,700 440,580 560,560 Z',
          color1: '#F0D8A0', color2: '#FDF4E0', opacity: 0.7,
          animDuration: 50, animDx: -25, animDy: 20,
        },
        {
          // 左下 —— 薄荷紫薄雾
          path: 'M -100,600 C 100,560 300,640 360,800 C 400,920 300,1040 140,1060 C -20,1060 -160,980 -200,840 C -240,700 -180,620 -100,600 Z',
          color1: '#C8B8E8', color2: '#F0E8F8', opacity: 0.65,
          animDuration: 65, animDx: 30, animDy: -20,
        },
      ],
    },
    dark: {
      base: '#140E22',
      blobs: [
        {
          path: 'M -80,-80 C 200,-160 520,-80 620,100 C 720,280 600,460 380,500 C 160,540 -20,420 -80,260 C -140,100 -80,-20 -80,-80 Z',
          color1: '#7B4EB8', color2: '#1E1230', opacity: 0.9,
          animDuration: 60, animDx: 45, animDy: -25,
        },
        {
          path: 'M 680,-40 C 900,-80 1100,60 1120,240 C 1140,420 980,540 780,540 C 580,540 440,440 420,280 C 400,120 520,-20 680,-40 Z',
          color1: '#C05878', color2: '#2A1420', opacity: 0.85,
          animDuration: 55, animDx: -35, animDy: 30,
        },
        {
          path: 'M 560,560 C 760,520 960,600 1040,760 C 1100,880 1000,1000 840,1040 C 680,1060 540,980 480,840 C 420,700 440,580 560,560 Z',
          color1: '#C89838', color2: '#2A2010', opacity: 0.75,
          animDuration: 50, animDx: -25, animDy: 20,
        },
        {
          path: 'M -100,600 C 100,560 300,640 360,800 C 400,920 300,1040 140,1060 C -20,1060 -160,980 -200,840 C -240,700 -180,620 -100,600 Z',
          color1: '#6848A0', color2: '#18102A', opacity: 0.7,
          animDuration: 65, animDx: 30, animDy: -20,
        },
      ],
    },
  },
  'ocean-depth': {
    name: '深空幻境',
    light: {
      base: '#0C0C24',
      blobs: [
        {
          // 左上 —— 紫色星云
          path: 'M -80,-100 C 220,-180 560,-80 660,120 C 760,320 620,500 400,520 C 180,540 0,400 -60,220 C -120,40 -80,-40 -80,-100 Z',
          color1: '#4A2878', color2: '#0C0C24', opacity: 0.7,
          animDuration: 60, animDx: 45, animDy: -30,
        },
        {
          // 右上 —— 深蓝星河
          path: 'M 700,-60 C 920,-100 1120,40 1140,220 C 1160,400 1000,520 800,520 C 600,520 460,420 440,260 C 420,100 540,-40 700,-60 Z',
          color1: '#283878', color2: '#0C0C24', opacity: 0.6,
          animDuration: 55, animDx: -40, animDy: 35,
        },
        {
          // 右下 —— 青色星尘
          path: 'M 580,580 C 780,540 980,620 1060,780 C 1120,920 1020,1040 860,1060 C 700,1080 560,1000 500,860 C 440,720 480,600 580,580 Z',
          color1: '#1A4858', color2: '#0C0C24', opacity: 0.5,
          animDuration: 65, animDx: -35, animDy: 25,
        },
      ],
      stars: [
        { cx: 120, cy: 80, r: 1.5, opacity: 0.9 },
        { cx: 340, cy: 45, r: 1, opacity: 0.7 },
        { cx: 560, cy: 120, r: 1.2, opacity: 0.8 },
        { cx: 780, cy: 60, r: 1.8, opacity: 0.85 },
        { cx: 900, cy: 180, r: 1, opacity: 0.6 },
        { cx: 200, cy: 250, r: 0.8, opacity: 0.5 },
        { cx: 450, cy: 300, r: 1.3, opacity: 0.75 },
        { cx: 680, cy: 350, r: 0.8, opacity: 0.55 },
        { cx: 850, cy: 420, r: 1.1, opacity: 0.65 },
        { cx: 100, cy: 500, r: 0.9, opacity: 0.5 },
        { cx: 350, cy: 600, r: 1, opacity: 0.6 },
        { cx: 600, cy: 550, r: 0.7, opacity: 0.45 },
        { cx: 950, cy: 600, r: 1.2, opacity: 0.7 },
        { cx: 150, cy: 750, r: 0.8, opacity: 0.5 },
        { cx: 400, cy: 800, r: 1, opacity: 0.55 },
        { cx: 700, cy: 780, r: 0.9, opacity: 0.5 },
        { cx: 880, cy: 850, r: 1.3, opacity: 0.65 },
        { cx: 50, cy: 900, r: 0.7, opacity: 0.4 },
        { cx: 520, cy: 920, r: 0.8, opacity: 0.45 },
        { cx: 250, cy: 150, r: 2, opacity: 0.95 },
      ],
      planets: [
        { cx: 820, cy: 280, r: 50, color1: '#B8B8C0', color2: '#606068', opacity: 0.9 },
        { cx: 180, cy: 680, r: 18, color1: '#7898B8', color2: '#384860', opacity: 0.8 },
      ],
    },
    dark: {
      base: '#030308',
      blobs: [
        {
          // 左上 —— 深紫色星云
          path: 'M -80,-100 C 220,-180 560,-80 660,120 C 760,320 620,500 400,520 C 180,540 0,400 -60,220 C -120,40 -80,-40 -80,-100 Z',
          color1: '#3A1878', color2: '#060410', opacity: 0.8,
          animDuration: 60, animDx: 45, animDy: -30,
        },
        {
          // 右上 —— 靛蓝星河
          path: 'M 700,-60 C 920,-100 1120,40 1140,220 C 1160,400 1000,520 800,520 C 600,520 460,420 440,260 C 420,100 540,-40 700,-60 Z',
          color1: '#182868', color2: '#040410', opacity: 0.7,
          animDuration: 55, animDx: -40, animDy: 35,
        },
        {
          // 右下 —— 暗青星尘
          path: 'M 580,580 C 780,540 980,620 1060,780 C 1120,920 1020,1040 860,1060 C 700,1080 560,1000 500,860 C 440,720 480,600 580,580 Z',
          color1: '#0A3848', color2: '#030308', opacity: 0.6,
          animDuration: 65, animDx: -35, animDy: 25,
        },
      ],
      stars: [
        { cx: 80, cy: 50, r: 1.5, opacity: 0.95 },
        { cx: 250, cy: 30, r: 1, opacity: 0.7 },
        { cx: 420, cy: 90, r: 1.8, opacity: 0.9 },
        { cx: 600, cy: 40, r: 1.2, opacity: 0.8 },
        { cx: 750, cy: 100, r: 2, opacity: 0.95 },
        { cx: 920, cy: 50, r: 1, opacity: 0.65 },
        { cx: 150, cy: 200, r: 0.8, opacity: 0.55 },
        { cx: 380, cy: 220, r: 1.3, opacity: 0.75 },
        { cx: 550, cy: 180, r: 0.7, opacity: 0.5 },
        { cx: 830, cy: 250, r: 1.5, opacity: 0.85 },
        { cx: 960, cy: 320, r: 0.9, opacity: 0.6 },
        { cx: 50, cy: 380, r: 1.1, opacity: 0.7 },
        { cx: 300, cy: 420, r: 0.8, opacity: 0.5 },
        { cx: 500, cy: 380, r: 1, opacity: 0.65 },
        { cx: 700, cy: 450, r: 0.7, opacity: 0.45 },
        { cx: 880, cy: 500, r: 1.2, opacity: 0.75 },
        { cx: 100, cy: 580, r: 0.9, opacity: 0.55 },
        { cx: 350, cy: 620, r: 1, opacity: 0.6 },
        { cx: 550, cy: 580, r: 0.8, opacity: 0.5 },
        { cx: 750, cy: 650, r: 1.3, opacity: 0.7 },
        { cx: 950, cy: 700, r: 0.7, opacity: 0.45 },
        { cx: 180, cy: 780, r: 1.1, opacity: 0.6 },
        { cx: 420, cy: 820, r: 0.8, opacity: 0.5 },
        { cx: 650, cy: 800, r: 1, opacity: 0.55 },
        { cx: 850, cy: 880, r: 1.5, opacity: 0.8 },
        { cx: 50, cy: 920, r: 0.7, opacity: 0.4 },
        { cx: 300, cy: 950, r: 0.9, opacity: 0.5 },
        { cx: 550, cy: 930, r: 0.6, opacity: 0.35 },
        { cx: 980, cy: 950, r: 1, opacity: 0.6 },
      ],
      planets: [
        { cx: 800, cy: 250, r: 55, color1: '#C0C0C8', color2: '#505058', opacity: 0.95 },
        { cx: 160, cy: 700, r: 20, color1: '#6888A8', color2: '#2A3848', opacity: 0.85 },
      ],
    },
  },
  'aurora': {
    name: '极光流动',
    light: {
      base: '#0A1020',
      blobs: [
        {
          // 主极光带 —— 从左下地平线蜿蜒到右上，翡翠绿波浪
          path: 'M -80,480 C 120,400 280,520 440,440 C 600,360 760,500 920,420 C 1020,370 1100,440 1120,480 C 1100,580 1020,600 900,580 C 700,560 540,640 380,580 C 220,530 60,600 -80,560 Z',
          color1: '#28D880', color2: '#0A1020', opacity: 0.75,
          animDuration: 55, animDx: 25, animDy: -15,
        },
        {
          // 次级极光带 —— 青绿色波浪，在主带上方
          path: 'M -60,380 C 140,320 300,420 460,360 C 620,300 780,400 940,340 C 1040,300 1100,360 1100,400 C 1080,480 1000,500 900,490 C 720,480 560,540 400,490 C 240,450 80,500 -60,470 Z',
          color1: '#50E0A8', color2: '#0A1020', opacity: 0.6,
          animDuration: 65, animDx: -20, animDy: 12,
        },
        {
          // 地平线光晕 —— 绿色扩散光
          path: 'M -80,600 C 150,580 350,620 550,600 C 750,580 950,620 1120,600 L 1120,800 C 950,820 750,800 550,820 C 350,830 150,810 -80,830 Z',
          color1: '#18A868', color2: '#0A1020', opacity: 0.4,
          animDuration: 75, animDx: 20, animDy: -10,
        },
        {
          // 顶部天空散射 —— 淡紫青色
          path: 'M -80,-100 C 200,-60 450,-40 700,-60 C 900,-80 1050,-40 1120,-20 L 1120,200 C 1050,180 900,200 700,180 C 450,170 200,200 -80,180 Z',
          color1: '#5878B8', color2: '#0A1020', opacity: 0.3,
          animDuration: 80, animDx: -15, animDy: 8,
        },
      ],
      stars: [
        { cx: 80, cy: 120, r: 1.2, opacity: 0.8 },
        { cx: 250, cy: 80, r: 0.8, opacity: 0.6 },
        { cx: 420, cy: 150, r: 1.5, opacity: 0.9 },
        { cx: 600, cy: 100, r: 1, opacity: 0.7 },
        { cx: 780, cy: 180, r: 1.3, opacity: 0.85 },
        { cx: 950, cy: 120, r: 0.9, opacity: 0.6 },
        { cx: 150, cy: 220, r: 0.7, opacity: 0.5 },
        { cx: 350, cy: 200, r: 1.1, opacity: 0.7 },
        { cx: 550, cy: 240, r: 0.8, opacity: 0.55 },
        { cx: 720, cy: 220, r: 1, opacity: 0.65 },
        { cx: 880, cy: 260, r: 0.9, opacity: 0.6 },
        { cx: 50, cy: 300, r: 0.8, opacity: 0.5 },
        { cx: 200, cy: 280, r: 0.7, opacity: 0.45 },
        { cx: 450, cy: 320, r: 1.2, opacity: 0.75 },
        { cx: 650, cy: 300, r: 0.9, opacity: 0.6 },
        { cx: 850, cy: 340, r: 1.1, opacity: 0.7 },
        { cx: 1000, cy: 280, r: 0.8, opacity: 0.5 },
        { cx: 100, cy: 360, r: 0.6, opacity: 0.4 },
        { cx: 300, cy: 380, r: 0.9, opacity: 0.55 },
        { cx: 500, cy: 360, r: 0.7, opacity: 0.5 },
        { cx: 700, cy: 380, r: 0.8, opacity: 0.5 },
        { cx: 900, cy: 400, r: 1, opacity: 0.6 },
        { cx: 150, cy: 520, r: 0.7, opacity: 0.45 },
        { cx: 380, cy: 500, r: 0.9, opacity: 0.55 },
        { cx: 580, cy: 520, r: 0.6, opacity: 0.4 },
        { cx: 800, cy: 500, r: 0.8, opacity: 0.5 },
      ],
    },
    dark: {
      base: '#030510',
      blobs: [
        {
          // 主极光带 —— 从左下地平线蜿蜒到右上，深翡翠绿
          path: 'M -80,480 C 120,400 280,520 440,440 C 600,360 760,500 920,420 C 1020,370 1100,440 1120,480 C 1100,580 1020,600 900,580 C 700,560 540,640 380,580 C 220,530 60,600 -80,560 Z',
          color1: '#08D068', color2: '#030510', opacity: 0.85,
          animDuration: 55, animDx: 25, animDy: -15,
        },
        {
          // 次级极光带 —— 青绿色
          path: 'M -60,380 C 140,320 300,420 460,360 C 620,300 780,400 940,340 C 1040,300 1100,360 1100,400 C 1080,480 1000,500 900,490 C 720,480 560,540 400,490 C 240,450 80,500 -60,470 Z',
          color1: '#28D888', color2: '#030510', opacity: 0.7,
          animDuration: 65, animDx: -20, animDy: 12,
        },
        {
          // 地平线光晕
          path: 'M -80,600 C 150,580 350,620 550,600 C 750,580 950,620 1120,600 L 1120,800 C 950,820 750,800 550,820 C 350,830 150,810 -80,830 Z',
          color1: '#08A058', color2: '#030510', opacity: 0.5,
          animDuration: 75, animDx: 20, animDy: -10,
        },
        {
          // 顶部天空散射
          path: 'M -80,-100 C 200,-60 450,-40 700,-60 C 900,-80 1050,-40 1120,-20 L 1120,200 C 1050,180 900,200 700,180 C 450,170 200,200 -80,180 Z',
          color1: '#3050A0', color2: '#030510', opacity: 0.35,
          animDuration: 80, animDx: -15, animDy: 8,
        },
      ],
      stars: [
        { cx: 80, cy: 120, r: 1.3, opacity: 0.9 },
        { cx: 250, cy: 80, r: 0.9, opacity: 0.7 },
        { cx: 420, cy: 150, r: 1.6, opacity: 0.95 },
        { cx: 600, cy: 100, r: 1.1, opacity: 0.75 },
        { cx: 780, cy: 180, r: 1.4, opacity: 0.9 },
        { cx: 950, cy: 120, r: 1, opacity: 0.65 },
        { cx: 150, cy: 220, r: 0.8, opacity: 0.55 },
        { cx: 350, cy: 200, r: 1.2, opacity: 0.75 },
        { cx: 550, cy: 240, r: 0.9, opacity: 0.6 },
        { cx: 720, cy: 220, r: 1.1, opacity: 0.7 },
        { cx: 880, cy: 260, r: 1, opacity: 0.65 },
        { cx: 50, cy: 300, r: 0.9, opacity: 0.55 },
        { cx: 200, cy: 280, r: 0.8, opacity: 0.5 },
        { cx: 450, cy: 320, r: 1.3, opacity: 0.8 },
        { cx: 650, cy: 300, r: 1, opacity: 0.65 },
        { cx: 850, cy: 340, r: 1.2, opacity: 0.75 },
        { cx: 1000, cy: 280, r: 0.9, opacity: 0.55 },
        { cx: 100, cy: 360, r: 0.7, opacity: 0.45 },
        { cx: 300, cy: 380, r: 1, opacity: 0.6 },
        { cx: 500, cy: 360, r: 0.8, opacity: 0.55 },
        { cx: 700, cy: 380, r: 0.9, opacity: 0.55 },
        { cx: 900, cy: 400, r: 1.1, opacity: 0.65 },
        { cx: 150, cy: 520, r: 0.8, opacity: 0.5 },
        { cx: 380, cy: 500, r: 1, opacity: 0.6 },
        { cx: 580, cy: 520, r: 0.7, opacity: 0.45 },
        { cx: 800, cy: 500, r: 0.9, opacity: 0.55 },
      ],
    },
  },
  'rose-dawn': {
    name: '暖日微光',
    light: {
      base: '#FDF2EC',
      blobs: [
        {
          // 左上 —— 玫瑰金晨曦
          path: 'M -80,-80 C 200,-160 540,-60 640,140 C 740,340 600,500 380,520 C 160,540 -20,400 -80,220 C -140,60 -80,-20 -80,-80 Z',
          color1: '#E8A0A0', color2: '#FDE8E4', opacity: 0.9,
          animDuration: 58, animDx: 40, animDy: -25,
        },
        {
          // 右上 —— 珊瑚粉霞光
          path: 'M 680,-40 C 900,-80 1120,60 1140,240 C 1160,420 1000,540 800,540 C 600,540 460,440 440,280 C 420,120 540,-20 680,-40 Z',
          color1: '#F0A8B0', color2: '#FDE8EC', opacity: 0.8,
          animDuration: 52, animDx: -35, animDy: 30,
        },
        {
          // 右下 —— 琥珀金暖阳
          path: 'M 560,560 C 760,520 960,600 1040,760 C 1100,880 1000,1000 840,1040 C 680,1060 540,980 480,840 C 420,700 440,580 560,560 Z',
          color1: '#E8C078', color2: '#FDF0D8', opacity: 0.75,
          animDuration: 55, animDx: -28, animDy: 22,
        },
        {
          // 左下 —— 暖杏色柔光
          path: 'M -100,600 C 100,560 300,640 360,800 C 400,920 300,1040 140,1060 C -20,1060 -160,980 -200,840 C -240,700 -180,620 -100,600 Z',
          color1: '#E8B898', color2: '#FCEEE0', opacity: 0.65,
          animDuration: 62, animDx: 28, animDy: -18,
        },
      ],
    },
    dark: {
      base: '#1A0E0A',
      blobs: [
        {
          path: 'M -80,-80 C 200,-160 540,-60 640,140 C 740,340 600,500 380,520 C 160,540 -20,400 -80,220 C -140,60 -80,-20 -80,-80 Z',
          color1: '#B84848', color2: '#2A1210', opacity: 0.9,
          animDuration: 58, animDx: 40, animDy: -25,
        },
        {
          path: 'M 680,-40 C 900,-80 1120,60 1140,240 C 1160,420 1000,540 800,540 C 600,540 460,440 440,280 C 420,120 540,-20 680,-40 Z',
          color1: '#C84858', color2: '#2A1418', opacity: 0.85,
          animDuration: 52, animDx: -35, animDy: 30,
        },
        {
          path: 'M 560,560 C 760,520 960,600 1040,760 C 1100,880 1000,1000 840,1040 C 680,1060 540,980 480,840 C 420,700 440,580 560,560 Z',
          color1: '#B88828', color2: '#2A2010', opacity: 0.75,
          animDuration: 55, animDx: -28, animDy: 22,
        },
        {
          path: 'M -100,600 C 100,560 300,640 360,800 C 400,920 300,1040 140,1060 C -20,1060 -160,980 -200,840 C -240,700 -180,620 -100,600 Z',
          color1: '#A86838', color2: '#221810', opacity: 0.7,
          animDuration: 62, animDx: 28, animDy: -18,
        },
      ],
    },
  },
  'deep-space': {
    name: '雾蓝静谧',
    light: {
      base: '#F0ECF8',
      blobs: [
        {
          // 左上 —— 星云紫
          path: 'M -80,-100 C 220,-180 560,-80 660,120 C 760,320 620,500 400,520 C 180,540 0,400 -60,220 C -120,40 -80,-40 -80,-100 Z',
          color1: '#A888D8', color2: '#E8E0F5', opacity: 0.9,
          animDuration: 60, animDx: 45, animDy: -30,
        },
        {
          // 右上 —— 靛蓝星河
          path: 'M 700,-60 C 920,-100 1120,40 1140,220 C 1160,400 1000,520 800,520 C 600,520 460,420 440,260 C 420,100 540,-40 700,-60 Z',
          color1: '#7888C8', color2: '#E0E4F5', opacity: 0.8,
          animDuration: 55, animDx: -40, animDy: 35,
        },
        {
          // 中央 —— 暗紫星尘
          path: 'M 200,400 C 400,360 600,440 660,600 C 700,720 620,840 460,860 C 300,880 160,800 100,660 C 40,520 80,420 200,400 Z',
          color1: '#C098E8', color2: '#F0E8FC', opacity: 0.75,
          animDuration: 50, animDx: 30, animDy: -25,
        },
        {
          // 右下 —— 深蓝星域
          path: 'M 580,580 C 780,540 980,620 1060,780 C 1120,920 1020,1040 860,1060 C 700,1080 560,1000 500,860 C 440,720 480,600 580,580 Z',
          color1: '#6878B8', color2: '#E0E4F0', opacity: 0.7,
          animDuration: 65, animDx: -35, animDy: 25,
        },
      ],
    },
    dark: {
      base: '#06060F',
      blobs: [
        {
          path: 'M -80,-100 C 220,-180 560,-80 660,120 C 760,320 620,500 400,520 C 180,540 0,400 -60,220 C -120,40 -80,-40 -80,-100 Z',
          color1: '#5838A0', color2: '#0E0820', opacity: 0.9,
          animDuration: 60, animDx: 45, animDy: -30,
        },
        {
          path: 'M 700,-60 C 920,-100 1120,40 1140,220 C 1160,400 1000,520 800,520 C 600,520 460,420 440,260 C 420,100 540,-40 700,-60 Z',
          color1: '#3848A0', color2: '#080C20', opacity: 0.85,
          animDuration: 55, animDx: -40, animDy: 35,
        },
        {
          path: 'M 200,400 C 400,360 600,440 660,600 C 700,720 620,840 460,860 C 300,880 160,800 100,660 C 40,520 80,420 200,400 Z',
          color1: '#6838B8', color2: '#100A28', opacity: 0.8,
          animDuration: 50, animDx: 30, animDy: -25,
        },
        {
          path: 'M 580,580 C 780,540 980,620 1060,780 C 1120,920 1020,1040 860,1060 C 700,1080 560,1000 500,860 C 440,720 480,600 580,580 Z',
          color1: '#283898', color2: '#080A1A', opacity: 0.75,
          animDuration: 65, animDx: -35, animDy: 25,
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

  const config = (gradientPresets[preset] || gradientPresets['purple-sunset'])!;
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

          {theme.planets?.map((planet, index) => (
            <radialGradient
              key={`planet-grad-${preset}-${index}`}
              id={`planet-grad-${preset}-${index}`}
              cx="35%"
              cy="35%"
              r="65%"
            >
              <stop offset="0%" stopColor={planet.color1} stopOpacity={planet.opacity} />
              <stop offset="100%" stopColor={planet.color2} stopOpacity={planet.opacity} />
            </radialGradient>
          ))}

          {theme.planets?.filter(p => p.hasRing).map((planet, index) => (
            <clipPath key={`ring-clip-${preset}-${index}`} id={`ring-back-${preset}-${index}`}>
              <rect x="0" y="0" width="1000" height={planet.cy} />
            </clipPath>
          ))}
          {theme.planets?.filter(p => p.hasRing).map((planet, index) => (
            <clipPath key={`ring-clip-front-${preset}-${index}`} id={`ring-front-${preset}-${index}`}>
              <rect x="0" y={planet.cy} width="1000" height={1000 - planet.cy} />
            </clipPath>
          ))}

          {/* 星球裁剪路径 */}
          {theme.planets?.filter(p => p.r > 30).map((planet, index) => (
            <clipPath key={`planet-clip-path-${preset}-${index}`} id={`planet-clip-${preset}-${index}`}>
              <circle cx={planet.cx} cy={planet.cy} r={planet.r} />
            </clipPath>
          ))}

          {/* 星球表面噪点纹理 */}
          <filter id="planet-noise-filter" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feComponentTransfer in="grayNoise" result="planetNoise">
              <feFuncA type="linear" slope="0.15" />
            </feComponentTransfer>
          </filter>

          <filter id="noise-texture" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feComponentTransfer in="grayNoise" result="subtleNoise">
              <feFuncA type="linear" slope="0.02" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="subtleNoise" mode="overlay" />
          </filter>
        </defs>

        <g>
          {theme.blobs.map((blob, index) => (
            <path
              key={`blob-${preset}-${index}`}
              d={blob.path}
              fill={`url(#blob-grad-${preset}-${index})`}
            />
          ))}
        </g>

        {/* 星星 */}
        {theme.stars?.map((star, index) => (
          <circle
            key={`star-${preset}-${index}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="white"
            opacity={star.opacity}
          />
        ))}

        {/* 星球 */}
        {theme.planets?.map((planet, index) => (
          <g key={`planet-${preset}-${index}`}>
            <circle
              cx={planet.cx}
              cy={planet.cy}
              r={planet.r}
              fill={`url(#planet-grad-${preset}-${index})`}
            />
            {/* 环形山纹理 - 仅对较大星球(r>30)绘制 */}
            {planet.r > 30 && (
              <g clipPath={`url(#planet-clip-${preset}-${index})`}>
                <circle cx={planet.cx - planet.r * 0.3} cy={planet.cy - planet.r * 0.2} r={planet.r * 0.18} fill="rgba(0,0,0,0.12)" />
                <circle cx={planet.cx - planet.r * 0.3} cy={planet.cy - planet.r * 0.2} r={planet.r * 0.15} fill="rgba(0,0,0,0.06)" />
                <circle cx={planet.cx + planet.r * 0.25} cy={planet.cy + planet.r * 0.15} r={planet.r * 0.12} fill="rgba(0,0,0,0.1)" />
                <circle cx={planet.cx + planet.r * 0.25} cy={planet.cy + planet.r * 0.15} r={planet.r * 0.09} fill="rgba(0,0,0,0.05)" />
                <circle cx={planet.cx - planet.r * 0.1} cy={planet.cy + planet.r * 0.35} r={planet.r * 0.1} fill="rgba(0,0,0,0.08)" />
                <circle cx={planet.cx - planet.r * 0.1} cy={planet.cy + planet.r * 0.35} r={planet.r * 0.07} fill="rgba(0,0,0,0.04)" />
                <circle cx={planet.cx + planet.r * 0.4} cy={planet.cy - planet.r * 0.3} r={planet.r * 0.08} fill="rgba(0,0,0,0.09)" />
                <circle cx={planet.cx + planet.r * 0.4} cy={planet.cy - planet.r * 0.3} r={planet.r * 0.05} fill="rgba(0,0,0,0.04)" />
                <circle cx={planet.cx - planet.r * 0.45} cy={planet.cy + planet.r * 0.1} r={planet.r * 0.07} fill="rgba(0,0,0,0.07)" />
                <circle cx={planet.cx + planet.r * 0.1} cy={planet.cy - planet.r * 0.4} r={planet.r * 0.06} fill="rgba(0,0,0,0.06)" />
                <circle cx={planet.cx + planet.r * 0.35} cy={planet.cy + planet.r * 0.35} r={planet.r * 0.05} fill="rgba(0,0,0,0.05)" />
                {/* 表面纹理噪点 */}
                <circle cx={planet.cx} cy={planet.cy} r={planet.r} fill="gray" filter="url(#planet-noise-filter)" opacity="0.3" />
              </g>
            )}
          </g>
        ))}

        <rect width="1000" height="1000" filter="url(#noise-texture)" opacity="0.15" />
      </svg>
    </div>
  );
}

export const gradientPresetNames: Record<string, string> = Object.fromEntries(
  Object.entries(gradientPresets).map(([key, val]) => [key, val.name])
);
