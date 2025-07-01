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
  const [weeklyBillCount, setWeeklyBillCount] = useState<number>(0);
  const [weeklyBillAmount, setWeeklyBillAmount] = useState<number>(0);
  const [pendingInvoices, setPendingInvoices] = useState<number>(0);
  const [overdueInvoices, setOverdueInvoices] = useState<number>(0);
  const [deliveryStats, setDeliveryStats] = useState({
    dueThisWeek: 0,
    overdueUndelivered: 0,
  });

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
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const fetchData = async () => {
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
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      result.data.forEach((bill: BillingData) => {
        const billDate = new Date(bill.billDateTime ?? "");
        const amount = bill.grandTotal ?? 0;

        if (billDate >= startOfWeek && billDate <= endOfWeek) {
          weeklyBillTotal++;
          weeklyAmountTotal += amount;
          const day = billDate.getDay();
          salesByDay[day] += amount;
        }

        const type = bill.patientType;
        if (type === "Walkin") patientCounts.Walkin++;
        else if (type === "IP") patientCounts.IP++;
        else if (type === "OP") patientCounts.OP++;

        if (bill.paymentStatus === "paid") paid++;
        else pending++;

        const paymentType = bill.paymentType?.toLowerCase();

        if (paymentType === "cash") cash += amount;
        else if (paymentType === "credit card" || paymentType === "debit card")
          card += amount;
        else if (paymentType === "upi" || paymentType === "net banking")
          online += amount;
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
        labels: ["Cash", "Card", "Online"],
        values: [cash, card, online],
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
        const startOfCurrentWeek = new Date(today);
        startOfCurrentWeek.setDate(today.getDate() - today.getDay());
        startOfCurrentWeek.setHours(0, 0, 0, 0);

        const endOfCurrentWeek = new Date(startOfCurrentWeek);
        endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
        endOfCurrentWeek.setHours(23, 59, 59, 999);

        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        purchaseResult.data.forEach((purchase) => {
          if (!purchase.paymentDueDate) return;

          const dueDate = new Date(purchase.paymentDueDate);
          const isPaid = purchase.paymentStatus?.toLowerCase() === "paid";

          const isInCurrentWeek =
            dueDate >= startOfCurrentWeek && dueDate <= endOfCurrentWeek;

          if (isInCurrentWeek && !isPaid) {
            if (dueDate < todayMidnight) {
              overdueInvoicesCount++;
            } else {
              pendingInvoicesCount++;
            }
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

        const startOfCurrentWeek = new Date(today);
        startOfCurrentWeek.setDate(today.getDate() - today.getDay());
        startOfCurrentWeek.setHours(0, 0, 0, 0);

        const endOfCurrentWeek = new Date(startOfCurrentWeek);
        endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
        endOfCurrentWeek.setHours(23, 59, 59, 999);

        purchaseOrderResult.data.forEach((order) => {
          if (!order.intendedDeliveryDate) return;

          const deliveryDate = new Date(order.intendedDeliveryDate);
          deliveryDate.setHours(0, 0, 0, 0);

          const isInCurrentWeek =
            deliveryDate >= startOfCurrentWeek &&
            deliveryDate <= endOfCurrentWeek;

          if (isInCurrentWeek) {
            ordersDueThisWeek++;

            if (deliveryDate < today) {
              undeliveredOverdueOrders++;
            }
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
    <main className="space-y-10">
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

      <div className="flex gap-6">
        <ChartCard title="Bill Count Summary" data={billCountData} />
        <ChartCard title="Financial Summary" data={financialSummaryData} />
        <ChartCard title="Patient Summary" data={patientSummaryData} />
      </div>

      <div className="flex">
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

        <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow-lg rounded-xl p-5 h-72 w-full space-y-6">
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
