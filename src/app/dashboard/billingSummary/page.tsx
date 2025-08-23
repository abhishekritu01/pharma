"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  getBillingSummaryByDate,
  getPaymentSummaryByDate
} from "@/app/services/BillingSummaryService";
import {
  BillingSummaryData,
  PaymentSummaryData
} from "@/app/types/BillingSummaryData";
import { BiExport } from "react-icons/bi";
// import { FiPrinter } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendar } from "react-icons/ci";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import { exportAsCSVService } from "@/app/services/ExportAsCSVService";
import { toast } from "react-toastify";
import Loader from "@/app/components/common/Loader";

const Page = () => {
  const [summaryData, setSummaryData] = useState<BillingSummaryData | null>(null);
  const [paymentSummaryData, setPaymentSummaryData] = useState<PaymentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        let dateToFetch = new Date();

        if (dateFilter === "yesterday") {
          dateToFetch.setDate(dateToFetch.getDate() - 1);
        } else if (dateFilter === "custom") {
          dateToFetch = selectedDate;
        }

        const [billingData, paymentData] = await Promise.all([
          getBillingSummaryByDate(dateToFetch),
          getPaymentSummaryByDate(dateToFetch)
        ]);

        setSummaryData(billingData);
        setPaymentSummaryData(paymentData);
      } catch (err) {
        console.error("Failed to load summary:", err);
        setSummaryData(null);
        setPaymentSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [dateFilter, selectedDate]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setDateFilter("custom");
      setShowDatePicker(false);
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return "0.00";
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
  };

  const prepareExportData = () => {
    if (!summaryData || !paymentSummaryData) return [];

    const formattedDate = format(selectedDate, "dd-MM-yyyy");

    // All data in horizontal format
    return [
      {
        "Type of Report": "Daily Closing Report",
        "Date": formattedDate,
        "Net sales (in Rs.)": formatNumber((summaryData.paidTotalAmount || 0) + (summaryData.unpaidTotalAmount || 0)),
        "Total bill count": (summaryData.paidTotalBills || 0) + (summaryData.unpaidTotalBills || 0),
        "Total Paid amount (in Rs.)": formatNumber(summaryData.paidTotalAmount),
        "Bill count for Paid": summaryData.paidTotalBills || 0,
        "Total Unpaid amount (in Rs.)": formatNumber(summaryData.unpaidTotalAmount),
        "Bill count for Unpaid": summaryData.unpaidTotalBills || 0,
        "Payment type (Cash)": formatNumber(paymentSummaryData.cashTotal),
        "Payment type (UPI)": formatNumber(paymentSummaryData.upiNetTotal),
        "Payment type (Card)": formatNumber(paymentSummaryData.cardTotal),
        "Payment type (Cash+UPI)": formatNumber(paymentSummaryData.upiCashTotal),
        "Total Refund Amount of bill returned": formatNumber(summaryData.totalReturnAmount),
        "Total no. of bill return": summaryData.totalReturnBills || 0
      }
    ];
  };

  const handleExport = async () => {
    try {
      // toast.info("Preparing CSV export...");

      const dataToExport = prepareExportData();
      const filename = `daily_report_${format(selectedDate, 'dd_MM_yyyy')}`;

      await exportAsCSVService.exportData(
        dataToExport,
        'csv',
        {
          filename,
          headers: {
            "Type of Report": "Type of Report",
            "Date": "Date"
          },
          csv: {
            delimiter: ','
          }
        }
      );

      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div> */}
        <Loader type="spinner" size="md" text="Daily Closing Report is loading ..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-darkPurple text-2xl md:text-3xl font-medium">
            Daily Closing Report - {format(selectedDate, "MMMM dd, yyyy")}
          </h2>
          <div className="flex items-center gap-4">
            <Button
              label="Export as CSV"
              className="px-6 bg-darkPurple text-white hover:bg-darkPurple"
              icon={<BiExport size={18} />}
              onClick={handleExport}
            />
            {/* <Button
              label="Print"
              className="px-4 border border-gray-400 hover:bg-gray-50"
              icon={<FiPrinter size={18} />}
            /> */}
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => {
              setDateFilter("today");
              setSelectedDate(new Date());
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium ${dateFilter === "today"
              ? "bg-darkPurple text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              setDateFilter("yesterday");
              setSelectedDate(yesterday);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium ${dateFilter === "yesterday"
              ? "bg-darkPurple text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Yesterday
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${dateFilter === "custom"
                ? "bg-darkPurple text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Custom Date
              <CiCalendar size={18} />
            </button>
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                  maxDate={new Date()}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
            <div className="rounded-xl mr-2">
              <Image
                src="/rupeeBillSummary.svg"
                alt="ruppee icon"
                width={45}
                height={32}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Sales</p>
              <p className="text-xl text-gray-800">
                ₹{formatNumber((summaryData?.paidTotalAmount || 0) + (summaryData?.unpaidTotalAmount || 0))}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
            <div className="rounded-xl mr-2">
              <Image
                src="/reportbillsummary.svg"
                alt="report icon"
                width={45}
                height={32}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Bill Count</p>
              <p className="text-xl text-gray-800">
                {(summaryData?.paidTotalBills || 0) + (summaryData?.unpaidTotalBills || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Sales Summary */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Summary</h2>
          <div className="flex justify-between text-gray-500 font-medium mb-4">
            <p></p>
            <div className="flex w-1/2 justify-between">
              <p>Bill Count</p>
              <p>Amount</p>
            </div>
          </div>
          <hr className="mb-4 border-gray-200" />
          <div className="space-y-4 text-gray-700">
            <div className="flex justify-between items-center">
              <p>Paid Bills</p>
              <div className="flex w-1/2 justify-between">
                <p>{summaryData?.paidTotalBills || 0}</p>
                <p>₹{formatNumber(summaryData?.paidTotalAmount)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>Unpaid Bills</p>
              <div className="flex w-1/2 justify-between">
                <p>{summaryData?.unpaidTotalBills || 0}</p>
                <p>₹{formatNumber(summaryData?.unpaidTotalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Type Summary */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Type Summary</h2>
          <div className="flex justify-between text-gray-500 font-medium mb-4">
            <p></p>
            <div className="flex w-1/2 justify-between">
              <p>Bill Count</p>
              <p>Amount</p>
            </div>
          </div>
          <hr className="mb-4 border-gray-200" />
          <div className="space-y-4 text-gray-700">
            <div className="flex justify-between items-center">
              <p>Cash</p>
              <div className="flex w-1/2 justify-between">
                <p>{paymentSummaryData?.cashCount || 0}</p>
                <p>₹{formatNumber(paymentSummaryData?.cashTotal)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>UPI</p>
              <div className="flex w-1/2 justify-between">
                <p>{paymentSummaryData?.upiNetCount || 0}</p>
                <p>₹{formatNumber(paymentSummaryData?.upiNetTotal)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>Card</p>
              <div className="flex w-1/2 justify-between">
                <p>{paymentSummaryData?.cardCount || 0}</p>
                <p>₹{formatNumber(paymentSummaryData?.cardTotal)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>UPI + Cash</p>
              <div className="flex w-1/2 justify-between">
                <p>{paymentSummaryData?.upiCashCount || 0}</p>
                <p>₹{formatNumber(paymentSummaryData?.upiCashTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Summary */}
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Return Summary</h2>
          <div className="flex justify-end text-gray-500 font-medium mb-4">
            <p className="w-1/4 text-right">Amount</p>
          </div>
          <hr className="mb-4 border-gray-200" />
          <div className="space-y-4 text-gray-700">
            <div className="flex justify-between items-center">
              <p>Total no. of Bill Returns</p>
              <p className="w-1/4 text-right">{summaryData?.totalReturnBills || 0}</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Total Refund Amount</p>
              <p className="w-1/4 text-right">₹{formatNumber(summaryData?.totalReturnAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;


































///............. original code without "export as csv" functionality...............

// "use client";

// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import {
//   getBillingSummaryByDate,
//   getPaymentSummaryByDate
// } from "@/app/services/BillingSummaryService";
// import {
//   BillingSummaryData,
//   PaymentSummaryData
// } from "@/app/types/BillingSummaryData";
// import { BiExport } from "react-icons/bi";
// import { FiPrinter } from "react-icons/fi";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { CiCalendar } from "react-icons/ci";
// import Image from "next/image";
// import Button from "@/app/components/common/Button";

// const Page = () => {
//   const [summaryData, setSummaryData] = useState<BillingSummaryData | null>(null);
//   const [paymentSummaryData, setPaymentSummaryData] = useState<PaymentSummaryData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dateFilter, setDateFilter] = useState("today");
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   useEffect(() => {
//     const fetchSummaries = async () => {
//       try {
//         setLoading(true);
//         let dateToFetch = new Date();

//         if (dateFilter === "yesterday") {
//           dateToFetch.setDate(dateToFetch.getDate() - 1);
//         } else if (dateFilter === "custom") {
//           dateToFetch = selectedDate;
//         }

//         const [billingData, paymentData] = await Promise.all([
//           getBillingSummaryByDate(dateToFetch),
//           getPaymentSummaryByDate(dateToFetch)
//         ]);

//         setSummaryData(billingData);
//         setPaymentSummaryData(paymentData);
//       } catch (err) {
//         console.error("Failed to load summary:", err);
//         setSummaryData(null);
//         setPaymentSummaryData(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSummaries();
//   }, [dateFilter, selectedDate]);

//   const handleDateChange = (date: Date | null) => {
//     if (date) {
//       setSelectedDate(date);
//       setDateFilter("custom");
//       setShowDatePicker(false);
//     }
//   };

//   const formatNumber = (num: number | null | undefined): string => {
//     if (num === null || num === undefined) return "0.00";
//     if (Number.isInteger(num)) return num.toString();
//     return num.toFixed(2);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <div className="container mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
//           <h2 className="text-darkPurple text-2xl md:text-3xl font-medium">
//             Daily Closing Report - {format(selectedDate, "MMMM dd, yyyy")}
//           </h2>
//           <div className="flex items-center gap-4">
//             <Button
//                   label="Export as CSV"
//                   className="px-6 bg-darkPurple text-white hover:bg-purple-800"
//                   icon={<BiExport size={18} />}
//                 />
//                 <Button
//                   label="Print"
//                   className="px-4 border border-gray-400 hover:bg-gray-50"
//                   icon={<FiPrinter size={18} />}
//                 />
//           </div>
//         </div>

//         {/* Date Filters */}
//         <div className="flex flex-wrap gap-3 mb-8">
//           <button
//             onClick={() => {
//               setDateFilter("today");
//               setSelectedDate(new Date());
//             }}
//             className={`px-4 py-2 rounded-md text-sm font-medium ${dateFilter === "today"
//                 ? "bg-darkPurple text-white"
//                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//           >
//             Today
//           </button>
//           <button
//             onClick={() => {
//               const yesterday = new Date();
//               yesterday.setDate(yesterday.getDate() - 1);
//               setDateFilter("yesterday");
//               setSelectedDate(yesterday);
//             }}
//             className={`px-4 py-2 rounded-md text-sm font-medium ${dateFilter === "yesterday"
//                 ? "bg-darkPurple text-white"
//                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//           >
//             Yesterday
//           </button>
//           <div className="relative">
//             <button
//               onClick={() => setShowDatePicker(!showDatePicker)}
//               className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${dateFilter === "custom"
//                   ? "bg-darkPurple text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//             >
//               Custom Date
//               <CiCalendar size={18} />
//             </button>
//             {showDatePicker && (
//               <div className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200">
//                 <DatePicker
//                   selected={selectedDate}
//                   onChange={handleDateChange}
//                   inline
//                   maxDate={new Date()}
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
//             <div className="rounded-xl mr-2">
//               <Image
//                 src="/rupeeBillSummary.svg"
//                 alt="ruppee icon"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Net Sales</p>
//               <p className="text-xl text-gray-800">
//                 ₹{formatNumber((summaryData?.paidTotalAmount || 0) + (summaryData?.unpaidTotalAmount || 0))}
//               </p>
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
//             <div className="rounded-xl mr-2">
//               <Image
//                 src="/reportbillsummary.svg"
//                 alt="report icon"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Net Bill Count</p>
//               <p className="text-xl text-gray-800">
//                 {(summaryData?.paidTotalBills || 0) + (summaryData?.unpaidTotalBills || 0)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Sales Summary */}
//         <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Summary</h2>
//           <div className="flex justify-between text-gray-500 font-medium mb-4">
//             <p></p>
//             <div className="flex w-1/2 justify-between">
//               <p>Bill Count</p>
//               <p>Amount</p>
//             </div>
//           </div>
//           <hr className="mb-4 border-gray-200" />
//           <div className="space-y-4 text-gray-700">
//             <div className="flex justify-between items-center">
//               <p>Net Debit Amount</p>
//               <div className="flex w-1/2 justify-between">
//                 <p>{summaryData?.unpaidTotalBills || 0}</p>
//                 <p>₹{formatNumber(summaryData?.unpaidTotalAmount)}</p>
//               </div>
//             </div>
//             <div className="flex justify-between items-center">
//               <p>Net Credit Amount</p>
//               <div className="flex w-1/2 justify-between">
//                 <p>{summaryData?.paidTotalBills || 0}</p>
//                 <p>₹{formatNumber(summaryData?.paidTotalAmount)}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Payment Type Summary */}
//         <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Type Summary</h2>
//           <div className="flex justify-between text-gray-500 font-medium mb-4">
//             <p></p>
//             <div className="flex w-1/2 justify-between">
//               <p>Bill Count</p>
//               <p>Amount</p>
//             </div>
//           </div>
//           <hr className="mb-4 border-gray-200" />
//           <div className="space-y-4 text-gray-700">
//             <div className="flex justify-between items-center">
//               <p>Cash</p>
//               <div className="flex w-1/2 justify-between">
//                 <p>{paymentSummaryData?.cashCount || 0}</p>
//                 <p>₹{formatNumber(paymentSummaryData?.cashTotal)}</p>
//               </div>
//             </div>
//             <div className="flex justify-between items-center">
//               <p>UPI</p>
//               <div className="flex w-1/2 justify-between">
//                 <p>{paymentSummaryData?.upiNetCount || 0}</p>
//                 <p>₹{formatNumber(paymentSummaryData?.upiNetTotal)}</p>
//               </div>
//             </div>
//             <div className="flex justify-between items-center">
//               <p>Card</p>
//               <div className="flex w-1/2 justify-between">
//                 <p>{paymentSummaryData?.cardCount || 0}</p>
//                 <p>₹{formatNumber(paymentSummaryData?.cardTotal)}</p>
//               </div>
//             </div>
//             <div className="flex justify-between items-center">
//               <p>UPI + Cash</p>
//               <div className="flex w-1/2 justify-between">
//                 <p>{paymentSummaryData?.upiCashCount || 0}</p>
//                 <p>₹{formatNumber(paymentSummaryData?.upiCashTotal)}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Return Summary */}
//         <div className="bg-white p-8 rounded-lg border border-gray-200">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Return Summary</h2>
//           <div className="flex justify-end text-gray-500 font-medium mb-4">
//             <p className="w-1/4 text-right">Amount</p>
//           </div>
//           <hr className="mb-4 border-gray-200" />
//           <div className="space-y-4 text-gray-700">
//             <div className="flex justify-between items-center">
//               <p>Total no. of Bill Returns</p>
//               <p className="w-1/4 text-right">{summaryData?.totalReturnBills || 0}</p>
//             </div>
//             <div className="flex justify-between items-center">
//               <p>Total Refund Amount</p>
//               <p className="w-1/4 text-right">₹{formatNumber(summaryData?.totalReturnAmount)}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;