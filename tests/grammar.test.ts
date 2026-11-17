import { describe, expect, it } from 'vitest';
import { parseGrammar } from '../src/core/grammar';
import type { Grammar, GrammarError } from '../src/core/types';
import { AN_BN, EXPRESSIONS } from './fixtures';

function ok(text: string): Grammar {
  const result = parseGrammar(text);
  if (!result.ok) throw new Error(`Grammaire refusée : ${JSON.stringify(result.errors)}`);
  return result.grammar;
}

function errors(text: string): readonly GrammarError[] {
  const result = parseGrammar(text);
  if (result.ok) throw new Error('La grammaire aurait dû être refusée');
  return result.errors;
}

const show = (g: Grammar) => g.productions.map((p) => `${p.lhs}->${p.rhs.join(' ') || 'ε'}`);

describe('parseGrammar', () => {
  it('lit la grammaire des expressions, avec des non-terminaux primés', () => {
    const g = ok(EXPRESSIONS);
    expect(g.start).toBe('E');
    expect(g.nonTerminals).toEqual(['E', "E'", 'T', "T'", 'F']);
    expect(g.terminals).toEqual(['+', '*', '(', ')', 'a']);
    expect(show(g)).toEqual([
      "E->T E'",
      "E'->+ T E'",
      "E'->ε",
      "T->F T'",
      "T'->* F T'",
      "T'->ε",
      'F->( E )',
      'F->a',
    ]);
  });

  it('accepte une saisie sans espaces et la flèche →', () => {
    expect(show(ok('S->aSb|ε'))).toEqual(['S->a S b', 'S->ε']);
    expect(show(ok('S → aSb | ε'))).toEqual(['S->a S b', 'S->ε']);
  });

  it('regroupe les règles d’un même non-terminal écrites sur plusieurs lignes', () => {
    expect(show(ok('S -> a S b\nS -> ε'))).toEqual(show(ok(AN_BN)));
  });

  it('ignore les lignes vides et les commentaires', () => {
    expect(show(ok('# langage aⁿbⁿ\n\nS -> a S b | ε\n'))).toEqual(['S->a S b', 'S->ε']);
  });

  it('numérote les règles dans l’ordre de saisie', () => {
    expect(ok(AN_BN).productions.map((p) => p.index)).toEqual([0, 1]);
  });

  it('refuse une grammaire vide', () => {
    expect(errors('  \n# rien\n')).toEqual([{ code: 'empty', line: 0 }]);
  });

  it('signale une ligne sans flèche, avec son numéro', () => {
    expect(errors('S -> a\nS a')).toEqual([{ code: 'missingArrow', line: 2 }]);
  });

  it('refuse une partie gauche qui n’est pas un non-terminal', () => {
    expect(errors('a -> b')).toEqual([{ code: 'invalidLeftSide', line: 1, symbol: 'a' }]);
    expect(errors('S T -> b')).toEqual([{ code: 'invalidLeftSide', line: 1, symbol: 'S T' }]);
  });

  it('refuse une alternative vide (il faut écrire ε)', () => {
    expect(errors('S -> a |')).toEqual([{ code: 'emptyAlternative', line: 1 }]);
  });

  it('refuse ε mêlé à d’autres symboles', () => {
    expect(errors('S -> a ε')).toEqual([{ code: 'misplacedEpsilon', line: 1 }]);
  });

  it('réserve le symbole $ à la fin du mot', () => {
    expect(errors('S -> a $')).toEqual([{ code: 'reservedSymbol', line: 1, symbol: '$' }]);
  });

  it('signale un non-terminal utilisé sans règle', () => {
    expect(errors('S -> a B')).toEqual([{ code: 'undefinedNonTerminal', line: 1, symbol: 'B' }]);
  });
});
