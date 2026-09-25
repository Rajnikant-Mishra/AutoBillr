import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getClientInitials = (client) =>
  client?.initials ||
  String(client?.name ?? "")
    .trim()
    .slice(0, 2)
    .toUpperCase() ||
  "CL";

const getStatusBadge = (status) => {
  switch (normalize(status)) {
    case "active":
      return "bg-primary-soft text-primary-dark border-primary/20";

    case "pending":
      return "bg-warning-soft text-warning border-warning/20";

    case "inactive":
      return "bg-surface-secondary text-text-muted border-border";

    case "archived":
      return "bg-surface-secondary text-text-light border-border";

    default:
      return "bg-surface-secondary text-text-muted border-border";
  }
};

const getProjectStatusBadge = (status) => {
  switch (normalize(status)) {
    case "active":
    case "in progress":
    case "in_progress":
      return "bg-primary-soft text-primary-dark border-primary/20";

    case "completed":
    case "complete":
      return "bg-success-soft text-success border-success/20";

    case "pending":
      return "bg-warning-soft text-warning border-warning/20";

    case "cancelled":
    case "canceled":
      return "bg-danger-soft text-danger border-danger/20";

    default:
      return "bg-surface-secondary text-text-muted border-border";
  }
};

const getInvoiceStatusBadge = (status) => {
  switch (normalize(status)) {
    case "paid":
      return "bg-success-soft text-success border-success/20";

    case "sent":
    case "scheduled":
      return "bg-info-soft text-info border-info/20";

    case "pending":
    case "draft":
      return "bg-warning-soft text-warning border-warning/20";

    case "overdue":
      return "bg-danger-soft text-danger border-danger/20";

    case "cancelled":
    case "canceled":
      return "bg-surface-secondary text-text-muted border-border";

    default:
      return "bg-surface-secondary text-text-muted border-border";
  }
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (value, currency = "INR") => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getProjectName = (project) =>
  project?.name ||
  project?.projectName ||
  project?.title ||
  "Unnamed Project";

const getInvoiceNumber = (invoice) =>
  invoice?.invoiceNumber ||
  invoice?.number ||
  invoice?.invoiceNo ||
  "Invoice";

const DetailRow = ({ label, value, valueClass = "text-text" }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="shrink-0 text-[12px] font-medium text-text-muted">
      {label}
    </span>

    <span
      className={`min-w-0 text-right text-[13px] font-semibold break-words ${valueClass}`}
    >
      {value || "—"}
    </span>
  </div>
);

const MiniStat = ({ label, value, valueClass = "text-text" }) => (
  <div className="rounded-xl bg-surface-secondary p-3">
    <div className="text-[10px] font-bold uppercase tracking-wider text-text-light">
      {label}
    </div>

    <div className={`mt-1 text-lg font-bold ${valueClass}`}>
      {value}
    </div>
  </div>
);

function SectionTitle({ children }) {
  return (
    <h4 className="mb-3 text-[11.5px] font-bold uppercase tracking-widest text-text-secondary">
      {children}
    </h4>
  );
}

function StatusBadge({ status, type = "client" }) {
  const className =
    type === "project"
      ? getProjectStatusBadge(status)
      : type === "invoice"
        ? getInvoiceStatusBadge(status)
        : getStatusBadge(status);

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full border px-2.5 py-1
        text-[10px] font-bold uppercase tracking-wider
        ${className}
      `}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
      />

      {status || "Unknown"}
    </span>
  );
}

function ProjectItem({ project }) {
  const status = project?.status || "Pending";

  return (
    <div className="rounded-xl border border-border-light bg-surface p-4 transition hover:border-border hover:bg-surface-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-text">
            {getProjectName(project)}
          </div>

          {project?.description && (
            <div className="mt-1 line-clamp-2 text-[11px] text-text-muted">
              {project.description}
            </div>
          )}
        </div>

        <StatusBadge status={status} type="project" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-light">
            Billing
          </div>

          <div className="mt-0.5 text-[12px] font-semibold text-text-secondary">
            {project?.billingType ||
              project?.billing ||
              project?.billingMethod ||
              "—"}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-light">
            Amount
          </div>

          <div className="mt-0.5 text-[12px] font-semibold text-text-secondary">
            {project?.amount != null
              ? formatAmount(
                  project.amount,
                  project?.currency || "INR"
                )
              : project?.totalAmount != null
                ? formatAmount(
                    project.totalAmount,
                    project?.currency || "INR"
                  )
                : "—"}
          </div>
        </div>
      </div>

      {(project?.startDate || project?.endDate || project?.nextInvoice) && (
        <div className="mt-3 border-t border-border-light pt-3">
          <div className="grid grid-cols-2 gap-3">
            {project?.startDate && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-light">
                  Start Date
                </div>

                <div className="mt-0.5 text-[12px] font-medium text-text-secondary">
                  {formatDate(project.startDate)}
                </div>
              </div>
            )}

            {project?.endDate && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-light">
                  End Date
                </div>

                <div className="mt-0.5 text-[12px] font-medium text-text-secondary">
                  {formatDate(project.endDate)}
                </div>
              </div>
            )}

            {project?.nextInvoice && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-light">
                  Next Invoice
                </div>

                <div className="mt-0.5 text-[12px] font-medium text-text-secondary">
                  {formatDate(project.nextInvoice)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceItem({ invoice }) {
  const status = invoice?.status || "Draft";

  const amount =
    invoice?.totalAmount ??
    invoice?.total ??
    invoice?.grandTotal ??
    invoice?.amount;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border-light bg-surface p-3.5 transition hover:border-border hover:bg-surface-hover">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold text-text">
          {getInvoiceNumber(invoice)}
        </div>

        <div className="mt-1 text-[11px] text-text-muted">
          {invoice?.issueDate
            ? `Issued ${formatDate(invoice.issueDate)}`
            : invoice?.createdAt
              ? formatDate(invoice.createdAt)
              : "No issue date"}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {amount != null && (
          <span className="text-[13px] font-bold tabular-nums text-text">
            {formatAmount(
              amount,
              invoice?.currency || "INR"
            )}
          </span>
        )}

        <StatusBadge status={status} type="invoice" />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-secondary px-4 py-6 text-center">
      <span className="material-symbols-outlined text-2xl text-text-light">
        {icon}
      </span>

      <div className="mt-2 text-[13px] font-semibold text-text-secondary">
        {title}
      </div>

      <div className="mt-1 text-[11px] text-text-muted">
        {description}
      </div>
    </div>
  );
}

export default function ClientDetailDrawer({
  isOpen,
  onClose,
  client,
  onEdit,
}) {
  if (!client) return null;

  const initials = getClientInitials(client);
  const status = client?.status || "inactive";

  /*
   * Related data can come from the backend in any of these common forms:
   *
   * client.projects
   * client.invoices
   *
   * or Prisma-style relation names if you use them.
   */
  const projects = Array.isArray(client?.projects)
    ? client.projects
    : [];

  const invoices = Array.isArray(client?.invoices)
    ? client.invoices
    : [];

  const activeProjects = projects.filter(
    (project) =>
      !["completed", "cancelled", "canceled", "archived"].includes(
        normalize(project?.status)
      )
  );

  const paidInvoices = invoices.filter(
    (invoice) => normalize(invoice?.status) === "paid"
  );

  const contactName =
    client?.contactName ||
    client?.contact?.name ||
    client?.contact?.fullName;

  const address = client?.billingAddress || client?.address;

  const city = client?.city;
  const state = client?.stateRegion || client?.state;
  const postalCode = client?.postalCode || client?.pincode;
  const country = client?.country;

  const fullAddress = [address, city, state, postalCode, country]
    .filter(Boolean)
    .join(", ");

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Client Details"
      width="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              onEdit?.(client);
            }}
          >
            Edit
          </Button>

          <Button
            icon={
              <span className="material-symbols-outlined text-[16px]">
                add
              </span>
            }
          >
            New Invoice
          </Button>
        </div>
      }
    >
      {/* =========================================================
          CLIENT HEADER
      ========================================================= */}
      <div className="-mx-6 -mt-6 mb-5 border-b border-border-light bg-gradient-to-br from-primary-soft to-surface px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={`
              grid h-14 w-14 shrink-0 place-items-center
              rounded-2xl border border-border
              text-xs font-bold
              ${client?.color || "bg-primary-soft text-primary-dark"}
            `}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-text">
              {client?.name || "Unknown Client"}
            </h2>

            <p className="truncate text-sm text-text-muted">
              {client?.email || "No email"}
            </p>

            <div className="mt-2">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BODY
      ========================================================= */}
      <div className="space-y-6">

        {/* =======================================================
            SUMMARY
        ======================================================= */}
        <div>
          <SectionTitle>Overview</SectionTitle>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat
              label="Projects"
              value={projects.length}
            />

            <MiniStat
              label="Active"
              value={activeProjects.length}
              valueClass="text-primary"
            />

            <MiniStat
              label="Paid"
              value={paidInvoices.length}
              valueClass="text-success"
            />
          </div>
        </div>

        {/* =======================================================
            CONTACT INFORMATION
        ======================================================= */}
        <div>
          <SectionTitle>Contact Information</SectionTitle>

          <div className="rounded-xl bg-surface-secondary px-4 py-1">
            <DetailRow
              label="Contact Person"
              value={contactName}
            />

            <DetailRow
              label="Email"
              value={client?.email}
            />

            <DetailRow
              label="Phone"
              value={client?.phone}
            />

            <DetailRow
              label="Website"
              value={client?.website}
            />

            <DetailRow
              label="Industry"
              value={client?.industry}
            />

            <DetailRow
              label="Client Tier"
              value={client?.tier}
            />
          </div>
        </div>

        {/* =======================================================
            ADDRESS
        ======================================================= */}
        <div>
          <SectionTitle>Address</SectionTitle>

          <div className="rounded-xl bg-surface-secondary px-4 py-1">
            <DetailRow
              label="Address"
              value={address}
            />

            <DetailRow
              label="City"
              value={city}
            />

            <DetailRow
              label="State"
              value={state}
            />

            <DetailRow
              label="Pincode"
              value={postalCode}
            />

            <DetailRow
              label="Country"
              value={country}
            />

            {fullAddress && (
              <div className="border-t border-border-light py-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-text-light">
                  Full Address
                </div>

                <div className="text-[12px] leading-5 text-text-secondary">
                  {fullAddress}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================
            ACCOUNT / BILLING SETTINGS
            No MRR / Billing / Next Invoice here.
            Those belong to Projects.
        ======================================================= */}
        <div>
          <SectionTitle>Account Settings</SectionTitle>

          <div className="rounded-xl bg-surface-secondary px-4 py-1">
            <DetailRow
              label="Tax ID"
              value={client?.taxId}
            />

            <DetailRow
              label="Auto Charge"
              value={
                client?.autoCharge ??
                client?.automation?.autoCharge
                  ? "Enabled"
                  : "Disabled"
              }
              valueClass={
                client?.autoCharge ||
                client?.automation?.autoCharge
                  ? "text-primary"
                  : "text-text-muted"
              }
            />

            <DetailRow
              label="Reminders"
              value={
                client?.reminders
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <DetailRow
              label="Portal Access"
              value={
                client?.portalAccess
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <DetailRow
              label="Welcome Email"
              value={
                client?.welcomeEmail
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </div>
        </div>

        {/* =======================================================
            RELATED PROJECTS
        ======================================================= */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Related Projects</SectionTitle>

            {projects.length > 0 && (
              <span className="rounded-full bg-surface-secondary px-2 py-1 text-[10px] font-bold text-text-muted">
                {projects.length}
              </span>
            )}
          </div>

          {projects.length > 0 ? (
            <div className="space-y-2.5">
              {projects.map((project) => (
                <ProjectItem
                  key={
                    project?._id ||
                    project?.id ||
                    getProjectName(project)
                  }
                  project={project}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="folder_open"
              title="No projects found"
              description="Projects associated with this client will appear here."
            />
          )}
        </div>

        {/* =======================================================
            RELATED INVOICES
        ======================================================= */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Related Invoices</SectionTitle>

            {invoices.length > 0 && (
              <span className="rounded-full bg-surface-secondary px-2 py-1 text-[10px] font-bold text-text-muted">
                {invoices.length}
              </span>
            )}
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-2.5">
              {invoices.slice(0, 5).map((invoice) => (
                <InvoiceItem
                  key={
                    invoice?._id ||
                    invoice?.id ||
                    getInvoiceNumber(invoice)
                  }
                  invoice={invoice}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="receipt_long"
              title="No invoices found"
              description="Invoices associated with this client will appear here."
            />
          )}

          {invoices.length > 5 && (
            <div className="mt-2 text-center text-[11px] font-medium text-text-muted">
              Showing 5 of {invoices.length} invoices
            </div>
          )}
        </div>

        {/* =======================================================
            NOTES
        ======================================================= */}
        {client?.notes && (
          <div>
            <SectionTitle>Notes</SectionTitle>

            <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
              <p className="whitespace-pre-wrap text-[12px] leading-5 text-text-secondary">
                {client.notes}
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            TAGS
        ======================================================= */}
        {Array.isArray(client?.tags) && client.tags.length > 0 && (
          <div>
            <SectionTitle>Tags</SectionTitle>

            <div className="flex flex-wrap gap-2">
              {client.tags.map((tag, index) => {
                const tagName =
                  typeof tag === "string"
                    ? tag
                    : tag?.name || tag?.label || "";

                if (!tagName) return null;

                return (
                  <span
                    key={`${tagName}-${index}`}
                    className="rounded-full border border-border bg-surface-secondary px-2.5 py-1 text-[10px] font-semibold text-text-secondary"
                  >
                    {tagName}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* =======================================================
            CREATED / UPDATED
        ======================================================= */}
        {(client?.createdAt || client?.updatedAt) && (
          <div>
            <SectionTitle>Record Information</SectionTitle>

            <div className="rounded-xl bg-surface-secondary px-4 py-1">
              {client?.createdAt && (
                <DetailRow
                  label="Created"
                  value={formatDate(client.createdAt)}
                />
              )}

              {client?.updatedAt && (
                <DetailRow
                  label="Last Updated"
                  value={formatDate(client.updatedAt)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </RightDrawer>
  );
}