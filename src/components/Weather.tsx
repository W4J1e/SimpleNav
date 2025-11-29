'use client';

import { useState, useEffect } from 'react';

// 单日天气预报数据接口
interface DailyWeather {
  date: string;
  day: string;
  codeDay: string;
  textDay: string;
  textNight: string;
  codeNight: string;
  high: number;
  low: number;
  rainfall: string;
  precip: string;
  windDirection: string;
  windDirectionDegree: string;
  windSpeed: string;
  windScale: string;
  humidity: string;
}

// 天气数据接口
interface WeatherData {
  city: string;
  daily: DailyWeather[];
}

export default function Weather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        // 获取环境变量中的API密钥
        const apiKey = process.env.NEXT_PUBLIC_SENIVERSE_API_KEY || '';
        
        if (!apiKey) {
          throw new Error('SENIVERSE_API_KEY is not configured');
        }
        
        // 使用心知天气V3 API获取4天的逐日天气预报，基于IP自动定位
        const response = await fetch(
          `https://api.seniverse.com/v3/weather/daily.json?key=${apiKey}&location=ip&language=zh-Hans&unit=c&start=0&days=4`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        
        // 获取当前日期，用于生成星期几
        const today = new Date();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        
        // 构造天气数据对象
        const weatherInfo: WeatherData = {
          city: data.results[0].location.name,
          daily: data.results[0].daily.map((day: any, index: number) => {
            const forecastDate = new Date();
            forecastDate.setDate(today.getDate() + index);
            
            return {
              date: day.date,
              day: index === 0 ? '今天' : weekdays[forecastDate.getDay()],
              codeDay: day.code_day,
              textDay: day.text_day,
              textNight: day.text_night,
              codeNight: day.code_night,
              high: parseInt(day.high),
              low: parseInt(day.low),
              rainfall: day.rainfall,
              precip: day.precip,
              windDirection: day.wind_direction,
              windDirectionDegree: day.wind_direction_degree,
              windSpeed: day.wind_speed,
              windScale: day.wind_scale,
              humidity: day.humidity
            };
          })
        };
        
        setWeatherData(weatherInfo);
        setError(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    // 每30分钟刷新一次天气数据
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white text-sm">
          <i className="fas fa-spinner fa-spin"></i>
          <span>加载天气...</span>
        </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="flex items-center gap-2 text-white text-sm">
          <i className="fas fa-cloud"></i>
          <span>天气不可用</span>
        </div>
    );
  }

  // 获取今天的天气数据
  const todayWeather = weatherData.daily[0];

  return (
    <div 
      className="relative text-white text-sm hover:opacity-90 transition-opacity cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 默认显示：今天的天气 */}
      <div className="flex items-center gap-3">
        <i className={`fas ${getWeatherIcon(todayWeather.codeDay)}`} style={{ fontSize: '1.2rem' }}></i>
        <div>
          <div className="font-medium">{weatherData.city}</div>
          <div>{todayWeather.high}°C {todayWeather.textDay}</div>
        </div>
      </div>
      
      {/* 悬停时显示的详情卡片 */}
      {isHovered && (
        <div className="absolute top-full left-0 mt-2 bg-black/70 backdrop-blur-md rounded-lg p-4 shadow-lg min-w-[280px] z-50">
          {/* 城市和日期 */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/20">
            <div className="font-medium">{weatherData.city}</div>
            <div className="text-xs opacity-80">{todayWeather.date}</div>
          </div>
          
          {/* 今天的详细天气信息 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <i className="fas fa-temperature-high text-orange-400"></i>
              <div>
                <div className="text-xs opacity-80">最高温度</div>
                <div>{todayWeather.high}°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-temperature-low text-blue-400"></i>
              <div>
                <div className="text-xs opacity-80">最低温度</div>
                <div>{todayWeather.low}°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-tint text-blue-300"></i>
              <div>
                <div className="text-xs opacity-80">湿度</div>
                <div>{todayWeather.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-wind text-gray-300"></i>
              <div>
                <div className="text-xs opacity-80">风速</div>
                <div>{todayWeather.windSpeed} km/h</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-compass text-yellow-400"></i>
              <div>
                <div className="text-xs opacity-80">风向</div>
                <div>{todayWeather.windDirection}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-cloud-rain text-gray-300"></i>
              <div>
                <div className="text-xs opacity-80">降水概率</div>
                <div>{todayWeather.precip}</div>
              </div>
            </div>
          </div>
          
          {/* 未来3天的天气预报 */}
          <div className="border-t border-white/20 pt-3">
            <div className="text-xs font-medium mb-2 opacity-80">未来3天预报</div>
            <div className="space-y-2">
              {weatherData.daily.slice(1).map((day, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-xs">{day.day}</div>
                    <i className={`fas ${getWeatherIcon(day.codeDay)}`} style={{ fontSize: '1rem' }}></i>
                    <div className="text-xs truncate max-w-[60px]">{day.textDay}</div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-300">{day.low}°</span> / <span>{day.high}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 根据天气代码返回对应的Font Awesome图标
  function getWeatherIcon(code: string): string {
    const iconMap: Record<string, string> = {
      // 晴天
      '0': 'fa-sun',
      '1': 'fa-sun',
      '2': 'fa-sun',
      '3': 'fa-sun',
      // 多云
      '4': 'fa-cloud-sun',
      '5': 'fa-cloud-sun',
      '6': 'fa-cloud-sun',
      '7': 'fa-cloud',
      '8': 'fa-cloud',
      // 阴天
      '9': 'fa-cloud',
      // 雨天
      '10': 'fa-cloud-rain',
      '11': 'fa-cloud-rain',
      '12': 'fa-cloud-rain',
      '13': 'fa-cloud-rain',
      '14': 'fa-cloud-rain',
      '15': 'fa-cloud-rain',
      '16': 'fa-cloud-rain',
      '17': 'fa-cloud-rain',
      '18': 'fa-cloud-rain',
      // 雷雨
      '19': 'fa-bolt',
      '20': 'fa-bolt',
      '21': 'fa-bolt',
      '22': 'fa-bolt',
      '23': 'fa-bolt',
      '24': 'fa-bolt',
      '25': 'fa-bolt',
      '26': 'fa-bolt',
      '27': 'fa-bolt',
      // 雪
      '28': 'fa-snowflake',
      '29': 'fa-snowflake',
      '30': 'fa-snowflake',
      '31': 'fa-snowflake',
      '32': 'fa-snowflake',
      '33': 'fa-snowflake',
      '34': 'fa-snowflake',
      '35': 'fa-snowflake',
      '36': 'fa-snowflake',
      '37': 'fa-snowflake',
      '38': 'fa-snowflake',
      '39': 'fa-snowflake',
      // 雾
      '40': 'fa-smog',
      '41': 'fa-smog',
      '42': 'fa-smog',
      '43': 'fa-smog',
      '44': 'fa-smog',
      '45': 'fa-smog',
      '46': 'fa-smog',
      '47': 'fa-smog'
    };
    
    return iconMap[code] || 'fa-cloud';
  }
};