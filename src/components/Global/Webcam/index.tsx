import React, { useEffect, useRef } from "react";

function WebCam() {
  const camElement = useRef<HTMLVideoElement | null>(null);

  const streamWebCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (camElement.current) {
      camElement.current.srcObject = stream;
      camElement.current.play();
    }
  };

  useEffect(() => {
    streamWebCam();
  }, []);

  return (
    <video
      ref={camElement}
      className="
        draggable
        h-72
        w-72
        rounded-full
        object-cover
        border
        border-white/20
        shadow-2xl
      "
    />
  );
}

export default WebCam;