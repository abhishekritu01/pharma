"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getUsersPharma } from "@/app/services/PharmacyService";
import { PharmacyData } from "@/app/types/PharmacyData";
import { getUserById } from "@/app/services/UserService";

const Page = () => {

    const [pharmacyData, setPharmacyData] = useState<PharmacyData[]>([]);
  

    // const fetchPharmacyDetails = async () => {
    //   try {
    //     const data = await getUsersPharma();
    //     console.log("Pharmacy Data", data);
        
    //     setPharmacyData(data);
    //   } catch (error) {
    //     console.error("Failed to fetch pharmacy:", error);
    //   }
    // };
  
    // useEffect(() => {
    //   fetchPharmacyDetails();
    // }, []);

  const [ownerName, setOwnerName] = useState<string>("N/A");

  const fetchPharmacyDetails = async () => {
    try {
      const data = await getUsersPharma();
      console.log("Pharmacy Data", data);

      setPharmacyData(data);

      if (data.length > 0) {
        const pharmacy = data[0]; // first pharmacy
        if (pharmacy.createdBy && pharmacy.pharmacyId) {
          // fetch user details
          const userResponse = await getUserById(
            pharmacy.createdBy,
            pharmacy.pharmacyId
          );

          if (userResponse?.data) {
            const { firstName, lastName } = userResponse.data;
            setOwnerName(`${firstName} ${lastName}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch pharmacy:", error);
    }
  };

  useEffect(() => {
    fetchPharmacyDetails();
  }, []);

  
     const pharmacy = pharmacyData.length > 0 ? pharmacyData[0] : null;

     const infoItems = [
    { icon: "/icons/person.svg", label: "Pharmacy Owner", value: ownerName || "N/A" },
    { icon: "/icons/mail.svg", label: "Email", value: pharmacy?.pharmaEmail || "N/A" },
    { icon: "/icons/phone.svg", label: "Phone Number", value: pharmacy?.pharmaPhone || "N/A" },
    { icon: "/icons/address.svg", label: "Address", value: pharmacy
      ? `${pharmacy.address || ""}, ${pharmacy.city || ""}, ${pharmacy.pharmaZip || ""}, ${pharmacy.state || ""},  ${pharmacy.pharmaCountry || ""}`
      : "N/A", },
  ];

  const compliance = [
    { icon: "/icons/dl.svg", label: "Drug Licence Number", value: pharmacy?.licenseNo || "N/A" },
    { icon: "/icons/gstin.svg", label: "GSTIN", value: pharmacy?.gstNo || "N/A" },
  ];



  return (
    <>
      <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
        Pharmacy Details
      </div>

      <div className="font-medium text-2xl mt-8">Pharmacy Info</div>

      <div className="mt-5 flex gap-6">
        <div>
          <div className="border border-[#CCCBCB] w-60 h-60 rounded-2xl">
            <div className="flex items-center justify-center">
              <Image
                src="/PharmacyLogo.jpg"
                alt="Pharmacy Logo"
                width={200}
                height={200}
              />
            </div>
          </div>
          <div className="font-bold text-lg mt-4 text-center">{pharmacy?.name}</div>
        </div>
        <div className="border border-[#CCCBCB] w-full h-full rounded-2xl p-6">
          <div className="font-bold text-lg">Contact Details</div>
        
          <div className="space-y-5 mt-5">
            {infoItems.map(({ icon, label, value }, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[350px_1fr] items-center"
              >
                <div className="flex items-center gap-3">
                  <Image src={icon} alt={label} width={20} height={20} />
                  <span className="text-gray">{label}</span>
                </div>
                <div className="text-gray-700">{value}</div>
              </div>
            ))}
          </div>

          <div className="border-b border-[#CCCBCB] my-10"></div>

          <div className="font-bold text-lg">Compliance</div>

            <div className="space-y-5 mt-5">
            {compliance.map(({ icon, label, value }, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[350px_1fr] items-center"
              >
                <div className="flex items-center gap-3">
                  <Image src={icon} alt={label} width={20} height={20} />
                  <span className="text-gray">{label}</span>
                </div>
                <div className="text-gray-700">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
