"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Filter = "normal" | "vintage" | "bw";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const [photo, setPhoto] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("normal");
  const [uploading, setUploading] = useState(false);

  async function startCamera(mode = facingMode) {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error(error);
      alert("Kamera kunne ikke startes");
    }
  }

  function flipCamera() {
    const next =
      facingMode === "environment" ? "user" : "environment";

    setFacingMode(next);
    startCamera(next);
  }

  function getVideoFilter() {
    if (filter === "bw") return "grayscale(1)";
    if (filter === "vintage")
      return "sepia(0.7) contrast(1.1)";

    return "none";
  }

  function applyPixelFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    if (filter === "normal") return;

    const imageData = ctx.getImageData(
      0,
      0,
      width,
      height
    );

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (filter === "bw") {
        const gray = (r + g + b) / 3;

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      if (filter === "vintage") {
        data[i] = r * 1.1 + 20;
        data[i + 1] = g * 0.95 + 10;
        data[i + 2] = b * 0.8;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    applyPixelFilter(
      ctx,
      canvas.width,
      canvas.height
    );

    setPhoto(canvas.toDataURL("image/png"));
  }

  async function uploadPhoto() {
    if (!photo) return;

    setUploading(true);

    try {
      const fileName = `event-${Date.now()}.png`;

      const response = await fetch(photo);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("events")
        .upload(fileName, blob, {
          contentType: "image/png",
        });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Billede gemt ✓");
      setPhoto(null);

    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="page">

      <h1>Vintage Event Camera</h1>

      <p className="subtitle">
        Capture your memories ✨
      </p>


      <div className="cameraFrame">

        <video
          ref={videoRef}
          className="video"
          autoPlay
          playsInline
          style={{
            filter: getVideoFilter(),
          }}
        />

        <canvas
          ref={canvasRef}
          hidden
        />

      </div>


      {photo && (
        <div className="photoCard">
          <img
            src={photo}
            alt="preview"
          />
        </div>
      )}


      <div className="filters">

        <button
          className={filter === "normal" ? "active" : ""}
          onClick={() => setFilter("normal")}
        >
          Normal
        </button>

        <button
          className={filter === "vintage" ? "active" : ""}
          onClick={() => setFilter("vintage")}
        >
          Vintage
        </button>

        <button
          className={filter === "bw" ? "active" : ""}
          onClick={() => setFilter("bw")}
        >
          Noir
        </button>

      </div>


      <div className="actions">

        <button onClick={() => startCamera()}>
          Start
        </button>

        <button onClick={flipCamera}>
          Flip
        </button>

        <button
          className="capture"
          onClick={takePhoto}
        >
          📸
        </button>

        <button
          onClick={uploadPhoto}
          disabled={uploading}
        >
          {uploading ? "Gemmer..." : "Upload"}
        </button>

      </div>


      <style jsx>{`

        .page {
          min-height:100vh;
          background:#f4eadb;
          padding:25px;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:15px;
          font-family:Georgia, serif;
        }

        h1 {
          color:#5b4030;
          margin:0;
        }

        .subtitle {
          color:#806451;
        }

        .cameraFrame {
          width:320px;
          height:420px;
          background:#fffaf3;
          padding:12px;
          border-radius:28px;
          box-shadow:0 15px 35px rgba(0,0,0,0.18);
        }

        .video {
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:20px;
        }

        .photoCard {
          background:white;
          padding:12px;
          border-radius:8px;
          box-shadow:0 10px 25px rgba(0,0,0,0.15);
        }

        .photoCard img {
          width:180px;
          display:block;
        }

        button {
          background:#8b6b4f;
          color:white;
          border:none;
          padding:12px 18px;
          border-radius:20px;
          margin:5px;
          font-size:15px;
        }

        button.active {
          background:#4f3525;
        }

        .capture {
          width:65px;
          height:65px;
          border-radius:50%;
          font-size:28px;
        }

        button:disabled {
          opacity:.5;
        }

      `}</style>

    </main>
  );
}