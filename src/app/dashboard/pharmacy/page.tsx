"use client";

import React from "react";
import Image from "next/image";

const Page = () => {
  const infoItems = [
    { icon: "/icons/person.svg", label: "Pharmacy Owner", value: "Cristofer Rosser" },
    { icon: "/icons/mail.svg", label: "Email", value: "aakash@company.com" },
    { icon: "/icons/phone.svg", label: "Phone Number", value: "9825378273" },
    { icon: "/icons/address.svg", label: "Address", value: "456 Harmony Lane, Suite 200, Wellness Town, WT 67890" },
  ];

  const compliance = [
    { icon: "/icons/dl.svg", label: "Drug Licence Number", value: "1928394749372901938" },
    { icon: "/icons/gstin.svg", label: "GSTIN", value: "GHIKF739463" },
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
          <div className="font-bold text-lg mt-4 text-center">Pharmacy Name</div>
        </div>
        <div className="border border-[#CCCBCB] w-full h-full rounded-2xl p-6">
          <div className="font-bold text-lg">Contact Details</div>
          {/* <div>
            <div className="flex gap-48 mt-5">
              <div className="flex gap-3">
                <span>
                  <Image
                    src="/icons/person.svg"
                    alt="Pharmacy Owner Icon"
                    width={15}
                    height={15}
                  />
                </span>
                <span className="text-gray">Pharmacy Owner</span>
              </div>
              <div>Data</div>
            </div>

            <div className="flex gap-48 mt-5">
              <div className="flex gap-3">
                <span>
                  <Image
                    src="/icons/mail.svg"
                    alt="Email"
                    width={15}
                    height={15}
                  />
                </span>
                <span className="text-gray">Email</span>
              </div>
              <div>Data</div>
            </div>

            <div className="flex gap-48 mt-5">
              <div className="flex gap-3">
                <span>
                  <Image
                    src="/icons/phone.svg"
                    alt="Phone"
                    width={15}
                    height={15}
                  />
                </span>
                <span className="text-gray">Phone Number</span>
              </div>
              <div>Data</div>
            </div>

                <div className="flex gap-48 mt-5">
              <div className="flex gap-3">
                <span>
                  <Image
                    src="/icons/address.svg"
                    alt="Address"
                    width={15}
                    height={15}
                  />
                </span>
                <span className="text-gray">Address</span>
              </div>
              <div>Data</div>
            </div>

          </div> */}

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
