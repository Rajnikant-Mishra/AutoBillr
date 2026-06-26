import { Link, useLocation } from "react-router-dom";

const routeNames = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/invoices": "Invoices",
  "/invoice-composer": "Invoice Composer",
  "/clients": "Clients",
  "/projects": "Projects",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/team": "Team & Permissions",
  "/pricing": "Pricing",
};

export default function Breadcrumb() {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean);

  return (
    <nav className="flex items-center text-sm text-slate-500">
      <Link
        to="/dashboard"
        className="hover:text-teal-600 transition"
      >
        AutoBillr
      </Link>

      {pathnames.map((value, index) => {
        const currentPath =
          "/" + pathnames.slice(0, index + 1).join("/");

        const isLast =
          index === pathnames.length - 1;

        const pageName =
          routeNames[currentPath] ||
          value
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) =>
              c.toUpperCase()
            );

        return (
          <div
            key={currentPath}
            className="flex items-center"
          >
            <span
              className="material-symbols-outlined mx-1"
              style={{ fontSize: "14px" }}
            >
              chevron_right
            </span>

            {isLast ? (
              <span className="font-semibold text-slate-900">
                {pageName}
              </span>
            ) : (
              <Link
                to={currentPath}
                className="hover:text-teal-600 transition"
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