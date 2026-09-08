// import React, { useEffect } from "react";
// import { Link } from "react-router-dom";
// import LandingNavbar from "../../components/landing/LandingNavbar";
// import LandingFooter from "../../components/landing/LandingFooter";
// // import "../../styles/theme.css";
// // import "../../styles/landing.css";

// export default function LandingPage() {
//   useEffect(() => {
//     const handleAnchorClick = (e) => {
//       const link = e.target.closest('a[href^="#"]');
//       if (!link) return;
//       const id = link.getAttribute("href");
//       if (!id || id === "#") return;
//       const el = document.querySelector(id);
//       if (!el) return;
//       e.preventDefault();
//       el.scrollIntoView({ behavior: "smooth", block: "start" });
//       window.history.replaceState(null, "", id);
//     };
//     document.addEventListener("click", handleAnchorClick);
//     return () => document.removeEventListener("click", handleAnchorClick);
//   }, []);

//   return (
//     <div className="landing-page bg-surface font-body-md text-on-surface antialiased">
//       <LandingNavbar />

//       <main className="pt-16">
//         {/* ========== HERO ========== */}
//         <section className="relative overflow-hidden bg-surface py-24 px-8">
//           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//             {/* Left */}
//             <div className="z-10">
//               <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/10 text-primary text-sm mb-6 border border-primary-container/20">
//                 New: AI-Powered Revenue Leakage Detection
//               </span>

//            <h1 className="text-[2rem] sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight max-w-[15ch] lg:max-w-none">
//   Automate Your{" "}
//   <span className="text-primary">Enterprise Billing</span> Lifecycle.
// </h1>

//               <p className="text-x text-on-surface-variant mb-10 max-w-lg leading-relaxed">
//                 Scale your revenue operations with the industry&apos;s most robust
//                 billing engine. Eliminate manual errors, accelerate cash flow,
//                 and focus on growth.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Link
//                   to="/register"
//                   className="px-8 py-4 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2"
//                 >
//                   Start Free Trial
//                   <span className="material-symbols-outlined">arrow_forward</span>
//                 </Link>
//                 <a
//                   href="#contact"
//                   className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
//                 >
//                   Schedule Demo
//                 </a>
//               </div>

//               <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
//                 <div className="flex -space-x-2">
//                   {[
//                     "https://lh3.googleusercontent.com/aida-public/AB6AXuA6IhZr-JDA0VwIzYA5FhjOZ3GCwl-TuCJzMWTAwPzuidlYY4ZMHZWO7PrvmQt3OQ3wdpKsXVFkWNvllxY0WcUG6RKF6FfFjjSEKDMPUyo8w_xtKClfLEI8QgGC2ceMf4NAQ9xx0bXafDnxmRwxSBnqeugdWCa6lFtaiWCQXTSoYArbNjD1GBnoc8lFrlFIKxbr_0UOLaJrCC6ZOWLYVhOaA7Kc0aggw-3mYUY-BuW3yHYJbP7Ih1yJ06jlMXKyKd37R86bMQJf364",
//                     "https://lh3.googleusercontent.com/aida-public/AB6AXuCjvBe3ah-rT3YferApLEoIKFoRqGoV1uVZsxc7Lz-wXNWPG_zKV5XlgRnMxYW83fvTyC0zp3mVO8hulNlkutqbC_rylju6XAlA2X_2V3g1UErnNGqrnHcZ_7pNZXrrInRwaqkdKQVkJ3HoDcIm3bI3ERqt95m5DHrNJXB5_Spm5PhZXM50PpjqCF2YWjjLgw1kgSRwg8HsL3VXqOGzcrEBVzqNAv6aPnkoU5g8WQuTV115x99464cRHyc2_dCmII7NOZhR2_bLs5s",
//                     "https://lh3.googleusercontent.com/aida-public/AB6AXuB8FW1k-f3csTa9KEVc_oQG2q4Pi5S_rpxBhIhvJDMP5HIEfXVBetxmSXfhCRA8-die3DeVX_pJbdmcVgtpzKQEcrqeFPRxSfskiH0L3gn-O5BpfGUt7-y6nXh5MxZjeBVOktRrtM_UDbBlAoC2bkhu7kQo2QW8q2941HH5RFT3Y6c7uYLp3UBZg4UA3BfFZigy6QzvobzWBvmvHfIhD70rZ0rTarYNqqq03NBPvyPU4p_q4o0Gp-FCGmxU6AfY1AKLWBbtAZVAhFU",
//                   ].map((src, i) => (
//                     <img
//                       key={i}
//                       className="w-8 h-8 rounded-full border-2 border-white"
//                       src={src}
//                       alt=""
//                       loading="lazy"
//                     />
//                   ))}
//                 </div>
//                 <p>Trusted by 2,000+ finance teams globally</p>
//               </div>
//             </div>

