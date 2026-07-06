"use client";

import { useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);

  // 🎥 START CAMERA
  async function startCamera(mode: "user" | "environment") {
    try {
      setError(null);

      // stop old stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

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
      console.error(err);
      setError(err?.message || "Kunne ikke starte kamera");
    }
  }

  // ⏹ STOP CAMERA
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }

  // 📸 TAKE PHOTO
  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");
    setPhoto(image);
  }

  // 📤 UPLOAD (placeholder)
  async function uploadPhoto() {
    if (!photo) return;

    alert("📤 Upload klar (backend kommer næste step)");
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mt-4">
        📸 Event Camera
      </h1>

      <p className="text-gray-400 text-sm mt-1">
        Tag billeder til dit event
      </p>

      {/* BUTTONS */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">

        <button
          onClick={() => startCamera("environment")}
          className="px-4 py-2 bg-white text-black rounded-xl font-medium"
        >
          Start kamera
        </button>

        <button
          onClick={() => startCamera("user")}
          className="px-4 py-2 bg-gray-800 rounded-xl"
        >
          Front
        </button>

        <button
          onClick={takePhoto}
          disabled={!stream}
          className="px-4 py-2 bg-blue-600 rounded-xl disabled:opacity-40"
        >
          📸 Tag billede
        </button>

        <button
          onClick={stopCamera}
          disabled={!stream}
          className="px-4 py-2 bg-red-600 rounded-xl disabled:opacity-40"
        >
          ⏹ Stop
        </button>
      </div>

      {/* CAMERA */}
      <div className="mt-6 w-full max-w-md rounded-2xl overflow-hidden border border-gray-800 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
        />
      </div>

      {/* HIDDEN CANVAS */}
      <canvas ref={canvasRef} className="hidden" />

      {/* PHOTO PREVIEW */}
      {photo && (
        <div className="mt-6 w-full max-w-md bg-gray-900 rounded-2xl p-3">

          <p className="text-sm text-gray-400 mb-2">
            Preview
          </p>

          <img
            src={photo}
            className="rounded-xl w-full"
          />

          <div className="flex gap-3 mt-3">

            <button
              onClick={uploadPhoto}
              className="flex-1 bg-green-600 py-2 rounded-xl"
            >
              Upload
            </button>

            <button
              onClick={() => setPhoto(null)}
              className="flex-1 bg-gray-700 py-2 rounded-xl"
            >
              Slet
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-red-500 mt-4 text-sm">
          ❌ {error}
        </p>
      )}
    </main>
  );
}