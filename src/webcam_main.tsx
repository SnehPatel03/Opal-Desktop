import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function WebcamWindow() {
  return (
    <main className="flex h-full items-center justify-center bg-transparent p-3 text-white draggable">
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-white/10 bg-[#171717]/95 text-sm text-gray-400 shadow-lg">
        Webcam preview is ready
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebcamWindow />
  </React.StrictMode>,
);
