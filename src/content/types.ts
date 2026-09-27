/** Typed shapes for every piece of copy and data on the page. Components render these as text. */

/** Width / height, e.g. `[16, 10]`. */
export type Ratio = readonly [number, number];

/**
 * A photo slot. Until the owner supplies the file, `src` is absent and the design's striped
 * "IMAGE PLACEHOLDER" renders with `label` as its description.
 */
export interface ImageSlot {
  /** Placeholder description from the design; also the starting point for `alt`. */
  label: string;
  ratio: Ratio;
  /** Base name of the processed image in `public/images/` (no extension), once it exists. */
  src?: string;
  /** Widths available for `src` (written by the image pipeline). */
  widths?: readonly number[];
  /** Meaningful alt text for the real image. */
  alt?: string;
}

/** An outbound link. `href: null` means the owner hasn't supplied it yet (rendered as a TODO). */
export interface LinkRef {
  label: string;
  href: string | null;
  /** Visible `[ADD …]` note from the design, shown until the link arrives. */
  note?: string;
}

export type CaseId = '004' | '003' | '002' | '001';

export interface CaseFile {
  id: CaseId;
  name: string;
  stamp: string;
  /** Stamp rotation in degrees. */
  stampRot: number;
  filed: string;
  images: readonly [ImageSlot, ImageSlot, ImageSlot];
  /** Which image doubles as the board card cover. */
  cover: 0 | 1 | 2;
  brief: readonly string[];
  facts: readonly string[];
  tools: readonly string[];
  links: readonly LinkRef[];
  /** Position on the 1200×1060 board canvas (board mode). */
  board: { left: number; top: number; rot: number };
}

export type DeskId = 'type' | 'note' | 'phone' | 'map' | 'radio' | 'rules' | 'mug';

export interface DeskObject {
  id: DeskId;
  obj: string;
  cat: string;
  note?: string;
  /** Skill chips revealed on examine … */
  tags?: readonly string[];
  /** … or a single italic line (the mug). */
  text?: string;
  rot: number;
}

export type SectionId = 'file' | 'evidence' | 'desk' | 'history' | 'commendations' | 'contact';

export interface NavLink {
  id: SectionId;
  label: string;
  /** Screen label number, e.g. `02`. */
  num: string;
}

export interface HistoryEntry {
  id: string;
  kind: 'work' | 'education';
  /**
   * `YYYY-MM` the entry is filed under. Work: its start month. Education: the date on its tab.
   * The list sorts work first, then education, each newest first.
   */
  sortDate: string;
  tab: string;
  title: string;
  meta: string;
  metaLink?: LinkRef;
  body?: { lead?: string; text: string };
  chips?: readonly string[];
  image?: ImageSlot;
}

export interface Commendation {
  id: string;
  label: string;
  body: string | readonly string[];
  rot: number;
  pending?: { stamp: string; stampRot: number };
}

export interface FileRow {
  term: string;
  detail: string;
  strong?: boolean;
}

export interface NarrativeParagraph {
  lead?: string;
  text: string;
}
