import { cn, onCloseApp } from "@/lib/utils";
import React from "react";
import { X } from "lucide-react";

type Props = {
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
};

const ControlLayout = ({ children, className, headerContent }: Props) => {
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
      <div className="draggable flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="non-draggable">{headerContent}</div>

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

      <main className="flex-1 overflow-hidden">
        <div className="h-full p-4">{children}</div>
      </main>
    </div>
  );
};

export default ControlLayout;
