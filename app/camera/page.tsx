"use client";

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function startCamera(
    mode: "user" | "environment" = facingMode
  ) {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
          },
          audio: false,
        });

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }

    } catch (error) {
      console.error(error);
      alert("Camera access denied");
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


  function getVideoFilter() {
    if (filter === "bw") {
     return "grayscale(1) contrast(1.1)";
    }

    if (filter === "vintage") {
  return "sepia(0.45) saturate(1.15) contrast(1.05) brightness(1.05)";
}

    return "none";
  }


  function applyPixelFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {

    if (filter === "normal") return;

    const image =
      ctx.getImageData(
        0,
        0,
        width,
        height
      );

    const data = image.data;


    for (let i = 0; i < data.length; i += 4) {

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];


      if (filter === "bw") {

        const gray =
          (r + g + b) / 3;

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


    ctx.putImageData(
      image,
      0,
      0
    );
  }



  function takePhoto() {

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;


    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


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


    setPhoto(
      canvas.toDataURL("image/png")
    );

  }



  async function uploadPhoto() {

    if (!photo) return;

    setUploading(true);

    try {

      const response =
        await fetch(photo);

      const blob =
        await response.blob();


      const fileName =
        `event-${Date.now()}.png`;


      const { error } =
        await supabase.storage
          .from("events")
          .upload(
            fileName,
            blob,
            {
              contentType:
                "image/png",
            }
          );


      if (error) {
        alert(error.message);
        return;
      }


      alert("Photo saved");
      setPhoto(null);


    } finally {

      setUploading(false);

    }

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
            filter: getVideoFilter(),
          }}
        />


        <canvas
          ref={canvasRef}
          hidden
        />

      </section>



      <div className="filters">

        <button
          className={
            filter === "normal"
              ? "selected"
              : ""
          }
          onClick={() =>
            setFilter("normal")
          }
        >
          ORIGINAL
        </button>


        <button
          className={
            filter === "vintage"
              ? "selected"
              : ""
          }
          onClick={() =>
            setFilter("vintage")
          }
        >
          VINTAGE
        </button>


        <button
          className={
            filter === "bw"
              ? "selected"
              : ""
          }
          onClick={() =>
            setFilter("bw")
          }
        >
          NOIR
        </button>

      </div>



      {photo && (

        <div className="preview">

          <img
            src={photo}
            alt="preview"
          />

        </div>

      )}



      <div className="controls">


        <button onClick={flipCamera}>
          FLIP
        </button>


        <button
          className="shutter"
          onClick={takePhoto}
        />


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
            #403127,
            #100d0b
          );
          color:#ead7b5;
          display:flex;
          flex-direction:column;
          align-items:center;
          padding:28px;
          gap:22px;
          font-family:Arial,sans-serif;
        }


        .brand {
          letter-spacing:5px;
          font-size:18px;
          text-align:center;
        }


        .brand span {
          display:block;
          margin-top:8px;
          font-size:10px;
          color:#b89662;
        }


        .cameraShell {

          width:330px;
          height:430px;
          padding:12px;
          background:#211914;
          border:1px solid #9a7443;
          border-radius:25px;
          box-shadow:
          0 25px 60px #000;

        }


        .video {

          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:18px;

        }


        button {

          background:#251b15;
          color:#ead7b5;
          border:1px solid #8d6b43;
          padding:12px 18px;
          border-radius:30px;
          margin:5px;

        }


        .selected {

          background:#9b7547;
          color:white;

        }


        .shutter {

          width:75px;
          height:75px;
          border-radius:50%;
          background:#f1e3c9;
          border:6px solid #9b7547;

        }


        .preview img {

          width:190px;
          border:8px solid #f1e3c9;

        }

      `}</style>


    </main>

  );
}