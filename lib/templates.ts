export interface StripTemplate {
  id: string; // must match the filename in templates/ and overlays/
  name: string; // shown on the picker card
  background: string; // fallback color if the background image is missing
}

export const TEMPLATES: StripTemplate[] = [
  { id: "classic", name: "Classic Cream", background: "#fff8f3" },
  { id: "candy", name: "Candy Stripe", background: "#ffffff" },
  { id: "sweetheart", name: "Sweetheart", background: "#fff0f5" },
  { id: "birthday", name: "Birthday Boy", background: "#3d467a" },
  { id: "clover", name: "Lucky Clover", background: "#f7f7d8" },
  { id: "bold", name: "Bold Pop", background: "#ffffff" },
];
