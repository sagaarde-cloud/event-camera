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

    if (filter === "vintage") {
      ctx.filter = "sepia(0.6) contrast(1.1)";
    } else if (filter === "bw") {
      ctx.filter = "grayscale(1)";
    } else {
      ctx.filter = "none";
    }

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");

    setPhoto(image);
  }

  async function uploadPhoto() {
    if (!photo) {
      alert("No photo");
      return;
    }

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
        console.error(error);
        alert(error.message);
        return;
      }

      alert("Upload successful 🚀");
      setPhoto(null);
    } catch (error) {
      console.error(error);
      alert("Upload error");
    }
  }

  function filterStyle() {
    if (filter === "vintage") {
      return "sepia(0.6) contrast(1.1)";
    }

    if (filter === "bw") {
      return "grayscale(1)";
    }

    return "none";
  }

  return (
    <main className="wrap">
      <div className="camera">
        <video
          ref={videoRef}
          className="video"
          autoPlay
          playsInline
          style={{ filter: filterStyle() }}
        />
        <canvas ref={canvasRef} hidden />
      </div>

      {photo && (
        <img
          src={photo}
          className="preview"
          alt="preview"
        />
      )}

      <div>
        <button onClick={() => startCamera()}>Start</button>
        <button onClick={flipCamera}>Flip</button>
        <button onClick={takePhoto}>Tag billede</button>
        <button onClick={uploadPhoto}>Upload</button>
      </div>

      <div>
        <button onClick={() => setFilter("normal")}>
          Normal
        </button>

        <button onClick={() => setFilter("vintage")}>
          Vintage
        </button>

        <button onClick={() => setFilter("bw")}>
          Sort/Hvid
        </button>
      </div>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .camera {
          width: 320px;
          height: 420px;
          overflow: hidden;
          border-radius: 20px;
          background: black;
        }

        .video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview {
          width: 200px;
          border-radius: 10px;
        }

        button {
          margin: 5px;
          padding: 10px;
        }
      `}</style>
    </main>
  );
}