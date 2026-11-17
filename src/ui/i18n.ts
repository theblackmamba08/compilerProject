import type { GrammarError } from '../core/types';

export type Lang = 'fr' | 'en';

const fr = {
  title: 'Word Wizard — analyseur LL(1)',
  description:
    'Testez une grammaire LL(1) : ensembles PREMIER et SUIVANT, table d’analyse, conflits et analyse pas à pas d’un mot.',
  heading: 'Word Wizard',
  skip: 'Aller aux résultats',
  intro:
    'Écrivez une grammaire, puis un mot : l’outil calcule les ensembles PREMIER et SUIVANT, construit la table LL(1) et montre l’analyse pas à pas.',
  switchLang: 'English',
  switchLangLabel: 'Switch to English',
  grammarLegend: 'Grammaire',
  grammarLabel: 'Règles, une par ligne',
  grammarHelp:
    'Majuscule (éventuellement suivie de primes, comme E\') : non-terminal. Tout autre caractère : terminal. Le mot vide s’écrit ε ; la première règle donne l’axiome.',
  insertEpsilon: 'Insérer ε',
  insertArrow: 'Insérer →',
  example: 'Charger un exemple',
  exampleNone: 'Choisir…',
  startLabel: 'Axiome',
  wordLabel: 'Mot à analyser',
  wordHelp: 'Les espaces sont ignorés. Laissez vide pour tester le mot vide.',
  verdictAccepted: (w: string) => `Le mot ${w} est reconnu.`,
  verdictRejected: (w: string) => `Le mot ${w} n’est pas reconnu.`,
  verdictNotLL1: 'La grammaire n’est pas LL(1) : l’analyse prédictive est impossible.',
  verdictGrammarError: 'La grammaire contient des erreurs.',
  emptyWord: 'vide (ε)',
  errorAt: (pos: number, found: string, expected: string) =>
    `Blocage au symbole n° ${pos + 1}, «\u00a0${found}\u00a0». Attendu\u00a0: ${expected}.`,
  errorEarlyEnd: (expected: string) => `Le mot s’arrête trop tôt. Attendu : ${expected}.`,
  endOfWord: 'fin du mot',
  or: ' ou ',
  nothing: 'aucun symbole',
  leftRecursion: (list: string) =>
    `Récursivité à gauche sur ${list} : une grammaire récursive à gauche n’est jamais LL(1). Il faut d’abord la transformer.`,
  conflictsTitle: 'Conflits',
  conflict: (nt: string, t: string) => `Case M[${nt}, ${t}] : plusieurs règles possibles.`,
  derivationTitle: 'Dérivation la plus à gauche',
  derivationEmpty: 'Aucune dérivation à afficher.',
  traceTitle: 'Analyse pas à pas',
  traceHelp: 'Survolez ou parcourez une ligne au clavier pour voir la case de la table utilisée.',
  colStep: 'Étape',
  colStack: 'Pile (sommet à droite)',
  colInput: 'Reste du mot',
  colAction: 'Action',
  actionExpand: (rule: string) => `appliquer ${rule}`,
  actionMatch: (t: string) => `lire ${t}`,
  actionAccept: 'accepter',
  actionError: 'erreur',
  setsTitle: 'Ensembles PREMIER et SUIVANT',
  colNonTerminal: 'Non-terminal',
  colFirst: 'PREMIER',
  colFollow: 'SUIVANT',
  tableTitle: 'Table d’analyse LL(1)',
  tableHelp: 'Ligne : sommet de la pile. Colonne : symbole lu. Case vide : erreur.',
  tableCaption: 'Table LL(1) : règle à appliquer selon le sommet de la pile et le symbole lu',
  footerCredit: 'Projet universitaire de 2023 (Groupe 10), réécrit en 2026 par',
  footerSource: 'Code source sur GitHub',
  grammarErrors: {
    empty: () => 'Écrivez au moins une règle, par exemple S -> a S b | ε.',
    missingArrow: (e: GrammarError) => `Ligne ${e.line} : il manque la flèche -> entre la partie gauche et la partie droite.`,
    invalidLeftSide: (e: GrammarError) =>
      `Ligne ${e.line} : « ${e.symbol ?? ''} » n’est pas un non-terminal. La partie gauche doit être une seule majuscule, comme S ou E'.`,
    emptyAlternative: (e: GrammarError) => `Ligne ${e.line} : une alternative est vide. Pour le mot vide, écrivez ε.`,
    misplacedEpsilon: (e: GrammarError) => `Ligne ${e.line} : ε doit être seul dans son alternative.`,
    reservedSymbol: (e: GrammarError) => `Ligne ${e.line} : le symbole $ est réservé à la fin du mot.`,
    undefinedNonTerminal: (e: GrammarError) =>
      `Ligne ${e.line} : le non-terminal ${e.symbol ?? ''} est utilisé mais n’a aucune règle.`,
    unknownStart: (e: GrammarError) => `L’axiome ${e.symbol ?? ''} n’a aucune règle.`,
  },
  examples: {
    expressions: 'Expressions arithmétiques',
    anbn: 'Le langage aⁿbⁿ',
    parentheses: 'Parenthèses bien formées',
    notLL1: 'Grammaire non LL(1)',
    leftRecursive: 'Grammaire récursive à gauche',
  },
};

