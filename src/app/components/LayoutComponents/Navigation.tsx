"use client"; 

import { NavigationItem } from '@/app/types/NavigationItem'
import { MdDashboard, MdInventory, MdAssignmentReturn, MdOutlineInventory,MdBarChart  } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import { RiMedicineBottleFill} from "react-icons/ri";
import { FaNotesMedical, FaStore} from "react-icons/fa6";
import { PiKeyReturnFill, PiReceiptFill } from "react-icons/pi";
import { FaListAlt } from 'react-icons/fa';
import { TbCreditCardFilled } from "react-icons/tb";
import { RiWaterPercentFill } from "react-icons/ri";
import { ClockAlert } from 'lucide-react';
import { BsCashStack } from 'react-icons/bs';




export const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: MdDashboard, current: true },

  {
    name: "Purchase",
    icon: MdInventory,
    current: false,
    children: [
      { name: "Purchase Order", href: "/dashboard/order", current: false, icon:  FaNotesMedical},
      { name: "Purchase Entry", href: "/dashboard/entry", current: false, icon: FaListAlt  },
      { name: "Purchase Return", href: "/dashboard/return", current: false, icon: MdAssignmentReturn },
      { name: "Inventory", href: "/dashboard/stockreport", icon: MdOutlineInventory , current: true },
    ],
  },

  // { name: "Stock", href: "/dashboard/inventory", icon: MdOutlineInventory , current: true },




    {
    name: "Bill",
    icon: PiReceiptFill,
    current: false,
    children: [
      { name: "Billing", href: "/dashboard/billing", icon: PiReceiptFill, current: true },
      { name: "Bill Return", href: "/dashboard/salesReturn", icon: PiKeyReturnFill, current: true },
      { name: "EOD Bill Report", href: "/dashboard/billingSummary", icon: BsCashStack, current: true },
     
    ],
  },
   

  {
    name: "Stock Summary",
    icon: MdBarChart,
    current: false,
    children: [
      { name: "Supplier Payment", href: "/dashboard/spaymentsummary", icon: TbCreditCardFilled , current: true },
      { name: "GST Summary", href: "/dashboard/gstsummary", icon: RiWaterPercentFill , current: true },
      { name: "Expired Stock", href: "/dashboard/expiryReport", icon: ClockAlert , current: true } 
    ],
  },

  
    {
    name: "Inventory Setting",
    icon: FaStore,
    current: false,
    children: [
      { name: "Supplier Master", href: "/dashboard/supplier", icon: IoPeople, current: true },
      { name: "Item Master", href: "/dashboard/item", icon: RiMedicineBottleFill, current: true },
     
    ],
  },
   

  // {
  //   name: "Settings",
  //   icon: IoSettings,
  //   current: false,
  //   children: [
  //     { name: "User Profile", href: "/dashboard/profile", current: false, icon: HiUser },
  //     { name: "Pharmacy", href: "/dashboard/lab", current: false, icon: FaHouseChimneyMedical },
  //   ],
  // },
];