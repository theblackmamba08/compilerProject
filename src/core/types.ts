/** Le mot vide. */
export const EPSILON = 'ε';
/** Marqueur de fin du mot, placé au fond de la pile et à la fin de l'entrée. */
export const END = '$';

/** Une règle de production A → α. Une partie droite vide représente ε. */
export interface Production {
  readonly lhs: string;
  readonly rhs: readonly string[];
  /** Rang de la règle dans l'ordre de saisie (à partir de 0). */
  readonly index: number;
}

export interface Grammar {
  readonly productions: readonly Production[];
  /** Non-terminaux, dans l'ordre de première apparition en partie gauche. */
  readonly nonTerminals: readonly string[];
  /** Terminaux, dans l'ordre de première apparition. */
  readonly terminals: readonly string[];
  /** Axiome : partie gauche de la première règle. */
  readonly start: string;
}

export type GrammarErrorCode =
  | 'empty'
  | 'missingArrow'
  | 'invalidLeftSide'
  | 'emptyAlternative'
  | 'misplacedEpsilon'
  | 'reservedSymbol'
  | 'undefinedNonTerminal'
  | 'unknownStart';

export interface GrammarError {
  readonly code: GrammarErrorCode;
  /** Numéro de ligne (à partir de 1) ; 0 quand l'erreur porte sur toute la saisie. */
  readonly line: number;
  readonly symbol?: string;
}

export type GrammarResult =
  | { readonly ok: true; readonly grammar: Grammar }
  | { readonly ok: false; readonly errors: readonly GrammarError[] };

export interface FirstOfSequence {
  readonly terminals: ReadonlySet<string>;
  readonly nullable: boolean;
}

export interface GrammarSets {
  readonly nullable: ReadonlySet<string>;
  /** PREMIER de chaque non-terminal ; contient ε si le non-terminal est annulable. */
  readonly first: ReadonlyMap<string, ReadonlySet<string>>;
  /** SUIVANT de chaque non-terminal ; contient $ pour l'axiome. */
  readonly follow: ReadonlyMap<string, ReadonlySet<string>>;
  firstOfSequence(symbols: readonly string[]): FirstOfSequence;
}

export interface Conflict {
  readonly nonTerminal: string;
  readonly terminal: string;
  readonly productions: readonly Production[];
}

export interface ParsingTable {
  /** cells.get(A).get(a) : règles à appliquer quand A est en haut de la pile et a sous la tête de lecture. */
  readonly cells: ReadonlyMap<string, ReadonlyMap<string, readonly Production[]>>;
  /** Colonnes de la table : les terminaux, puis $. */
  readonly columns: readonly string[];
  readonly conflicts: readonly Conflict[];
  readonly isLL1: boolean;
}

export type StepAction =
  | { readonly kind: 'expand'; readonly production: Production }
  | { readonly kind: 'match'; readonly terminal: string }
  | { readonly kind: 'accept' }
  | { readonly kind: 'error' };

export interface ParseStep {
  /** Pile, du fond ($) vers le sommet. */
  readonly stack: readonly string[];
  /** Reste du mot à lire, terminé par $. */
  readonly input: readonly string[];
  readonly action: StepAction;
}

export interface ParseError {
  /** Position du symbole fautif dans le mot (à partir de 0, espaces non comptés). */
  readonly position: number;
  readonly found: string;
  readonly expected: readonly string[];
}

export interface ParseResult {
  readonly status: 'accepted' | 'rejected' | 'notLL1';
  readonly steps: readonly ParseStep[];
  /** Dérivation la plus à gauche : suite des proto-mots, de l'axiome au mot. */
  readonly derivation: readonly (readonly string[])[];
  readonly error?: ParseError;
}
