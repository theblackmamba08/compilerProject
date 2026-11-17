import { isNonTerminal } from './grammar';
import { END } from './types';
import type { Conflict, Grammar, GrammarSets, ParsingTable, Production } from './types';

/**
 * Construit la table d'analyse LL(1) : pour chaque règle A → α,
 * on la place en M[A, a] pour tout a de PREMIER(α), et en M[A, b]
 * pour tout b de SUIVANT(A) si α est annulable.
 * Une case qui reçoit plusieurs règles est un conflit : elles sont toutes gardées
 * (la version de 2023 écrasait la précédente et ne voyait donc aucun conflit, bug 2).
 */
export function buildTable(grammar: Grammar, sets: GrammarSets): ParsingTable {
  const cells = new Map<string, Map<string, Production[]>>(grammar.nonTerminals.map((a) => [a, new Map()]));

  const place = (production: Production, terminal: string) => {
    const row = cells.get(production.lhs) as Map<string, Production[]>;
    const cell = row.get(terminal) ?? [];
    if (!cell.includes(production)) cell.push(production);
    row.set(terminal, cell);
  };

  for (const production of grammar.productions) {
    const seq = sets.firstOfSequence(production.rhs);
    for (const t of seq.terminals) place(production, t);
    if (seq.nullable) {
      for (const b of sets.follow.get(production.lhs) ?? []) place(production, b);
    }
  }

  const columns = [...grammar.terminals, END];
  const conflicts: Conflict[] = [];
  for (const nonTerminal of grammar.nonTerminals) {
    for (const terminal of columns) {
      const productions = cells.get(nonTerminal)?.get(terminal) ?? [];
      if (productions.length > 1) conflicts.push({ nonTerminal, terminal, productions });
    }
  }

  return { cells, columns, conflicts, isLL1: conflicts.length === 0 };
}

/**
 * Non-terminaux récursifs à gauche (A ⇒⁺ A…), directement ou non,
 * en tenant compte des symboles annulables placés devant.
 */
export function findLeftRecursion(grammar: Grammar, nullable?: ReadonlySet<string>): string[] {
  const canVanish = nullable ?? computeNullable(grammar);
  // Graphe « A peut commencer par B ».
  const edges = new Map<string, Set<string>>(grammar.nonTerminals.map((a) => [a, new Set()]));
  for (const { lhs, rhs } of grammar.productions) {
    for (const symbol of rhs) {
      if (!isNonTerminal(symbol)) break;
      edges.get(lhs)?.add(symbol);
      if (!canVanish.has(symbol)) break;
    }
  }
  return grammar.nonTerminals.filter((a) => reaches(edges, a, a));
}

function reaches(edges: ReadonlyMap<string, ReadonlySet<string>>, from: string, target: string): boolean {
  const seen = new Set<string>();
  const stack = [...(edges.get(from) ?? [])];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    if (current === target) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push(...(edges.get(current) ?? []));
  }
  return false;
}

function computeNullable(grammar: Grammar): Set<string> {
  const nullable = new Set<string>();
  for (let changed = true; changed; ) {
    changed = false;
    for (const { lhs, rhs } of grammar.productions) {
      if (!nullable.has(lhs) && rhs.every((s) => nullable.has(s))) {
        nullable.add(lhs);
        changed = true;
      }
    }
  }
  return nullable;
}
