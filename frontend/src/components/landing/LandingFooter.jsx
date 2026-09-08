import { Link } from "react-router-dom";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#enterprise" },
  { label: "Pricing", href: "#pricing" },
  { label: "API Docs", href: "#contact" },
];

const companyLinks = [
  { label: "About Us", href: "#contact" },
  { label: "Careers", href: "#contact" },
  { label: "Customers", href: "#features" },
  { label: "Blog", href: "#contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Security", href: "#enterprise" },
  { label: "Contact", href: "#contact" },
];

export default function LandingFooter() {
  const handleSubmit = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-sm">
                  payments
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                AutoBillr
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Automating the financial backbone of the world&apos;s most ambitious companies.
            </p>
            <div className="flex gap-4">
              <a href="#contact" className="text-slate-400 hover:text-primary" aria-label="Website">
                <span className="material-symbols-outlined">public</span>
              </a>
              <button type="button" className="text-slate-400 hover:text-primary" aria-label="Share">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h5 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-6">
              Product
            </h5>
            <ul className="space-y-4 text-sm text-slate-500">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-primary transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-6">
              Company
            </h5>
            <ul className="space-y-4 text-sm text-slate-500">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-primary transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-6">
              Newsletter
            </h5>
            <p className="text-xs text-slate-500 mb-4">
              Get the latest on revenue operations and billing trends.
            </p>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                required
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-primary outline-none"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-slate-500 text-xs">
            © {new Date().getFullYear()} AutoBillr Inc. All rights reserved.
          </span>
          <nav className="flex gap-8">
            {legalLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-slate-500 hover:text-slate-900 text-xs hover:underline"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}