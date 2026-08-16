import { updateStudioSettingSchema } from "@/schemas/StudioSettings.schema";
import useZodForm from "./useZodForm";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateStudioSettings } from "@/lib/utils";
import { toast } from "sonner";

export const useStudioSettings = (
  id: string,
  screen?: string | null,
  audio?: string | null,
  preset?: "HD" | "SD",
  plan?: "PRO" | "FREE",
) => {
  const { register, watch } = useZodForm(updateStudioSettingSchema, {
    screen: screen!,
    audio: audio!,
    preset: preset!,
  });

  const { mutate } = useMutation({
    mutationKey: ["update-studio"],
    mutationFn: (data: {
      screen: string;
      id: string;
      audio: string;
      preset: "HD" | "SD";
    }) => updateStudioSettings(data.id, data.screen, data.audio, data.preset),
    onSuccess: (data) => {
      return toast(data.status === 200 ? "Success" : "Error", {
        description: data.message,
      });
    },
    onError: () => {
      toast.error("Unable to save media settings");
    },
  });

  useEffect(() => {
    if (screen && audio) {
      window.ipcRenderer.send("media-sources", {
        screen,
        id: id,
        audio,
        preset,
        plan,
      });
    }
  }, [audio, screen]);

  useEffect(() => {
    const subscribe = watch((values, { type }) => {
      // Ignore form initialization/reset events. Persist only user selections.
      if (type !== "change") return;

      mutate({
        screen: values.screen,
        id: id,
        audio: values.audio,
        preset: values.preset,
      });

      window.ipcRenderer.send("media-sources", {
        screen: values.screen,
        audio: values.audio,
        id: id,
        preset: values.preset,
        plan,
      });
    });
    return () => subscribe.unsubscribe();
  }, [id, mutate, plan, watch]);

  return { register };
};
