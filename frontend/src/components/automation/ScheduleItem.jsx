export default function ScheduleItem({
  date,
  invoice,
  amount,
  upcoming = false,
}) {
  return (
    <div
      className={`relative flex items-center gap-5 transition-all ${
        !upcoming ? "opacity-50" : ""
      }`}
    >
      {/* Timeline Dot */}
      <div
        className={`
          w-7 h-7 rounded-full
          grid place-items-center
          flex-none z-10
          ring-4 ring-white
          ${
            upcoming
              ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
              : "bg-slate-200 text-slate-400"
          }
        `}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "14px" }}
        >
          {upcoming ? "play_arrow" : "schedule"}
        </span>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[86px]">
        <div className="flex justify-between items-start mb-1">
          <span className="font-bold text-slate-900 text-[13px]">
            {date}
          </span>

          {upcoming && (
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">
              Upcoming
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500">
          {invoice}
        </div>

        <div className="mt-2 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Total Amount
          </span>

          <span className="font-bold text-slate-900 tabular-nums">
            {format(Number(amount || 0))}
          </span>
        </div>
      </div>
    </div>
  );
}