import React from "react";
import "./Spinner.css";

export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="custom-spinner"
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
} 