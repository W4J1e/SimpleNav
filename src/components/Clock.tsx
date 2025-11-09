'use client';

import { useState, useEffect } from 'react';
import { formatTime, formatDate } from '@/lib/utils';

interface ClockProps {
  showClock: boolean;
}

export default function Clock({ showClock }: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!showClock) return null;

  return (
    <div id="clock" className="text-white text-center mb-8 transition-all duration-300 opacity-100">
      <div className="text-[clamp(2rem,10vw,4rem)] font-light" id="time">
        {formatTime(time)}
      </div>
      <div className="text-[clamp(0.8rem,3vw,1.2rem)] mt-1" id="date">
        {formatDate(time)}
      </div>
    </div>
  );
}