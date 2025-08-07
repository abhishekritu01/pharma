"use client";

import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import { userSchema } from "@/app/schema/UserSchema";
import { getPharmacy } from "@/app/services/PharmacyService";
import {
  createUser,
  getUserById,
  updateUser,
} from "@/app/services/UserService";
import { PharmacyData } from "@/app/types/PharmacyData";
import { UserData } from "@/app/types/UserData";
import Select from "react-select";
import React, { useEffect, useRef, useState } from "react";
import { MultiValue } from "react-select";
import { toast } from "react-toastify";
import z, { ZodError } from "zod";
import ToggleButton from "@/app/components/common/ToggleButton";

interface UserProps {
  setShowDrawer: (value: boolean) => void;
  id?: string | number | null;
  action?: "edit" | "delete";
}

interface Option {
  value: string;
  label: string;
}

const AddUser: React.FC<UserProps> = ({ setShowDrawer, id, action }) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [, setPharmacies] = useState<PharmacyData[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Option[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  const roleOptions: Option[] = [
    { value: "ADMIN", label: "Admin" },
    { value: "DESKROLE", label: "Desk Role" },
  ];

  const [formData, setFormData] = useState<UserData>({
    id: 0,
    username: "",
    password: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    roles: [],
    enabled: true,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;

    const updatedValue: string | number = value;

    setFormData((prev) => ({
      ...prev,
      [id]: updatedValue,
    }));

    if (id in userSchema.shape) {
      const fieldKey = id as keyof typeof userSchema.shape;

      const singleFieldSchema = z.object({
        [fieldKey]: userSchema.shape[fieldKey],
      });

      const result = singleFieldSchema.safeParse({ [fieldKey]: updatedValue });

      if (!result.success) {
        setValidationErrors((prev) => ({
          ...prev,
          [id]: result.error.errors[0].message,
        }));
      } else {
        setValidationErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const hasSetPharmacy = useRef(false);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await getPharmacy();
        setPharmacies(data.data);

        if (!hasSetPharmacy.current && data.data.length > 0) {
          hasSetPharmacy.current = true;
          setFormData((prev) => ({
            ...prev,
            pharmacyId: data.data[0].pharmacyId,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPharmacies();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;

        if (!formData.pharmacyId) return;

        const userId = Number(id);
        const response = await getUserById(userId, formData.pharmacyId);

        const userData = response?.data || response;

        if (userData) {
          setIsEnabled(userData.enabled);
          setFormData((prev) => ({
            ...prev,
            ...userData,
            roles: userData.roles || [],
          }));

          // Set selected roles for multi-select
          const roleOptionsFormatted = (userData.roles || []).map(
            (role: string) => ({
              value: role,
              label: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
            })
          );

          setSelectedRoles(roleOptionsFormatted);
        }
      } catch (error) {
        toast.error("Failed to fetch user");
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id, formData.pharmacyId]);

  const addUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setValidationErrors({});

    try {
      if (action === "edit") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = formData;
        userSchema.omit({ password: true }).parse(rest);
      } else {
        userSchema.parse(formData);
      }

      formData.enabled = isEnabled;

      if (action === "edit" && id) {
        await updateUser(formData.pharmacyId!, Number(id), formData);
        toast.success("User updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await createUser(formData.pharmacyId!, formData);
        toast.success("User created successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setShowDrawer(false);
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          formattedErrors[field] = err.message;
        });
        setValidationErrors(formattedErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error occurred");
      }
    }
  };

  const handleRoleChange = (selectedOptions: MultiValue<Option>) => {
    const roles = selectedOptions
      ? selectedOptions.map((option: Option) => option.value)
      : [];
    setSelectedRoles(selectedOptions as Option[]);
    setFormData({ ...formData, roles });
  };

  return (
    <>
      <main className="space-y-4">
        <div>
          {action !== "edit" && (
            <div className="relative mt-4 grid grid-cols-2 gap-4">
              {[
                {
                  id: "username",
                  label: "User Name",
                  type: "text",
                  maxLength: 50,
                },
                {
                  id: "password",
                  label: "Password",
                  type: "text",
                  maxLength: 10,
                },
              ].map(({ id, label, type, maxLength }) => (
                <div key={id} className="flex flex-col">
                  <InputField
                    type={type}
                    id={id}
                    label={
                      <>
                        {label} <span className="text-tertiaryRed">*</span>
                      </>
                    }
                    maxLength={maxLength}
                    value={String(formData[id as keyof UserData] ?? "")}
                    onChange={(e) => handleChange(e)}
                  />
                  {validationErrors[id] && (
                    <span className="text-tertiaryRed text-sm">
                      {validationErrors[id]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "firstName",
                label: "First Name",
                type: "text",
                maxLength: 50,
              },
              {
                id: "lastName",
                label: "Last Name",
                type: "text",
                maxLength: 10,
              },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  maxLength={maxLength}
                  value={String(formData[id as keyof UserData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-tertiaryRed text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "email",
                label: "Email",
                type: "text",
                maxLength: 50,
              },
              {
                id: "roles",
                label: "Role",
                type: "text",
                maxLength: 10,
              },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col">
                {id === "roles" ? (
                  <div className="relative w-full z-50">
                    <label
                      htmlFor={id}
                      className={`absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all ${
                        selectedRoles && selectedRoles.length
                          ? "text-purple-950"
                          : "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2"
                      }`}
                    >
                      {label} <span className="text-tertiaryRed">*</span>
                    </label>

                    <Select
                      isMulti
                      options={roleOptions}
                      value={selectedRoles}
                      onChange={handleRoleChange}
                      placeholder=" "
                      classNamePrefix="react-select"
                      className={`peer react-select-container mt-2 ${
                        validationErrors.roles
                          ? "border border-red-500 rounded-lg"
                          : ""
                      }`}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          height: "49px",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "0.5rem",
                          borderColor: state.isFocused ? "#6B21A8" : "#B5B3B3",
                          boxShadow: state.isFocused ? "#6B21A8" : "none",
                          backgroundColor: "transparent",
                          "&:hover": {
                            borderColor: "#4B0082",
                          },
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: "#6B7280",
                          fontSize: "0.875rem",
                        }),
                        input: (base) => ({
                          ...base,
                          color: "#000",
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "#000",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor:
                            state.isSelected || state.isFocused
                              ? "#4B0082"
                              : "#fff",
                          color:
                            state.isSelected || state.isFocused
                              ? "#fff"
                              : "#000",
                          cursor: "pointer",
                          borderRadius: "0.5rem",
                          margin: "2px",
                          ":active": {
                            backgroundColor: "#4B0082",
                            color: "#fff",
                          },
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />

                    {validationErrors.roles && (
                      <span className="text-tertiaryRed text-sm mt-1">
                        {validationErrors.roles}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <InputField
                      type={type}
                      id={id}
                      label={
                        <>
                          {label} <span className="text-tertiaryRed">*</span>
                        </>
                      }
                      maxLength={maxLength}
                      value={String(formData[id as keyof UserData] ?? "")}
                      onChange={(e) => handleChange(e)}
                    />
                    {validationErrors[id] && (
                      <span className="text-tertiaryRed text-sm mt-1">
                        {validationErrors[id]}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "phone",
                label: "Phone",
                type: "text",
                maxLength: 10,
              },
              {
                id: "city",
                label: "City",
                type: "text",
                maxLength: 50,
              },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col">
                <InputField
                  type={type}
                  id={id}
                  label={<>{label}</>}
                  maxLength={maxLength}
                  value={String(formData[id as keyof UserData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-tertiaryRed text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        {action === "edit" && <ToggleButton isEnabled={isEnabled} setIsEnabled={setIsEnabled} />}

        <div>
          <Button
            onClick={addUser}
            label={action === "edit" ? "Edit" : id ? "Save" : "Add User"}
            value=""
            className={`w-36 h-11 text-white ${
              action === "edit" ? "bg-darkPurple" : "bg-darkPurple"
            }`}
          />
        </div>
      </main>
    </>
  );
};

export default AddUser;
