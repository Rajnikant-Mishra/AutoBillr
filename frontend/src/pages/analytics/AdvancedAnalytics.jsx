import React, { useState } from "react";

import BillingConfiguration from "../../components/automation/BillingConfiguration";
import SchedulePreview from "../../components/automation/SchedulePreview";
import AutomationFlow from "../../components/automation/AutomationFlow";

export default function Automation() {
  const [previewData, setPreviewData] = useState({
    frequency: "Quarterly",
    amount: 12450,
    clientName: "",
    projectName: "",
    active: false,
  });

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">
        {/* Header — matches screenshot */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Recurring Billing
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 max-w-2xl">
              Configure autonomous payment cycles for your enterprise clients.
              Automation ensures zero-leakage revenue collection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Active Engines
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular leading-none mt-0.5">
                142
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <span className="material-symbols-outlined text-[22px]">
                bolt
              </span>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7">
            <BillingConfiguration setPreviewData={setPreviewData} />
          </div>

          <div className="xl:col-span-5">
            <div className="xl:sticky xl:top-24">
              <SchedulePreview previewData={previewData} />
            </div>
          </div>
        </div>

        {/* Automation Logic Flow */}
        <AutomationFlow />
      </div>
    </main>
  );
}