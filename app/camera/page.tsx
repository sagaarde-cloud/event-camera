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

  async function startCamera(mode: "user" | "environment" = facingMode) {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
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
    } catch (err) {
      console.error(err);
      alert("Kamera kunne ikke startes");
    }
  }

  function flipCamera() {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    startCamera(newMode);
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 🎨 FILTER BRÆNDES IND I BILLEDET
    if (filter === "vintage") {
      ctx.filter = "sepia(0.6) contrast(1.1)";
    } else if (filter === "bw") {
      ctx.filter = "grayscale(1)";
    } else {
      ctx.filter = "none";
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");
    setPhoto(image);
  }

  async function uploadPhoto() {
    if (!photo) return;

    try {
      const fileName = `event-${Date.now()}.png`;

      const res = await fetch(photo);
      const blob = await res.blob();

      const { error } = await supabase.storage
        .from("events")
        .upload(fileName, blob);

      if (error) throw error;

      alert("Upload successful 🚀");
      setPhoto(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  }

  function getFilterStyle() {
    if (filter === "vintage") return "sepia(0.6) contrast(1.1)";
    if (filter === "bw") return "grayscale(1)";
    return "none";
  }

  return (
    <div className="wrap">
      <div className="camera">
        <video
          ref={videoRef}
          className="video"
          style={{ filter: getFilterStyle() }}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {photo && <img src={photo} className="preview" alt="preview" />}

      <div className="buttons">
        <button onClick={() => startCamera()}>Start</button>
        <button onClick={flipCamera}>Flip</button>
        <button onClick={takePhoto}>Tag billede</button>
        <button onClick={uploadPhoto}>Upload</button>
      </div>

      <div className="filters">
        <button onClick={() => setFilter("normal")}>Normal</button>
        <button onClick={() => setFilter("vintage")}>Vintage</button>
        <button onClick={() => setFilter("bw")}>B/W</button>
      </div>

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: #f7f3ee;
          min-height: 100vh;
          font-family: sans-serif;
        }

        .camera {
          width: 320px;
          height: 420px;
          border-radius: 20px;
          overflow: hidden;
          border: 8px solid #d8cfc4;
          background: black;
        }

        .video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview {
          width: 160px;
          border-radius: 12px;
          border: 3px solid #d8cfc4;
        }

        button {
          margin: 4px;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: #cbbba0;
          color: white;
          cursor: pointer;
        }

        button:hover {
          background: #b8a48b;
        }

        .filters {
          margin-top: 10px;
        }

        .hidden {
          display: none;
        }
      `}</style>
    </div>
  );
}