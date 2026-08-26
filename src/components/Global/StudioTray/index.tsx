import { onStopRecording, StartRecording } from "@/lib/recorder";
import { cn, videoRecordingTime } from "@/lib/utils";
import { Cast, Pause, Square } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
    const handleProfileReceived = (_event: unknown, payload: StudioSource) => {
      console.log("Profile received:", payload);
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
      const time = new Date().getTime() - initialTime.current.getTime();

      const recordingTime = videoRecordingTime(time);

      if (onSources?.plan === "FREE" && time >= 5 * 60 * 1000) {
        setRecording(false);
        clearTime();
        onStopRecording();
        return;
      }

      setOnTimer(recordingTime.length);

      if (time <= 0) {
        setOnTimer("00:00:00");
        clearInterval(recordTimeInterval);
      }
    }, 100);

    return () => {
      clearInterval(recordTimeInterval);
    };
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
      setStartError("Allow screen and microphone access, then try again.");
    }
  };

  /*
   * Stop recording
   */
  const handleStopRecording = () => {
    if (!recording) return;

    setRecording(false);
    clearTime();

    onStopRecording();
  };

  /*
   * Pause recording
   *
   * Add your pause functionality here when
   * your recorder supports pause/resume.
   */
  const handlePauseRecording = () => {
    if (!recording) return;

    console.log("Pause recording");
  };

  const stopPreview = () => {
    previewStream.current?.getTracks().forEach((track) => track.stop());
    previewStream.current = null;
    if (videoElement.current) videoElement.current.srcObject = null;
    setPreview(false);
    window.ipcRenderer?.send("resize-studio", { shrink: true });
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
      window.ipcRenderer?.send("resize-studio", { shrink: false });
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
        p-4
        draggable
      "
    >
      {preview && (
        <video
          ref={videoElement}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full max-w-[368px] rounded-xl border border-white/15 bg-black object-cover shadow-xl"
        />
      )}

      {/* Studio Tray */}
      <div
        className="
          draggable
          flex
          h-[68px]
          w-full
          max-w-[380px]
          items-center
          rounded-full
          border
          border-white/20
          bg-[#171717]/95
          px-3
          shadow-[0_12px_40px_rgba(0,0,0,0.5)]
          backdrop-blur-xl
        "
      >
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
            transition-all
            duration-200
            hover:scale-105
            active:scale-95
            disabled:cursor-default
            disabled:hover:scale-100
          "
        >
          <span
            className={cn(
              "rounded-full transition-all duration-200",
              recording
                ? "h-6 w-6 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                : "h-8 w-8 bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.3)]",
            )}
          />
        </button>

        <div className="non-draggable flex flex-1 items-center justify-center">
          {recording ? (
            <div className="flex items-center gap-3">
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

              <button
                type="button"
                onClick={handlePauseRecording}
                aria-label="Pause recording"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-zinc-300
                  transition-all
                  duration-200
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <Pause size={17} strokeWidth={2} fill="currentColor" />
              </button>
            </div>
          ) : (
            <span
              className="
                text-xs
                font-medium
                tracking-wide
                text-zinc-500
              "
            >
              {startError ??
                (onSources ? "Ready to record" : "Loading settings…")}
            </span>
          )}
        </div>
        <div className="non-draggable flex items-center gap-1">
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
                ? "cursor-pointer text-zinc-300 hover:bg-white/10 hover:text-white"
                : "cursor-not-allowed text-zinc-700",
            )}
          >
            <Square
              size={17}
              strokeWidth={2}
              fill={recording ? "currentColor" : "none"}
            />
          </button>

          <button
            type="button"
            onClick={handlePreview}
            disabled={!onSources}
            aria-label={preview ? "Hide preview" : "Show preview"}
            aria-pressed={preview}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:text-zinc-700",
              preview
                ? "bg-white/10 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-white",
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
