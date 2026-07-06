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

      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
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
      setError(err?.message || "Kamera fejl");
    }
  }

  // ⏹ STOP CAMERA
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
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

  // 📤 UPLOAD (placeholder nu)
  async function uploadPhoto() {
    if (!photo) return;

    console.log("Uploading to event...", photo);

    alert("📤 Upload klar (placeholder) - vi bygger backend næste step!");
  }

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24 }}>📸 Event Camera</h1>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={() => startCamera("environment")}>
          Start kamera
        </button>

        <button onClick={() => startCamera("user")}>
          Front
        </button>

        <button onClick={takePhoto} disabled={!stream}>
          📸 Tag billede
        </button>

        <button onClick={stopCamera} disabled={!stream}>
          ⏹ Stop
        </button>
      </div>

      {/* Video */}
      <div style={{ marginTop: 20 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            borderRadius: 12,
            background: "#000",
          }}
        />
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Photo preview */}
      {photo && (
        <div style={{ marginTop: 20 }}>
          <h3>📷 Preview</h3>
          <img
            src={photo}
            style={{
              width: "100%",
              borderRadius: 12,
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={uploadPhoto}>
              📤 Upload til event
            </button>

            <button onClick={() => setPhoto(null)}>
              🗑 Slet
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: "red" }}>❌ {error}</p>
      )}
    </main>
  );
}