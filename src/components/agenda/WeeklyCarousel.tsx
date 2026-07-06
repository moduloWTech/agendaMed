import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyCarouselProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeeklyCarousel({ selectedDate, onDateSelect }: WeeklyCarouselProps) {
  // Gera os dias do mês baseado no selectedDate
  const days = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result = [];
    const today = new Date();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

      result.push({
        date: date,
        dayNumber: i.toString(),
        dayName: capitalizedDayName,
        isToday: isToday,
        isSelected: date.getDate() === selectedDate.getDate()
      });
    }
    return result;
  }, [selectedDate]);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateSelect(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateSelect(newDate);
  };

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="w-full px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Selecione o Dia</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">{capitalizedMonth}</h2>
            <span className="text-2xl font-bold text-gray-300">/</span>
            <p className="text-gray-500 font-bold text-xl mt-1">{selectedDate.getFullYear()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full bg-white shadow-sm text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full bg-white shadow-sm text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => onDateSelect(day.date)}
            className={`
              flex flex-col items-center justify-center min-w-[72px] h-[96px] rounded-full transition-all duration-300 snap-center shrink-0
              ${day.isSelected
                ? 'bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-md shadow-[var(--color-secondary)]/30 scale-105'
                : day.isToday
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-transparent text-gray-400 hover:bg-gray-50 border border-transparent hover:border-gray-100'}
            `}
          >
            <span className={`text-2xl font-bold ${day.isSelected ? 'text-[var(--color-primary)]' : day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
              {day.dayNumber}
            </span>
            <span className={`text-sm font-semibold mt-1 ${day.isSelected ? 'text-[var(--color-accent)]' : day.isToday ? 'text-blue-500' : 'text-gray-400'}`}>
              {day.dayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
