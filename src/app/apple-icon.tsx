import { ImageResponse } from "next/og";

// Icône affichée quand on ajoute le site à l'écran d'accueil d'un iPhone ou d'un iPad.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#E8691E" }}>
        <div style={{ width: 62, height: 62, border: "17px solid #FFFFFF", borderRadius: 10, transform: "rotate(45deg)" }} />
      </div>
    ),
    size,
  );
}
