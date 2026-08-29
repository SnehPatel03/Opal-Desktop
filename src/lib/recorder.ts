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

export const StartRecording = async (
  onSources: RecordingSources,
) => {
  try {
    console.log("1. StartRecording called");

    if (!mediaRecorder) {
      console.log("2. MediaRecorder missing. Calling selectSources...");
      await selectSources(onSources);
    }

    console.log(
      "3. MediaRecorder state:",
      mediaRecorder?.state,
    );

    if (!mediaRecorder) {
      throw new Error("Unable to initialize MediaRecorder.");
    }

    if (mediaRecorder.state === "recording") {
      console.log("4. Already recording");
      return;
    }

    videoTransferFileName = `${uuid()}-${onSources.id.slice(0, 8)}.webm`;

    userId = onSources.id;

    console.log("5. Filename:", videoTransferFileName);
    console.log("6. Starting MediaRecorder...");

    hidePluginWindow(true);

    mediaRecorder.start(1000);

    console.log(
      "7. MediaRecorder started. State:",
      mediaRecorder.state,
    );
  } catch (error) {
    console.error("StartRecording error:", error);
    throw error;
  }
};

export const onStopRecording = () => {
  if (!mediaRecorder) {
    console.log("mediaRec is not initializessssss")
    return;
  }

  if (mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  recordingStream?.getTracks().forEach((track) => {
    track.stop();
  });

  recordingStream = null;
  mediaRecorder = null;

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
  console.log(
    "8. onDataAvailable fired",
    e.data,
  );

  if (!e.data || e.data.size === 0) {
    console.log("9. Empty chunk");
    return;
  }

  if (!videoTransferFileName) {
    console.error("10. No filename");
    return;
  }

  console.log(
    "11. Sending chunk:",
    e.data.size,
    "bytes",
  );

  socket.emit("video-chunks", {
    chunks: e.data,
    filename: videoTransferFileName,
  });

  console.log("12. Chunk sent");
};

export const selectSources = async (
  onSources: RecordingSources,
  videoElement?: React.RefObject<HTMLVideoElement | null>,
) => {
  if (!onSources || !onSources.screen || !onSources.audio || !onSources.id) {
    console.error("Invalid recording sources.");
    return;
  }

  userId = onSources.id;

  const videoWidth = onSources.preset === "HD" ? 1920 : 1280;

  const videoHeight = onSources.preset === "HD" ? 1080 : 720;

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

      mediaRecorder.stream.getTracks().forEach((track) => track.stop());

      mediaRecorder = null;
    }
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

    /**
     * Initialize recorder
     */
    mediaRecorder = new MediaRecorder(recordingStream, {
      mimeType,
    });

    mediaRecorder.ondataavailable = onDataAvailable;
    mediaRecorder.onstop = stopRecording;

    console.log("MediaRecorder initialized");
    console.log("MimeType:", mimeType);
    console.log("Resolution:", `${videoWidth}x${videoHeight}`);
  } catch (error) {
    console.error("Error accessing media devices:", error);
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
