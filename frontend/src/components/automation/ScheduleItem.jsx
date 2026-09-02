import useCurrency from "../../hooks/useCurrency";

export default function ScheduleItem({
  date,
  invoice,
  amount,
  upcoming = false,
}) {
  const { format } = useCurrency();

  return (
    <div
      className={`
        relative flex items-center gap-5
        transition-opacity duration-fast
        ${!upcoming ? "opacity-50" : ""}
      `}
    >
      {/* Timeline Dot */}
      <div
        className={`
          w-7 h-7 rounded-full
          grid place-items-center
          flex-none z-10
          ring-4 ring-surface
          ${
            upcoming
              ? "bg-primary text-text-inverse shadow-lg shadow-primary/30"
              : "bg-surface-secondary text-text-light"
          }
        `}
      >
        <span className="material-symbols-outlined text-[14px]" aria-hidden>
          {upcoming ? "play_arrow" : "schedule"}
        </span>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-surface-secondary p-4 rounded-xl border border-border-light min-h-[86px]">
        <div className="flex justify-between items-start gap-2 mb-1">
          <span className="font-bold text-text text-[13px]">{date}</span>

          {upcoming && (
            <span className="text-[10px] font-bold text-primary-dark bg-primary-soft px-2 py-0.5 rounded uppercase shrink-0">
              Upcoming
            </span>
          )}
        </div>

        <div className="text-xs text-text-muted">{invoice}</div>

        <div className="mt-2 flex justify-between items-center text-xs">
          <span className="text-text-light">Total Amount</span>
          <span className="font-bold text-text tabular-nums">
            {format(Number(amount || 0))}
          </span>
        </div>
      </div>
    </div>
  );
}