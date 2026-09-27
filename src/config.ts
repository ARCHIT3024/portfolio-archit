/** Site-wide switches (docs/app-flow.md §9). */
export const SHOW_INTRO = true;
export const START_LIGHTS_OFF = false;
export const PAPER_GRAIN = true;

export const BREAKPOINTS = {
  /** ≥ board: evidence board is the scaled absolute canvas with red string. */
  board: 1000,
  /** < mobile: case folder becomes a full-screen sheet. */
  mobile: 760,
  /** ≥ navInline: nav shows the six inline links; below it, the Case Index menu. */
  navInline: 1100,
} as const;

/** Evidence board canvas (board mode), in unscaled px. */
export const BOARD = { width: 1200, height: 1060, cardWidth: 384 } as const;

/** Storage key for the lamp preference. */
export const LAMP_STORAGE_KEY = 'casefile:lightsOff';
