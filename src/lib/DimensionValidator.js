// /components/DimensionValidator.jsx
import React from "react";

export function DimensionValidator({
  width,
  height,
  moduleWidth,
  moduleHeight,
  className = "inline-flex items-center space-x-2",
}) {
  // Validation pure, sans toucher à InputHandler
  const perfectFit =
    width  % moduleWidth === 0 &&
    height % moduleHeight === 0;

  if (perfectFit) return null;  // rien à afficher si c'est bon

  // sinon on affiche la pastille rouge + message
  return (
    <div className={className}>
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <span className="text-destructive font-semibold">
        ⚠ Dimensions 
      </span>
    </div>
  );
}
