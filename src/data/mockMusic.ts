import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const mockMusic = [
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273ada101c2e9e97feb8fae37a9",
    year: "1975",
    genre: ["Rock", "Progressive Rock"],
    spotifyLink: "https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb",
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b2734121faee8df82c526cbab2be",
    year: "1982",
    genre: ["Pop", "Funk", "Dance"],
    spotifyLink: "https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5",
  },
  {
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b27399581550279b761c5feb68c3",
    year: "1971",
    genre: ["Rock", "Pop"],
    spotifyLink: "https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9",
  },
  {
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf",
    year: "1991",
    genre: ["Grunge", "Alternative Rock"],
    spotifyLink: "https://open.spotify.com/track/5ghIJDpPoe3CfHMGu71E6T",
  },
  {
    title: "Yesterday",
    artist: "The Beatles",
    album: "Help!",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b2734ce8b4e42588bf18182a1ad2",
    year: "1965",
    genre: ["Pop Rock", "Classical"],
    spotifyLink: "https://open.spotify.com/track/3BQHpFgAp4l80e1XslIjNI",
  },
  {
    title: "Purple Rain",
    artist: "Prince",
    album: "Purple Rain",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273d52bfb90ee8dfeda8378b99b",
    year: "1984",
    genre: ["Rock", "Pop", "Funk"],
    spotifyLink: "https://open.spotify.com/track/54X78diSLoUDI3joC2bjMz",
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273cc462869998e9c3c37c5da9e",
    year: "1977",
    genre: ["Rock", "Soft Rock"],
    spotifyLink: "https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv",
  },
  {
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273e44963b8bb127552ac4dfc87",
    year: "1987",
    genre: ["Hard Rock", "Rock"],
    spotifyLink: "https://open.spotify.com/track/7o2CTH4ctstm8TNelqjb51",
  },
  {
    title: "Lose Yourself",
    artist: "Eminem",
    album: "8 Mile",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273726d48d93d02e1271774f023",
    year: "2002",
    genre: ["Hip Hop", "Rap"],
    spotifyLink: "https://open.spotify.com/track/7MJQ9Nfxzh8F9QqQPnGOH5",
  },
  {
    title: "Take Five",
    artist: "Dave Brubeck",
    album: "Time Out",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273d52b2e9e8e9f3a2e85d2cb8e",
    year: "1959",
    genre: ["Jazz", "Cool Jazz"],
    spotifyLink: "https://open.spotify.com/track/5UbH6gN4nRCmvQgjhA6ZBX",
  },
  {
    title: "Danza Kuduro",
    artist: "Don Omar",
    album: "Meet the Orphans",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273c4d41f07abe74e4c801ec7c0",
    year: "2010",
    genre: ["Reggaeton", "Latin Pop"],
    spotifyLink: "https://open.spotify.com/track/6OxYVwvMfTldXjxFzQ8NrI",
  },
  {
    title: "Silent Night",
    artist: "BTS",
    album: "2 Cool 4 Skool",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273c7d45f5b6d4966e512f0f166",
    year: "2013",
    genre: ["K-pop", "Hip Hop"],
    spotifyLink: "https://open.spotify.com/track/2RsAajgo0g7bMCHxwH3Sk0",
  },
  {
    title: "Love Story",
    artist: "Taylor Swift",
    album: "Fearless",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273a48964b5d9a3d6968ae3e0de",
    year: "2008",
    genre: ["Country Pop", "Pop"],
    spotifyLink: "https://open.spotify.com/track/1vrd6UOGamcKNGnSHJQlSt",
  },
  {
    title: "Numb",
    artist: "Linkin Park",
    album: "Meteora",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273b4ad7ebaf4575f120eb3f193",
    year: "2003",
    genre: ["Nu Metal", "Alternative Rock"],
    spotifyLink: "https://open.spotify.com/track/2nLtzopw4rPReszdYBJU6h",
  },
  {
    title: "September",
    artist: "Earth, Wind & Fire",
    album: "The Best of Earth, Wind & Fire, Vol. 1",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273a0d7d3ae56f8aa2d6c4f5569",
    year: "1978",
    genre: ["Funk", "Soul", "Disco"],
    spotifyLink: "https://open.spotify.com/track/2grjqo0Frpf2okIBiifQKs",
  },
  {
    title: "One More Time",
    artist: "Daft Punk",
    album: "Discovery",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273b33d46dfa2635a47eebf63b2",
    year: "2000",
    genre: ["Electronic", "House", "French House"],
    spotifyLink: "https://open.spotify.com/track/0DiWol3AO6WpXZgp0goxAV",
  },
];

// Function to upload mock data to Firebase
export async function uploadMockMusic() {
  const musicCollection = collection(db, "music");

  try {
    for (const music of mockMusic) {
      await addDoc(musicCollection, {
        ...music,
        id: Math.random().toString(36).substr(2, 9), // Generate random ID
      });
    }
    console.log("Mock music data uploaded successfully!");
  } catch (error) {
    console.error("Error uploading mock music:", error);
  }
}
