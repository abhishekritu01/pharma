"use client";

import React, { useEffect, useRef, useState } from "react";
import SideBar from "../components/LayoutComponents/SideBar";
import useUserStore from "../context/userStore";
import { usePharma } from "../context/PharmaContex";
import { useRouter } from "next/navigation";
import { getUsersPharma } from "../services/PharmacyService";
import { toast } from "react-toastify";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { initializeUser } = useUserStore();
  const {
    pharma,
    setPharma,
    // currentPharma,
    setCurrentPharma,
    refreshpharma,
    setLoginedUser,
  } = usePharma();
  const router = useRouter();

  const didToast = useRef(false);

  useEffect(() => {
    initializeUser();
    const fetchPharma = async () => {
      try {
        const storedPharma = localStorage.getItem("currentPharma");
        const storedPharmas = localStorage.getItem("userPharmas");
        const getlogedUser = localStorage.getItem("logedUser");

        if (storedPharma && storedPharmas) {
          setPharma(JSON.parse(storedPharmas));
          setCurrentPharma(JSON.parse(storedPharma));
          setLoginedUser(JSON.parse(getlogedUser || "{}"));
        }

        const data = await getUsersPharma();

        setPharma(data);
        localStorage.setItem("userPharmas", JSON.stringify(data));

        if (data && data.length > 0) {
          setPharma(data);
          localStorage.setItem("userPharmas", JSON.stringify(data));

          if (!storedPharma) {
            setCurrentPharma(data[0]);
            localStorage.setItem("currentPharma", JSON.stringify(data[0]));
          }
        } else {
          throw new Error("Pharmacy Not Found");
        }
      } catch (error) {
         if (!didToast.current) {
          toast.error(
            error instanceof Error ? error.message : "Pharmacy Not Found",
            {
              position: "top-right",
              autoClose: 2000,
            }
          );
          didToast.current = true;
        }
      }
    };
    fetchPharma();
  }, [
    initializeUser,
    setPharma,
    setCurrentPharma,
    setLoginedUser,
    refreshpharma,
  ]);

  // const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedPharmaName = event.target.value;
  //   const selectedPharma = pharma.find(
  //     (pharma) => pharma.name === selectedPharmaName
  //   );
  //   if (selectedPharma) {
  //     alert("Are you sure you want to switch to " + selectedPharma.name);
  //     setCurrentPharma(selectedPharma);
  //     localStorage.setItem("currentPharma", JSON.stringify(selectedPharma));
  //     localStorage.setItem("userPharmas", JSON.stringify(selectedPharma));
  //     toast.success(`Switched to ${selectedPharma.name}`, {
  //       position: "top-right",
  //       autoClose: 2000,
  //     });
  //   }
  // };
  useEffect(() => {
    if (pharma == null) {
      router.push("/create-pharma");
    }
  }, [pharma, router]);

  return (
    <div className="flex h-screen ">
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main
        className={`flex-1 ml-20 transition-all duration-400 ${
          isOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Navigation Bar */}
        {/* {user && (
          <TopNav
            user={user}
            labs={labs}
            currentLab={currentLab}
            handleChange={handleChange}
          />
        )} */}

        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px)" }}
        >
          {
            // labs == null ? (<Lab />)
            //   :
            //   (
            <div className="relative isolate bg-white h-screen ">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
              >
                {/* <div
                      style={{
                        clipPath:
                          'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                      }}
                      className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    /> */}
              </div>
              <div className="relative z-10 max-w-full mx-auto ">
                {children}
              </div>
            </div>
            //  )
          }
        </div>
      </main>
    </div>
  );
};

export default Layout;
