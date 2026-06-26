import Button from "./Button";

export default function SectionHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="text-slate-500 text-sm mt-1.5 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {secondaryAction && (
          <Button
            variant={secondaryAction.variant || "secondary"}
            icon={secondaryAction.icon}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}

        {primaryAction && (
          <Button
            variant={primaryAction.variant || "primary"}
            icon={primaryAction.icon}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}