import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const onCloseApp = () => window.ipcRenderer?.send("closeApp");

const httpClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? "https://opal-beige.vercel.app/api"
      : "/api"),
});

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const fetchUserProfile = async (clerkId: string, token: string) => {
  const response = await httpClient.get(`/auth/${clerkId}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });
  return response.data;
};

export type DesktopSource = {
  id: string;
  name: string;
  display_id: string;
};

export const getMediaResources = async () => {
  if (!window.ipcRenderer) {
    throw new Error("Media sources are available only in the desktop app.");
  }

  // Browsers hide microphone names until the user grants microphone access.
  // Request it once, then immediately release the stream because recording has
  // not started yet.
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    // Devices can still be listed after a denial, but their labels may be blank.
    console.warn("Microphone permission was not granted.", error);
  }

  const [displays, enumeratedDevices] = await Promise.all([
    window.ipcRenderer.invoke("getSources") as Promise<DesktopSource[]>,
    navigator.mediaDevices.enumerateDevices(),
  ]);
  const audioInputs = enumeratedDevices.filter(
    (device) => device.kind === "audioinput",
  );

  return { displays, audio: audioInputs };
};
export const updateStudioSettings = async (
  id: string,
  screen: string,
  audio: string,
  preset: "HD" | "SD",
  token: string,
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
        ...authHeaders(token),
      },
    },
  );

  return res.data;
};

export const hidePluginWindow = (state: boolean) => {
  window.ipcRenderer.send("hide-plugin", { state });
};

export const videoRecordingTime = (ms: number) => {
  const second = Math.floor((ms / 1000) % 60)
    .toString()
    .padStart(2, "0");
  const minute = Math.floor((ms / 1000 / 60) % 60)
    .toString()
    .padStart(2, "0");
  const hour = Math.floor((ms / 1000 / 60 / 60) % 60)
    .toString()
    .padStart(2, "0");

  return { length: `${hour}:${minute}:${second}`, minute };
};
