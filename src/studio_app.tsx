import { useEffect } from "react";
import StudioTray from "./components/Global/StudioTray";

function Studio_App() {
  useEffect(() => {
    document.body.classList.add("studio-window");
    return () => document.body.classList.remove("studio-window");
  }, []);

  return (
    <StudioTray />
  );
}

export default Studio_App;
