import { hidePluginWindow } from "./utils";
import { v4 as uuid } from "uuid";
import io from "socket.io-client";

let userId: string;
let videoTransferFileName: string | undefined;
let mediaRecorder: MediaRecorder | null = null;
let recordingStream: MediaStream | null = null;

const socket = io(import.meta.env.VITE_SOCKET_URL as string);

type RecordingSources = {
  screen: string;
  audio: string;
  id: string;
  preset: "HD" | "SD";
  plan?: "FREE" | "PRO";
};
export const StartRecording = (onSources: RecordingSources) => {
  if (!mediaRecorder) {
    alert("MediaRecorder not initialized. Call selectSources first.");
    return;
  }

  if (mediaRecorder.state === "recording") {
    return;
  }

  videoTransferFileName = `${uuid()}-${onSources.id.slice(0, 8)}.webm`;

  userId = onSources.id;

  hidePluginWindow(true);

  mediaRecorder.start(1000);

  console.log("Recording started:", videoTransferFileName);
};
export const onStopRecording = () => {
  if (!mediaRecorder) {
    return;
  }

  if (mediaRecorder.state === "inactive") {
    return;
  }

  mediaRecorder.stop();

  console.log("Recording stopped");
};

const stopRecording = () => {
  hidePluginWindow(false);

  if (!videoTransferFileName) {
    console.error("No recording filename found.");
    return;
  }

  console.log("Processing video:", videoTransferFileName);

  socket.emit("process-video", {
    filename: videoTransferFileName,
    userId,
  });
};

export const onDataAvailable = (e: BlobEvent) => {
  if (!e.data || e.data.size === 0) {
    return;
  }

  if (!videoTransferFileName) {
    console.error("No video filename available.");
    return;
  }

  socket.emit("video-chunks", {
    chunks: e.data,
    filename: videoTransferFileName,
  });

  console.log(
    "Video chunk sent:",
    e.data.size,
    "bytes",
  );
};
export const selectSources = async (
  onSources: RecordingSources,
  videoElement?: React.RefObject<HTMLVideoElement | null>,
) => {
  if (
    !onSources ||
    !onSources.screen ||
    !onSources.audio ||
    !onSources.id
  ) {
    console.error("Invalid recording sources.");
    return;
  }

  userId = onSources.id;

  const videoWidth =
    onSources.preset === "HD" ? 1920 : 1280;

  const videoHeight =
    onSources.preset === "HD" ? 1080 : 720;

  const videoConstraints = {
    mandatory: {
      chromeMediaSource: "desktop",
      chromeMediaSourceId: onSources.screen,

      minWidth: videoWidth,
      maxWidth: videoWidth,

      minHeight: videoHeight,
      maxHeight: videoHeight,

      maxFrameRate: 30,
    },
  } as unknown as MediaTrackConstraints;

  let screenStream: MediaStream | null = null;
  let microphoneStream: MediaStream | null = null;

  try {
    screenStream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: {
          exact: onSources.audio,
        },
      },
      video: false,
    });
    if (videoElement?.current) {
      videoElement.current.srcObject = screenStream;

      await videoElement.current.play().catch((error) => {
        console.warn("Unable to play preview:", error);
      });
    }
    recordingStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...microphoneStream.getAudioTracks(),
    ]);
    if (mediaRecorder) {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }

      mediaRecorder.stream
        .getTracks()
        .forEach((track) => track.stop());

      mediaRecorder = null;
    }
    const mimeType =
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus",
      )
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp8,opus",
          )
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

    /**
     * Initialize recorder
     */
    mediaRecorder = new MediaRecorder(
      recordingStream,
      {
        mimeType,
      },
    );

    mediaRecorder.ondataavailable = onDataAvailable;
    mediaRecorder.onstop = stopRecording;

    console.log("MediaRecorder initialized");
    console.log("MimeType:", mimeType);
    console.log("Resolution:", `${videoWidth}x${videoHeight}`);
  } catch (error) {
    console.error(
      "Error accessing media devices:",
      error,
    );
    screenStream?.getTracks().forEach((track) => {
      track.stop();
    });

    microphoneStream?.getTracks().forEach((track) => {
      track.stop();
    });

    recordingStream?.getTracks().forEach((track) => {
      track.stop();
    });

    recordingStream = null;
    mediaRecorder = null;

    throw error;
  }
};