import React, { useState,useEffect } from "react";
import RightDrawer from "../layout/RightDrawer";
import {
  showErrorToast,
  showSuccessToast,
} from "../ui/CustomToast";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import useCurrency from "../../hooks/useCurrency";
export default function ProjectDrawer({
  isOpen,
  onClose,
}) {

  const [formData, setFormData] = useState({
  title: "",
  client: "",
  projectType: "Fixed Fee",
  startDate: "",
  endDate: "",
  description: "",
  budget: "",
  billingMethod: "Milestone",
  autoInvoice: true,
  color: "bg-cyan-500",
});


const { format, selectedCurrency, currencySymbol } = useCurrency();

const allTeamMembers = [
  "Alex Sterling",
  "Marcus Chen",
  "Diego Ruiz",
  "Aria Singh",
  "Sophia Taylor",
  "Ethan Parker",
  "Olivia Brown",
];
  const billingOptions = [
    {
      label: "Milestone",
      icon: "flag",
    },
    {
      label: "Hourly",
      icon: "schedule",
    },
    {
      label: "Retainer",
      icon: "sync",
    },
    {
      label: "Fixed Fee",
      icon: "request_quote",
    },
  ];
const colors = [
  "bg-teal-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
];

const [nextMemberIndex, setNextMemberIndex] = useState(2);

const [removedMembers, setRemovedMembers] = useState([]);
const [teamMembers, setTeamMembers] = useState([
  "Alex Sterling",
  "Marcus Chen",
]);
const [clients, setClients] = useState([]);
const [loading, setLoading] = useState(false);
const [milestones, setMilestones] = useState([]);
const [newMember, setNewMember] = useState("");
const [showMemberInput, setShowMemberInput] = useState(false);
const validateForm = () => {
  const requiredFields = [
    {
      key: "title",
      label: "Project Name",
    },
    {
      key: "client",
      label: "Client",
    },
    {
      key: "startDate",
      label: "Start Date",
    },
    {
      key: "endDate",
      label: "End Date",
    },
    {
      key: "budget",
      label: "Budget",
    },
  ];

  for (const field of requiredFields) {
    if (
      !String(
        formData[field.key] || ""
      ).trim()
    ) {
      showErrorToast(
        `${field.label} is required`
      );

      return false;
    }
  }

  if (
    new Date(formData.endDate) <
    new Date(formData.startDate)
  ) {
    showErrorToast(
      "End date cannot be before start date"
    );

    return false;
  }

  if (
    Number(formData.budget) <= 0
  ) {
    showErrorToast(
      "Budget must be greater than 0"
    );

    return false;
  }

  for (let i = 0; i < milestones.length; i++) {
    const milestone = milestones[i];

    if (!milestone.title.trim()) {
      showErrorToast(
        `Milestone ${
          i + 1
        } title is required`
      );

      return false;
    }

    if (!milestone.dueDate) {
      showErrorToast(
        `Milestone ${
          i + 1
        } due date is required`
      );

      return false;
    }

    if (
      Number(milestone.amount) <= 0
    ) {
      showErrorToast(
        `Milestone ${
          i + 1
        } amount is required`
      );

      return false;
    }
  }

  return true;
};
const resetForm = () => {
  setFormData({
  title: "",
  client: "",
  clientName: "",
  projectType: "Fixed Fee",
  startDate: "",
  endDate: "",
  description: "",
  budget: "",
  billingMethod: "Milestone",
  autoInvoice: true,
  color: "bg-cyan-500",
});

  setMilestones([]);

  setTeamMembers([
    "Alex Sterling",
    "Marcus Chen",
  ]);

  setRemovedMembers([]);

  setNextMemberIndex(2);
};
const createProject = async () => {
  if (!validateForm()) return;

  try {
    setLoading(true);

    const payload = {
      ...formData,
      milestones,
      teamMembers,
      members: teamMembers.length,
      billed: 0,
      progress: 0,
      status: "ACTIVE",
      icon: "folder",
      dueDate: formData.endDate,
    };

    console.log("Sending payload:", payload);

    // Hardcode for now to bypass env issue
    const API_URL = "http://localhost:5000";   // ← Direct URL

    const response = await fetch(`${API_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log("Raw Response from server:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Failed. Raw text:", text);
      throw new Error("Server did not return valid JSON");
    }

    if (!response.ok) {
      throw new Error(data.message || "Project creation failed");
    }

    showSuccessToast("Project created successfully");
    resetForm();
    onClose();

    window.dispatchEvent(
  new CustomEvent("project-created", {
    detail: {
      project: payload,
    },
  })
);
  } catch (error) {
    console.error("Create Error:", error);
    showErrorToast(error.message || "Failed to create project");
  } finally {
    setLoading(false);
  }
};
const handleChange = (field, value) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const addMilestone = () => {
  setMilestones((prev) => [
    ...prev,
    {
      title: "",
      dueDate: "",
      amount: 0,
      status: "scheduled",
    },
  ]);
};

const deleteMilestone = (index) => {
  setMilestones((prev) =>
    prev.filter((_, i) => i !== index)
  );
};

const updateMilestone = (index, field, value) => {
  setMilestones((prev) =>
    prev.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]:
              field === "amount"
                ? Number(value)
                : value,
          }
        : item
    )
  );
};   

const addMember = () => {
  // First add remaining members from original list
  if (nextMemberIndex < allTeamMembers.length) {
    const nextMember = allTeamMembers[nextMemberIndex];

    setTeamMembers((prev) => [...prev, nextMember]);
    setNextMemberIndex((prev) => prev + 1);

    return;
  }

  // After all members are added, reuse removed members as queue
  if (removedMembers.length > 0) {
    const memberToRestore = removedMembers[0];

    if (!teamMembers.includes(memberToRestore)) {
      setTeamMembers((prev) => [...prev, memberToRestore]);
    }

    setRemovedMembers((prev) => prev.slice(1));
  }
};


const removeMember = (memberToRemove) => {
  setTeamMembers((prev) =>
    prev.filter((member) => member !== memberToRemove)
  );

  setRemovedMembers((prev) => {
    if (prev.includes(memberToRemove)) return prev;

    return [...prev, memberToRemove];
  });
};
const allMembersAdded =
  nextMemberIndex >= allTeamMembers.length &&
  removedMembers.length === 0;


useEffect(() => {
  if (isOpen) {
    fetchClients();
  }
}, [isOpen]);

const fetchClients = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/clients");
    const text = await response.text();
    console.log("Clients Raw Response:", text);

    const data = JSON.parse(text);
    setClients(data.clients || []);
  } catch (error) {
    console.error("CLIENT ERROR:", error);
    showErrorToast("Failed to load clients");
  }
};
const totalMilestoneAmount = milestones.reduce(
  (sum, item) => sum + (Number(item.amount) || 0),
  0
);


  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="secondary">
  Save Draft
</Button>

  <Button
  icon="rocket_launch"
  onClick={createProject}
  disabled={loading}
>
  {loading
    ? "Creating..."
    : "Create Project"}
</Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="New Project"
      icon="add_business"
      width="max-w-2xl"
      footer={footer}
    >
      <div className="space-y-6">

        {/* SECTION 1 */}
        <section>
          <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
              1
            </span>
            Project Basics
          </h4>

          <div className="space-y-4">

            <div>
             

       <FormInput
  label="Project Name *"
  value={formData.title}
  onChange={(e) =>
    handleChange("title", e.target.value)
  }
  placeholder="Q1 Marketing Sprint"
/>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
                  Client *
                </label>

  <select
  value={formData.client}
  onChange={(e) => {
  const selectedClient = clients.find(
    (c) => c._id === e.target.value
  );

  setFormData((prev) => ({
    ...prev,
    client: selectedClient?._id,
    clientName: selectedClient?.name,
  }));
}}
  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg"
>
  <option value="">
    Select Client
  </option>

  {clients.map((client) => (
    <option
      key={client._id}
      value={client._id}
    >
      {client.name}
    </option>
  ))}
</select>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
                  Project Type
                </label>

                <select
  value={formData.projectType}
  onChange={(e) =>
    handleChange("projectType", e.target.value)
  }
  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm"
>
  <option>Fixed Fee</option>
  <option>Time & Materials</option>
  <option>Retainer</option>
  <option>Internal</option>
</select>
              </div>

            </div>

           <div className="grid grid-cols-2 gap-3">
  <FormInput
    label="Start Date *"
    type="date"
    value={formData.startDate}
    onChange={(e) =>
      handleChange("startDate", e.target.value)
    }
  />

  <FormInput
    label="End Date *"
    type="date"
    value={formData.endDate}
    onChange={(e) =>
      handleChange("endDate", e.target.value)
    }
  />
</div>
<textarea
  rows={3}
  value={formData.description}
  onChange={(e) =>
    handleChange("description", e.target.value)
  }
  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg"
/>

          </div>

          <div>
  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
    Color Tag
  </label>

  <div className="flex gap-2">
    {colors.map((color) => (
      <button
        key={color}
        type="button"
        onClick={() =>
  handleChange("color", color)
}
        className={`
          w-9 h-9 rounded-lg
          ${color}
          transition hover:scale-105
          ${
            formData.color === color
              ? "ring-2 ring-offset-2 ring-slate-900 scale-110"
              : ""
          }
        `}
      />
    ))}
  </div>
</div>
        </section>

        {/* SECTION 2 */}
        <section className="pt-5 border-t border-slate-100">

          <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
              2
            </span>
            Budget & Billing
          </h4>

          <div className="space-y-4">

            <div>
              <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
  Total Budget ({selectedCurrency?.code})
</label>

              <div className="relative">
               <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
  {currencySymbol}
</span>

               <input
  type="number"
  value={formData.budget}
  onChange={(e) =>
    handleChange("budget", e.target.value)
  }
  className="w-full pl-8 pr-3.5 py-2.5 border border-slate-200 rounded-lg"
/>
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">
                Billing Method
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

                {billingOptions.map((item) => (
                  <button
                    key={item.label}
                    onClick={() =>
                      handleChange(
  "billingMethod",
  item.label
)
                    }
                    className={`
                      flex flex-col items-center p-3 rounded-lg border-2 transition
                      ${
                        formData.billingMethod === item.label
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 hover:border-teal-300"
                      }
                    `}
                  >
                    <span className="material-symbols-outlined mb-1">
                      {item.icon}
                    </span>

                    <span className="text-[11px] font-bold">
                      {item.label}
                    </span>
                  </button>
                ))}

              </div>
            </div>
<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
  <div>
    <div className="text-[13px] font-bold text-slate-900">
      Auto-generate invoices
    </div>

    <div className="text-[11.5px] text-slate-500">
      Create + send invoices when milestones complete
    </div>
  </div>

  <button
    type="button"
    onClick={() =>
  handleChange(
    "autoInvoice",
    !formData.autoInvoice
  )
}
    className={`
      w-11 h-6 rounded-full relative transition
      ${
  formData.autoInvoice
    ? "bg-teal-600"
    : "bg-slate-300"
}
    `}
  >
    <span
      className={`
        absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition
       ${
  formData.autoInvoice
    ? "right-0.5"
    : "left-0.5"
}
      `}
    />
  </button>
</div>
          </div>
        </section>

        {/* SECTION 3 */}
    <section className="pt-5 border-t border-slate-100">

  <div className="flex items-center justify-between mb-3">
    <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
      <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
        3
      </span>
      Milestones
    </h4>

   <span className="text-[11px] font-bold text-teal-600">
  {format(totalMilestoneAmount)}
</span>
  </div>

<div className="space-y-2">
  {milestones.map((item, index) => (
    <div
      key={index}
      className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg border border-slate-100"
    >
      <div className="col-span-6">
        <label className="text-[9px] uppercase text-slate-400 font-bold">
          Milestone
        </label>

        <input
          type="text"
          value={item.title}
          onChange={(e) =>
            updateMilestone(
              index,
              "title",
              e.target.value
            )
          }
          className="w-full bg-transparent border-0 p-0 text-[13px] font-medium outline-none"
        />
      </div>

      <div className="col-span-3">
        <label className="text-[9px] uppercase text-slate-400 font-bold">
          Due
        </label>

        <input
          type="date"
          value={item.dueDate}
          onChange={(e) =>
            updateMilestone(
               index,
  "dueDate",
  e.target.value
            )
          }
          className="w-full bg-transparent border-0 p-0 text-[12px] outline-none"
        />
      </div>

      <div className="col-span-2">
      <label className="text-[9px] uppercase text-slate-400 font-bold">
  Amount ({selectedCurrency?.code || "USD"})
</label>

        <div className="relative">
    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
      {currencySymbol}
    </span>

    <input
      type="number"
      value={item.amount}
      onChange={(e) =>
        updateMilestone(
          index,
          "amount",
          e.target.value
        )
      }
      className="w-full pl-4 bg-transparent border-0 p-0 text-[13px] font-medium outline-none"
    />
  </div>
      </div>

      <div className="col-span-1 flex justify-center pt-5">
        <button
          type="button"
          onClick={() =>
            deleteMilestone(index)
          }
          className="text-red-500 hover:text-red-700"
        >
          <span className="material-symbols-outlined">
            delete
          </span>
        </button>
      </div>
    </div>
  ))}

  <button
    type="button"
    onClick={addMilestone}
    className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold text-teal-600 flex items-center justify-center gap-2"
  >
    <span className="material-symbols-outlined">
      add
    </span>
    Add Milestone
  </button>
</div>
</section>

        {/* SECTION 4 */}
      <section className="pt-5 border-t border-slate-100">

  <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
    <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
      4
    </span>

    Team & Access
  </h4>

  <div className="flex flex-wrap gap-2">
  {teamMembers.map((member) => (
    <span
      key={member}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-[12px] font-semibold text-teal-700"
    >
      <span className="w-5 h-5 bg-teal-600 text-white rounded-full grid place-items-center text-[10px] font-black">
        {member.charAt(0)}
      </span>

      {member}

      <button
        type="button"
        onClick={() => removeMember(member)}
      >
        <span className="material-symbols-outlined text-[13px] mt-1">
          close
        </span>
      </button>
    </span>
  ))}

  {!allMembersAdded && (
    <button
      type="button"
      onClick={addMember}
      className="inline-flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-slate-200 hover:border-teal-300 rounded-full text-[12px] font-semibold text-slate-500 hover:text-teal-600"
    >
      <span className="material-symbols-outlined text-sm">
        add
      </span>

      Add Member
    </button>
  )}
</div>
</section>

      </div>
    </RightDrawer>
  );
}