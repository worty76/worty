export interface JourneyScene {
  id: string;
  name: string;
  era: string;
  image: string;
  lines: string[];
}

/**
 * The walkable story of Dat — each scene is a chapter.
 * Edit the text freely; the /journey page renders whatever is here.
 */
export const JOURNEY_SCENES: JourneyScene[] = [
  {
    id: "living-room",
    name: "The Living Room",
    era: "where it started",
    image: "/images/journey/living-room.png",
    lines: [
      "This is where everything began — a small living room, an old TV, and a kid who kept asking \"how does it actually work?\"",
      "I was never the guy with fancy achievements. But I was curious. Curiosity is a quiet thing — it waits for the right moment.",
      "One day a family computer showed up. That was the first time I realized a machine could be told what to do.",
      "I didn't know it yet, but the seed was planted here.",
    ],
  },
  {
    id: "neon-lounge",
    name: "Neon Lounge",
    era: "the city nights",
    image: "/images/journey/neon-lounge.png",
    lines: [
      "Years later — the city, the noise, the neon. This is where I learned that the internet never sleeps.",
      "I stayed up late poking at things I didn't understand: HTML pages, broken scripts, servers that answered back.",
      "Every error message was a door. I got lost a lot. But getting lost was the point — that's how the map got drawn.",
      "Somewhere between those nights, \"just curious\" quietly became \"this is what I want to do.\"",
    ],
  },
  {
    id: "classroom",
    name: "The Classroom",
    era: "learning the craft",
    image: "/images/journey/classroom.png",
    lines: [
      "Then came the years of fundamentals — data structures, algorithms, and a lot of \"why is my code not compiling.\"",
      "This is where I met Go. A language that doesn't try to be clever — just clear, fast, and honest. It fit the way I think.",
      "I learned that good engineering isn't about writing more code. It's about writing systems that are reliable, easy to maintain, and designed for growth.",
      "Concurrency, goroutines, channels — suddenly real-time problems felt solvable. I was hooked.",
    ],
  },
  {
    id: "boardwalk",
    name: "Beach Boardwalk",
    era: "first steps into the real world",
    image: "/images/journey/boardwalk.png",
    lines: [
      "Then the classroom ended and the real world started — my first job, real users, real stakes.",
      "Everything I built now had to survive production: paging systems, on-call nights, bugs that only show up at 3 AM.",
      "I worked on products used by actual people. That changes you — reliability stops being a buzzword and becomes a promise.",
      "Some days were hard. But every ship, every fix, every incident made the fundamentals from the classroom finally click.",
    ],
  },
  {
    id: "cafe",
    name: "Bean & Bloom Café",
    era: "today — building worty",
    image: "/images/journey/cafe.png",
    lines: [
      "And this brings us to now. A quiet café, a laptop, and this site — worty — my little corner of the internet.",
      "Everything you've walked past on this site lives here: the articles, the projects, the tiny world I keep building after hours.",
      "I'm still that kid from the living room — just with better tools and slightly fewer unhandled exceptions.",
      "The story isn't finished. If you want to write the next chapter with me — my inbox is always open. Thanks for walking this far.",
    ],
  },
];
