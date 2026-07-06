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

  // 🎥 START / SWITCH CAMERA (FIXED)
  async function startCamera(mode: "user" | "environment") {
    try {
      setError(null);

      // stop old stream properly
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

  // 📸 PHOTO + FILTER
  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    let img = canvas.toDataURL("image/png");

    // simple filter overlay (frontend fake filter)
    if (filter === "bw") {
      img = applyFakeOverlay(img, "bw");
    }
    if (filter === "vintage") {
      img = applyFakeOverlay(img, "vintage");
    }

    setPhoto(img);
  }

  // 🎞 SIMPLE FILTER SIMULATION (frontend trick)
  function applyFakeOverlay(img: string, type: string) {
    // NOTE: real filters kan bygges senere med canvas shaders
    return img;
  }

  async function uploadPhoto() {
    if (!photo) return;
    alert("Upload klar (kommer næste step)");
  }

  return (
    <main style={styles.page}>
      
      {/* POLAROID FRAME */}
      <div style={styles.polaroid}>
        
        <div style={styles.cameraFrame}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              ...styles.video,
              filter:
                filter === "bw"
                  ? "grayscale(1)"
                  : filter === "vintage"
                  ? "sepia(0.6) contrast(1.1)"
                  : "none",
            }}
          />
        </div>

        <div style={styles.caption}>
          Event Camera
        </div>
      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>
        
        <button onClick={() => startCamera("environment")} style={styles.btn}>
          Start
        </button>

        <button onClick={() => startCamera(facingMode === "user" ? "environment" : "user")} style={styles.btn}>
          Flip
        </button>

        <button onClick={takePhoto} disabled={!stream} style={styles.capture}>
          Capture
        </button>

        <button onClick={stopCamera} disabled={!stream} style={styles.stop}>
          Stop
        </button>
      </div>

      {/* FILTERS */}
      <div style={styles.filters}>
        <button onClick={() => setFilter("normal")} style={styles.filterBtn}>
          Normal
        </button>

        <button onClick={() => setFilter("vintage")} style={styles.filterBtn}>
          Vintage
        </button>

        <button onClick={() => setFilter("bw")} style={styles.filterBtn}>
          B&W
        </button>
      </div>

      {/* PHOTO */}
      {photo && (
        <div style={styles.preview}>
          <img src={photo} style={{ width: "100%", borderRadius: 12 }} />

          <button onClick={uploadPhoto} style={styles.upload}>
            Upload
          </button>
        </div>
      )}

      {/* ERROR */}
      {error && <p style={styles.error}>{error}</p>}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </main>
  );
}

/* 🎨 POLAROID STYLE */
const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#f4efe7",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
    fontFamily: "system-ui",
  },

  polaroid: {
    background: "white",
    padding: 12,
    paddingBottom: 40,
    borderRadius: 6,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: 360,
    marginTop: 20,
  },

  cameraFrame: {
    background: "#000",
    borderRadius: 4,
    overflow: "hidden",
  },

  video: {
    width: "100%",
    display: "block",
  },

  caption: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#333",
    letterSpacing: 1,
  },

  controls: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  btn: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "white",
  },

  capture: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "#c97c5d",
    color: "white",
    border: "none",
  },

  stop: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "#b23a48",
    color: "white",
    border: "none",
  },

  filters: {
    display: "flex",
    gap: 10,
    marginTop: 15,
  },

  filterBtn: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #ccc",
    background: "white",
  },

  preview: {
    marginTop: 20,
    width: "100%",
    maxWidth: 360,
  },

  upload: {
    marginTop: 10,
    width: "100%",
    padding: 10,
    background: "#4a7c59",
    color: "white",
    borderRadius: 10,
    border: "none",
  },

  error: {
    color: "red",
    marginTop: 10,
  },
};