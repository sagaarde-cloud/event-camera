"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Filter = "normal" | "vintage" | "bw";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] =
    useState<"user" | "environment">("environment");

  const [photo, setPhoto] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("normal");
  const [uploading, setUploading] = useState(false);

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
      facingMode === "environment"
        ? "user"
        : "environment";

    setFacingMode(next);
    startCamera(next);
  }

  function videoFilter() {
    if (filter === "bw") return "grayscale(1)";
    if (filter === "vintage")
      return "sepia(.7) contrast(1.1)";

    return "none";
  }

  function applyPixelFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    if (filter === "normal") return;

    const image = ctx.getImageData(
      0,
      0,
      width,
      height
    );

    const data = image.data;

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
        data[i + 1] = g * .95 + 10;
        data[i + 2] = b * .8;
      }
    }

    ctx.putImageData(image, 0, 0);
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

    const response = await fetch(photo);
    const blob = await response.blob();

    const fileName =
      `event-${Date.now()}.png`;

    const { error } =
      await supabase.storage
        .from("events")
        .upload(fileName, blob, {
          contentType: "image/png",
        });

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Photo saved");
    setPhoto(null);
  }


  return (
    <main className="page">

      <div className="brand">
        EVENT CAMERA
        <span>MEMORIES COLLECTION</span>
      </div>


      <section className="cameraShell">

        <video
          ref={videoRef}
          className="video"
          autoPlay
          playsInline
          style={{
            filter: videoFilter(),
          }}
        />

        <canvas
          ref={canvasRef}
          hidden
        />

      </section>


      <div className="filters">

        {[
          ["normal", "ORIGINAL"],
          ["vintage", "VINTAGE"],
          ["bw", "NOIR"],
        ].map(([value, label]) => (

          <button
            key={value}
            className={
              filter === value
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter(value as Filter)
            }
          >
            {label}
          </button>

        ))}

      </div>


      {photo && (
        <div className="preview">
          <img src={photo} />
        </div>
      )}


      <div className="controls">

        <button onClick={() => startCamera()}>
          START
        </button>

        <button onClick={flipCamera}>
          FLIP
        </button>


        <button
          className="shutter"
          onClick={takePhoto}
        >
        </button>


        <button
          onClick={uploadPhoto}
          disabled={uploading}
        >
          {uploading
            ? "SAVING"
            : "SAVE"}
        </button>

      </div>


      <style jsx>{`

        .page {
          min-height:100vh;
          background:
          radial-gradient(
            circle at top,
            #3d3028,
            #120f0d
          );

          color:#f3e5cf;
          display:flex;
          flex-direction:column;
          align-items:center;
          padding:28px;
          gap:22px;
          font-family:
          Arial, sans-serif;
        }


        .brand {
          letter-spacing:4px;
          font-size:18px;
          text-align:center;
        }


        .brand span {
          display:block;
          font-size:10px;
          margin-top:8px;
          color:#c5a878;
          letter-spacing:3px;
        }


        .cameraShell {
          width:330px;
          height:430px;
          padding:12px;
          background:#1f1915;
          border:1px solid #8d6b43;
          border-radius:24px;
          box-shadow:
          0 25px 60px black;
        }


        .video {
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:16px;
        }


        .filters button,
        .controls button {
          background:#241c17;
          color:#e8d1aa;
          border:1px solid #80603b;
          padding:12px 18px;
          margin:5px;
          border-radius:30px;
          letter-spacing:1px;
        }


        .selected {
          background:#a67c48 !important;
          color:white !important;
        }


        .shutter {
          width:70px;
          height:70px;
          border-radius:50%;
          background:#eee0c8 !important;
          border:6px solid #8d6b43 !important;
        }


        .preview img {
          width:190px;
          border-radius:12px;
          border:8px solid #eee0c8;
        }


      `}</style>

    </main>
  );
}