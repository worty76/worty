import "./globals.css";
import { Space_Grotesk, DM_Sans, Caveat, Patrick_Hand } from "next/font/google";
import type { Metadata } from "next";
import { SiteNavbar } from "../components/layouts/SiteNavbar";
import { GridBackground } from "@/components/fun/GridBackground";
import { MascotLayer } from "@/components/fun/MascotLayer";
import { MascotToolbar } from "@/components/fun/MascotToolbar";
import { MascotProvider } from "@/context/mascot-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { RouteAnalytics } from "@/components/RouteAnalytics";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

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
  // v1 is an archived copy of the site — keep it out of search results so it
  // never competes with the current site at worty.id.vn
  robots: { index: false, follow: false },
};

/** where the current site lives */
const CURRENT_SITE = "https://worty.id.vn";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
        className={`${heading.variable} ${body.variable} ${sketch.variable} ${hand.variable} font-sans antialiased transition-colors duration-1000`}
      >
        {/* archive banner — this is the old version of the site */}
        <div className="relative z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-[rgb(var(--primary-text-rgb)_/_0.2)] bg-[rgb(var(--primary-text-rgb)_/_0.08)] px-4 py-2 text-center text-xs secondary-color-text">
          <span className="opacity-80">You&apos;re viewing the old version of this site (v1 · 2025).</span>
          <a
            href={CURRENT_SITE}
            className="font-semibold underline underline-offset-2 hover:opacity-80"
          >
            See the new site →
          </a>
        </div>
        {/* Living pixel-field background */}
        <GridBackground />
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
