"use client";

import React, { useEffect, useState } from "react";
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
import Button from "@/app/components/common/Button";
import Loader from "@/app/components/common/Loader";

const PurchaseOrderDetailsClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  const [purchaseOrderData, setPurchaseOrderData] =
    useState<PurchaseOrderData | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);
 const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 

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

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (!orderId) return;
       setLoading(true);
    setError(null); 

      try {
        const purchaseOrderData = await getPurchaseOrderById(orderId);
        setPurchaseOrderData(purchaseOrderData);

        if (purchaseOrderData?.supplierId) {
          const supplier = await getSupplierById(purchaseOrderData.supplierId);
          setSupplier(supplier?.supplierName || "Unknown Supplier");
        }

        const updatedItems = await Promise.all(
          purchaseOrderData?.purchaseOrderItemDtos?.map(
            async (item: {
              itemId: string;
              variantTypeId: string;
              unitTypeId: string;
            }) => {
              let itemName = "Unknown Item";
              let variantName = "Unknown Variant";
              let unitName = "Unknown Unit";

              if (item?.itemId) {
                const fetchedItem = await getItemById(item.itemId);
                itemName = fetchedItem?.itemName || itemName;
                variantName = fetchedItem?.variantName || variantName;
                unitName = fetchedItem?.unitName || unitName;
              }

              return {
                ...item,
                itemName,
                variantName,
                unitName,
              };
            }
          ) || []
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader type="spinner" size="md" text="Loading ..." fullScreen={false} />
      </div>
    );
  }

  // Error display
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // No data display
  if (!purchaseOrderData) {
    return <p>No data available.</p>;
  }

  return (
    <>
      {/* ==== SCREEN VIEW ==== */}
      <main className="space-y-10 print:hidden">
        <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
          Purchase Order Details
        </div>

        <div className="flex space-x-4">
          <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
            <Image src="/OrderId.svg" alt="Order ID" width={45} height={32} />
            <div className="grid">
              <span className="font-normal text-sm text-gray">Order ID</span>
              <span className="font-normal text-base">
                {purchaseOrderData?.orderId1}
              </span>
            </div>
          </div>

          <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
            <Image src="/Date.svg" alt="Order Date" width={45} height={32} />
            <div className="grid">
              <span className="font-normal text-sm text-gray">Order Date</span>
              <span className="font-normal text-base">
                {purchaseOrderData?.orderedDate
                  ? new Date(
                      purchaseOrderData.orderedDate
                    ).toLocaleDateString()
                  : ""}
              </span>
            </div>
          </div>

          <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
            <Image
              src="/Supplier.svg"
              alt="Supplier Name"
              width={45}
              height={32}
            />
            <div className="grid">
              <span className="font-normal text-sm text-gray">
                Supplier Name
              </span>
              <span className="font-normal text-base">{supplier}</span>
            </div>
          </div>

          <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
            <Image
              src="/Date.svg"
              alt="Intended Delivery Date"
              width={45}
              height={32}
            />
            <div className="grid">
              <span className="font-normal text-sm text-gray">
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
          <div className="flex justify-between font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg">
            <div>GRAND TOTAL</div>
            <div>
              ₹{purchaseOrderData?.grandTotal?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        <Footer />

        {/* Buttons container */}
        <div className="flex justify-end gap-4 mt-6 print-hidden">
          <Button
            label="Back"
            value=""
            className="w-20"
            onClick={() => router.back()}
          />
          <Button
            label="Print"
            onClick={handlePrint}
            className="w-20 bg-darkPurple text-white"
          />
        </div>
      </main>

      {/* ==== PRINT VIEW ==== */}
      <div className="hidden print:block bg-gray-100 print-section p-4 sm:p-8">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
            Purchase Order Details
          </h1>
        </header>

        <main className="bg-white border border-gray-400">
          {/* Header Information */}
          <section className="border-b border-gray-400 text-sm">
            {/* Row 1: Order ID & Order Date */}
            <div className="flex flex-row">
              <div className="w-1/2 p-4 border-r border-gray-400 space-y-1">
                <p className="font-semibold text-gray-800 tracking-wide">
                  Order ID
                </p>
                <p className="text-gray-700 tracking-wide">
                  {purchaseOrderData?.orderId1}
                </p>
              </div>
              <div className="w-1/2 p-4 space-y-1">
                <p className="font-semibold text-gray-800 tracking-wide">
                  Order Date
                </p>
                <p className="text-gray-700 tracking-wide">
                  {purchaseOrderData?.orderedDate
                    ? new Date(
                        purchaseOrderData.orderedDate
                      ).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>

            {/* Row 2: Supplier & Delivery Date */}
            <div className="flex flex-row border-t border-gray-400">
              <div className="w-1/2 p-4 border-r border-gray-400 space-y-1">
                <p className="font-semibold text-gray-800 tracking-wide">
                  Supplier Name
                </p>
                <p className="text-gray-700 tracking-wide">{supplier}</p>
              </div>
              <div className="w-1/2 p-4 space-y-1">
                <p className="font-semibold text-gray-800 tracking-wide">
                  Intended Delivery Date
                </p>
                <p className="text-gray-700 tracking-wide">
                  {purchaseOrderData?.intendedDeliveryDate
                    ? new Date(
                        purchaseOrderData.intendedDeliveryDate
                      ).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>
          </section>

          {/* Table Section */}
          <section className="w-full p-6">
            <table className="w-full text-sm text-left text-gray-800">
              <thead>
                <tr className="font-semibold border-b border-gray-400 tracking-wide">
                  <th className="py-2 px-2">SL No.</th>
                  <th className="py-2 px-2">Item Name</th>
                  <th className="py-2 px-2">Manufacturer</th>
                  <th className="py-2 px-2">Quantity</th>
                  <th className="py-2 px-2">Variant Type</th>
                  <th className="py-2 px-2">Unit Type</th>
                  <th className="py-2 px-2">Estimated Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrderData?.purchaseOrderItemDtos?.map(
                  (item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-400 tracking-wide text-gray-700"
                    >
                      <td className="py-2 px-2">{index + 1}</td>
                      <td className="py-2 px-2 font-semibold text-gray-800">
                        {item.itemName}
                      </td>
                      <td className="py-2 px-2">{item.manufacturer}</td>
                      <td className="py-2 px-2">{item.packageQuantity}</td>
                      <td className="py-2 px-2">{item.variantName}</td>
                      <td className="py-2 px-2">{item.unitName}</td>
                      <td className="py-2 px-2">₹{item.amount}</td>
                    </tr>
                  )
                )}
              </tbody>
              <tfoot className="border-t-2 border-gray-300">
                <tr>
                  <td
                    colSpan={6}
                    className="py-2 px-2 text-right font-bold text-gray-800"
                  >
                    GRAND TOTAL:
                  </td>
                  <td className="py-2 px-2 font-bold text-gray-800">
                    ₹{purchaseOrderData?.grandTotal?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        </main>
        
        <div className="mt-20">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default PurchaseOrderDetailsClient;
















// this code is added with functionality of print and others...............................

// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import Image from "next/image";
// import { useSearchParams, useRouter } from "next/navigation";
// import {
//   PurchaseOrderData,
//   PurchaseOrderItem,
// } from "@/app/types/PurchaseOrderData";
// import { getPurchaseOrderById } from "@/app/services/PurchaseOrderService";
// import { getSupplierById } from "@/app/services/SupplierService";
// import Table from "@/app/components/common/Table";
// import { getItemById } from "@/app/services/ItemService";
// import Footer from "@/app/components/common/Footer";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import Button from "@/app/components/common/Button";

// const PurchaseOrderDetailsClient = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const orderId = searchParams.get("id");
  
//   const [purchaseOrderData, setPurchaseOrderData] =
//     useState<PurchaseOrderData | null>(null);
//   const [supplier, setSupplier] = useState<string | null>(null);
//   const [, setLoading] = useState(true);
//   const [, setError] = useState<string>();
//   const printRef = useRef<HTMLDivElement>(null);

//   const handlePrint = async () => {
//     if (!printRef.current) return;

//     try {
//       const element = printRef.current;
      
//       // Apply print styles
//       element.classList.add("print-mode");

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = pdf.internal.pageSize.getWidth();

//       const canvas = await html2canvas(element, {
//         scale: 2,
//         useCORS: true,
//         allowTaint: true,
//         logging: false,
//         backgroundColor: '#ffffff'
//       });

//       const imgData = canvas.toDataURL("image/png");
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = imgHeight / imgWidth;
//       const pdfImgHeight = pageWidth * ratio;

//       pdf.addImage(
//         imgData,
//         "PNG",
//         0,
//         0,
//         pageWidth,
//         pdfImgHeight
//       );

//       // Restore original styles
//       element.classList.remove("print-mode");

//       const pdfBlob = pdf.output("blob");
//       const pdfUrl = URL.createObjectURL(pdfBlob);
//       const printWindow = window.open(pdfUrl);

//       if (printWindow) {
//         printWindow.onload = () => {
//           printWindow.print();
//         };
//       }
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     }
//   };
  
//   const columns = [
//     { header: "Item Name", accessor: "itemName" as keyof PurchaseOrderItem },
//     {
//       header: "Manufacturer",
//       accessor: "manufacturer" as keyof PurchaseOrderItem,
//     },
//     {
//       header: "Package Qty",
//       accessor: "packageQuantity" as keyof PurchaseOrderItem,
//     },
//     {
//       header: "Variant Type",
//       accessor: "variantName" as keyof PurchaseOrderItem,
//     },
//     {
//       header: "Unit Type",
//       accessor: "unitName" as keyof PurchaseOrderItem,
//     },
//     {
//       header: "Estimated Amount",
//       accessor: "amount" as keyof PurchaseOrderItem,
//     },
//   ];
  
//   useEffect(() => {
//     const fetchPurchaseOrder = async () => {
//       if (!orderId) return;
  
//       try {
//         const purchaseOrderData = await getPurchaseOrderById(orderId);
//         setPurchaseOrderData(purchaseOrderData);
  
//         if (purchaseOrderData?.supplierId) {
//           const supplier = await getSupplierById(purchaseOrderData.supplierId);
//           setSupplier(supplier?.supplierName || "Unknown Supplier");
//         }
  
//         const updatedItems = await Promise.all(
//           purchaseOrderData?.purchaseOrderItemDtos?.map(async (item: { itemId: string; variantTypeId: string; unitTypeId: string; }) => {
//             let itemName = "Unknown Item";
//             let variantName = "Unknown Variant";
//             let unitName = "Unknown Unit";
  
//             // Fetch item name
//             if (item?.itemId) {
//               const fetchedItem = await getItemById(item.itemId);
//               itemName = fetchedItem?.itemName || itemName;
//               variantName = fetchedItem?.variantName || variantName
//               unitName = fetchedItem?.unitName || unitName
//             }
  
//             return {
//               ...item,
//               itemName,
//               variantName,
//               unitName,
//             };
//           }) || []
//         );
  
//         setPurchaseOrderData({
//           ...purchaseOrderData,
//           purchaseOrderItemDtos: updatedItems,
//         });
//       } catch (err) {
//         console.error("Error fetching purchase order:", err);
//         setError("Failed to fetch order details or supplier.");
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchPurchaseOrder();
//   }, [orderId]);
  
//   return (
//     <div>
//       <div ref={printRef}>
//         <main className="space-y-10 p-4">
//           <div className="justify-start text-darkPurple text-3xl font-medium leading-10 print-hidden">
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
//                 <span className="font-normal text-sm text-gray mb-1">Order ID</span>
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
//                 <span className="font-normal text-sm text-gray mb-1">Order Date</span>
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
//                 <span className="font-normal text-sm text-gray mb-1">
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
//                 <span className="font-normal text-sm text-gray mb-1">
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
//                 value: purchaseOrderData?.grandTotal?.toFixed(2),
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
//       </div>

//       {/* Buttons container */}
//       <div className="flex justify-end gap-4 mt-6 print-hidden">
//         <Button
//           label="Back"
//           value=""
//           className="w-20"
//           onClick={() => router.back()}
//         />
//         <Button
//         label="Print"
//           onClick={handlePrint}
//           className="w-20 bg-darkPurple text-white"
//        / >

//       </div>

//       <style jsx global>{`
//         @media print {
//           body, html {
//             margin: 0;
//             padding: 0;
//             color: black !important;
//             background: white !important;
//           }
//           .print-hidden {
//             display: none !important;
//           }
//           * {
//             color: black !important;
//             background: white !important;
//             border-color: black !important;
//           }
//         }
//         .print-mode * {
//           color: black !important;
//           background: white !important;
//           border-color: black !important;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default PurchaseOrderDetailsClient;
























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