// import { useEffect, useState } from "react";

// import Button from "../../components/ui/Button";
// import FormInput from "../../components/ui/FormInput";
// import Modal from "../../components/ui/Modal";

// import {
//   showSuccessToast,
//   showErrorToast,
// } from "../../components/ui/CustomToast";

// const API_BASE = (
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000/api/v1"
// ).replace(/\/$/, "");

// const TEAM_API = `${API_BASE}/team`;

// export default function CreateRoleModal({
//   isOpen,
//   onClose,
//   role = null,
//   existingRoles = [],
//   onCreated,
//   onUpdated,
// }) {
//   const isEditMode = Boolean(role?.id);

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//   });

//   const [isSaving, setIsSaving] =
//     useState(false);

//   /* =========================================================
//      LOAD ROLE INTO FORM
//   ========================================================= */

//   useEffect(() => {
//     if (!isOpen) return;

//     if (isEditMode) {
//       setForm({
//         name: role?.name || "",
//         description:
//           role?.description || "",
//       });
//     } else {
//       setForm({
//         name: "",
//         description: "",
//       });
//     }
//   }, [
//     isOpen,
//     isEditMode,
//     role,
//   ]);

//   /* =========================================================
//      CLOSE
//   ========================================================= */

//   const handleClose = () => {
//     if (isSaving) return;

//     setForm({
//       name: "",
//       description: "",
//     });

//     onClose?.();
//   };

//   /* =========================================================
//      SAVE
//   ========================================================= */

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const name = form.name.trim();
//     const description =
//       form.description.trim();

//     /* -----------------------------------------------
//        VALIDATION
//     ----------------------------------------------- */

//     if (!name) {
//       showErrorToast(
//         "Please enter a role name."
//       );
//       return;
//     }

//     if (name.length < 2) {
//       showErrorToast(
//         "Role name must contain at least 2 characters."
//       );
//       return;
//     }

//     if (name.length > 50) {
//       showErrorToast(
//         "Role name cannot exceed 50 characters."
//       );
//       return;
//     }

//     /* -----------------------------------------------
//        DUPLICATE CHECK
//     ----------------------------------------------- */

//     const duplicate = existingRoles.some(
//       (item) => {
//         if (
//           isEditMode &&
//           item.id === role.id
//         ) {
//           return false;
//         }

//         return (
//           String(item.name || "")
//             .trim()
//             .toLowerCase() ===
//           name.toLowerCase()
//         );
//       }
//     );

//     if (duplicate) {
//       showErrorToast(
//         "A role with this name already exists."
//       );
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const url = isEditMode
//         ? `${TEAM_API}/roles/${role.id}`
//         : `${TEAM_API}/roles`;

//       const method = isEditMode
//         ? "PATCH"
//         : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type":
//             "application/json",
//         },
//         body: JSON.stringify({
//           name,
//           description:
//             description ||
//             "Custom workspace role.",
//         }),
//       });

//       const text = await res.text();

//       let result = {};

//       try {
//         result = text
//           ? JSON.parse(text)
//           : {};
//       } catch {
//         throw new Error(
//           "Invalid server response. Please check the backend."
//         );
//       }

//       if (!res.ok || !result?.success) {
//         throw new Error(
//           result?.message ||
//             (isEditMode
//               ? "Failed to update role"
//               : "Failed to create role")
//         );
//       }

//       /* -----------------------------------------------
//          EDIT
//       ----------------------------------------------- */

//       if (isEditMode) {
//         const updatedRole =
//           result?.data;

//         onUpdated?.(updatedRole);

//         showSuccessToast(
//           "Role updated",
//           `${name} has been updated successfully.`
//         );
//       }

//       /* -----------------------------------------------
//          CREATE
//       ----------------------------------------------- */

//       else {
//         const newRole =
//           result?.data;

//         onCreated?.(newRole);

//         showSuccessToast(
//           "Role created",
//           `${name} has been created successfully.`
//         );
//       }

//       handleClose();
//     } catch (error) {
//       console.error(
//         "Role save error:",
//         error
//       );

