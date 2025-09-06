"use client";

import React, { useEffect, useState } from "react";
import useUserStore from "../context/userStore";
import DoughnutChart from "../components/common/DoughnutChart";
import { getBilling } from "../services/BillingService";
import { BillingData } from "../types/BillingData";
import BarChart from "../components/common/BarChart";
import { RiBarChartBoxFill } from "react-icons/ri";
import { AiFillAlert } from "react-icons/ai";
import { getPurchase } from "../services/PurchaseEntryService";
import { getPurchaseOrder } from "../services/PurchaseOrderService";

const Page = () => {
  const { user, initializeUser } = useUserStore();
  const [greeting, setGreeting] = useState("");
  // const [weeklyBillCount, setWeeklyBillCount] = useState<number>(0);
  // const [weeklyBillAmount, setWeeklyBillAmount] = useState<number>(0);
  // const [pendingInvoices, setPendingInvoices] = useState<number>(0);
  // const [overdueInvoices, setOverdueInvoices] = useState<number>(0);
  // const [deliveryStats, setDeliveryStats] = useState({
  //   dueThisWeek: 0,
  //   overdueUndelivered: 0,
  // });
  const [,setWeeklyBillCount] = useState<number>(0);
  const [,setWeeklyBillAmount] = useState<number>(0);
  const [, setPendingInvoices] = useState<number>(0);
  const [, setOverdueInvoices] = useState<number>(0);
  const [, setDeliveryStats] = useState({
    dueThisWeek: 0,
    overdueUndelivered: 0,
  });
  const [selectedRange, setSelectedRange] = useState<
    "today" | "week" | "month"
  >("today");

  const [billCountData, setBillCountData] = useState({
    labels: ["Paid", "Pending"],
    values: [0, 0],
  });

  const [financialSummaryData, setFinancialSummaryData] = useState({
    labels: ["Cash", "Card", "Online"],
    values: [0, 0, 0],
  });

  const [patientSummaryData, setPatientSummaryData] = useState({
    labels: ["Walkin", "IP", "OP"],
    values: [0, 0, 0],
  });

  useEffect(() => {
    setGreeting(getGreeting());
    initializeUser();
    fetchData();
  }, [initializeUser]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const handleRangeChange = (range: "today" | "week" | "month") => {
    setSelectedRange(range);
    fetchData(range);
  };

  const fetchData = async (range: "today" | "week" | "month" = "today") => {
    const result = await getBilling();

    if (result.status === "success" && Array.isArray(result.data)) {
      const patientCounts = { Walkin: 0, IP: 0, OP: 0 };
      let paid = 0,
        pending = 0;
      let cash = 0,
        card = 0,
        online = 0;
      const salesByDay = Array(7).fill(0);
      let weeklyBillTotal = 0;
      let weeklyAmountTotal = 0;

      const now = new Date();
      let startDate = new Date(now);
      let endDate = new Date(now);

      if (range === "today") {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (range === "week") {
        const day = now.getDay();
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (range === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      result.data.forEach((bill: BillingData) => {
        const billDate = new Date(bill.billDateTime ?? "");
        billDate.setHours(0, 0, 0, 0);

        const amount = bill.grandTotal ?? 0;

        if (billDate >= startDate && billDate <= endDate) {
          const type = bill.patientType;
          if (type === "Walkin") patientCounts.Walkin++;
          else if (type === "IP") patientCounts.IP++;
          else if (type === "OP") patientCounts.OP++;

          if (bill.paymentStatus === "paid") paid++;
          else pending++;

          const paymentType = bill.paymentType?.toLowerCase();
          if (paymentType === "cash") {
            cash += amount;
          } else if (
            paymentType === "creditcard" ||
            paymentType === "debitcard"
          ) {
            card += amount;
          } else if (paymentType === "upi" || paymentType === "net banking") {
            online += amount;
          } else if (paymentType === "upicash") {
            // UPI & Cash are stored separately
            const upiAmount = bill.upi ?? 0;
            const cashAmount = bill.cash ?? 0;
            online += upiAmount;
            cash += cashAmount;
          }
        }

        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        if (billDate >= weekStart && billDate <= weekEnd) {
          weeklyBillTotal++;
          weeklyAmountTotal += amount;
          const day = billDate.getDay();
          salesByDay[day] += amount;
        }
      });

      setPatientSummaryData({
        labels: ["Walkin", "IP", "OP"],
        values: [patientCounts.Walkin, patientCounts.IP, patientCounts.OP],
      });

      setBillCountData({
        labels: ["Paid", "Pending"],
        values: [paid, pending],
      });

      setFinancialSummaryData({
        labels: ["Cash", "Card", "UPI / Online"],
        values: [Math.round(cash), Math.round(card), Math.round(online)],
      });

      setWeeklySalesData(salesByDay);
      setWeeklyBillCount(weeklyBillTotal);
      setWeeklyBillAmount(weeklyAmountTotal);

      const purchaseResult = await getPurchase();
      if (
        purchaseResult.status === "success" &&
        Array.isArray(purchaseResult.data)
      ) {
        let pendingInvoicesCount = 0;
        let overdueInvoicesCount = 0;

        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        purchaseResult.data.forEach((purchase) => {
          if (!purchase.paymentDueDate) return;

          const dueDate = new Date(purchase.paymentDueDate);
          const isPaid = purchase.paymentStatus?.toLowerCase() === "paid";
          const isInWeek = dueDate >= weekStart && dueDate <= weekEnd;

          if (isInWeek && !isPaid) {
            if (dueDate < todayMidnight) overdueInvoicesCount++;
            else pendingInvoicesCount++;
          }
        });

        setPendingInvoices(pendingInvoicesCount);
        setOverdueInvoices(overdueInvoicesCount);
      }

      const purchaseOrderResult = await getPurchaseOrder();
      if (
        purchaseOrderResult.status === "success" &&
        Array.isArray(purchaseOrderResult.data)
      ) {
        let ordersDueThisWeek = 0;
        let undeliveredOverdueOrders = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        purchaseOrderResult.data.forEach((order) => {
          if (!order.intendedDeliveryDate) return;

          const deliveryDate = new Date(order.intendedDeliveryDate);
          deliveryDate.setHours(0, 0, 0, 0);

          if (deliveryDate >= weekStart && deliveryDate <= weekEnd) {
            ordersDueThisWeek++;
            if (deliveryDate < today) undeliveredOverdueOrders++;
          }
        });

        setDeliveryStats({
          dueThisWeek: ordersDueThisWeek,
          overdueUndelivered: undeliveredOverdueOrders,
        });
      }
    } else {
      console.error("Failed to load billing data:", result.message);
    }
  };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const [weeklySalesData, setWeeklySalesData] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);

  return (
    <main>
      <div className="mt-3 space-y-1">
        <div className="font-semibold text-3xl text-darkPurple">
          {greeting},{" "}
          {`${capitalize(user?.firstName || "")} ${capitalize(
            user?.lastName || ""
          )}`}
        </div>
        <div className="font-normal text-lg text-fourGray">
          Welcome to your Pharma Management Dashboard
        </div>
      </div>

      <div className="text-sm font-normal text-[#726C6C] flex space-x-7 pt-7 cursor-pointer ml-3">
        <div
          onClick={() => handleRangeChange("today")}
          className={`hover:text-[#4B0082] ${
            selectedRange === "today" ? "text-[#4B0082]" : ""
          }`}
        >
          Today
        </div>
        <div
          onClick={() => handleRangeChange("week")}
          className={`hover:text-[#4B0082] ${
            selectedRange === "week" ? "text-[#4B0082]" : ""
          }`}
        >
          This Week
        </div>
        <div
          onClick={() => handleRangeChange("month")}
          className={`hover:text-[#4B0082] ${
            selectedRange === "month" ? "text-[#4B0082]" : ""
          }`}
        >
          This Month
        </div>
      </div>

      <div className="flex gap-6 pt-3">
        <ChartCard title="Bill Count Summary" data={billCountData} />
        <ChartCard title="Financial Summary" data={financialSummaryData} />
        <ChartCard title="Patient Summary" data={patientSummaryData} />
      </div>

      <div className="flex pt-7">
        <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow-lg rounded-xl p-4 h-72 w-full">
          <div className="font-normal text-lg whitespace-nowrap flex items-center space-x-3">
            <span className="text-[#B16CE9]">
              <RiBarChartBoxFill />
            </span>
            <span>Sales Analytics</span>
          </div>
          <div className="">
            <BarChart salesData={weeklySalesData} />
          </div>
        </div>

        {/* <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow-lg rounded-xl p-5 h-72 w-full space-y-6">
          <div className="font-normal text-lg whitespace-nowrap flex items-center space-x-3">
            <span className="text-[#FCA258]">
              <AiFillAlert />
            </span>
            <span>Important Alerts</span>
          </div>
          <div className="flex flex-col space-y-2 text-base font-normal text-[#433E3F] cursor-pointer">
            <span className="hover:text-[#4B0082] transition-colors">
              {weeklyBillCount} bills were generated this week
            </span>
            <span className="hover:text-[#4B0082] transition-colors">
              ₹{weeklyBillAmount} total billing for the week
            </span>
            <span className="hover:text-[#4B0082] transition-colors">
              {pendingInvoices} purchase invoices due this week
            </span>
            <span className="hover:text-[#4B0082] transition-colors">
              {overdueInvoices} purchase invoices pending past due date
            </span>
            <span className="hover:text-[#4B0082] transition-colors">
              {deliveryStats.dueThisWeek} orders expected for delivery this week
            </span>
            <span className="hover:text-[#4B0082] transition-colors">
              {deliveryStats.overdueUndelivered} orders are undelivered past the
              expected delivery date
            </span>
          </div>

        </div> */}

        <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow-lg rounded-xl p-5 h-72 w-full">
          <div className="font-normal text-lg whitespace-nowrap flex items-center space-x-3 mb-4">
            <span className="text-[#FCA258]">
              <AiFillAlert />
            </span>
            <span>Important Alerts</span>
          </div>

          
          <div className="text-sm font-medium text-[#433E3F] space-y-6 overflow-y-auto h-[calc(100%-2.5rem)] pr-2">
            <div className="space-y-2">
              <div>Inventory Alerts</div>
              <div className="space-y-2 text-gray-600 px-3">
                <p>48 SKUs OOS</p>
                <p>15 SKUs Low</p>
                <p>12 SKUs No sales</p>
                <p>5 SKUs Added this week</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>Billing & Invoices</div>
              <div className="space-y-2 text-gray-600 px-3">
                <p>112 Auto-matched invoices</p>
                <p>Mismatched flagged</p>
                <p>7 credit notes pending</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>Sales & Revenue</div>
              <div className="space-y-2 text-gray-600 px-3">
                <p>Sales down 8% MoM</p>
                <p>Avg order +5%</p>
                <p>4 hot SKUs OOS</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>Delivery & Logistics</div>
              <div className="space-y-2 text-gray-600 px-3">
                <p>Returns in transit</p>
                <p>Delayed &gt;48 hrs</p>
                <p>Damaged on delivery</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>User & Activity</div>
              <div className="space-y-2 text-gray-600 px-3">
                <p>26 New customers</p>
                <p>9 Inactive &gt;30 days</p>
                <p>Seller under review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const ChartCard = ({
  title,
  data,
}: {
  title: string;
  data: { labels: string[]; values: number[] };
}) => (
  <div className="max-w-sm mx-auto bg-white border border-gray-100 shadow-lg rounded-xl p-4 h-64 w-full">
    <div className="flex flex-col">
      <h1 className="font-normal text-lg whitespace-nowrap">{title}</h1>
      <div className="flex items-center mt-5">
        <DoughnutChart labels={data.labels} data={data.values} />
      </div>
    </div>
  </div>
);

export default Page;
