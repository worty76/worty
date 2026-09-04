import { State, type Character } from "../../types";

/**
 * "Naruto SND5 Expanded" sprite sheet (Jump/DS game rip).
 * Rips by Neimad — edit by Degue1297 (credit requested by the editor).
 * Used here for personal non-commercial fan use only.
 */
const naruto: Character = {
  id: "naruto",
  title: "Naruto",
  src: "/sprites/naruto.png",
  cellW: 69,
  cellH: 76,
  cols: 18,
  idle: State.idle,
  margin: 40,
  actions: {
    [State.idle]: { name: State.idle, start: 0, end: 1, frameDuration: 450, loop: true },
    [State.walk]: { name: State.walk, start: 2, end: 3, frameDuration: 140, speed: 60, loop: true },
    [State.dash]: { name: State.dash, start: 4, end: 5, frameDuration: 150, speed: 110, loop: false, next: State.idle },
    [State.flyKick]: { name: State.flyKick, start: 6, end: 7, frameDuration: 150, speed: 90, loop: false, next: State.idle },
    [State.lunge]: { name: State.lunge, start: 8, end: 9, frameDuration: 150, speed: 50, loop: false, next: State.idle },
    [State.kickCombo]: { name: State.kickCombo, start: 10, end: 12, frameDuration: 150, speed: 40, loop: false, next: State.idle },
    [State.sword]: { name: State.sword, start: 13, end: 14, frameDuration: 150, speed: 40, loop: false, next: State.idle },
    [State.skill]: { name: State.skill, start: 15, end: 17, frameDuration: 200, loop: false, next: State.idle },
  },
};

export default naruto;
