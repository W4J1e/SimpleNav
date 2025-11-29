'use client';

import { useState, useEffect } from 'react';

interface MovieData {
  gettime: number;
  daily_word: string;
  mov_title: string;
  mov_text: string;
  mov_id: string;
  mov_link: string;
  mov_rating: string;
  mov_director: string;
  mov_year: number;
  mov_area: string;
  mov_type: string[];
  mov_pic: string;
  mov_intro: string;
}

interface MovieCalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieCalendarDialog({ isOpen, onClose }: MovieCalendarDialogProps) {
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<{ day: number; month: string; weekday: string }>({
    day: 0,
    month: '',
    weekday: ''
  });

  // 获取当前日期信息
  useEffect(() => {
    const date = new Date();
    const day = date.getDate();
    const month = `${date.getMonth() + 1}月`;
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    setCurrentDate({ day, month, weekday });
  }, []);

  // 获取电影数据
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/movie-calendar');
        const data = await response.json();
        setMovieData(data);
      } catch (error) {
        console.error('获取电影数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, []);

  if (!isOpen) return null;

  if (isLoading || !movieData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      {/* 对话框容器 */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-md rounded-xl p-8 text-white shadow-2xl">
        {/* 关闭按钮 */}
        <button 
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          onClick={onClose}
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* 电影信息容器 */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧：电影海报和日期 */}
          <div className="md:w-1/3 flex flex-col items-center">
            {/* 日期信息 */}
            <div className="mb-4 md:mb-20 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-center w-full">
              <div className="text-3xl font-bold">{currentDate.day}</div>
              <div className="text-sm opacity-80">{currentDate.month}/{currentDate.weekday}</div>
            </div>
            
            {/* 电影海报 */}
            <div className="w-full aspect-[3/4] bg-cover rounded-lg shadow-lg" style={{ backgroundImage: `url(${movieData.mov_pic})` }}></div>
          </div>
          
          {/* 右侧：电影信息 */}
          <div className="md:w-2/3">
            {/* 电影标题和评分 */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold">{movieData.mov_title}</h2>
              <span className="text-green-400 text-xl">豆 {movieData.mov_rating}</span>
            </div>

            {/* 电影年份、地区、类型 */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-sm opacity-80">{movieData.mov_year} {movieData.mov_area}</span>
              <div className="flex flex-wrap gap-2">
                {movieData.mov_type.map((type, index) => (
                  <span key={index} className="text-xs bg-white/20 rounded-full px-3 py-1">{type}</span>
                ))}
              </div>
            </div>

            {/* 导演信息 */}
            <div className="mb-4">
              <span className="text-sm opacity-80">导演：{movieData.mov_director}</span>
            </div>

            {/* 电影台词 */}
            <div className="mb-6 p-4 bg-black/30 backdrop-blur-sm rounded-lg italic">
              <p className="text-base">{movieData.mov_text}</p>
            </div>

            {/* 电影简介 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">电影简介</h3>
              <p className="text-sm leading-relaxed opacity-90 whitespace-pre-line">{movieData.mov_intro}</p>
            </div>
          </div>
        </div>

        {/* 数据来源 */}
        <div className="mt-6 text-center text-xs opacity-60">
          数据来源：<a href="https://www.cikeee.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">此刻电影日历</a>
        </div>
      </div>
    </div>
  );
}