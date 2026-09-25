import Button from "./Button";

export default function SectionHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="text-slate-500 text-sm mt-1.5 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {(secondaryAction || primaryAction) && (
        <div className="flex items-center gap-2 flex-wrap">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "secondary"}
              size={secondaryAction.size || "md"}
              icon={secondaryAction.icon}
              disabled={secondaryAction.disabled}
              loading={secondaryAction.loading}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}

          {primaryAction && (
            <Button
              variant={primaryAction.variant || "primary"}
              size={primaryAction.size || "md"}
              icon={primaryAction.icon}
              disabled={primaryAction.disabled}
              loading={primaryAction.loading}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}