"use client";

export default function Home() {
  return (
    <main
      style={{
        padding: 40,
        fontFamily: "sans-serif",
      }}
    >
      <h1>🧪 Testside</h1>

      <button
        onClick={() => alert("JavaScript virker!")}
        style={{
          padding: 20,
          fontSize: 20,
          cursor: "pointer",
        }}
      >
        Tryk her
      </button>
    </main>
  );
}