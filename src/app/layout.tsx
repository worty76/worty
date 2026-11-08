import "./globals.css";
import "./manga.css";
import { Chakra_Petch, Be_Vietnam_Pro, Shippori_Mincho, JetBrains_Mono, Caveat, Patrick_Hand } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { SiteNavbar } from "../components/layouts/SiteNavbar";
import { NetworkBackground } from "@/components/fun/NetworkBackground";
import { MascotLayer } from "@/components/fun/MascotLayer";
import { MascotToolbar } from "@/components/fun/MascotToolbar";
import { MascotProvider } from "@/context/mascot-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { RouteAnalytics } from "@/components/RouteAnalytics";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // env(safe-area-inset-*) become real values on notched phones
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#262223" },
    { media: "(prefers-color-scheme: light)", color: "#ddc6b6" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Go developer & writer`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Go developer & writer`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

/* Headings: angular "mecha HUD" style, full Vietnamese support */
const heading = Chakra_Petch({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700"],
});

/* Body: designed in Vietnam, full Vietnamese diacritics */
const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/* Small Japanese labels (思い出, 作品, おわり…) — only the glyphs used get fetched */
const jp = Shippori_Mincho({
  subsets: ["latin"],
  variable: "--font-jp",
  display: "swap",
  weight: "700",
  preload: false,
});

/* Numbers & tags: EXHIBIT 02 / 05, No.01, tech-debt meter */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "700"],
});

const sketch = Caveat({
  subsets: ["latin"],
  variable: "--font-sketch",
  display: "swap",
});

const hand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  weight: "400",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      <head>
        <meta name="description" content={SITE_DESCRIPTION} />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme-preference")==="reversed"){document.documentElement.setAttribute("data-theme","reversed")}}catch(e){}`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${heading.variable} ${body.variable} ${jp.variable} ${mono.variable} ${sketch.variable} ${hand.variable} font-sans antialiased transition-colors duration-1000`}
      >
        {/* Living service-mesh background */}
        <NetworkBackground />
        <AuthProvider>
          <ThemeProvider>
            <MascotProvider>
              <NextTopLoader
                color="var(--color-primary-text)"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                showSpinner={false}
              />
              <SiteNavbar />
              <RouteAnalytics />
              <MascotLayer />
              <MascotToolbar />
              {children}
            <Toaster
              position="top-right"
              containerStyle={{
                top: 80,
                right: 20,
              }}
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--color-surface)",
                  color: "var(--color-primary-text)",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgb(var(--primary-text-rgb) / 0.15)",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#ffffff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
            </MascotProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
