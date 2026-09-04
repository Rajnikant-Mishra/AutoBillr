import { Link, useLocation } from "react-router-dom";

const ROUTE_NAMES = {
  "/dashboard": "Dashboard",
  "/invoice": "Invoices",
  "/composer": "Invoice Composer",
  "/clients": "Clients",
  "/projects": "Projects",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/team": "Team & Permissions",
  "/pricing": "Pricing",
  "/automation": "Recurring Billing",
};

function formatSegment(value) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumb() {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm text-slate-500"
    >
      <Link
        to="/dashboard"
        className="hover:text-primary transition-colors"
      >
        AutoBillr
      </Link>

      {pathnames.map((value, index) => {
        const currentPath =
          "/" +
          pathnames
            .slice(0, index + 1)
            .join("/");

        const isLast =
          index === pathnames.length - 1;

        const pageName =
          ROUTE_NAMES[currentPath] ||
          formatSegment(value);

        return (
          <div
            key={currentPath}
            className="flex items-center"
          >
            <span
              className="material-symbols-outlined mx-1 text-[14px]"
              aria-hidden="true"
            >
              chevron_right
            </span>

            {isLast ? (
              <span
                aria-current="page"
                className="font-semibold text-slate-900"
              >
                {pageName}
              </span>
            ) : (
              <Link
                to={currentPath}
                className="hover:text-primary transition-colors"
              >
                {pageName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}