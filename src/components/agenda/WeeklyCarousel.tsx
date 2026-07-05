
const daysOfWeek = [
  { dayName: 'Seg', date: '12', isToday: false },
  { dayName: 'Ter', date: '13', isToday: true },
  { dayName: 'Qua', date: '14', isToday: false },
  { dayName: 'Qui', date: '15', isToday: false },
  { dayName: 'Sex', date: '16', isToday: false },
  { dayName: 'Sáb', date: '17', isToday: false },
  { dayName: 'Dom', date: '18', isToday: false },
];

export function WeeklyCarousel() {
  return (
    <div className="w-full px-6 py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Select Date</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">Novembro</h2>
            <span className="text-2xl font-bold text-gray-300">/</span>
            <p className="text-gray-500 font-bold text-xl mt-1">13</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {daysOfWeek.map((day, idx) => (
          <button
            key={idx}
            className={`
              flex flex-col items-center justify-center min-w-[72px] h-[96px] rounded-full transition-all duration-300 snap-center
              ${day.isToday
                ? 'bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-md shadow-[var(--color-secondary)]/30 scale-105'
                : 'bg-transparent text-gray-400 hover:bg-gray-50 border border-transparent hover:border-gray-100'}
            `}
          >
            <span className={`text-2xl font-bold ${day.isToday ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
              {day.date}
            </span>
            <span className={`text-sm font-semibold mt-1 ${day.isToday ? 'text-[var(--color-accent)]' : 'text-gray-400'}`}>
              {day.dayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
