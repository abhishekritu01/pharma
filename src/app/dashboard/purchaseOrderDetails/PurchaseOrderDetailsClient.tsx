"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PurchaseOrderData,
  PurchaseOrderItem,
} from "@/app/types/PurchaseOrderData";
import { getPurchaseOrderById } from "@/app/services/PurchaseOrderService";
import { getSupplierById } from "@/app/services/SupplierService";
import Table from "@/app/components/common/Table";
import { getItemById } from "@/app/services/ItemService";
import Footer from "@/app/components/common/Footer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaPrint } from "react-icons/fa";
import Button from "@/app/components/common/Button";

const PurchaseOrderDetailsClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  
  const [purchaseOrderData, setPurchaseOrderData] =
    useState<PurchaseOrderData | null>(null);
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
    { header: "Item Name", accessor: "itemName" as keyof PurchaseOrderItem },
    {
      header: "Manufacturer",
      accessor: "manufacturer" as keyof PurchaseOrderItem,
    },
    {
      header: "Package Qty",
      accessor: "packageQuantity" as keyof PurchaseOrderItem,
    },
    {
      header: "Variant Type",
      accessor: "variantName" as keyof PurchaseOrderItem,
    },
    {
      header: "Unit Type",
      accessor: "unitName" as keyof PurchaseOrderItem,
    },
    {
      header: "Estimated Amount",
      accessor: "amount" as keyof PurchaseOrderItem,
    },
  ];
  
  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (!orderId) return;
  
      try {
        const purchaseOrderData = await getPurchaseOrderById(orderId);
        setPurchaseOrderData(purchaseOrderData);
  
        if (purchaseOrderData?.supplierId) {
          const supplier = await getSupplierById(purchaseOrderData.supplierId);
          setSupplier(supplier?.supplierName || "Unknown Supplier");
        }
  
        const updatedItems = await Promise.all(
          purchaseOrderData?.purchaseOrderItemDtos?.map(async (item: { itemId: string; variantTypeId: string; unitTypeId: string; }) => {
            let itemName = "Unknown Item";
            let variantName = "Unknown Variant";
            let unitName = "Unknown Unit";
  
            // Fetch item name
            if (item?.itemId) {
              const fetchedItem = await getItemById(item.itemId);
              itemName = fetchedItem?.itemName || itemName;
              variantName = fetchedItem?.variantName || variantName
              unitName = fetchedItem?.unitName || unitName
            }
  
            return {
              ...item,
              itemName,
              variantName,
              unitName,
            };
          }) || []
        );
  
        setPurchaseOrderData({
          ...purchaseOrderData,
          purchaseOrderItemDtos: updatedItems,
        });
      } catch (err) {
        console.error("Error fetching purchase order:", err);
        setError("Failed to fetch order details or supplier.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchPurchaseOrder();
  }, [orderId]);
  
  return (
    <div>
      <div ref={printRef}>
        <main className="space-y-10 p-4">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10 print-hidden">
            Purchase Order Details
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
                <span className="font-normal text-sm text-gray mb-1">Order ID</span>
                <span className="font-normal text-base">
                  {purchaseOrderData?.orderId1}
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
                <span className="font-normal text-sm text-gray mb-1">Order Date</span>
                <span className="font-normal text-base">
                  {purchaseOrderData?.orderedDate
                    ? new Date(purchaseOrderData.orderedDate).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
  
            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/Supplier.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray mb-1">
                  Supplier Name
                </span>
                <span className="font-normal text-base">{supplier}</span>
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
                <span className="font-normal text-sm text-gray mb-1">
                  Intended Delivery Date
                </span>
                <span className="font-normal text-base">
                  {purchaseOrderData?.intendedDeliveryDate
                    ? new Date(
                        purchaseOrderData.intendedDeliveryDate
                      ).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          </div>
  
          <Table
            data={purchaseOrderData?.purchaseOrderItemDtos ?? []}
            columns={columns}
            noDataMessage="No items found"
          />
  
          <div className="border h-full w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
            {[
              {
                label: "GRAND TOTAL",
                value: purchaseOrderData?.grandTotal?.toFixed(2),
                isTotal: true,
              },
            ].map(({ label, value, isTotal }, index) => (
              <div
                key={index}
                className={`flex justify-between ${
                  isTotal
                    ? "font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg"
                    : ""
                }`}
              >
                <div>{label}</div>
                <div>₹{value}</div>
              </div>
            ))}
          </div>
  
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
}

export default PurchaseOrderDetailsClient;
























// the code is without functionality of print  ...............................

// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { useSearchParams } from "next/navigation";
// import {
//   PurchaseOrderData,
//   PurchaseOrderItem,
// } from "@/app/types/PurchaseOrderData";
// import { getPurchaseOrderById } from "@/app/services/PurchaseOrderService";
// import { getSupplierById } from "@/app/services/SupplierService";
// import Table from "@/app/components/common/Table";
// import { getItemById } from "@/app/services/ItemService";
// import Footer from "@/app/components/common/Footer";

// const PurchaseOrderDetailsClient = () => {
//     const searchParams = useSearchParams();
//     const orderId = searchParams.get("id");
  
//     const [purchaseOrderData, setPurchaseOrderData] =
//       useState<PurchaseOrderData | null>(null);
//     const [supplier, setSupplier] = useState<string | null>(null);
//     const [, setLoading] = useState(true);
//     const [, setError] = useState<string>();
  
//     const columns = [
//       { header: "Item Name", accessor: "itemName" as keyof PurchaseOrderItem },
//       {
//         header: "Manufacturer",
//         accessor: "manufacturer" as keyof PurchaseOrderItem,
//       },
//       {
//         header: "Package Qty",
//         accessor: "packageQuantity" as keyof PurchaseOrderItem,
//       },
//       {
//         header: "Variant Type",
//         accessor: "variantName" as keyof PurchaseOrderItem,
//       },
//       {
//         header: "Unit Type",
//         accessor: "unitName" as keyof PurchaseOrderItem,
//       },
  
//       {
//         header: "Estimated Amount",
//         accessor: "amount" as keyof PurchaseOrderItem,
//       },
//     ];
  
//     useEffect(() => {
//       const fetchPurchaseOrder = async () => {
//         if (!orderId) return;
    
//         try {
//           const purchaseOrderData = await getPurchaseOrderById(orderId);
//           setPurchaseOrderData(purchaseOrderData);
    
//           if (purchaseOrderData?.supplierId) {
//             const supplier = await getSupplierById(purchaseOrderData.supplierId);
//             setSupplier(supplier?.supplierName || "Unknown Supplier");
//           }
    
//           const updatedItems = await Promise.all(
//             purchaseOrderData?.purchaseOrderItemDtos?.map(async (item: { itemId: string; variantTypeId: string; unitTypeId: string; }) => {
//               let itemName = "Unknown Item";
//               let variantName = "Unknown Variant";
//               let unitName = "Unknown Unit";
    
//               // Fetch item name
//               if (item?.itemId) {
//                 const fetchedItem = await getItemById(item.itemId);
//                 itemName = fetchedItem?.itemName || itemName;
//                 variantName = fetchedItem?.variantName || variantName
//                 unitName = fetchedItem?.unitName || unitName
//               }
    
//               return {
//                 ...item,
//                 itemName,
//                 variantName,
//                 unitName,
//               };
//             }) || []
//           );
    
//           setPurchaseOrderData({
//             ...purchaseOrderData,
//             purchaseOrderItemDtos: updatedItems,
//           });
//         } catch (err) {
//           console.error("Error fetching purchase order:", err);
//           setError("Failed to fetch order details or supplier.");
//         } finally {
//           setLoading(false);
//         }
//       };
    
//       fetchPurchaseOrder();
//     }, [orderId]);
   
//    return (
//       <>
//         <main className="space-y-10">
//           <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//             Purchase Order Details
//           </div>
  
//           <div className="flex space-x-4">
//             <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//               <div>
//                 <Image
//                   src="/OrderId.svg"
//                   alt="Company Logo"
//                   width={45}
//                   height={32}
//                 />
//               </div>
//               <div className="grid">
//                 <span className="font-normal text-sm text-gray">Order ID</span>
//                 <span className="font-normal text-base">
//                   {purchaseOrderData?.orderId1}
//                 </span>
//               </div>
//             </div>
  
//             <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//               <div>
//                 <Image
//                   src="/Date.svg"
//                   alt="Company Logo"
//                   width={45}
//                   height={32}
//                 />
//               </div>
//               <div className="grid">
//                 <span className="font-normal text-sm text-gray">Order Date</span>
//                 <span className="font-normal text-base">
//                   {purchaseOrderData?.orderedDate
//                     ? new Date(purchaseOrderData.orderedDate).toLocaleDateString()
//                     : ""}
//                 </span>
//               </div>
//             </div>
  
//             <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//               <div>
//                 <Image
//                   src="/Supplier.svg"
//                   alt="Company Logo"
//                   width={45}
//                   height={32}
//                 />
//               </div>
//               <div className="grid">
//                 <span className="font-normal text-sm text-gray">
//                   Supplier Name
//                 </span>
//                 <span className="font-normal text-base">{supplier}</span>
//               </div>
//             </div>
  
//             <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//               <div>
//                 <Image
//                   src="/Date.svg"
//                   alt="Company Logo"
//                   width={45}
//                   height={32}
//                 />
//               </div>
//               <div className="grid">
//                 <span className="font-normal text-sm text-gray">
//                   Intended Delivery Date
//                 </span>
//                 <span className="font-normal text-base">
//                   {purchaseOrderData?.intendedDeliveryDate
//                     ? new Date(
//                         purchaseOrderData.intendedDeliveryDate
//                       ).toLocaleDateString()
//                     : ""}
//                 </span>
//               </div>
//             </div>
//           </div>
  
//           <Table
//             data={purchaseOrderData?.purchaseOrderItemDtos ?? []}
//             columns={columns}
//             noDataMessage="No items found"
//           />
  
//           <div className="border h-full w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
//             {[
              
//               {
//                 label: "GRAND TOTAL",
//                 value: purchaseOrderData?.grandTotal.toFixed(2),
//                 isTotal: true,
//               },
//             ].map(({ label, value, isTotal }, index) => (
//               <div
//                 key={index}
//                 className={`flex justify-between ${
//                   isTotal
//                     ? "font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg"
//                     : ""
//                 }`}
//               >
//                 <div>{label}</div>
//                 <div>₹{value}</div>
//               </div>
//             ))}
//           </div>
  
//           <Footer />
//         </main>
//       </>
//     );
// }

// export default PurchaseOrderDetailsClient