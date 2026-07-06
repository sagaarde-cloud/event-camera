"use client";

import { useRef, useState } from "react";

type Filter = "normal" | "vintage" | "bw";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [filter, setFilter] = useState<Filter>("normal");
  const [error, setError] = useState<string | null>(null);

  async function startCamera(mode: "user" | "environment") {
    try {
      setError(null);

      if (stream) stream.getTracks().forEach((t) => t.stop());

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }

      setStream(newStream);
      setFacingMode(mode);
    } catch (err: any) {
      setError(err?.message || "Camera error");
    }
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/png");
    setPhoto(img);
  }

  async function uploadPhoto() {
    if (!photo) return;
    alert("Upload coming next step");
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] flex flex-col items-center px-6 py-10">

      {/* TOP BAR */}
      <div className="text-center mb-8">
        <h1 className="text-xl tracking-[0.3em] uppercase text-[#2b2b2b]">
          Event Camera
        </h1>
        <p className="text-sm text-[#7a746d] mt-2">
          Capture moments in a soft vintage style
        </p>
      </div>

      {/* CAMERA FRAME (MAIN FOCUS) */}
      <div className="w-full max-w-sm bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[28px] p-4">
        
        <div className="rounded-[20px] overflow-hidden bg-black aspect-[3/4]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              filter === "bw"
                ? "grayscale"
                : filter === "vintage"
                ? "sepia-[0.6] contrast-110"
                : ""
            }`}
          />
        </div>

        {/* FILTERS */}
        <div className="flex justify-between mt-4 text-xs text-[#7a746d]">
          <button onClick={() => setFilter("normal")}>Normal</button>
          <button onClick={() => setFilter("vintage")}>Vintage</button>
          <button onClick={() => setFilter("bw")}>B&W</button>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          
          <button
            onClick={() => startCamera("environment")}
            className="py-3 rounded-xl bg-[#2b2b2b] text-white text-sm"
          >
            Start
          </button>

          <button
            onClick={() =>
              startCamera(facingMode === "user" ? "environment" : "user")
            }
            className="py-3 rounded-xl border border-[#d6c8bb] text-sm"
          >
            Flip
          </button>

          <button
            onClick={takePhoto}
            disabled={!stream}
            className="py-3 rounded-xl bg-[#c97c5d] text-white text-sm col-span-2 disabled:opacity-40"
          >
            Capture Photo
          </button>

          <button
            onClick={stopCamera}
            disabled={!stream}
            className="py-2 rounded-xl text-sm text-[#7a746d] col-span-2"
          >
            Stop camera
          </button>
        </div>
      </div>

      {/* PREVIEW */}
      {photo && (
        <div className="w-full max-w-sm mt-8 bg-white rounded-[24px] shadow-md p-4">
          
          <p className="text-xs tracking-widest uppercase text-[#7a746d] mb-3">
            Preview
          </p>

          <img src={photo} className="rounded-[16px]" />

          <button
            onClick={uploadPhoto}
            className="w-full mt-4 py-3 rounded-xl bg-[#4a7c59] text-white text-sm"
          >
            Upload
          </button>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-sm mt-6">{error}</p>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}