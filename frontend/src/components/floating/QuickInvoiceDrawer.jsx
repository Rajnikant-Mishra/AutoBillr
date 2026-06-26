import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import Badge from "../ui/Badge";

import {
  showSuccessToast,
} from "../ui/CustomToast";
import RightDrawer from "../layout/RightDrawer";
import useCurrency from "../../hooks/useCurrency";
export default function QuickInvoiceDrawer({
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();
 const { selectedCurrency } = useCurrency();
  const [form, setForm] = useState({
    client: "Apex Partners",
    amount: 2450,
    due: "Net 30",
    description:
      "Q4 Marketing Campaign — Strategy and execution",
  });

  const handleSaveDraft = () => {
    showSuccessToast(
      "Draft Saved",
      "Invoice saved successfully"
    );

    onClose?.();
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Invoice"
      icon="receipt_long"
      width="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              navigate("/invoice-composer");
            }}
          >
            Open Full Composer →
          </Button>

          <Button
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Client */}
        <div>
          <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
            Client
          </label>

          <select
            value={form.client}
            onChange={(e) =>
              setForm({
                ...form,
                client: e.target.value,
              })
            }
            className="
              w-full px-3 py-2.5
              border border-slate-200
              rounded-lg text-sm
              focus:ring-2
              focus:ring-teal-500/20
              focus:border-teal-500
              outline-none
            "
          >
            <option>Apex Partners</option>
            <option>Cloud Labs</option>
            <option>Urban Edge</option>
            <option>Global Tech Solutions</option>
            <option>Health Plus Medical</option>
          </select>
        </div>

        {/* Amount + Due */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
  Amount ({selectedCurrency?.code || "INR"})
</label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
    {selectedCurrency?.symbol || "₹"}
  </span>

              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
                className="
                  w-full pl-7 pr-3 py-2.5
                  border border-slate-200
                  rounded-lg text-sm
                  focus:ring-2
                  focus:ring-teal-500/20
                  focus:border-teal-500
                  outline-none
                "
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
              Due
            </label>

            <select
              value={form.due}
              onChange={(e) =>
                setForm({
                  ...form,
                  due: e.target.value,
                })
              }
              className="
                w-full px-3 py-2.5
                border border-slate-200
                rounded-lg text-sm
                focus:ring-2
                focus:ring-teal-500/20
                focus:border-teal-500
                outline-none
              "
            >
              <option>Net 15</option>
              <option>Net 30</option>
              <option>Net 60</option>
              <option>Due on receipt</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
            Description
          </label>

          <textarea
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            placeholder="Brief description..."
            className="
              w-full px-3 py-2.5
              border border-slate-200
              rounded-lg text-sm
              resize-none
              focus:ring-2
              focus:ring-teal-500/20
              focus:border-teal-500
              outline-none
            "
          />
        </div>

        {/* AI Suggestion */}
        <div
          className="
            p-4
            bg-teal-50
            border border-teal-100
            rounded-xl
            flex gap-3
          "
        >
          <span className="material-symbols-outlined text-teal-600 mt-0.5">
            auto_awesome
          </span>

          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              AutoBillr Suggests
            </div>

            <div className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
              Auto-charge ACH on due date with
              reminders at D-7, D and D+3.
            </div>

            <div className="mt-3">
              <Badge
                label="100% Paid Within 4 Days"
                variant="paid"
              />
            </div>
          </div>
        </div>

    
      </div>
    </RightDrawer>
  );
}