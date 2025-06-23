"use client";

import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import TextareaField from "@/app/components/common/TextareaFeild";
import { patientSchema } from "@/app/schema/PatientSchema";
import { checkDuplicate, createPatient } from "@/app/services/PatientService";
import { PatientData } from "@/app/types/PatientData";
import React, {useState } from "react";
import { toast } from "react-toastify";
import { z, ZodError } from "zod";

interface PatientProps {
  setShowDrawer: (value: boolean) => void;
}

const Patient: React.FC<PatientProps> = ({ setShowDrawer }) => {
  const [formData, setFormData] = useState<PatientData>({
    patientId: "",
    patientId1: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: 0,
    address: "",
    city: "",
    state: "",
    zip: "",
    bloodGroup: "",
    dateOfBirth: new Date(),
    gender: "",
    pharmacyId: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;

    let updatedValue: string | number | Date = value;

    if (id === "phone") {
      updatedValue = Number(value.replace(/\D/g, ""));
    }

    if (id === "dateOfBirth") {
      updatedValue = new Date(value); // ✅ convert string to Date
    }

    setFormData((prev) => ({
      ...prev,
      [id]: updatedValue,
    }));

    if (id in patientSchema.shape) {
      const fieldKey = id as keyof typeof patientSchema.shape;

      const singleFieldSchema = z.object({
        [fieldKey]: patientSchema.shape[fieldKey],
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

  const addPatient = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      patientSchema.parse(formData);

      if (!formData.patientId) {
        const duplicateCheck = await checkDuplicate({
          firstName: formData.firstName,
          phone: formData.phone,
        });

        if (duplicateCheck.duplicate) {
          toast.warning(
            "Patient with this name and phone number already exists.",
            {
              position: "top-right",
              autoClose: 4000,
            }
          );
          return;
        }
      }

      await createPatient(formData);
      toast.success("Patient created successfully", {
        position: "top-right",
        autoClose: 3000,
      });

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
        console.error("Unexpected Error:", error.message);
      } else {
        console.error("Unknown error occurred", error);
      }
    }
  };

  // useEffect(() => {
  //   const fetchPatient = async () => {
  //     if (!patientId) return;
  //     try {
  //       const data = await getPatientById(patientId);
  //       setFormData(data);
  //     } catch (error) {
  //       console.error("Error fetching Patient for edit:", error);
  //       toast.error("Failed to load Patient details", {
  //         position: "top-right",
  //       });
  //     }
  //   };

  //   fetchPatient();
  // }, [patientId]);

  //  const handleDeletePatient = async (
  //     e: React.MouseEvent<HTMLButtonElement>
  //   ) => {
  //     e.preventDefault();

  //     if (!patientId) return;

  //     try {
  //       await patientDelete(patientId);
  //       toast.success("Patient deleted successfully", {
  //         position: "top-right",
  //         autoClose: 3000,
  //       });
  //       setShowDrawer(false);
  //       window.location.reload();
  //     } catch (error) {
  //       console.error("Error deleting Patient:", error);
  //       toast.error("Failed to delete Patient", { position: "top-right" });
  //     }
  //   };

  return (
    <>
      <main className="space-y-6">
        <div>
          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "firstName",
                label: "First Name",
                type: "text",
                maxLength: 30,
              },
              {
                id: "lastName",
                label: "Last Name",
                type: "text",
                maxLength: 20,
              },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  maxLength={maxLength}
                  value={String(formData[id as keyof PatientData] ?? "")}
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

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              {
                id: "phone",
                label: "Mobile Number",
                type: "text",
                maxLength: 10,
              },
              {
                id: "email",
                label: "Email",
                type: "text",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  value={String(formData[id as keyof PatientData] ?? "")}
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

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              {
                id: "dateOfBirth",
                label: "DOB",
                type: "date",
              },
              {
                id: "gender",
                label: "Gender",
                type: "select",
              },
            ].map(({ id, label, type }) => {
              const value =
                id === "dateOfBirth" && formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
                  : String(formData[id as keyof PatientData] ?? "");

              return (
                <div key={id} className="relative w-72">
                  {id === "gender" ? (
                    <>
                      <label
                        htmlFor={id}
                        className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                      >
                        {label} <span className="text-tertiaryRed">*</span>
                      </label>

                      <select
                        id={id}
                        value={value}
                        onChange={(e) => handleChange(e)}
                        className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </>
                  ) : (
                    <InputField
                      type={type}
                      id={id}
                      label={
                        <>
                          {label} <span className="text-tertiaryRed">*</span>
                        </>
                      }
                      value={value}
                      onChange={(e) => handleChange(e)}
                    />
                  )}

                  {validationErrors[id] && (
                    <span className="text-tertiaryRed text-sm">
                      {validationErrors[id]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <TextareaField
              id="address"
              label="Address"
              value={String(formData.address)}
              rows={2}
              cols={40}
              onChange={(e) => handleChange(e)}
            />
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              {
                id: "city",
                label: "City",
                type: "text",
              },
              {
                id: "state",
                label: "State",
                type: "text",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  value={String(formData[id as keyof PatientData] ?? "")}
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

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "zip", label: "ZIP Code", type: "text", maxLength: 6 },
              { id: "bloodGroup", label: "Blood Group", type: "text" },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  value={String(formData[id as keyof PatientData] ?? "")}
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

        {/* <div>
          <Button
            onClick={action === "delete" ? handleDeleteItem : addItem}
            label={
              action === "delete" ? "Delete" : itemId ? "Save" : "Add Item"
            }
            value=""
            className={`w-36 h-11 text-white ${
              action === "delete" ? "bg-darkRed" : "bg-darkPurple"
            }`}
          />
        </div> */}

        <div className="flex">
          <Button
            onClick={addPatient}
            label="Add Patient"
            value=""
            className="w-28 bg-darkPurple text-white h-11"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default Patient;
