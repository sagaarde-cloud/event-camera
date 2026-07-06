"use client";

import { useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);

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
      setError(err?.message || "Camera error");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
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
    alert("Upload placeholder — backend kommer næste step");
  }

  return (
    <main style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Event Camera</h1>
        <p style={styles.subtitle}>Capture memories from your event</p>
      </div>

      {/* CAMERA CARD */}
      <div style={styles.card}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />
      </div>

      {/* ACTION BAR */}
      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={() => startCamera("environment")}>
          Start
        </button>

        <button style={styles.secondaryBtn} onClick={() => startCamera("user")}>
          Flip
        </button>

        <button style={styles.captureBtn} onClick={takePhoto} disabled={!stream}>
          Capture
        </button>

        <button style={styles.dangerBtn} onClick={stopCamera} disabled={!stream}>
          Stop
        </button>
      </div>

      {/* PHOTO PREVIEW */}
      {photo && (
        <div style={styles.previewCard}>
          <img src={photo} style={styles.previewImg} />

          <div style={styles.previewActions}>
            <button style={styles.uploadBtn} onClick={uploadPhoto}>
              Upload
            </button>

            <button style={styles.deleteBtn} onClick={() => setPhoto(null)}>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && <p style={styles.error}>{error}</p>}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </main>
  );
}

/* 🎨 VINTAGE / CUTE DESIGN SYSTEM */
const styles: any = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f7f1ea, #f2e6df)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "system-ui",
    color: "#2b2b2b",
  },

  header: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    letterSpacing: 1,
    margin: 0,
    fontWeight: 600,
  },

  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 6,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  video: {
    width: "100%",
    display: "block",
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 18,
  },

  primaryBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: "#2f2f2f",
    color: "white",
  },

  secondaryBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #cbb9ad",
    background: "transparent",
    color: "#2f2f2f",
  },

  captureBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: "#c97c5d",
    color: "white",
  },

  dangerBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: "#b23a48",
    color: "white",
  },

  previewCard: {
    marginTop: 20,
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.05)",
  },

  previewImg: {
    width: "100%",
    display: "block",
  },

  previewActions: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    gap: 10,
  },

  uploadBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    background: "#4a7c59",
    color: "white",
    border: "none",
  },

  deleteBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    background: "#e9d8c3",
    border: "none",
  },

  error: {
    color: "#b23a48",
    marginTop: 10,
    fontSize: 14,
  },
};