//             {/* Right – Dashboard Preview */}
//             <div className="relative">
//               <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full" />
//               <div className="relative bg-white/70 border border-white/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
//                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
//                   <div className="flex gap-1.5">
//                     <div className="w-3 h-3 rounded-full bg-red-400" />
//                     <div className="w-3 h-3 rounded-full bg-yellow-400" />
//                     <div className="w-3 h-3 rounded-full bg-green-400" />
//                   </div>
//                   <div className="text-xs font-medium text-slate-400">
//                     Financial Dashboard — Q4 Forecast
//                   </div>
//                 </div>

//                 <div className="p-8">
//                   <div className="grid grid-cols-2 gap-4 mb-8">
//                     <div className="p-4 bg-teal-50 rounded-xl">
//                       <div className="text-xs text-teal-600 font-bold mb-1">
//                         REVENUE GROWTH
//                       </div>
//                       <div className="text-2xl font-bold text-slate-900">
//                         +24.8%
//                       </div>
//                     </div>
//                     <div className="p-4 bg-slate-50 rounded-xl">
//                       <div className="text-xs text-slate-500 font-bold mb-1">
//                         CHURN RATE
//                       </div>
//                       <div className="text-2xl font-bold text-slate-900">
//                         0.42%
//                       </div>
//                     </div>
//                   </div>

//                   {/* Chart bars – fixed with inline heights */}
//                   <div className="h-48 w-full bg-slate-50 rounded-xl flex items-end px-4 gap-2">
//                     <div
//                       className="flex-1 bg-primary/20 rounded-t-lg"
//                       style={{ height: "50%" }}
//                     />
//                     <div
//                       className="flex-1 bg-primary/40 rounded-t-lg"
//                       style={{ height: "66%" }}
//                     />
//                     <div
//                       className="flex-1 bg-primary/60 rounded-t-lg"
//                       style={{ height: "75%" }}
//                     />
//                     <div
//                       className="flex-1 bg-primary rounded-t-lg"
//                       style={{ height: "100%" }}
//                     />
//                     <div
//                       className="flex-1 bg-primary/80 rounded-t-lg"
//                       style={{ height: "80%" }}
//                     />
//                     <div
//                       className="flex-1 bg-primary/50 rounded-t-lg"
//                       style={{ height: "66%" }}
//                     />
//                     <div
//                       className="flex-1 bg-primary/30 rounded-t-lg"
//                       style={{ height: "50%" }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ========== SOCIAL PROOF ========== */}
//         <section className="py-12 border-y border-slate-200 bg-white">
//           <div className="max-w-7xl mx-auto px-8">
//             <p className="text-center text-slate-400 font-semibold uppercase tracking-widest text-xs mb-8">
//               Empowering High-Growth Enterprise Teams
//             </p>
//             <div className="flex flex-wrap justify-center items-center gap-6 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
//               {["CLOUDSCALE", "FINTECH_IO", "DATAFLOW", "PRISM_HQ", "NEXUS_"].map(
//                 (name) => (
//                   <span key={name} className="text-xl font-black text-slate-800">
//                     {name}
//                   </span>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         {/* ========== BENTO ========== */}
//         <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//               Precision Billing at Every Step
//             </h2>
//             <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
//               Our comprehensive suite is built to handle the complexities of
//               modern enterprise revenue structures.
//             </p>
//           </div>

