import { describe, expect, it } from 'vitest';
import { computeSets } from '../src/core/analysis';
import { parseGrammar } from '../src/core/grammar';
import { buildTable, findLeftRecursion } from '../src/core/table';
import type { Grammar } from '../src/core/types';
import { EXPRESSIONS, LEFT_RECURSIVE, NOT_LL1 } from './fixtures';

function grammar(text: string): Grammar {
  const result = parseGrammar(text);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.grammar;
}

function table(text: string) {
  const g = grammar(text);
  return buildTable(g, computeSets(g));
}

const cell = (t: ReturnType<typeof table>, nt: string, a: string) =>
  (t.cells.get(nt)?.get(a) ?? []).map((p) => `${p.lhs}->${p.rhs.join(' ') || 'ε'}`);

describe('buildTable', () => {
  it('construit la table LL(1) des expressions, sans conflit', () => {
    const t = table(EXPRESSIONS);
    expect(t.isLL1).toBe(true);
    expect(t.conflicts).toEqual([]);
    expect(cell(t, 'E', 'a')).toEqual(["E->T E'"]);
    expect(cell(t, "E'", '+')).toEqual(["E'->+ T E'"]);
    expect(cell(t, "E'", ')')).toEqual(["E'->ε"]);
    expect(cell(t, "E'", '$')).toEqual(["E'->ε"]);
    expect(cell(t, "T'", '+')).toEqual(["T'->ε"]);
    expect(cell(t, 'F', '(')).toEqual(['F->( E )']);
    expect(cell(t, 'F', '+')).toEqual([]);
  });

  it('non-régression du bug 2 de 2023 : détecte et garde les conflits', () => {
    const t = table(NOT_LL1);
    expect(t.isLL1).toBe(false);
    expect(t.conflicts).toHaveLength(1);
    expect(t.conflicts[0]?.nonTerminal).toBe('S');
    expect(t.conflicts[0]?.terminal).toBe('a');
    expect(cell(t, 'S', 'a')).toEqual(['S->a S', 'S->a']);
  });

  it('une grammaire récursive à gauche n’est pas LL(1)', () => {
    expect(table(LEFT_RECURSIVE).isLL1).toBe(false);
  });
});

describe('findLeftRecursion', () => {
  it('repère la récursivité à gauche directe', () => {
    expect(findLeftRecursion(grammar(LEFT_RECURSIVE))).toEqual(['E']);
  });

  it('repère la récursivité à gauche indirecte, y compris à travers un annulable', () => {
    expect(findLeftRecursion(grammar('S -> A a\nA -> S b | c'))).toEqual(['S', 'A']);
    expect(findLeftRecursion(grammar('S -> B S a | c\nB -> ε'))).toEqual(['S']);
  });

  it('ne signale rien pour la grammaire des expressions', () => {
    expect(findLeftRecursion(grammar(EXPRESSIONS))).toEqual([]);
  });
});
