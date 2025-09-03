"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import { Plus } from "lucide-react";
import Drawer from "@/app/components/common/Drawer";
import AddUser from "./component/AddUser";
import { UserData } from "@/app/types/UserData";
import { PharmacyData } from "@/app/types/PharmacyData";
import { getPharmacy } from "@/app/services/PharmacyService";
import { getUserOfPharmacy } from "@/app/services/UserService";
import { toast } from "react-toastify";
import PaginationTable from "@/app/components/common/PaginationTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import Loader from "@/app/components/common/Loader";

type Action = "edit" | "delete";

const Page = () => {
  const roles = [
    {
      icon: "/icons/UserIcon1.svg",
      title: "Pharmacy Owner",
      features: [
        "Full access to all modules",
        "Manage users & roles",
        "Control store settings",
      ],
    },
    {
      icon: "/icons/UserIcon2.svg",
      title: "Admin",
      features: [
        "Handle stock & purchase",
        "Track inventory movement",
        "Update batch & pricing",
      ],
    },
    {
      icon: "/icons/UserIcon3.svg",
      title: "Front Desk / Sales",
      features: [
        "Create bills & orders",
        "View stock & customers",
        "No access to settings",
      ],
    },
  ];

  const [showUser, setShowUser] = useState(false);
  const [, setShowDrawer] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(
    null
  );
  const [action, setAction] = useState<Action | undefined>(undefined);
  const [, setPharmacies] = useState<PharmacyData[]>([]);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    {
      header: "User Name",
      accessor: "username" as keyof UserData,
    },
    {
      header: "Email",
      accessor: "email" as keyof UserData,
    },
    {
      header: "Roles",
      accessor: "roles" as keyof UserData,
    },
    {
      header: "Status",
      accessor: (row: UserData) => {
        const isActive = row.enabled === true;

        const bgClass = isActive ? "bg-green" : "bg-danger";
        const textClass = isActive ? "text-green" : "text-danger";

        return (
          <span
            className={`px-2 py-1 rounded-xl text-sm font-medium ${bgClass} ${textClass}`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      header: "Action",
      accessor: (row: UserData) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          <div className="absolute right-0 mt-2 min-w-[160px] bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
            <button
              onClick={() => handleUserDrawer(row.id, "edit")}
              className="w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              Edit
            </button>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchPharmacies = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPharmacy();

        const pharmacies = res?.data || [];

        setPharmacies(pharmacies);

        if (pharmacies.length > 0 && pharmacies[0]?.pharmacyId) {
          fetchUser(pharmacies[0].pharmacyId);
        } else {
          console.warn("No valid pharmacyId found.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch pharmacies:", error);
        setError("Failed to load pharmacy data");
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  // const fetchUser = async (pharmacyId?: number) => {
  //   try {
  //     const response = await getUserOfPharmacy(pharmacyId);

  //     const users = response?.data || response?.users || [];
  //     setUser(users);
  //   } catch (error) {
  //     toast.error("Failed to fetch members");
  //     console.error("Failed to fetch users:", error);
  //     setError("Failed to load user data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUser = async (pharmacyId?: number) => {
    if (!pharmacyId) return; // prevent call if no pharmacyId

    try {
      const response = await getUserOfPharmacy(pharmacyId);
      const users = response?.data || response?.users || [];
      setUser(users);
    } catch (error) {
      toast.error("Failed to fetch members");
      console.error("Failed to fetch users:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedPharma = localStorage.getItem("currentPharma");
    const pharmacyId = storedPharma
      ? JSON.parse(storedPharma).pharmacyId
      : null;

    if (pharmacyId) {
      fetchUser(pharmacyId);
    }
  }, []);

  const handleUserDrawer = (id?: number, action?: Action) => {
    if (id) {
      setCurrentUserId(id);
    } else {
      setCurrentUserId(null);
    }

    setAction(action);
    setShowUser(true);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setShowUser(false);
  };

  return (
    <>
      {showUser && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Create User"}>
          <AddUser
            setShowDrawer={handleCloseDrawer}
            id={currentUserId}
            action={action}
            onSuccess={(pharmacyId) => fetchUser(pharmacyId)}
          />
        </Drawer>
      )}

      <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
        User Management
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role, index) => (
          <div
            key={index}
            className="w-full h-44 bg-[#FAFAFA] p-8 mt-7 rounded-xl"
          >
            <div className="flex space-x-5 items-center">
              <Image
                src={role.icon}
                alt={`${role.title} Icon`}
                width={24}
                height={24}
              />
              <span className="font-medium text-xl">{role.title}</span>
            </div>

            <ul className="list-disc list-inside text-gray mt-3 text-base font-normal px-2">
              {role.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-10 items-center">
        <div>
          <div className="justify-start text-2xl font-medium leading-10">
            User List
          </div>
          <div className="text-base font-normal text-fourGray">
            Manage staff access for operations, inventory, and more
          </div>
        </div>

        <div>
          <Button
            onClick={() => handleUserDrawer()}
            label="Add User"
            value=""
            className="w-40 bg-darkPurple text-white h-11 "
            icon={<Plus size={15} />}
          ></Button>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div> */}
            <Loader
              type="spinner"
              size="md"
              text="User List is loading ..."
              fullScreen={false}
            />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error!</strong> {error}
          </div>
        ) : (
          <PaginationTable
            data={user}
            columns={columns}
            noDataMessage="No records found"
          />
        )}
      </div>
    </>
  );
};

export default Page;
