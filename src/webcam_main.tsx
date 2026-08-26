import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import "./index.css";
import webcam_app from "./webcam_app";
import Webcam_app from "./webcam_app";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key!");
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <Webcam_app />
    </ClerkProvider>
  </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});