//           <div className="grid grid-cols-12 gap-6">
//             {/* Efficiency */}
//             <div className="col-span-12 md:col-span-8 bg-white/70 p-10 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between backdrop-blur-sm">
//               <div>
//                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
//                   <span className="material-symbols-outlined text-[32px]">
//                     bolt
//                   </span>
//                 </div>
//                 <h3 className="text-2xl font-bold text-slate-900 mb-4">
//                   Unmatched Efficiency
//                 </h3>
//                 <p className="text-on-surface-variant max-w-md mb-8">
//                   Reduce your monthly close process from days to minutes.
//                   AutoBillr syncs directly with your CRM to generate error-free
//                   invoices automatically.
//                 </p>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
//                   <div className="text-primary font-bold mb-1">98%</div>
//                   <div className="text-xs text-slate-500 uppercase tracking-tight">
//                     Fewer Manual Errors
//                   </div>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
//                   <div className="text-primary font-bold mb-1">12hrs</div>
//                   <div className="text-xs text-slate-500 uppercase tracking-tight">
//                     Saved Weekly / User
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Security */}
//             <div className="col-span-12 md:col-span-4 bg-slate-900 p-10 rounded-2xl text-white flex flex-col items-center text-center justify-center">
//               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
//                 <span className="material-symbols-outlined text-green-500 text-[500px]">
//                   shield_lock
//                 </span>
//               </div>
//               <h3 className="text-xl font-bold mb-4 text-white">Bank-Grade Security</h3>
//               <p className="text-slate-400 text-sm">
//                 SOC2 Type II, GDPR, and PCI-DSS Level 1 compliant. Your financial
//                 data is encrypted and protected at every layer.
//               </p>
//             </div>

//             {/* Transparency */}
//             <div className="col-span-12 md:col-span-4 bg-white/70 p-10 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-sm">
//               <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
//                 <span className="material-symbols-outlined text-[32px]">
//                   visibility
//                 </span>
//               </div>
//               <h3 className="text-xl font-bold text-slate-900 mb-4">
//                 Real-time Transparency
//               </h3>
//               <p className="text-on-surface-variant text-sm">
//                 Real-time dashboards for both you and your customers. Zero
//                 friction, total clarity on every line item.
//               </p>
//             </div>

