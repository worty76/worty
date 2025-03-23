/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "i0.wp.com",
      "www.esports.net",
      "i2-prod.chroniclelive.co.uk",
      "video-images.vice.com",
      "api.dicebear.com",
      "i.scdn.co",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.billboard.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId,
  },
};

module.exports = nextConfig;
