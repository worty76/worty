import { Merriweather, Source_Sans_3 } from "next/font/google";

export const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const sourceSans = Source_Sans_3({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});
