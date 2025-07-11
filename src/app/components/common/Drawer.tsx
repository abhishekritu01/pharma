"use client";
import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DrawerProps {
  setShowDrawer: (value: boolean) => void;
  children: React.ReactNode;
  title: string;
}

const Drawer: React.FC<DrawerProps> = ({ setShowDrawer, children, title }) => {
  const [open,] = useState(true);

  const handleShowDrawer: () => void = () => {
    setShowDrawer(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleShowDrawer()}
      className="relative z-10"
    >
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" aria-hidden="true" />

      <div className="fixed inset-0" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel className="pointer-events-auto w-auto transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700">
              <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl justify-between">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-2xl font-medium text-gray-900">
                      {title}
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setShowDrawer(false)}
                        className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden cursor-pointer"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only ">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  {children}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Drawer;
