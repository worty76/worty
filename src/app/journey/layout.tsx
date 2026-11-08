import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Road So Far — my journey",
  description: "An anime-style scroll story of how a normal guy from a small hometown became a Go backend engineer.",
};

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
