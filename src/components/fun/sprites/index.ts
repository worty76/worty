import type { Character } from "./types";

export * from "./types";

// Auto-register every character folder under ./characters (each exports a
// default Character). Add a folder = done, no barrel edit required.
const req = require.context("./characters", true, /index\.ts$/);

export const characters: Record<string, Character> = req
  .keys()
  .reduce((acc: Record<string, Character>, key: string) => {
    const mod = req(key);
    const ch: Character = mod.default ?? mod[Object.keys(mod)[0]];
    if (ch?.id) acc[ch.id] = ch;
    return acc;
  }, {});

if (Object.keys(characters).length === 0) {
  throw new Error("No sprites characters registered under ./characters");
}
