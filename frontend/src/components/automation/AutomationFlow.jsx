import FlowStep from "./FlowStep";

export default function AutomationFlow() {
  return (
    <div className="mt-8">
      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-5">
        Automation Logic Flow
      </h3>

      <div
        className="
          bg-gradient-to-br
          from-slate-100
          to-slate-50
          rounded-2xl
          p-8
          border
          border-slate-200
          relative
          overflow-hidden
        "
      >
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 relative z-10">
          {/* Trigger */}
          <FlowStep
            icon="alarm_on"
            title="Trigger"
            description="First day of Quarter"
            iconColor="text-teal-600"
            ringColor="ring-teal-50"
          />

          <div className="hidden md:flex items-center self-center flex-1">
            <div className="w-full h-px bg-slate-300 relative">
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
          </div>

          <FlowStep
            icon="article"
            title="Action"
            description="Draft & Validate"
            iconColor="text-indigo-600"
            ringColor="ring-indigo-50"
          />

          <div className="hidden md:flex items-center self-center flex-1">
            <div className="w-full h-px bg-slate-300 relative">
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
          </div>

          <FlowStep
            icon="forward_to_inbox"
            title="Dispatch"
            description="Email to Accounts"
            iconColor="text-amber-600"
            ringColor="ring-amber-50"
          />

          <div className="hidden md:flex items-center self-center flex-1">
            <div className="w-full h-px bg-slate-300 relative">
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
          </div>

          <FlowStep
            icon="task_alt"
            title="Settlement"
            description="Payment Collection"
            active
          />
        </div>
      </div>
    </div>
  );
}