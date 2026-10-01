import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";

import "./index.css";
import Studio_App from "./studio_app.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Studio_App />

    <Toaster
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
    />
  </React.StrictMode>
);

// Electron IPC
window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});