import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import { doctorSchema } from "@/app/schema/DoctorSchema";
import {
  checkDuplicateDoctor,
  createDoctor,
} from "@/app/services/DoctorService";
import { DoctorData } from "@/app/types/DoctorData";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { z, ZodError } from "zod";

interface DoctorProps {
  setShowDrawer: (value: boolean) => void;
  onDoctorAdded: () => void;

}

const Doctor: React.FC<DoctorProps> = ({ setShowDrawer, onDoctorAdded }) => {
  const [formData, setFormData] = useState<DoctorData>({
    doctorId: "",
    doctorName: "",
    doctorSpeciality: "",
    doctorQualification: "",
    doctorVenue: "",
    doctorMobile: 0,
    doctorEmail: "",
    doctorLicenseNumber: "",
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

    if (id === "doctorMobile") {
      updatedValue = Number(value.replace(/\D/g, ""));
    }

    setFormData((prev) => ({
      ...prev,
      [id]: updatedValue,
    }));

    if (id in doctorSchema.shape) {
      const fieldKey = id as keyof typeof doctorSchema.shape;

      const singleFieldSchema = z.object({
        [fieldKey]: doctorSchema.shape[fieldKey],
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

  const addDoctor = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      doctorSchema.parse(formData);

      if (!formData.doctorId) {
        const duplicateCheck = await checkDuplicateDoctor({
          doctorName: formData.doctorName,
          doctorMobile: formData.doctorMobile,
        });

        if (duplicateCheck.duplicate) {
          toast.warning(
            "Doctor with this name and phone number already exists.",
            {
              position: "top-right",
              autoClose: 4000,
            }
          );
          return;
        }
      }

      await createDoctor(formData);
      toast.success("Doctor created successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      onDoctorAdded();
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

  return (
    <>
      <main className="space-y-6">
        <div>
          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "doctorName",
                label: "Name",
                type: "text",
                maxLength: 30,
              },
              {
                id: "doctorSpeciality",
                label: "Speciality",
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
                  value={String(formData[id as keyof DoctorData] ?? "")}
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
                id: "doctorQualification",
                label: "Qualification",
                type: "text",
                maxLength: 10,
              },
              {
                id: "doctorMobile",
                label: "Mobile Number",
                type: "text",
                maxLength: 10,
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
                  value={String(formData[id as keyof DoctorData] ?? "")}
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
                id: "doctorVenue",
                label: "Venue",
                type: "text",
              },
              {
                id: "doctorEmail",
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
                      {label} 
                    </>
                  }
                  value={String(formData[id as keyof DoctorData] ?? "")}
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
                id: "doctorLicenseNumber",
                label: "License Number",
                type: "text",
                maxLength: 10,
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} 
                    </>
                  }
                  value={String(formData[id as keyof DoctorData] ?? "")}
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
            onClick={addDoctor}
            label="Add Doctor"
            value=""
            className="w-28 bg-darkPurple text-white h-11"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default Doctor;
