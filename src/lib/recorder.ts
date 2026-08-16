import { hidePluginWindow } from "./utils";

let recorder: MediaRecorder | null = null;
let recordingStream: MediaStream | null = null;

export const StartRecording = async (onSources: {
  id: string;
  screen: string;
  audio: string;
  preset: "HD" | "SD";
  plan: "FREE" | "PRO";
}) => {
  if (recorder?.state === "recording") return;

  const videoConstraints = {
    mandatory: {
      chromeMediaSource: "desktop",
      chromeMediaSourceId: onSources.screen,
      maxFrameRate: 30,
      maxWidth: onSources.preset === "HD" ? 1920 : 1280,
      maxHeight: onSources.preset === "HD" ? 1080 : 720,
    },
  } as unknown as MediaTrackConstraints;

  const screenStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: videoConstraints,
  });

  let microphoneStream: MediaStream | null = null;
  try {
    if (onSources.audio) {
      microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: onSources.audio } },
      });
    }

    recordingStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...(microphoneStream?.getAudioTracks() ?? []),
    ]);
    recorder = new window.MediaRecorder(recordingStream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm",
    });
    recorder.onstop = cleanupRecording;
    recorder.start(1000);
    hidePluginWindow(true);
  } catch (error) {
    screenStream.getTracks().forEach((track) => track.stop());
    microphoneStream?.getTracks().forEach((track) => track.stop());
    throw error;
  }
};

const cleanupRecording = () => {
  recordingStream?.getTracks().forEach((track) => track.stop());
  recordingStream = null;
  recorder = null;
};

export const onStopRecording = () => {
  if (!recorder) return;

  if (recorder.state === "inactive") {
    cleanupRecording();
    return;
  }

  recorder.stop();
};