//       showErrorToast(
//         error?.message ||
//           (isEditMode
//             ? "Failed to update role"
//             : "Failed to create role")
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={handleClose}
//       title={
//         isEditMode
//           ? "Edit Role"
//           : "Create Custom Role"
//       }
//       size="sm"
//       position="right-modal"
//     >
//       <form
//         onSubmit={handleSubmit}
//         className="space-y-5"
//       >
//         {/* =================================================
//             ROLE NAME
//         ================================================= */}

//         <FormInput
//           label="Role Name"
//           icon="admin_panel_settings"
//           value={form.name}
//           placeholder="e.g. Finance Executive"
//           onChange={(event) =>
//             setForm((current) => ({
//               ...current,
//               name: event.target.value,
//             }))
//           }
//           maxLength={50}
//           disabled={isSaving}
//           autoFocus
//         />

//         <div className="
//           flex
//           justify-between
//           -mt-3
//         ">
//           <span className="
//             text-[11px]
//             text-text-muted
//           ">
//             Choose a unique role name.
//           </span>

//           <span className="
//             text-[11px]
//             text-text-light
//           ">
//             {form.name.length}/50
//           </span>
//         </div>

//         {/* =================================================
//             DESCRIPTION
//         ================================================= */}

//         <div>
//           <label
//             htmlFor="role-description"
//             className="
//               block
//               text-sm
//               font-medium
//               text-text-secondary
//               mb-2
//             "
//           >
//             Description
//           </label>

//           <textarea
//             id="role-description"
//             value={form.description}
//             onChange={(event) =>
//               setForm((current) => ({
//                 ...current,
//                 description:
//                   event.target.value,
//               }))
//             }
//             placeholder="
//               Describe what this role is responsible for...
//             "
//             rows={4}
//             maxLength={200}
//             disabled={isSaving}
//             className="
//               w-full
//               px-3
//               py-2.5
//               rounded-lg
//               border border-border
//               bg-surface
//               text-sm
//               text-text
//               outline-none
//               resize-none
//               transition
//               placeholder:text-text-light
//               focus:border-primary
//               focus:ring-2
//               focus:ring-[rgba(15,157,148,0.15)]
//               disabled:opacity-60
//               disabled:cursor-not-allowed
//             "
//           />

//           <div className="
//             flex
//             justify-end
//             mt-1.5
//           ">
//             <span className="
//               text-[11px]
//               text-text-light
//             ">
//               {form.description.length}/200
//             </span>
//           </div>
//         </div>

//         {/* =================================================
//             INFO
//         ================================================= */}

//         <div className="
//           flex
//           gap-3
//           p-3.5
//           rounded-lg
//           bg-primary-soft
//           border border-primary/10
//         ">
//           <span
//             className="
//               material-symbols-outlined
//               text-primary
//               shrink-0
//             "
//             style={{
//               fontSize: 20,
//             }}
//           >
//             info
//           </span>

//           <p className="
//             text-xs
//             text-text-secondary
//             leading-5
//           ">
//             {isEditMode
//               ? "Update the role name or description. Existing members assigned to this role will continue using this role."
//               : "Custom roles let you define workspace-specific responsibilities. You can configure permissions for this role later."}
//           </p>
//         </div>

//         {/* =================================================
//             BUTTONS
//         ================================================= */}

//         <div className="
//           flex
//           justify-end
//           gap-3
//           pt-3
//           border-t
//           border-border-light
//         ">
//           <Button
//             type="button"
//             variant="secondary"
//             onClick={handleClose}
//             disabled={isSaving}
//           >
//             Cancel
//           </Button>

//           <Button
//             type="submit"
//             variant="primary"
//             disabled={isSaving}
//           >
//             {isSaving
//               ? isEditMode
//                 ? "Saving..."
//                 : "Creating..."
//               : isEditMode
//               ? "Save Changes"
//               : "Create Role"}
//           </Button>
//         </div>
//       </form>
//     </Modal>
//   );
// }


































import { useEffect, useState } from "react";

import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";
import Modal from "../../components/ui/Modal";

import {
  showSuccessToast,
  showErrorToast,
} from "../../components/ui/CustomToast";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const TEAM_API = `${API_BASE}/team`;

