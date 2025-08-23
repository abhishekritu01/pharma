"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Table from "@/app/components/common/Table";
import { PurchaseReturnData } from "@/app/types/PurchaseReturnData";
import { getPurchaseReturnById } from "@/app/services/PurchaseReturnService";
import { getSupplierById } from "@/app/services/SupplierService";
import { getItemById } from "@/app/services/ItemService";
import Footer from "@/app/components/common/Footer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaPrint } from "react-icons/fa";
import Button from "@/app/components/common/Button";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const returnId = params.id as string;

  const [purchaseReturnData, setPurchaseReturnData] =
    useState<PurchaseReturnData | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string>();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      const element = printRef.current;
      
      // Apply print styles
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

  const columns = [
    {
      header: "Discrepancy In",
      accessor: "discrepancyIn" as const,
    },
    {
      header: "Discrepancy",
      accessor: "discrepancy" as const,
    },
  ];

  useEffect(() => {
    const fetchPurchaseReturn = async () => {
      if (!returnId) return;

      try {
        const purchaseReturnData = await getPurchaseReturnById(returnId);
        setPurchaseReturnData(purchaseReturnData);
        console.log("purchaseReturnData--", purchaseReturnData);

        if (purchaseReturnData?.supplierId) {
          const supplier = await getSupplierById(purchaseReturnData.supplierId);
          setSupplier(supplier?.supplierName || "Unknown Supplier");
        }

        const updatedItems = await Promise.all(
          purchaseReturnData?.purchaseReturnItemDtos?.map(
            async (item: { itemId: string }) => {
              let itemName = "Unknown Item";

              if (item?.itemId) {
                const fetchedItem = await getItemById(item.itemId);
                itemName = fetchedItem?.itemName || itemName;
              }

              return {
                ...item,
                itemName,
              };
            }
          ) || []
        );

        setPurchaseReturnData({
          ...purchaseReturnData,
          purchaseReturnItemDtos: updatedItems,
        });
      } catch (err) {
        console.error("Error fetching purchase return:", err);
        setError("Failed to fetch return details or supplier.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseReturn();
  }, [returnId]);

  return (
    <div>
      <div ref={printRef}>
        <main className="space-y-10 p-4">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10 print-hidden">
            Purchase Return Details
          </div>

          <div className="flex space-x-4">
            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/OrderId.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray mb-1">Return ID</span>
                <span className="font-normal text-base">
                  {purchaseReturnData?.returnId1}
                </span>
              </div>
            </div>

            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/Date.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray mb-1">Return Date</span>
                <span className="font-normal text-base">
                  {purchaseReturnData?.returnDate
                    ? new Date(purchaseReturnData.returnDate).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>

            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/Rupees.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray mb-1">
                  Return Amount
                </span>
                <span className="font-normal text-base">
                  {purchaseReturnData?.returnAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {purchaseReturnData?.purchaseReturnItemDtos?.map((item, index) => (
            <div
              key={index}
              className="border border-gray-300 w-full rounded-lg p-5 flex gap-8"
            >
              <div className="space-y-5 w-1/2">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="grid">
                    <div className="font-normal text-sm text-gray mb-1">Item Name</div>
                    <div className="font-normal text-base">
                      {item.itemName || "Unknown Item"}
                    </div>
                  </div>

                  <div className="grid">
                    <div className="font-normal text-sm text-gray mb-1">
                      Batch Number
                    </div>
                    <div className="font-normal text-base">{item.batchNo}</div>
                  </div>

                  <div className="grid">
                    <div className="font-normal text-sm text-gray mb-1">
                      Bill Number
                    </div>
                    <div className="font-normal text-base">
                      {purchaseReturnData?.purchaseBillNo || "N/A"}
                    </div>
                  </div>

                  <div className="grid">
                    <div className="font-normal text-sm text-gray mb-1">Supplier</div>
                    <div className="font-normal text-base">{supplier}</div>
                  </div>

                  <div className="grid">
                    <div className="font-normal text-sm text-gray mb-1">
                      Return Type
                    </div>
                    <div className="font-normal text-base">{item.returnType}</div>
                  </div>

                  <div className="grid">
                    <div className="font-normal text-sm text-gray mb-1">
                      Return Quantity
                    </div>
                    <div className="font-normal text-base">
                      {item.returnQuantity}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <Table
                  data={[
                    {
                      discrepancyIn: item.discrepancyIn,
                      discrepancy: item.discrepancy,
                    },
                  ]}
                  columns={columns}
                  noDataMessage="No purchase items found"
                />
              </div>
            </div>
          ))}

          <Footer />
        </main>
      </div>

      {/* Buttons container */}
      <div className="flex justify-end gap-4 mt-6 print-hidden">
        <Button
          label="Back"
          value=""
          className="w-20 h-11 hover:bg-gray-200"
          onClick={() => router.back()}
        />
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-darkPurple text-white rounded-full hover:bg-darkPurple transition flex items-center gap-2 w-20 h-11 justify-center"
        >
          <FaPrint />
          Print
        </button>
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
    </div>
  );
};

export default Page;






















// the code belwo is written by sreeraksha which is the original code ...............................

// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import Table from "@/app/components/common/Table";
// import { PurchaseReturnData } from "@/app/types/PurchaseReturnData";
// import { getPurchaseReturnById } from "@/app/services/PurchaseReturnService";
// import { getSupplierById } from "@/app/services/SupplierService";
// import { getItemById } from "@/app/services/ItemService";
// import Footer from "@/app/components/common/Footer";
// const Page = () => {
//   const params = useParams();
//   const returnId = params.id as string;

//   const [purchaseReturnData, setPurchaseReturnData] =
//     useState<PurchaseReturnData | null>(null);
//   const [supplier, setSupplier] = useState<string | null>(null);

//   const [, setLoading] = useState(true);
//   const [, setError] = useState<string>();

//   const columns = [
//     {
//       header: "Discrepancy In",
//       accessor: "discrepancyIn" as const,
//     },
//     {
//       header: "Discrepancy",
//       accessor: "discrepancy" as const,
//     },
//   ];

//   useEffect(() => {
//     const fetchPurchaseReturn = async () => {
//       if (!returnId) return;

//       try {
//         const purchaseReturnData = await getPurchaseReturnById(returnId);
//         setPurchaseReturnData(purchaseReturnData);
//         console.log("purchaseReturnData--", purchaseReturnData);

//         if (purchaseReturnData?.supplierId) {
//           const supplier = await getSupplierById(purchaseReturnData.supplierId);
//           setSupplier(supplier?.supplierName || "Unknown Supplier");
//         }

//         const updatedItems = await Promise.all(
//           purchaseReturnData?.purchaseReturnItemDtos?.map(
//             async (item: { itemId: string }) => {
//               let itemName = "Unknown Item";

//               if (item?.itemId) {
//                 const fetchedItem = await getItemById(item.itemId);
//                 itemName = fetchedItem?.itemName || itemName;
//               }

//               return {
//                 ...item,
//                 itemName,
//               };
//             }
//           ) || []
//         );

//         setPurchaseReturnData({
//           ...purchaseReturnData,
//           purchaseReturnItemDtos: updatedItems,
//         });
//       } catch (err) {
//         console.error("Error fetching purchase return:", err);
//         setError("Failed to fetch return details or supplier.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPurchaseReturn();
//   }, [returnId]);

//   return (
//     <>
//       <main className="space-y-10">
//         <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//           Purchase Return Details
//         </div>

//         <div className="flex space-x-4">
//           <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//             <div>
//               <Image
//                 src="/OrderId.svg"
//                 alt="Company Logo"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div className="grid">
//               <span className="font-normal text-sm text-gray">Return ID</span>
//               <span className="font-normal text-base">
//                 {purchaseReturnData?.returnId1}
//               </span>
//             </div>
//           </div>

//           <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//             <div>
//               <Image
//                 src="/Date.svg"
//                 alt="Company Logo"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div className="grid">
//               <span className="font-normal text-sm text-gray">Return Date</span>
//               <span className="font-normal text-base">
//                 {purchaseReturnData?.returnDate
//                   ? new Date(purchaseReturnData.returnDate).toLocaleDateString()
//                   : ""}
//               </span>
//             </div>
//           </div>

//           <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//             <div>
//               <Image
//                 src="/Rupees.svg"
//                 alt="Company Logo"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div className="grid">
//               <span className="font-normal text-sm text-gray">
//                 Return Amount
//               </span>
//               <span className="font-normal text-base">
//                 {purchaseReturnData?.returnAmount.toFixed(2)}
//               </span>
//             </div>
//           </div>
//         </div>

//         {purchaseReturnData?.purchaseReturnItemDtos?.map((item, index) => (
//           <div
//             key={index}
//             className="border border-gray-300 w-full rounded-lg p-5 flex gap-8"
//           >
//             <div className="space-y-5 w-1/2">
//               <div className="grid grid-cols-2 gap-x-6 gap-y-4">
//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">Item Name</div>
//                   <div className="font-normal text-base">
//                     {item.itemName || "Unknown Item"}
//                   </div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">
//                     Batch Number
//                   </div>
//                   <div className="font-normal text-base">{item.batchNo}</div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">
//                     Bill Number
//                   </div>
//                   <div className="font-normal text-base">
//                     {purchaseReturnData?.purchaseBillNo || "N/A"}
//                   </div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">Supplier</div>
//                   <div className="font-normal text-base">{supplier}</div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">
//                     Return Type
//                   </div>
//                   <div className="font-normal text-base">{item.returnType}</div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">
//                     Return Quantity
//                   </div>
//                   <div className="font-normal text-base">
//                     {item.returnQuantity}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1">
//               <Table
//                 data={[
//                   {
//                     discrepancyIn: item.discrepancyIn,
//                     discrepancy: item.discrepancy,
//                   },
//                 ]}
//                 columns={columns}
//                 noDataMessage="No purchase items found"
//               />
//             </div>
//           </div>
//         ))}

//         <Footer />
//       </main>
//     </>
//   );
// };

// export default Page;