//             {/* Automation */}
//             <div className="col-span-12 md:col-span-8 bg-surface-container p-10 rounded-2xl overflow-hidden relative">
//               <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
//                 <div className="flex-1">
//                   <h3 className="text-2xl font-bold text-slate-900 mb-4">
//                     Custom Automation Logic
//                   </h3>
//                   <p className="text-on-surface-variant">
//                     Build complex billing workflows with our visual node builder.
//                     If this, then that — specifically for your financial stack.
//                   </p>
//                 </div>
//                 <div className="flex-1 flex flex-col gap-4">
//                   <div className="bg-white px-6 py-4 rounded-full border border-slate-200 flex items-center gap-4 shadow-sm self-end">
//                     <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
//                       <span className="material-symbols-outlined text-white text-[20px]">
//                         smart_toy
//                       </span>
//                     </div>
//                     <span className="font-medium text-slate-700">
//                       Trigger: Contract Signed
//                     </span>
//                   </div>
//                   <div className="w-px h-8 bg-slate-300 self-end mr-24" />
//                   <div className="bg-white px-6 py-4 rounded-full border border-slate-200 flex items-center gap-4 shadow-sm">
//                     <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//                       <span className="material-symbols-outlined text-white text-[20px]">
//                         receipt_long
//                       </span>
//                     </div>
//                     <span className="font-medium text-slate-700">
//                       Action: Generate Invoice
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
//                 <span className="material-symbols-outlined text-[300px]">
//                   account_tree
//                 </span>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ========== HOW IT WORKS ========== */}
//         <section id="how-it-works" className="py-24 bg-white px-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
//                 Seamless Integration in 3 Steps
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
//               {[
//                 {
//                   num: "01",
//                   title: "Connect Your Stack",
//                   text: "Native integrations with Salesforce, HubSpot, Stripe, and NetSuite. Connect in minutes with zero code.",
//                 },
//                 {
//                   num: "02",
//                   title: "Define Your Rules",
//                   text: "Set up subscription tiers, usage-based triggers, and regional tax compliance once.",
//                 },
//                 {
//                   num: "03",
//                   title: "Automate & Scale",
//                   text: "Watch as invoices are sent, payments are reconciled, and reports are generated automatically.",
//                 },
//               ].map((step) => (
//                 <div
//                   key={step.num}
//                   className="relative p-8 rounded-2xl hover:bg-slate-50 transition-colors"
//                 >
//                   <div className="text-8xl font-black text-slate-100 absolute top-4 left-4 z-0">
//                     {step.num}
//                   </div>
//                   <div className="relative z-10">
//                     <h4 className="text-xl font-bold text-slate-900 mb-4">
//                       {step.title}
//                     </h4>
//                     <p className="text-on-surface-variant">{step.text}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ========== CTA ========== */}
//         <section id="contact" className="py-24 px-8">
//           <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 to-transparent opacity-50" />
//             <div className="relative z-10">
//               <h2 className="text-4xl md:text-5xl text-on-primary mb-8 leading-tight font-bold">
//                 Ready to transform your billing operation?
//               </h2>
//               <p className="text-on-primary-container text-lg mb-10 max-w-2xl mx-auto">
//                 Join the future of financial automation. No credit card required
//                 for your first 14 days.
//               </p>
//               <div className="flex flex-col sm:flex-row justify-center gap-4">
//                 <Link
//                   to="/register"
//                   className="px-10 py-5 bg-white text-primary rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl"
//                 >
//                   Get Started Now
//                 </Link>
//                 <a
//                   href="#enterprise"
//                   className="px-10 py-5 bg-primary-container/30 text-on-primary border border-white/20 rounded-xl font-bold text-lg hover:bg-primary-container/50 transition-all"
//                 >
//                   Talk to Sales
//                 </a>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <LandingFooter />
//     </div>
//   );
// }






















import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";

// Make sure your global design-system CSS is imported once
// globally, preferably in main.jsx/App.jsx.
// import "../../styles/theme.css";

