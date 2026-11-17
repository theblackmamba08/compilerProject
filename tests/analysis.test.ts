import { describe, expect, it } from 'vitest';
import { computeSets } from '../src/core/analysis';
import { parseGrammar } from '../src/core/grammar';
import type { Grammar } from '../src/core/types';
import { EXPRESSIONS, NULLABLE_PREFIX } from './fixtures';

function grammar(text: string): Grammar {
  const result = parseGrammar(text);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.grammar;
}

const sorted = (set: ReadonlySet<string> | undefined) => [...(set ?? [])].sort();

describe('computeSets — grammaire des expressions (valeurs de référence)', () => {
  const sets = computeSets(grammar(EXPRESSIONS));

  it('calcule les non-terminaux annulables', () => {
    expect(sorted(sets.nullable)).toEqual(["E'", "T'"]);
  });

  it('calcule PREMIER (ε indiqué pour les annulables)', () => {
    expect(sorted(sets.first.get('E'))).toEqual(['(', 'a']);
    expect(sorted(sets.first.get('T'))).toEqual(['(', 'a']);
    expect(sorted(sets.first.get('F'))).toEqual(['(', 'a']);
    expect(sorted(sets.first.get("E'"))).toEqual(['+', 'ε']);
    expect(sorted(sets.first.get("T'"))).toEqual(['*', 'ε']);
  });

  it('calcule SUIVANT', () => {
    expect(sorted(sets.follow.get('E'))).toEqual(['$', ')']);
    expect(sorted(sets.follow.get("E'"))).toEqual(['$', ')']);
    expect(sorted(sets.follow.get('T'))).toEqual(['$', ')', '+']);
    expect(sorted(sets.follow.get("T'"))).toEqual(['$', ')', '+']);
    expect(sorted(sets.follow.get('F'))).toEqual(['$', ')', '*', '+']);
  });
});

describe('computeSets — non-régression du bug 3 de 2023', () => {
  it('traverse tous les symboles annulables en tête de règle', () => {
    const sets = computeSets(grammar(NULLABLE_PREFIX));
    expect(sorted(sets.first.get('S'))).toEqual(['a', 'b', 'c']);
    expect(sorted(sets.follow.get('A'))).toEqual(['b', 'c']);
    expect(sorted(sets.follow.get('B'))).toEqual(['c']);
  });

  it('marque annulable une règle faite uniquement de non-terminaux annulables', () => {
    const sets = computeSets(grammar('S -> A B\nA -> ε\nB -> ε'));
    expect(sets.nullable.has('S')).toBe(true);
    expect(sorted(sets.first.get('S'))).toEqual(['ε']);
  });
});

describe('firstOfSequence', () => {
  it('donne PREMIER d’une suite et dit si elle est annulable', () => {
    const sets = computeSets(grammar(NULLABLE_PREFIX));
    expect(sorted(sets.firstOfSequence(['A', 'B']).terminals)).toEqual(['a', 'b']);
    expect(sets.firstOfSequence(['A', 'B']).nullable).toBe(true);
    expect(sets.firstOfSequence(['A', 'c']).nullable).toBe(false);
    expect(sets.firstOfSequence([]).nullable).toBe(true);
  });
});
