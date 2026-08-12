/**
 * Canonical helix geometry, shared by the logo mark, favicon, hero Helix
 * animation and the scroll-strand (CLAUDE.md §10: "the mark's two strand
 * paths ARE the hero helix and the scroll-strand").
 *
 * ViewBox 0 0 64 64. Two interlocking S-curves cross at the tips like the
 * source logo; circuit rungs are deliberately staggered and unequal so the
 * mark reads as drawn, not generated.
 */

export const HELIX_VIEWBOX = "0 0 64 64";

/** Left strand — biology (teal). Bulges left; tails flick right. */
export const STRAND_TEAL =
  "M40 2.5 C20.5 10.5, 14.2 20, 14.2 32 C14.2 44, 20.5 53.5, 40 61.5";

/** Right strand — human health (copper). Mirrored, crossing both tips. */
export const STRAND_COPPER =
  "M24 2.5 C43.5 10.5, 49.8 20, 49.8 32 C49.8 44, 43.5 53.5, 24 61.5";

export interface CircuitRung {
  x1: number;
  y: number;
  x2: number;
  /** node dot sits just past the rung's inner end */
  nodeX: number;
}

/** Circuit traces, teal (left) side — four rungs, uneven lengths. */
export const RUNGS_TEAL: CircuitRung[] = [
  { x1: 16.6, y: 22, x2: 26.5, nodeX: 29 },
  { x1: 14.9, y: 29, x2: 23, nodeX: 25.5 },
  { x1: 14.9, y: 36, x2: 27.5, nodeX: 30 },
  { x1: 17.2, y: 43.5, x2: 24, nodeX: 26.5 },
];

/** Circuit traces, copper (right) side — three rungs, offset half-steps. */
export const RUNGS_COPPER: CircuitRung[] = [
  { x1: 47.2, y: 18.5, x2: 39, nodeX: 36.5 },
  { x1: 49.4, y: 26, x2: 41.5, nodeX: 39 },
  { x1: 49.2, y: 33.5, x2: 37.5, nodeX: 35 },
];

export const NODE_RADIUS = 1.7;
export const STRAND_WIDTH = 3.4;
export const RUNG_WIDTH = 1.6;
