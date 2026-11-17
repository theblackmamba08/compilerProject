import { isNonTerminal } from './grammar';
import { END } from './types';
import type { Grammar, ParseError, ParseResult, ParseStep, ParsingTable } from './types';

/** Garde-fou : une grammaire LL(1) sans récursivité à gauche termine toujours bien avant. */
const MAX_STEPS = 10_000;

/**
 * Analyse descendante prédictive avec une pile.
 * L'analyse n'accepte que si la pile ET le mot sont épuisés ensemble
 * (la version de 2023 acceptait dès que la pile était vide, bug 1).
 */
export function parseWord(grammar: Grammar, table: ParsingTable, word: readonly string[]): ParseResult {
  if (!table.isLL1) return { status: 'notLL1', steps: [], derivation: [] };

  const stack: string[] = [END, grammar.start];
  const input = [...word, END];
  let position = 0;
  const steps: ParseStep[] = [];
  const consumed: string[] = [];
  const derivation: string[][] = [[grammar.start]];

  const snapshot = () => ({ stack: [...stack], input: input.slice(position) });
  const fail = (expected: readonly string[]): ParseResult => {
    steps.push({ ...snapshot(), action: { kind: 'error' } });
    const error: ParseError = { position, found: input[position] as string, expected };
    return { status: 'rejected', steps, derivation, error };
  };

  while (steps.length < MAX_STEPS) {
    const top = stack.at(-1) as string;
    const current = input[position] as string;

    if (top === END) {
      if (current === END) {
        steps.push({ ...snapshot(), action: { kind: 'accept' } });
        return { status: 'accepted', steps, derivation };
      }
      return fail([END]);
    }

    if (!isNonTerminal(top)) {
      if (top !== current) return fail([top]);
      steps.push({ ...snapshot(), action: { kind: 'match', terminal: top } });
      stack.pop();
      consumed.push(top);
      position++;
      continue;
    }

    const production = table.cells.get(top)?.get(current)?.[0];
    if (!production) {
      const row = table.cells.get(top);
      return fail(table.columns.filter((t) => (row?.get(t)?.length ?? 0) > 0));
    }
    steps.push({ ...snapshot(), action: { kind: 'expand', production } });
    stack.pop();
    for (let i = production.rhs.length - 1; i >= 0; i--) stack.push(production.rhs[i] as string);
    derivation.push([...consumed, ...stack.slice(1).reverse()]);
  }
  return fail([]);
}
