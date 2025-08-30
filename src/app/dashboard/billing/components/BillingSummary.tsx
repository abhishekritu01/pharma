"use client";

import { getBillingById } from "@/app/services/BillingService";
import { BillingData } from "@/app/types/BillingData";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import { getItemById } from "@/app/services/ItemService";
import { ItemData } from "@/app/types/ItemData";
import { getPatientById } from "@/app/services/PatientService";
import Footer from "@/app/components/common/Footer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface BillingSummaryProps {
  billId: string;
  onClose: () => void;
}

const BillingSummary: React.FC<BillingSummaryProps> = ({ billId, onClose }) => {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const paymentTypeMap: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    creditCard: "Credit Card",
    debitCard: "Debit Card",
    net_banking: "Net Banking",
  };

  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      const element = printRef.current;


      element.classList.add("print-mode");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      const pdfImgHeight = pageWidth * ratio;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pageWidth,
        pdfImgHeight
      );

      // Restore original styles
      element.classList.remove("print-mode");

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBillingById(billId);


        const enrichedItems = await Promise.all(
          data.billItemDtos.map(async (item: ItemData) => {
            try {
              const itemDetails = await getItemById(item.itemId);
              return {
                ...item,
                itemName: itemDetails.itemName || "N/A",
              };
            } catch (err) {
              console.error("Failed to fetch item name:", err);
              return {
                ...item,
                itemName: "Unknown Item",
              };
            }
          })
        );

        let patientName = "Unknown";
        let phone = "N/A";

        try {
          const patient = await getPatientById(data.patientId);
          patientName = `${patient.firstName} ${patient.lastName}`;
          phone = patient.phone;
        } catch (err) {
          console.error("Failed to fetch patient details:", err);
        }


        setBillingData({
          ...data,
          billItemDtos: enrichedItems,
          patientName,
          phone,
        });
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      }
    };

    if (billId) {
      fetchData();
    }
  }, [billId]);

  return (
    <>
      <div ref={printRef}>
        <main className="space-y-10 px-4 py-4">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10 print-hidden">
            Bill Summary
          </div>

          <div className="border border-Gray">
            <div className="flex">
              <div className="flex-1 border-r border-gray-400 flex-col">
                <div className="flex justify-center items-center py-2">
                  <Image
                    src="/PharmacyIcon.jpg"
                    alt="Pharmacy Logo"
                    width={200}
                    height={200}
                  />
                </div>
                <div className=" text-center py-2 text-3xl font-bold">
                  Cure Plus Pharma
                </div>
              </div>
              <div className="flex-1 border-r border-gray-400 p-5">
                {billingData &&
                  [
                    {
                      label: "Invoice No.",
                      value: billingData.billId1 ?? billingData.billId,
                    },
                    {
                      label: "Date / Time",
                      value: new Date(billingData.billDateTime).toLocaleString(),
                    },
                    { label: "Contact No.", value: billingData.phone ?? "N/A" },
                    {
                      label: "Patient Name",
                      value: billingData.patientName ?? "N/A",
                    },
                    { label: "Doctor", value: billingData.doctorName },
                    {
                      label: "Payment Status",
                      value: billingData.paymentStatus
                        ? billingData.paymentStatus.charAt(0).toUpperCase() +
                        billingData.paymentStatus.slice(1).toLowerCase()
                        : "--",
                    },
                  ].map(({ label, value }, index) => (
                    <div
                      key={index}
                      className="flex text-base space-y-3 space-x-1"
                    >
                      <div className="font-medium">{label}</div>
                      <div className="font-normal">
                        : {String(value ?? "N/A")}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex-1 p-5">
                {[
                  { label: "Branch", value: "" },
                  {
                    label: "Address",
                    value: "",
                  },
                  {
                    label: "Tel No.",
                    value: "",
                  },
                  { label: "DL No.", value: "" },
                  { label: "GSTIN", value: "" },
                ].map(({ label, value }, index) => (
                  <div
                    key={index}
                    className="flex  text-base space-y-5 space-x-2"
                  >
                    <div className="font-medium">{label}</div>
                    <div>: {String(value ?? "N/A")}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-400 overflow-auto">
              {billingData?.billItemDtos && (
                <table className="text-sm font-medium w-full table-auto border-collapse">
                  <thead className="h-12 whitespace-nowrap border-b border-gray-400">
                    <tr>
                      {[
                        "SL No.",
                        "Item Name",
                        "Batch No.",
                        "Expiry Date",
                        "Quantity",
                        "Price",
                        "Gross",
                        "GST %",
                        "GST",
                        "Net",
                      ].map((header, i) => (
                        <th key={i} className="text-left px-4 py-2">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                    {billingData.billItemDtos.map((item, index) => (
                      <tr key={item.billItemId}>
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2 break-words min-w-[160px] max-w-[250px]">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-2 min-w-[120px]">
                          {item.batchNo}
                        </td>
                        <td className="px-4 py-2 min-w-[120px]">
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2">{item.packageQuantity}</td>
                        <td className="px-4 py-2">
                          {item.mrpSalePricePerUnit.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">{item.netTotal.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.gstPercentage}%</td>
                        <td className="px-4 py-2">{item.gstAmount.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          {item.grossTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-gray-400 text-sm">
              <div className="flex justify-between px-4 py-2 items-center flex-wrap gap-2">
                <div className="text-[#5A5555]">
                  {paymentTypeMap[billingData?.paymentType ?? ""] || "--"}{" "}
                  {billingData?.paymentStatus?.toLowerCase() === "paid" && (
                    <> - {billingData?.grandTotal ?? "N/A"}</>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-right font-medium text-[#5A5555]">
                  <span>Disc {billingData?.totalDiscount ?? "0.00"}</span>
                  <span>
                    CGST{" "}
                    {(billingData?.totalGst
                      ? billingData.totalGst / 2
                      : 0
                    ).toFixed(2)}
                  </span>
                  <span>
                    SGST{" "}
                    {(billingData?.totalGst
                      ? billingData.totalGst / 2
                      : 0
                    ).toFixed(2)}
                  </span>
                  <span>
                    Due{" "}
                    {billingData?.paymentStatus?.toLowerCase() === "pending"
                      ? billingData?.grandTotal ?? "0.00"
                      : "0.00"}
                  </span>

                  <span className="text-black">
                    TOTAL {billingData?.grandTotal ?? "0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t border-gray-400 h-9 px-4 items-center text-sm font-medium">
              <div>E & OE. Goods once sold cannot be taken back or exchanged</div>

            </div>
          </div>
          <div className="flex justify-end pt-25 px-5">Q P Signature</div>

          <div className="flex justify-between">
            <Footer />
          </div>
        </main>
      </div>

      <div className="flex justify-end gap-4 mt-6 print-hidden">
        <Button
          label="Back"
          value=""
          className="w-20 h-11"
          onClick={onClose}
        />
        <Button
          label="Print"
          onClick={handlePrint}
          className="w-20 bg-darkPurple text-white"
        />
      </div>

      <style jsx global>{`
        @media print {
          body, html {
            margin: 0;
            padding: 0;
            color: black !important;
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
          * {
            color: black !important;
            background: white !important;
            border-color: black !important;
          }
        }
        .print-mode * {
          color: black !important;
          background: white !important;
          border-color: black !important;
        }
      `}</style>
    </>
  );
};

export default BillingSummary;
















// This code is original and without the functionality to print button and PDF generation.

// "use client";

// import { getBillingById } from "@/app/services/BillingService";
// import { BillingData } from "@/app/types/BillingData";
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import Button from "@/app/components/common/Button";
// import { getItemById } from "@/app/services/ItemService";
// import { ItemData } from "@/app/types/ItemData";
// import { getPatientById } from "@/app/services/PatientService";
// import Footer from "@/app/components/common/Footer";

// interface BillingSummaryProps {
//   billId: string;
//   onClose: () => void;
// }

// const BillingSummary: React.FC<BillingSummaryProps> = ({ billId, onClose }) => {
//   const [billingData, setBillingData] = useState<BillingData | null>(null);

//   const paymentTypeMap: Record<string, string> = {
//     cash: "Cash",
//     upi: "UPI",
//     creditCard: "Credit Card",
//     debitCard: "Debit Card",
//     net_banking: "Net Banking",
//   };

//   <span>{paymentTypeMap[billingData?.paymentType ?? ""] || "--"} - </span>;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const data = await getBillingById(billId);

//         // Fetch item names
//         const enrichedItems = await Promise.all(
//           data.billItemDtos.map(async (item: ItemData) => {
//             try {
//               const itemDetails = await getItemById(item.itemId);
//               return {
//                 ...item,
//                 itemName: itemDetails.itemName || "N/A",
//               };
//             } catch (err) {
//               console.error("Failed to fetch item name:", err);
//               return {
//                 ...item,
//                 itemName: "Unknown Item",
//               };
//             }
//           })
//         );

//         let patientName = "Unknown";
//         let phone = "N/A";

//         try {
//           const patient = await getPatientById(data.patientId);
//           patientName = `${patient.firstName} ${patient.lastName}`;
//           phone = patient.phone;
//         } catch (err) {
//           console.error("Failed to fetch patient details:", err);
//         }

//         // Update billing data with enriched items and patient info
//         setBillingData({
//           ...data,
//           billItemDtos: enrichedItems,
//           patientName,
//           phone,
//         });
//       } catch (error) {
//         console.error("Failed to fetch billing data:", error);
//       }
//     };

//     if (billId) {
//       fetchData();
//     }
//   }, [billId]);

//   return (
//     <>
//       <main className="space-y-10">
//         <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//           Bill Summary
//         </div>

//         <div className="border border-Gray">
//           <div className="flex">
//             <div className="flex-1 border-r border-gray-400 flex-col">
//               <div className="flex justify-center items-center py-2">
//                 <Image
//                   src="/PharmacyIcon.jpg"
//                   alt="Pharmacy Logo"
//                   width={200}
//                   height={200}
//                 />
//               </div>
//               <div className=" text-center py-2 text-3xl font-bold">
//                 Cure Plus Pharma
//               </div>
//             </div>
//             <div className="flex-1 border-r border-gray-400 p-5">
//               {billingData &&
//                 [
//                   {
//                     label: "Invoice No.",
//                     value: billingData.billId1 ?? billingData.billId,
//                   },
//                   {
//                     label: "Date / Time",
//                     value: new Date(billingData.billDateTime).toLocaleString(),
//                   },
//                   { label: "Contact No.", value: billingData.phone ?? "N/A" },
//                   {
//                     label: "Patient Name",
//                     value: billingData.patientName ?? "N/A",
//                   },
//                   { label: "Doctor", value: billingData.doctorName },
//                   {
//                     label: "Payment Status",
//                     value: billingData.paymentStatus
//                       ? billingData.paymentStatus.charAt(0).toUpperCase() +
//                         billingData.paymentStatus.slice(1).toLowerCase()
//                       : "--",
//                   },
//                 ].map(({ label, value }, index) => (
//                   <div
//                     key={index}
//                     className="flex text-base space-y-3 space-x-1"
//                   >
//                     <div className="font-medium">{label}</div>
//                     <div className="font-normal">
//                       : {String(value ?? "N/A")}
//                     </div>
//                   </div>
//                 ))}
//             </div>

//             <div className="flex-1 p-5">
//               {[
//                 { label: "Branch", value: "" },
//                 {
//                   label: "Address",
//                   value: "",
//                 },
//                 {
//                   label: "Tel No.",
//                   value: "",
//                 },
//                 { label: "DL No.", value: "" },
//                 { label: "GSTIN", value: "" },
//               ].map(({ label, value }, index) => (
//                 <div
//                   key={index}
//                   className="flex  text-base space-y-5 space-x-2"
//                 >
//                   <div className="font-medium">{label}</div>
//                   <div>: {String(value ?? "N/A")}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="border-t border-gray-400 overflow-auto">
//             {billingData?.billItemDtos && (
//               <table className="text-sm font-medium w-full table-auto border-collapse">
//                 <thead className="h-12 whitespace-nowrap border-b border-gray-400">
//                   <tr>
//                     {[
//                       "SL No.",
//                       "Item Name",
//                       "Batch No.",
//                       "Expiry Date",
//                       "Quantity",
//                       "Price",
//                       "Gross",
//                       "GST %",
//                       "GST",
//                       "Net",
//                     ].map((header, i) => (
//                       <th key={i} className="text-left px-4 py-2">
//                         {header}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="whitespace-nowrap">
//                   {billingData.billItemDtos.map((item, index) => (
//                     <tr key={item.billItemId}>
//                       <td className="px-4 py-2">{index + 1}</td>
//                       <td className="px-4 py-2 break-words min-w-[160px] max-w-[250px]">
//                         {item.itemName}
//                       </td>
//                       <td className="px-4 py-2 min-w-[120px]">
//                         {item.batchNo}
//                       </td>
//                       <td className="px-4 py-2 min-w-[120px]">
//                         {item.expiryDate
//                           ? new Date(item.expiryDate).toLocaleDateString()
//                           : "N/A"}
//                       </td>
//                       <td className="px-4 py-2">{item.packageQuantity}</td>
//                       <td className="px-4 py-2">
//                         {item.mrpSalePricePerUnit.toFixed(2)}
//                       </td>
//                       <td className="px-4 py-2">{item.netTotal.toFixed(2)}</td>
//                       <td className="px-4 py-2">{item.gstPercentage}%</td>
//                       <td className="px-4 py-2">{item.gstAmount.toFixed(2)}</td>
//                       <td className="px-4 py-2">
//                         {item.grossTotal.toFixed(2)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           <div className="border-t border-gray-400 text-sm">
//             <div className="flex justify-between px-4 py-2 items-center flex-wrap gap-2">
//               <div className="text-[#5A5555]">
//                 {paymentTypeMap[billingData?.paymentType ?? ""] || "--"}{" "}
//                 {billingData?.paymentStatus?.toLowerCase() === "paid" && (
//                   <> - {billingData?.grandTotal ?? "N/A"}</>
//                 )}
//               </div>

//               <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-right font-medium text-[#5A5555]">
//                 <span>Disc {billingData?.totalDiscount ?? "0.00"}</span>
//                 <span>
//                   CGST{" "}
//                   {(billingData?.totalGst
//                     ? billingData.totalGst / 2
//                     : 0
//                   ).toFixed(2)}
//                 </span>
//                 <span>
//                   SGST{" "}
//                   {(billingData?.totalGst
//                     ? billingData.totalGst / 2
//                     : 0
//                   ).toFixed(2)}
//                 </span>
//                 <span>
//                   Due{" "}
//                   {billingData?.paymentStatus?.toLowerCase() === "pending"
//                     ? billingData?.grandTotal ?? "0.00"
//                     : "0.00"}
//                 </span>

//                 <span className="text-black">
//                   TOTAL {billingData?.grandTotal ?? "0.00"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-between border-t border-gray-400 h-9 px-4 items-center text-sm font-medium">
//             <div>E & OE. Goods once sold cannot be taken back or exchanged</div>
//             {/* <div>{billingData ? rupeesInWords(billingData.grandTotal) : ""}</div> */}
//           </div>
//         </div>
//         <div className="flex justify-end pt-25 px-5">Q P Signature</div>

//         <div className="flex justify-between">
//           <Footer />

//           <div className="mt-9 flex space-x-5">
//             <Button
//               label="Print"
//               value=""
//               className="w-20 text-black"
//               onClick={() => window.print()}
//             ></Button>
//             <Button
//               label="Back"
//               value=""
//               className="w-20 text-black"
//               onClick={onClose}
//             ></Button>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// };

// export default BillingSummary;
