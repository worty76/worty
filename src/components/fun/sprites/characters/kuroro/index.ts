import { State, type Character } from "../../types";

const kuroro: Character = {
  id: "kuroro",
  title: "Kuroro",
  src: "/sprites/kuroro.png",
  cellW: 64,
  cellH: 79,
  cols: 103,
  idle: State.idle,
  margin: 40,
  defaultEnabled: true,
  actions: {
    [State.idle]: { name: State.idle, start: 0, end: 2, frameDuration: 450, loop: true },
    [State.walk]: { name: State.walk, start: 3, end: 4, frameDuration: 120, speed: 50, loop: true },
    [State.dash]: { name: State.dash, start: 10, end: 19, frameDuration: 150, speed: 20, next: State.idle },
    [State.flyKick]: { name: State.flyKick, start: 20, end: 22, frameDuration: 150, speed: 70, next: State.idle },
    [State.lunge]: { name: State.lunge, start: 36, end: 52, frameDuration: 150, speed: 30, next: State.idle },
    [State.kickCombo]: { name: State.kickCombo, start: 56, end: 67, frameDuration: 150, speed: 20, next: State.idle },
    [State.sword]: { name: State.sword, start: 68, end: 86, frameDuration: 150, speed: 20, next: State.idle },
    [State.skill]: { name: State.skill, start: 87, end: 102, frameDuration: 150, next: State.idle },
  },
};

export default kuroro;
