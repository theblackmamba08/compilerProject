import { END, EPSILON } from './types';
import type { Grammar, GrammarError, GrammarResult, Production } from './types';

const ARROW = /->|→/;
const NON_TERMINAL = /^[A-Z]'*$/;

/**
 * Découpe une suite de symboles écrite sans séparateur obligatoire.
 * Un non-terminal est une majuscule suivie d'éventuels primes (E, E', E'') ;
 * tout autre caractère visible est un terminal d'un seul caractère.
 */
export function tokenize(text: string): string[] {
  const symbols: string[] = [];
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i] as string;
    if (/\s/.test(c)) continue;
    if (/[A-Z]/.test(c)) {
      let symbol = c;
      while (chars[i + 1] === "'") {
        symbol += "'";
        i++;
      }
      symbols.push(symbol);
    } else {
      symbols.push(c);
    }
  }
  return symbols;
}

export const isNonTerminal = (symbol: string): boolean => NON_TERMINAL.test(symbol);

/**
 * Lit une grammaire écrite une règle par ligne : « S -> a S b | ε ».
 * Les lignes vides et celles qui commencent par # sont ignorées.
 */
export function parseGrammar(text: string): GrammarResult {
  const errors: GrammarError[] = [];
  const productions: Production[] = [];
  const firstUse = new Map<string, number>();

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = i + 1;
    const content = raw.trim();
    if (content === '' || content.startsWith('#')) return;

    const arrow = ARROW.exec(content);
    if (!arrow) {
      errors.push({ code: 'missingArrow', line });
      return;
    }
    const left = content.slice(0, arrow.index).trim();
    const right = content.slice(arrow.index + arrow[0].length);
    if (!isNonTerminal(left)) {
      errors.push({ code: 'invalidLeftSide', line, symbol: left });
      return;
    }

    for (const alternative of right.split('|')) {
      const symbols = tokenize(alternative);
      if (symbols.length === 0) {
        errors.push({ code: 'emptyAlternative', line });
        return;
      }
      if (symbols.includes(EPSILON) && symbols.length > 1) {
        errors.push({ code: 'misplacedEpsilon', line });
        return;
      }
      if (symbols.includes(END)) {
        errors.push({ code: 'reservedSymbol', line, symbol: END });
        return;
      }
      const rhs = symbols[0] === EPSILON ? [] : symbols;
      for (const symbol of rhs) {
        if (isNonTerminal(symbol) && !firstUse.has(symbol)) firstUse.set(symbol, line);
      }
      productions.push({ lhs: left, rhs, index: productions.length });
    }
  });

  if (errors.length > 0) return { ok: false, errors };
  if (productions.length === 0) return { ok: false, errors: [{ code: 'empty', line: 0 }] };

  const nonTerminals = unique(productions.map((p) => p.lhs));
  for (const [symbol, line] of firstUse) {
    if (!nonTerminals.includes(symbol)) errors.push({ code: 'undefinedNonTerminal', line, symbol });
  }
  if (errors.length > 0) return { ok: false, errors };

  const terminals = unique(productions.flatMap((p) => p.rhs.filter((s) => !isNonTerminal(s))));
  const start = productions[0]?.lhs as string;
  const grammar: Grammar = { productions, nonTerminals, terminals, start };
  return { ok: true, grammar };
}

/** Change l'axiome d'une grammaire déjà lue. */
export function withStart(grammar: Grammar, start: string): GrammarResult {
  if (!grammar.nonTerminals.includes(start)) {
    return { ok: false, errors: [{ code: 'unknownStart', line: 0, symbol: start }] };
  }
  return { ok: true, grammar: { ...grammar, start } };
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}
