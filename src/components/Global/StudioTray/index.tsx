"use client";

import { onStopRecording, StartRecording } from "@/lib/recorder";
import { cn, videoRecordingTime } from "@/lib/utils";
import { Cast, Square } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type StudioSource = {
  id: string;
  screen: string;
  audio: string;
  preset: "HD" | "SD";
  plan: "FREE" | "PRO";
};

const StudioTray = () => {
  const [preview, setPreview] = useState(false);
  const [recording, setRecording] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [onTimer, setOnTimer] = useState("00:00:00");

  const [onSources, setOnSources] = useState<StudioSource | undefined>(
    undefined,
  );

  const initialTime = useRef(new Date());
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const previewStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    const video = videoElement.current;
    if (!preview || !video || !previewStream.current) return;

    video.srcObject = previewStream.current;
    void video.play();
  }, [preview]);

  useEffect(() => {
    return () => {
      previewStream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const handleProfileReceived = (
      _event: unknown,
      payload: StudioSource,
    ) => {
      setOnSources(payload);
    };

    window.ipcRenderer?.on("profile-received", handleProfileReceived);

    return () => {
      window.ipcRenderer?.removeListener(
        "profile-received",
        handleProfileReceived,
      );
    };
  }, []);

  const clearTime = () => {
    setOnTimer("00:00:00");
    initialTime.current = new Date();
  };

  useEffect(() => {
    if (!recording) return;

    const recordTimeInterval = setInterval(() => {
      const time =
        new Date().getTime() - initialTime.current.getTime();

      const recordingTime = videoRecordingTime(time);

      if (onSources?.plan === "FREE" && time >= 3 * 60 * 1000) {
        setRecording(false);
        clearTime();
        onStopRecording();
        toast.message('Free Tier limit: Videos can’t be longer than 3 minutes' )
        return;
      }

      setOnTimer(recordingTime.length);

      if (time <= 0) {
        setOnTimer("00:00:00");
        clearInterval(recordTimeInterval);
      }
    }, 100);

    return () => clearInterval(recordTimeInterval);
  }, [recording, onSources?.plan]);

  const handleStartRecording = async () => {
    if (!onSources || recording) return;

    try {
      setStartError(null);

      await StartRecording(onSources);

      setRecording(true);
      initialTime.current = new Date();
    } catch (error) {
      console.error("Unable to start recording", error);
      setStartError(
        "Allow screen and microphone access, then try again.",
      );
    }
  };

  const handleStopRecording = () => {
    if (!recording) return;

    setRecording(false);
    clearTime();
    onStopRecording();
  };

  const stopPreview = () => {
    previewStream.current?.getTracks().forEach((track) => track.stop());
    previewStream.current = null;

    if (videoElement.current) {
      videoElement.current.srcObject = null;
    }

    setPreview(false);

    window.ipcRenderer?.send("resize-studio", {
      shrink: true,
    });
  };

  const handlePreview = async () => {
    if (preview) {
      stopPreview();
      return;
    }

    if (!onSources) return;

    try {
      setStartError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: onSources.screen,
            maxFrameRate: 30,
          },
        } as unknown as MediaTrackConstraints,
      });

      previewStream.current = stream;

      setPreview(true);

      window.ipcRenderer?.send("resize-studio", {
        shrink: false,
      });
    } catch (error) {
      console.error("Unable to show preview", error);

      setStartError("Unable to show the selected screen preview.");

      stopPreview();
    }
  };

  return (
    <div
      className="
        flex
        h-screen
        w-full
        flex-col
        items-center
        justify-center
        gap-3
        bg-transparent
        p-4
        draggable
      "
    >
      {/* Preview */}
      {preview && (
        <div
          className="
            relative
            w-full
            max-w-[368px]
            overflow-hidden
            rounded-xl
            border
            border-white/[0.12]
            bg-[#080808]
            shadow-[0_16px_50px_rgba(0,0,0,0.55)]
          "
        >
          <video
            ref={videoElement}
            autoPlay
            muted
            playsInline
            className="
              block
              aspect-video
              w-full
              object-cover
            "
          />

          {/* Preview indicator */}
          <div
            className="
              absolute
              left-3
              top-3
              flex
              items-center
              gap-1.5
              rounded-full
              bg-black/70
              px-2.5
              py-1
              backdrop-blur-md
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff4c0f]" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-white/80">
              Preview
            </span>
          </div>
        </div>
      )}

      {/* Recorder */}
      <div
        className="
          draggable
          flex
          h-[68px]
          w-full
          max-w-[380px]
          items-center
          rounded-[20px]
          border
          border-white/[0.12]
          bg-[#101011]/95
          px-3
          shadow-[0_12px_40px_rgba(0,0,0,0.5)]
          backdrop-blur-xl
        "
      >
        {/* Record */}
        <button
          type="button"
          onClick={handleStartRecording}
          disabled={!onSources || recording}
          aria-label="Start recording"
          className="
            non-draggable
            flex
            h-12
            w-12
            shrink-0
            cursor-pointer
            items-center
            justify-center
            rounded-full
            transition-transform
            duration-200
            hover:scale-105
            active:scale-95
            disabled:cursor-default
            disabled:hover:scale-100
          "
        >
          <span
            className={cn(
              "block transition-all duration-200",
              recording
                ? "h-6 w-6 rounded-[5px] bg-[#ff4c0f] shadow-[0_0_14px_rgba(255,76,15,0.35)]"
                : "h-8 w-8 rounded-full bg-[#ff4c0f] shadow-[0_0_18px_rgba(255,76,15,0.25)]",
            )}
          />
        </button>

        {/* Status */}
        <div className="non-draggable flex flex-1 items-center justify-center px-3">
          {recording ? (
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff4c0f]" />

              <span
                className="
                  min-w-[70px]
                  text-center
                  font-mono
                  text-sm
                  font-medium
                  tracking-wider
                  text-white
                "
              >
                {onTimer}
              </span>
            </div>
          ) : (
            <span
              className={cn(
                "max-w-[180px] select-none truncate text-center text-xs font-medium tracking-wide",
                startError
                  ? "text-[#ff4c0f]"
                  : onSources
                    ? "text-zinc-500"
                    : "text-zinc-600",
              )}
            >
              {startError ??
                (onSources ? "Ready to record" : "Loading settings…")}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="non-draggable flex items-center gap-0.5">
          {/* Stop */}
          <button
            type="button"
            onClick={handleStopRecording}
            disabled={!recording}
            aria-label="Stop recording"
            className={cn(
              `
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition-all
                duration-200
              `,
              recording
                ? "cursor-pointer text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                : "cursor-not-allowed text-zinc-700",
            )}
          >
            <Square
              size={16}
              strokeWidth={2}
              fill={recording ? "currentColor" : "none"}
            />
          </button>

          {/* Preview */}
          <button
            type="button"
            onClick={handlePreview}
            disabled={!onSources}
            aria-label={preview ? "Hide preview" : "Show preview"}
            aria-pressed={preview}
            className={cn(
              `
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition-all
                duration-200
                disabled:cursor-not-allowed
              `,
              preview
                ? "bg-[#ff4c0f]/15 text-[#ff4c0f]"
                : "text-zinc-400 hover:bg-white/[0.08] hover:text-white",
            )}
          >
            <Cast size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioTray;