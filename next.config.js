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
    apiKey:"AIzaSyDr4TB-kfFY-v-Ex2fow8OjrB7xv8TYiTw",
    authDomain:"shopcart-4dbd1.firebaseapp.com",
    projectId:"shopcart-4dbd1",
    storageBucket:"shopcart-4dbd1.appspot.com",
    messagingSenderId:"19011260530",
    appId:"1:19011260530:web:e7c66e1815b9358ee3b2eb",
    measurementId:"G-28CB5XYQF2"
  },
};

module.exports = nextConfig;
