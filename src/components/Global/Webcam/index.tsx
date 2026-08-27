import React, { useEffect, useRef } from "react";

function WebCam() {
  const camElement = useRef<HTMLVideoElement | null>(null);

  const streamWebCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (camElement.current) {
        camElement.current.srcObject = stream;
        await camElement.current.play();
      }
    } catch (error) {
      console.error("Unable to access webcam:", error);
    }
  };

  useEffect(() => {
    streamWebCam();

    return () => {
      const video = camElement.current;

      if (video?.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
  <video
    ref={camElement}
    autoPlay
    muted
    playsInline
    className="
      draggable
      h-72
      w-72
      rounded-full
      border
      border-white/20
      bg-black
      object-cover
      shadow-2xl
    "
  />
);
}

export default WebCam;