export default function LandingPage() {
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]');

      if (!link) return;

      const id = link.getAttribute("href");

      if (!id || id === "#") return;

      const el = document.querySelector(id);

      if (!el) return;

      e.preventDefault();

      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.history.replaceState(null, "", id);
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener(
        "click",
        handleAnchorClick
      );
    };
  }, []);

  return (
    <div
      className="
        min-h-screen
        bg-background
        text-text
        antialiased
        font-sans
      "
      style={{
        fontFamily:
          "var(--font-family-base)",
      }}
    >
      <LandingNavbar />

      <main className="pt-16">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden bg-background py-20 sm:py-24 px-5 sm:px-8">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT */}

            <div className="relative z-10">
              {/* Badge */}

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  text-xs
                  sm:text-sm
                  font-semibold
                  text-primary
                  bg-primary-light
                  border
                  border-primary/20
                  mb-6
                "
              >
                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-primary
                  "
                />

                New: AI-Powered Revenue Leakage Detection
              </span>

              {/* Heading */}

              <h1
                className="
                  text-[2rem]
                  sm:text-4xl
                  lg:text-5xl
                  font-extrabold
                  text-text
                  mb-6
                  leading-tight
                  tracking-tight
                  max-w-[15ch]
                  lg:max-w-none
                "
                style={{
                  fontFamily:
                    "var(--font-family-heading)",
                }}
              >
                Automate Your{" "}
                <span className="text-primary">
                  Enterprise Billing
                </span>{" "}
                Lifecycle.
              </h1>

              {/* Description */}

              <p
                className="
                  text-base
                  sm:text-lg
                  text-text-muted
                  mb-10
                  max-w-lg
                  leading-relaxed
                "
              >
                Scale your revenue operations with
                the industry&apos;s most robust billing
                engine. Eliminate manual errors,
                accelerate cash flow, and focus on
                growth.
              </p>

              {/* Buttons */}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/register"
                  className="
                    min-h-[48px]
                    px-7
                    sm:px-8
                    py-3
                    bg-primary
                    text-white
                    rounded-xl
                    font-semibold
                    shadow-md
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition-all
                    duration-200
                    hover:bg-primary-hover
                    hover:-translate-y-0.5
                  "
                >
                  Start Free Trial

                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </Link>

                <a
                  href="#contact"
                  className="
                    min-h-[48px]
                    px-7
                    sm:px-8
                    py-3
                    bg-surface
                    text-text
                    border
                    border-border
                    rounded-xl
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition-all
                    duration-200
                    hover:bg-surface-hover
                    hover:border-border-dark
                  "
                >
                  Schedule Demo
                </a>
              </div>

              {/* Trusted */}

              <div className="mt-8 flex items-center gap-4 text-sm text-text-muted">
                <div className="flex -space-x-2">
                  {[
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuA6IhZr-JDA0VwIzYA5FhjOZ3GCwl-TuCJzMWTAwPzuidlYY4ZMHZWO7PrvmQt3OQ3wdpKsXVFkWNvllxY0WcUG6RKF6FfFjjSEKDMPUyo8w_xtKClfLEI8QgGC2ceMf4NAQ9xx0bXafDnxmRwxSBnqeugdWCa6lFtaiWCQXTSoYArbNjD1GBnoc8lFrlFIKxbr_0UOLaJrCC6ZOWLYVhOaA7Kc0aggw-3mYUY-BuW3yHYJbP7Ih1yJ06jlMXKyKd37R86bMQJf364",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCjvBe3ah-rT3YferApLEoIKFoRqGoV1uVZsxc7Lz-wXNWPG_zKV5XlgRnMxYW83fvTyC0zp3mVO8hulNlkutqbC_rylju6XAlA2X_2V3g1UErnNGqrnHcZ_7pNZXrrInRwaqkdKQVkJ3HoDcIm3bI3ERqt95m5DHrNJXB5_Spm5PhZXM50PpjqCF2YWjjLgw1kgSRwg8HsL3VXqOGzcrEBVzqNAv6aPnkoU5g8WQuTV115x99464cRHyc2_dCmII7NOZhR2_bLs5s",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB8FW1k-f3csTa9KEVc_oQG2q4Pi5S_rpxBhIhvJDMP5HIEfXVBetxmSXfhCRA8-die3DeVX_pJbdmcVgtpzKQEcrqeFPRxSfskiH0L3gn-O5BpfGUt7-y6nXh5MxZjeBVOktRrtM_UDbBlAoC2bkhu7kQo2QW8q2941HH5RFT3Y6c7uYLp3UBZg4UA3BfFZigy6QzvobzWBvmvHfIhD70rZ0rTarYNqqq03NBPvyPU4p_q4o0Gp-FCGmxU6AfY1AKLWBbtAZVAhFU",
                  ].map((src, i) => (
                    <img
                      key={i}
                      className="
                        w-8
                        h-8
                        rounded-full
                        border-2
                        border-surface
                        object-cover
                      "
                      src={src}
                      alt=""
                      loading="lazy"
                    />
                  ))}
                </div>

                <p>
                  Trusted by 2,000+ finance teams
                  globally
                </p>
              </div>
            </div>

            {/* RIGHT - DASHBOARD PREVIEW */}

            <div className="relative">
              {/* Glow */}

              <div
                className="
                  absolute
                  -inset-6
                  rounded-full
                  blur-3xl
                  opacity-60
                  pointer-events-none
                "
                style={{
                  background:
                    "var(--color-primary-light)",
                }}
              />

              <div
                className="
                  relative
                  bg-surface
                  border
                  border-border
                  rounded-2xl
                  overflow-hidden
                "
                style={{
                  boxShadow:
                    "var(--shadow-xl)",
                }}
              >
                {/* Browser header */}

                <div
                  className="
                    px-5
                    sm:px-6
                    py-4
                    border-b
                    border-border-light
                    flex
                    justify-between
                    items-center
                    bg-surface-secondary
                  "
                >
                  <div className="flex gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          "var(--color-danger)",
                      }}
                    />

                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          "var(--color-warning)",
                      }}
                    />

                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          "var(--color-success)",
                      }}
                    />
                  </div>

                  <div className="text-[10px] sm:text-xs font-medium text-text-light">
                    Financial Dashboard — Q4 Forecast
                  </div>
                </div>

                {/* Dashboard */}

                <div className="p-5 sm:p-8">
                  {/* Stats */}

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-4 bg-primary-soft rounded-xl">
                      <div className="text-[10px] sm:text-xs text-primary font-bold mb-1">
                        REVENUE GROWTH
                      </div>

                      <div className="text-xl sm:text-2xl font-bold text-text">
                        +24.8%
                      </div>
                    </div>

                    <div className="p-4 bg-surface-secondary rounded-xl">
                      <div className="text-[10px] sm:text-xs text-text-muted font-bold mb-1">
                        CHURN RATE
                      </div>

                      <div className="text-xl sm:text-2xl font-bold text-text">
                        0.42%
                      </div>
                    </div>
                  </div>

                  {/* Chart */}

                  <div
                    className="
                      h-40
                      sm:h-48
                      w-full
                      bg-surface-secondary
                      rounded-xl
                      flex
                      items-end
                      px-3
                      sm:px-4
                      gap-1.5
                      sm:gap-2
                      overflow-hidden
                    "
                  >
                    {[
                      "50%",
                      "66%",
                      "75%",
                      "100%",
                      "80%",
                      "66%",
                      "50%",
                    ].map((height, index) => (
                      <div
                        key={index}
                        className="
                          flex-1
                          rounded-t-lg
                          transition-all
                          duration-300
                          hover:bg-primary
                        "
                        style={{
                          height,
                          background:
                            `rgba(58, 135, 131, ${
                              0.2 +
                              index * 0.1
                            })`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SOCIAL PROOF
        ===================================================== */}

        <section className="py-10 border-y border-border bg-surface">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <p className="text-center text-text-light font-semibold uppercase tracking-widest text-xs mb-8">
              Empowering High-Growth Enterprise Teams
            </p>

            <div
              className="
                flex
                flex-wrap
                justify-center
                items-center
                gap-8
                md:gap-20
              "
            >
              {[
                "CLOUDSCALE",
                "FINTECH_IO",
                "DATAFLOW",
                "PRISM_HQ",
                "NEXUS_",
              ].map((name) => (
                <span
                  key={name}
                  className="
                    text-lg
                    sm:text-xl
                    font-black
                    text-text-secondary
                    opacity-60
                    hover:opacity-100
                    transition-opacity
                  "
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section
          id="features"
          className="py-20 sm:py-24 px-5 sm:px-8 bg-background"
        >
          <div className="max-w-[1280px] mx-auto">
            {/* Section heading */}

            <div className="text-center mb-14 sm:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                Precision Billing at Every Step
              </h2>

              <p className="text-text-muted max-w-2xl mx-auto text-base sm:text-lg">
                Our comprehensive suite is built to
                handle the complexities of modern
                enterprise revenue structures.
              </p>
            </div>

            {/* Bento */}

            <div className="grid grid-cols-12 gap-5 sm:gap-6">
              {/* =================================================
                  EFFICIENCY
              ================================================= */}

              <div
                className="
                  col-span-12
                  md:col-span-8
                  bg-surface
                  p-6
                  sm:p-10
                  rounded-2xl
                  shadow-sm
                  border
                  border-border
                  flex
                  flex-col
                  justify-between
                "
              >
                <div>
                  <div
                    className="
                      w-12
                      h-12
                      bg-primary-light
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      text-primary
                      mb-6
                    "
                  >
                    <span className="material-symbols-outlined text-[28px]">
                      bolt
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-text mb-4">
                    Unmatched Efficiency
                  </h3>

                  <p className="text-text-muted max-w-md mb-8 leading-relaxed">
                    Reduce your monthly close process
                    from days to minutes. AutoBillr
                    syncs directly with your CRM to
                    generate error-free invoices
                    automatically.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-secondary p-4 rounded-lg border border-border-light">
                    <div className="text-primary font-bold mb-1">
                      98%
                    </div>

                    <div className="text-xs text-text-muted uppercase tracking-tight">
                      Fewer Manual Errors
                    </div>
                  </div>

                  <div className="bg-surface-secondary p-4 rounded-lg border border-border-light">
                    <div className="text-primary font-bold mb-1">
                      12hrs
                    </div>

                    <div className="text-xs text-text-muted uppercase tracking-tight">
                      Saved Weekly / User
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div
                className="
                  col-span-12
                  md:col-span-4
                  p-8
                  sm:p-10
                  rounded-2xl
                  flex
                  flex-col
                  items-center
                  text-center
                  justify-center
                "
                style={{
                  background:
                    "var(--color-text)",
                }}
              >
                <div
                  className="
                    w-16
                    h-16
                    rounded-full
                    flex
                    items-center
                    justify-center
                    mb-6
                  "
                  style={{
                    background:
                      "rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="
                      material-symbols-outlined
                      text-[32px]
                    "
                    style={{
                      color:
                        "var(--color-success)",
                    }}
                  >
                    shield_lock
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-4 text-white">
                  Bank-Grade Security
                </h3>

                <p className="text-text-light text-sm leading-relaxed">
                  SOC2 Type II, GDPR, and PCI-DSS
                  Level 1 compliant. Your financial
                  data is encrypted and protected at
                  every layer.
                </p>
              </div>

              {/* =================================================
                  TRANSPARENCY
              ================================================= */}

              <div
                className="
                  col-span-12
                  md:col-span-4
                  bg-surface
                  p-8
                  sm:p-10
                  rounded-2xl
                  shadow-sm
                  border
                  border-border
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    mb-6
                  "
                  style={{
                    background:
                      "var(--color-secondary)",
                  }}
                >
                  <span className="material-symbols-outlined text-[28px] text-white">
                    visibility
                  </span>
                </div>

                <h3 className="text-xl font-bold text-text mb-4">
                  Real-time Transparency
                </h3>

                <p className="text-text-muted text-sm leading-relaxed">
                  Real-time dashboards for both you
                  and your customers. Zero friction,
                  total clarity on every line item.
                </p>
              </div>

              {/* =================================================
                  AUTOMATION
              ================================================= */}

              <div
                className="
                  col-span-12
                  md:col-span-8
                  bg-primary-soft
                  p-6
                  sm:p-10
                  rounded-2xl
                  overflow-hidden
                  relative
                "
              >
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 relative z-10">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-text mb-4">
                      Custom Automation Logic
                    </h3>

                    <p className="text-text-muted leading-relaxed">
                      Build complex billing workflows
                      with our visual node builder. If
                      this, then that — specifically
                      for your financial stack.
                    </p>
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-4">
                    {/* Trigger */}

                    <div className="bg-surface px-5 py-3 rounded-full border border-border flex items-center gap-3 shadow-sm self-end max-w-full">
                      <div
                        className="
                          w-8
                          h-8
                          rounded-full
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                        style={{
                          background:
                            "var(--color-secondary)",
                        }}
                      >
                        <span className="material-symbols-outlined text-white text-[18px]">
                          smart_toy
                        </span>
                      </div>

                      <span className="font-medium text-text-secondary text-sm">
                        Trigger: Contract Signed
                      </span>
                    </div>

                    {/* Connector */}

                    <div
                      className="
                        w-px
                        h-8
                        self-end
                        mr-10
                      "
                      style={{
                        background:
                          "var(--color-border-dark)",
                      }}
                    />

                    {/* Action */}

                    <div className="bg-surface px-5 py-3 rounded-full border border-border flex items-center gap-3 shadow-sm max-w-full">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-[18px]">
                          receipt_long
                        </span>
                      </div>

                      <span className="font-medium text-text-secondary text-sm">
                        Action: Generate Invoice
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative icon */}

                <div className="absolute top-0 right-0 opacity-[0.06] pointer-events-none">
                  <span className="material-symbols-outlined text-[260px]">
                    account_tree
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          id="how-it-works"
          className="py-20 sm:py-24 bg-surface px-5 sm:px-8"
        >
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-14 sm:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text">
                Seamless Integration in 3 Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12">
              {[
                {
                  num: "01",
                  title: "Connect Your Stack",
                  text: "Native integrations with Salesforce, HubSpot, Stripe, and NetSuite. Connect in minutes with zero code.",
                },
                {
                  num: "02",
                  title: "Define Your Rules",
                  text: "Set up subscription tiers, usage-based triggers, and regional tax compliance once.",
                },
                {
                  num: "03",
                  title: "Automate & Scale",
                  text: "Watch as invoices are sent, payments are reconciled, and reports are generated automatically.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="
                    relative
                    p-6
                    sm:p-8
                    rounded-2xl
                    hover:bg-surface-secondary
                    transition-colors
                    duration-200
                  "
                >
                  {/* Number */}

                  <div
                    className="
                      text-7xl
                      sm:text-8xl
                      font-black
                      absolute
                      top-4
                      left-4
                      z-0
                      pointer-events-none
                    "
                    style={{
                      color:
                        "var(--color-surface-hover)",
                    }}
                  >
                    {step.num}
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-text mb-4">
                      {step.title}
                    </h4>

                    <p className="text-text-muted leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section
          id="contact"
          className="py-20 sm:py-24 px-5 sm:px-8 bg-background"
        >
          <div
            className="
              max-w-5xl
              mx-auto
              bg-primary
              rounded-3xl
              p-8
              sm:p-12
              md:p-20
              text-center
              relative
              overflow-hidden
            "
            style={{
              boxShadow:
                "var(--shadow-primary)",
            }}
          >
            {/* Decorative background */}

            <div
              className="
                absolute
                inset-0
                pointer-events-none
              "
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 60%)",
              }}
            />

            <div className="relative z-10">
              <h2
                className="
                  text-3xl
                  sm:text-4xl
                  md:text-5xl
                  text-white
                  mb-8
                  leading-tight
                  font-bold
                "
              >
                Ready to transform your billing
                operation?
              </h2>

              <p className="text-white/80 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
                Join the future of financial
                automation. No credit card required
                for your first 14 days.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Link
                  to="/register"
                  className="
                    px-8
                    sm:px-10
                    py-4
                    sm:py-5
                    bg-white
                    text-primary
                    rounded-xl
                    font-bold
                    text-base
                    sm:text-lg
                    hover:bg-primary-soft
                    transition-all
                    duration-200
                    shadow-lg
                  "
                >
                  Get Started Now
                </Link>

                <a
                  href="#enterprise"
                  className="
                    px-8
                    sm:px-10
                    py-4
                    sm:py-5
                    rounded-xl
                    font-bold
                    text-base
                    sm:text-lg
                    text-white
                    border
                    border-white/30
                    transition-all
                    duration-200
                    hover:bg-white/10
                  "
                >
                  Talk to Sales
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}