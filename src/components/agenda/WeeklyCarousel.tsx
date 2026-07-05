
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
    <div className="w-full bg-white px-4 py-6 shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Novembro</h2>
          <p className="text-gray-500 font-medium">Hoje é Terça, 13</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {daysOfWeek.map((day, idx) => (
          <button
            key={idx}
            className={`
              flex flex-col items-center justify-center min-w-[72px] h-[88px] rounded-2xl transition-colors snap-center
              ${day.isToday
                ? 'bg-[var(--color-primary)] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}
            `}
          >
            <span className={`text-sm font-semibold mb-1 ${day.isToday ? 'text-blue-100' : 'text-gray-400'}`}>
              {day.dayName}
            </span>
            <span className={`text-2xl font-bold ${day.isToday ? 'text-white' : 'text-gray-800'}`}>
              {day.date}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
