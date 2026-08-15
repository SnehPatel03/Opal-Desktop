import { cn, onCloseApp } from "@/lib/utils";
import React from "react";
import { X } from "lucide-react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const ControlLayout = ({ children, className }: Props) => {
  return (
    <div
      className={cn(
        "w-full h-full min-h-screen",
        "bg-[#171717]",
        "flex flex-col",
        "overflow-hidden",
        className,
      )}
    >
      <div className="draggable flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-auto px-3 gap-1 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="App Logo"
              className="w-6 h-6 object-contain"
            />
            <span className="text-gray-200 text-xl ">Opal</span>
          </div>

          <div className="flex flex-col"></div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onCloseApp}
          className="
            non-draggable
            w-9 h-9
            flex items-center justify-center
            rounded-xl
            text-gray-400
            hover:text-white
            hover:bg-white/10
            transition-all duration-200
          "
        >
          <X size={18} />
        </button>
      </div>

      <main className="flex-1 overflow-auto">
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
};

export default ControlLayout;