type Messages = typeof fr;

const en: Messages = {
  title: 'Word Wizard — LL(1) parser',
  description:
    'Try out an LL(1) grammar: FIRST and FOLLOW sets, parsing table, conflicts and a step-by-step parse of a word.',
  heading: 'Word Wizard',
  skip: 'Skip to results',
  intro:
    'Write a grammar, then a word: the tool computes the FIRST and FOLLOW sets, builds the LL(1) table and walks you through the parse.',
  switchLang: 'Français',
  switchLangLabel: 'Passer en français',
  grammarLegend: 'Grammar',
  grammarLabel: 'Rules, one per line',
  grammarHelp:
    'An uppercase letter (optionally followed by primes, as in E\') is a non-terminal. Any other character is a terminal. Write the empty word as ε; the first rule sets the start symbol.',
  insertEpsilon: 'Insert ε',
  insertArrow: 'Insert →',
  example: 'Load an example',
  exampleNone: 'Choose…',
  startLabel: 'Start symbol',
  wordLabel: 'Word to parse',
  wordHelp: 'Spaces are ignored. Leave it empty to test the empty word.',
  verdictAccepted: (w: string) => `The word ${w} is accepted.`,
  verdictRejected: (w: string) => `The word ${w} is rejected.`,
  verdictNotLL1: 'This grammar isn’t LL(1), so predictive parsing isn’t possible.',
  verdictGrammarError: 'The grammar has errors.',
  emptyWord: 'empty (ε)',
  errorAt: (pos: number, found: string, expected: string) =>
    `Stuck at symbol #${pos + 1}, “${found}”. Expected: ${expected}.`,
  errorEarlyEnd: (expected: string) => `The word ends too early. Expected: ${expected}.`,
  endOfWord: 'end of word',
  or: ' or ',
  nothing: 'nothing',
  leftRecursion: (list: string) =>
    `Left recursion on ${list}: a left-recursive grammar is never LL(1). Rewrite it first.`,
  conflictsTitle: 'Conflicts',
  conflict: (nt: string, t: string) => `Cell M[${nt}, ${t}]: more than one rule applies.`,
  derivationTitle: 'Leftmost derivation',
  derivationEmpty: 'No derivation to show.',
  traceTitle: 'Step-by-step parse',
  traceHelp: 'Hover over a row, or move through it with the keyboard, to see which table cell was used.',
  colStep: 'Step',
  colStack: 'Stack (top on the right)',
  colInput: 'Remaining input',
  colAction: 'Action',
  actionExpand: (rule: string) => `apply ${rule}`,
  actionMatch: (t: string) => `read ${t}`,
  actionAccept: 'accept',
  actionError: 'error',
  setsTitle: 'FIRST and FOLLOW sets',
  colNonTerminal: 'Non-terminal',
  colFirst: 'FIRST',
  colFollow: 'FOLLOW',
  tableTitle: 'LL(1) parsing table',
  tableHelp: 'Row: top of the stack. Column: symbol read. Empty cell: error.',
  tableCaption: 'LL(1) table: the rule to apply for each top of stack and symbol read',
  footerCredit: 'University project from 2023 (Group 10), rewritten in 2026 by',
  footerSource: 'Source code on GitHub',
  grammarErrors: {
    empty: () => 'Write at least one rule, for example S -> a S b | ε.',
    missingArrow: (e: GrammarError) => `Line ${e.line}: the arrow -> between the left and right sides is missing.`,
    invalidLeftSide: (e: GrammarError) =>
      `Line ${e.line}: “${e.symbol ?? ''}” isn’t a non-terminal. The left side must be a single uppercase letter, such as S or E'.`,
    emptyAlternative: (e: GrammarError) => `Line ${e.line}: one alternative is empty. Write ε for the empty word.`,
    misplacedEpsilon: (e: GrammarError) => `Line ${e.line}: ε must stand alone in its alternative.`,
    reservedSymbol: (e: GrammarError) => `Line ${e.line}: the $ symbol is reserved for the end of the word.`,
    undefinedNonTerminal: (e: GrammarError) =>
      `Line ${e.line}: the non-terminal ${e.symbol ?? ''} is used but has no rule.`,
    unknownStart: (e: GrammarError) => `The start symbol ${e.symbol ?? ''} has no rule.`,
  },
  examples: {
    expressions: 'Arithmetic expressions',
    anbn: 'The language aⁿbⁿ',
    parentheses: 'Balanced parentheses',
    notLL1: 'A grammar that isn’t LL(1)',
    leftRecursive: 'A left-recursive grammar',
  },
};

export const messages: Record<Lang, Messages> = { fr, en };
export type { Messages };

/** Langue initiale : paramètre ?lang=, puis choix mémorisé, puis langue du navigateur. */
export function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'fr' || fromUrl === 'en') return fromUrl;
  try {
    const saved = window.localStorage.getItem('ww-lang');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    // Stockage indisponible (navigation privée, iframe) : on continue sans.
  }
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function rememberLang(lang: Lang): void {
  try {
    window.localStorage.setItem('ww-lang', lang);
  } catch {
    // Sans conséquence : la langue reste dans l'adresse.
  }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState(null, '', url);
}
