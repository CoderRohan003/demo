import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useDate } from '@/context/DateContext';

// Helper function to get all days in a given month
const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const DateSlider = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const [displayedDates, setDisplayedDates] = useState<Date[]>([]);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [isFetching, setIsFetching] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Initialize or reset the date slider when the selectedDate changes
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const initialDates = getDaysInMonth(year, month);
    setDisplayedDates(initialDates);
    setDateRange({ start: initialDates[0], end: initialDates[initialDates.length - 1] });
  }, [selectedDate]);

  // Maintain scroll position when prepending dates
  useLayoutEffect(() => {
    if (scrollContainerRef.current && scrollPosition > 0) {
      scrollContainerRef.current.scrollLeft = scrollPosition;
      setScrollPosition(0);
    }
  }, [displayedDates, scrollPosition]);

  const handleScroll = () => {
    if (isFetching || !scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Load previous month
    if (scrollLeft < 50) {
      setIsFetching(true);
      const prevMonth = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth() - 1, 1);
      const newDates = getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());

      const oldScrollWidth = scrollContainerRef.current.scrollWidth;
      setDisplayedDates(prev => [...newDates, ...prev]);
      setDateRange(prev => ({ ...prev, start: newDates[0] }));

      setTimeout(() => {
        if (scrollContainerRef.current) {
          const newScrollWidth = scrollContainerRef.current.scrollWidth;
          setScrollPosition(newScrollWidth - oldScrollWidth);
        }
        setIsFetching(false);
      }, 0);
    }

    // Load next month
    if (scrollWidth - scrollLeft - clientWidth < 50) {
      setIsFetching(true);
      const nextMonth = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth() + 1, 1);
      const newDates = getDaysInMonth(nextMonth.getFullYear(), nextMonth.getMonth());

      setDisplayedDates(prev => [...prev, ...newDates]);
      setDateRange(prev => ({ ...prev, end: newDates[newDates.length - 1] }));
      setTimeout(() => setIsFetching(false), 500);
    }
  };

  return (
    <section className="mb-6">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        // I've added the new 'scrollbar-hide' class here
        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
      >
        {displayedDates.map((date, index) => (
          <button
            key={index}
            onClick={() => setSelectedDate(date)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg w-20 h-24 flex-shrink-0 transition-colors
              ${selectedDate.toDateString() === date.toDateString() ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <span className="text-sm">{date.toLocaleString('default', { month: 'short' })}</span>
            <span className="text-2xl font-bold">{date.getDate()}</span>
            <span className="text-xs">{date.toLocaleString('default', { weekday: 'short' })}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DateSlider;