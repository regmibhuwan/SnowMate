'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayMood {
  day: string;
  mood: string;
  date?: string;
  icon?: string;
}

interface WeekCarouselProps {
  weeklyMoods: DayMood[];
}

export default function WeekCarousel({ weeklyMoods }: WeekCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative mb-6">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2 px-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {weeklyMoods.map((day, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-64 snap-center"
          >
            <div className="glass rounded-2xl p-5 shadow-lg h-full hover:shadow-xl transition-all duration-300 min-h-[140px] flex flex-col">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                {day.date || day.day}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-2 flex-1 flex items-center">
                {day.mood}
              </div>
              {day.icon && (
                <div className="text-4xl mt-3">
                  {day.icon}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Scroll buttons - hidden on mobile, visible on desktop */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-lg"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-lg"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}

