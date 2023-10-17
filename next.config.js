/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "i0.wp.com",
      "www.esports.net",
      "i2-prod.chroniclelive.co.uk",
      "video-images.vice.com",
    ],
  },
  env: {
    apiKey: process.env.NEXT_PUBLIC_apiKey,
    authDomain: process.env.NEXT_PUBLIC_authDomain,
    projectId: process.env.NEXT_PUBLIC_projectId,
    storageBucket: process.env.NEXT_PUBLIC_storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
    appId: process.env.NEXT_PUBLIC_appId,
    measurementId: process.env.NEXT_PUBLIC_measurementId,
  },
};

module.exports = nextConfig;
