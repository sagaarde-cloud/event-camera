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

  async function startCamera(mode = facingMode) {
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
  }

  function flipCamera() {
    const next =
      facingMode === "environment" ? "user" : "environment";

    setFacingMode(next);
    startCamera(next);
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

    const response = await fetch(photo);
    const blob = await response.blob();

    const fileName = `event-${Date.now()}.png`;

    const { error } = await supabase.storage
      .from("events")
      .upload(fileName, blob, {
        contentType: "image/png",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Upload successful 🚀");
  }


  function previewFilter() {
    if (filter === "bw") return "grayscale(1)";
    if (filter === "vintage")
      return "sepia(0.7) contrast(1.1)";

    return "none";
  }


  return (
    <main className="wrap">

      <video
        ref={videoRef}
        className="video"
        autoPlay
        playsInline
        style={{
          filter: previewFilter(),
        }}
      />

      <canvas ref={canvasRef} hidden />


      {photo && (
        <img
          src={photo}
          className="preview"
          alt="preview"
        />
      )}


      <div>
        <button onClick={() => startCamera()}>
          Start
        </button>

        <button onClick={flipCamera}>
          Flip
        </button>

        <button onClick={takePhoto}>
          Tag billede
        </button>

        <button onClick={uploadPhoto}>
          Upload
        </button>
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
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:15px;
          padding:20px;
        }

        .video {
          width:320px;
          height:420px;
          object-fit:cover;
          border-radius:20px;
        }

        .preview {
          width:200px;
        }

        button {
          margin:5px;
          padding:10px;
        }
      `}</style>

    </main>
  );
}