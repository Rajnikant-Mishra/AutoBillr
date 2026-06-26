import { useState } from "react";
import AutomationFlow from "../../components/automation/AutomationFlow";
import BillingConfiguration from "../../components/automation/BillingConfiguration";
import SchedulePreview from "../../components/automation/SchedulePreview";
import Badge from "../../components/ui/Badge";
import SectionHeader from "../../components/ui/SectionHeader";
import useCurrency from "../../hooks/useCurrency";
export default function RecurringBilling() {
  const [previewData, setPreviewData] = useState({
    frequency: "Quarterly",
    amount: 10000,
    clientName: "",
    projectName: "",
    active: false,
  });

  return (
    <div className="page-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <SectionHeader
          title="Recurring Billing"
          description="Configure autonomous payment cycles for your enterprise clients. Automation ensures zero-leakage revenue collection."
        />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <Badge
              label="Active Engines"
              variant="active"
            />

            <div className="text-xl font-black text-slate-900">
              142
            </div>
          </div>

          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 grid place-items-center">
            <span className="material-symbols-outlined">
              bolt
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <BillingConfiguration
            previewData={previewData}
            setPreviewData={setPreviewData}
          />
        </div>

        <div className="lg:col-span-5">
          <SchedulePreview
            previewData={previewData}
          />
        </div>
      </div>

      <AutomationFlow />
    </div>
  );
}