"use client";

import { useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  async function startCamera() {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
        setStarted(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Ukendt kamera fejl");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>📸 Camera</h1>

      <button
        onClick={startCamera}
        style={{
          padding: 12,
          background: "black",
          color: "white",
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        Start kamera
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          ❌ {error}
        </p>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          marginTop: 20,
          borderRadius: 12,
          background: "black",
        }}
      />

      {started && (
        <p style={{ marginTop: 10 }}>✅ Kamera kører</p>
      )}
    </main>
  );
}