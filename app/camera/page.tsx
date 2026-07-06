"use client";

import { useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);

  async function startCamera(mode: "user" | "environment") {
    try {
      setError(null);

      // stop gammel stream
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
      setError(err?.message || "Kamera fejl");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>📸 Kamera</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={() => startCamera("user")}>
          Front kamera
        </button>

        <button onClick={() => startCamera("environment")}>
          Bag kamera
        </button>
      </div>

      {error && (
        <p style={{ color: "red" }}>❌ {error}</p>
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

      <p style={{ marginTop: 10 }}>
        Aktiv: {facingMode === "user" ? "Front" : "Bag"}
      </p>
    </main>
  );
}