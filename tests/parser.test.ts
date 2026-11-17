import { describe, expect, it } from 'vitest';
import { analyze } from '../src/core/analyze';
import { AN_BN, EXPRESSIONS, NOT_LL1, NULLABLE_PREFIX } from './fixtures';

function run(grammarText: string, word: string) {
  const result = analyze(grammarText, word);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.parse;
}

describe('analyse d’un mot — grammaire des expressions', () => {
  it.each(['a', 'a+a*a', '(a+a)*a', '((a))'])('accepte %s', (word) => {
    expect(run(EXPRESSIONS, word).status).toBe('accepted');
  });

  it.each(['a+', 'aa', 'a*(a', '()', ''])('refuse %j', (word) => {
    expect(run(EXPRESSIONS, word).status).toBe('rejected');
  });

  it.each(['a)', 'a+a)))'])('non-régression du bug 1 de 2023 : refuse %s (symboles en trop)', (word) => {
    const parse = run(EXPRESSIONS, word);
    expect(parse.status).toBe('rejected');
    expect(parse.error?.found).toBe(')');
    expect(parse.error?.expected).toEqual(['$']);
  });

  it('ignore les espaces du mot', () => {
    expect(run(EXPRESSIONS, ' a + a ').status).toBe('accepted');
  });

  it('indique la position et les symboles attendus en cas d’erreur', () => {
    const parse = run(EXPRESSIONS, 'a+*a');
    expect(parse.error).toEqual({ position: 2, found: '*', expected: ['(', 'a'] });
  });

  it('refuse un symbole inconnu de la grammaire', () => {
    const parse = run(EXPRESSIONS, 'a+x');
    expect(parse.status).toBe('rejected');
    expect(parse.error?.found).toBe('x');
  });
});

describe('dérivation et trace', () => {
  it('donne la dérivation la plus à gauche', () => {
    expect(run(AN_BN, 'ab').derivation).toEqual([['S'], ['a', 'S', 'b'], ['a', 'b']]);
  });

  it('enregistre chaque étape : pile, reste du mot, action', () => {
    const steps = run(AN_BN, 'ab').steps;
    expect(steps[0]).toMatchObject({ stack: ['$', 'S'], input: ['a', 'b', '$'], action: { kind: 'expand' } });
    expect(steps[1]).toMatchObject({ stack: ['$', 'b', 'S', 'a'], action: { kind: 'match', terminal: 'a' } });
    expect(steps.at(-1)).toMatchObject({ stack: ['$'], input: ['$'], action: { kind: 'accept' } });
  });

  it.each(['', 'ab', 'aabb', 'aaabbb'])('aⁿbⁿ : accepte %j', (word) => {
    expect(run(AN_BN, word).status).toBe('accepted');
  });

  it.each(['aab', 'ba', 'abb'])('aⁿbⁿ : refuse %s', (word) => {
    expect(run(AN_BN, word).status).toBe('rejected');
  });
});

describe('cas corrigés depuis la version de 2023', () => {
  it('bug 3 : accepte « c » quand les deux premiers symboles s’effacent', () => {
    expect(run(NULLABLE_PREFIX, 'c').status).toBe('accepted');
    expect(run(NULLABLE_PREFIX, 'abc').status).toBe('accepted');
    expect(run(NULLABLE_PREFIX, 'ba').status).toBe('rejected');
  });

  it('bug 2 : refuse d’analyser avec une grammaire non LL(1)', () => {
    const parse = run(NOT_LL1, 'aa');
    expect(parse.status).toBe('notLL1');
    expect(parse.steps).toEqual([]);
  });
});

describe('analyze — erreurs de grammaire', () => {
  it('renvoie les erreurs de saisie sans analyser', () => {
    const result = analyze('S -> a B', 'a');
    expect(result.ok).toBe(false);
  });

  it('permet de choisir un autre axiome', () => {
    const result = analyze('S -> a T\nT -> b', 'b', 'T');
    expect(result.ok && result.parse.status).toBe('accepted');
  });
});