// =====================================================
// AUTH TOKEN HELPER
// =====================================================

const getAuthToken = () => {
  const plain = localStorage.getItem("token");
  if (plain && plain.startsWith("ey")) return plain;

  const auth = localStorage.getItem("autobiller-auth");
  if (!auth) return null;

  if (auth.startsWith("ey")) return auth;

  try {
    const parsed = JSON.parse(auth);
    return parsed?.state?.token || parsed?.token || null;
  } catch {
    return null;
  }
};

export default function CreateRoleModal({
  isOpen,
  onClose,
  role = null,
  existingRoles = [],
  onCreated,
  onUpdated,
}) {
  const isEditMode = Boolean(role?.id);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode) {
      setForm({
        name: role?.name || "",
        description: role?.description || "",
      });
    } else {
      setForm({
        name: "",
        description: "",
      });
    }
  }, [isOpen, isEditMode, role]);

  const handleClose = () => {
    if (isSaving) return;

    setForm({
      name: "",
      description: "",
    });

    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      showErrorToast("Please enter a role name.");
      return;
    }

    if (name.length < 2) {
      showErrorToast("Role name must contain at least 2 characters.");
      return;
    }

    if (name.length > 50) {
      showErrorToast("Role name cannot exceed 50 characters.");
      return;
    }

    const duplicate = existingRoles.some((item) => {
      if (isEditMode && item.id === role.id) return false;

      return (
        String(item.name || "")
          .trim()
          .toLowerCase() === name.toLowerCase()
      );
    });

    if (duplicate) {
      showErrorToast("A role with this name already exists.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showErrorToast("Session expired. Please login again.");
      return;
    }

    try {
      setIsSaving(true);

      const url = isEditMode
        ? `${TEAM_API}/roles/${role.id}`
        : `${TEAM_API}/roles`;

      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || "Custom workspace role.",
        }),
      });

      const text = await res.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid server response. Please check the backend.");
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.message ||
            (isEditMode ? "Failed to update role" : "Failed to create role")
        );
      }

      if (isEditMode) {
        const updatedRole = result?.data;
        onUpdated?.(updatedRole);
        showSuccessToast("Role updated", `${name} has been updated successfully.`);
      } else {
        const newRole = result?.data;
        onCreated?.(newRole);
        showSuccessToast("Role created", `${name} has been created successfully.`);
      }

      handleClose();
    } catch (error) {
      console.error("Role save error:", error);
      showErrorToast(
        error?.message ||
          (isEditMode ? "Failed to update role" : "Failed to create role")
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Role" : "Create Custom Role"}
      size="sm"
      position="right-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Role Name"
          icon="admin_panel_settings"
          value={form.name}
          placeholder="e.g. Finance Executive"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          maxLength={50}
          disabled={isSaving}
          autoFocus
        />

        <div className="flex justify-between -mt-3">
          <span className="text-[11px] text-text-muted">
            Choose a unique role name.
          </span>
          <span className="text-[11px] text-text-light">
            {form.name.length}/50
          </span>
        </div>

        <div>
          <label
            htmlFor="role-description"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Description
          </label>

          <textarea
            id="role-description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Describe what this role is responsible for..."
            rows={4}
            maxLength={200}
            disabled={isSaving}
            className="
              w-full px-3 py-2.5 rounded-lg border border-border
              bg-surface text-sm text-text outline-none resize-none transition
              placeholder:text-text-light
              focus:border-primary focus:ring-2 focus:ring-[rgba(15,157,148,0.15)]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          />

          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-text-light">
              {form.description.length}/200
            </span>
          </div>
        </div>

        <div className="flex gap-3 p-3.5 rounded-lg bg-primary-soft border border-primary/10">
          <span
            className="material-symbols-outlined text-primary shrink-0"
            style={{ fontSize: 20 }}
          >
            info
          </span>
          <p className="text-xs text-text-secondary leading-5">
            {isEditMode
              ? "Update the role name or description. Existing members assigned to this role will continue using this role."
              : "Custom roles let you define workspace-specific responsibilities. You can configure permissions for this role later."}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}