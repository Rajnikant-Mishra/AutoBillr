import FlowStep from "./FlowStep";

function FlowConnector() {
  return (
    <div className="hidden md:flex items-center self-center flex-1">
      <div className="w-full h-px bg-border relative">
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-text-light" />
      </div>
    </div>
  );
}

export default function AutomationFlow() {
  return (
    <div className="mt-8">
      <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-5">
        Automation Logic Flow
      </h3>

      <div
        className="
          bg-gradient-to-br
          from-surface-secondary
          to-surface
          rounded-2xl
          p-8
          border border-border
          relative
          overflow-hidden
        "
      >
        {/* Decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 relative z-10">
          <FlowStep
            icon="alarm_on"
            title="Trigger"
            description="First day of Quarter"
            iconColor="text-primary"
            ringColor="ring-primary-soft"
          />

          <FlowConnector />

          <FlowStep
            icon="article"
            title="Action"
            description="Draft & Validate"
            iconColor="text-info"
            ringColor="ring-info-soft"
          />

          <FlowConnector />

          <FlowStep
            icon="forward_to_inbox"
            title="Dispatch"
            description="Email to Accounts"
            iconColor="text-warning"
            ringColor="ring-warning-soft"
          />

          <FlowConnector />

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