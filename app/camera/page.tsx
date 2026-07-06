"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    console.log("navigator:", navigator);
    console.log("mediaDevices:", navigator?.mediaDevices);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Test</h1>
      <p>Åbn console (F12)</p>
    </div>
  );
}