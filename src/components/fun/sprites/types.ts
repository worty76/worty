export type Direction = 1 | -1;

// Shared action/state names referenced across character configs and engine.
export const State = {
  idle: "idle",
  walk: "walk",
  dash: "dash",
  flyKick: "flyKick",
  lunge: "lunge",
  kickCombo: "kickCombo",
  sword: "sword",
  skill: "skill",
} as const;

export type StateName = (typeof State)[keyof typeof State];

export interface Action {
  name: string;
  start: number;
  end: number;
  frameDuration: number;
  speed?: number;
  loop?: boolean;
  next?: string;
}

export interface Character {
  id: string;
  title: string;
  src: string;
  cellW: number;
  cellH: number;
  cols: number;
  actions: Record<string, Action>;
  idle: string;
  margin?: number;
}

export interface FrameState {
  name: string;
  frame: number;
}

export const framePosition = (
  i: number,
  cellW: number,
  cellH: number,
  cols: number,
): { x: number; y: number } => ({
  x: -(i % cols) * cellW,
  y: -Math.floor(i / cols) * cellH,
});

/**
 * Advance one frame within an action. Returns the next state, wrapping the
 * frame pointer (loop) or falling back to `next`/idle when a non-looping
 * action completes.
 */
export const advanceFrame = (
  state: FrameState,
  action: Action,
  character: Character,
): FrameState => {
  const nextFrame = state.frame + 1;
  if (nextFrame <= action.end) return { name: action.name, frame: nextFrame };
  const fallback = action.loop ? action.name : action.next ?? character.idle;
  const fb = character.actions[fallback] ?? character.actions[character.idle];
  return { name: fb.name, frame: fb.start };
};

// Pure self-check over the frame/transition math. Throws on the first violation.
export const selfCheck = (chars: Record<string, Character>) => {
  const assert = (cond: unknown, msg: string) => {
    if (!cond) throw new Error(`sprite self-check failed: ${msg}`);
  };

  for (const [id, c] of Object.entries(chars)) {
    const { cellW, cellH, cols } = c;

    // origin + column/wrap math (strip is a 1-row grid)
    assert(framePosition(0, cellW, cellH, cols).x === 0, `${id}: origin x`);
    assert(framePosition(0, cellW, cellH, cols).y === 0, `${id}: origin y`);
    assert(framePosition(cols, cellW, cellH, cols).x === 0, `${id}: wrap x`);
    assert(framePosition(cols, cellW, cellH, cols).y === -cellH, `${id}: wrap y`);

    for (const [name, action] of Object.entries(c.actions)) {
      // mid-action advance stays in the same action
      if (action.start < action.end) {
        const mid = advanceFrame({ name, frame: action.start }, action, c);
        assert(mid.name === name && mid.frame === action.start + 1, `${id}.${name}: mid`);
      }

      // end-of-action transition: loop wraps, otherwise fall back to next/idle
      const last = advanceFrame({ name, frame: action.end }, action, c);
      const expect = c.actions[action.loop ? name : action.next ?? c.idle];
      assert(last.name === expect.name && last.frame === expect.start, `${id}.${name}: transition`);
    }
  }
};
