import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const onCloseApp = () => window.ipcRenderer?.send("closeApp");

const httpClient = axios.create({
  // Use Vite's same-origin proxy in development to prevent browser CORS checks.
  // Set VITE_API_BASE_URL only when a production API gateway is configured.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

export const fetchUserProfile = async (clerkId: string) => {
  const response = await httpClient.get(`/auth/${clerkId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("user data", response);
  return response.data;
};

export const getMediaResources = async () => {
  const displays = await window.ipcRenderer.invoke("getSources"); // just a syntax no need to Remember
  const enumeratedDevices =
    await window.navigator.mediaDevices.enumerateDevices();
  const audioInputs = enumeratedDevices.filter((d) => d.kind === "audioinput");
  console.log("getting Sources");
  return { displays, audio: audioInputs };
};
export const updateStudioSettings = async (
  id: string,
  screen: string,
  audio: string,
  preset: "HD" | "SD",
) => {
  const res = await httpClient.post(
    `/studio/${id}`,
    {
      screen,
      audio,
      preset,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return res.data;
};