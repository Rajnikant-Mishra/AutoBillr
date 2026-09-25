import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { showSuccessToast } from "../ui/CustomToast";
import RightDrawer from "../layout/RightDrawer";
import useCurrency from "../../hooks/useCurrency";

const inputClassName = `
  w-full px-3 py-2.5
  border border-border rounded-lg text-sm
  bg-[var(--input-background)] text-text
  focus:outline-none
  focus:ring-2 focus:ring-primary/20
  focus:border-primary
  transition-colors duration-fast
`;

export default function QuickInvoiceDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { selectedCurrency } = useCurrency();

  const [form, setForm] = useState({
    client: "Apex Partners",
    amount: 2450,
    due: "Net 30",
    description: "Q4 Marketing Campaign — Strategy and execution",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    showSuccessToast("Draft Saved", "Invoice saved successfully");
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
          <Button onClick={handleSaveDraft}>Save Draft</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Client */}
        <div>
          <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
            Client
          </label>
          <select
            value={form.client}
            onChange={(e) => handleChange("client", e.target.value)}
            className={inputClassName}
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
            <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
              Amount ({selectedCurrency?.code || "INR"})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
                {selectedCurrency?.symbol || "₹"}
              </span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className={`${inputClassName} pl-7 pr-3`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
              Due
            </label>
            <select
              value={form.due}
              onChange={(e) => handleChange("due", e.target.value)}
              className={inputClassName}
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
          <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Brief description..."
            className={`${inputClassName} resize-none`}
          />
        </div>

        {/* AI Suggestion */}
        <div className="p-4 bg-primary-soft border border-primary/15 rounded-xl flex gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">
            auto_awesome
          </span>
          <div>
            <div className="text-[13px] font-semibold text-text">
              AutoBillr Suggests
            </div>
            <div className="text-[11.5px] text-text-secondary mt-1 leading-relaxed">
              Auto-charge ACH on due date with reminders at D-7, D and D+3.
            </div>
            <div className="mt-3">
              <Badge label="100% Paid Within 4 Days" variant="paid" />
            </div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}