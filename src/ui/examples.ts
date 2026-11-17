import type { Messages } from './i18n';

export interface Example {
  readonly id: keyof Messages['examples'];
  readonly grammar: string;
  readonly word: string;
}

export const EXAMPLES: readonly Example[] = [
  {
    id: 'expressions',
    grammar: "E  -> T E'\nE' -> + T E' | ε\nT  -> F T'\nT' -> * F T' | ε\nF  -> ( E ) | a",
    word: 'a + a * a',
  },
  { id: 'anbn', grammar: 'S -> a S b | ε', word: 'aabb' },
  { id: 'parentheses', grammar: 'S -> ( S ) S | ε', word: '(()())' },
  { id: 'notLL1', grammar: 'S -> a S | a', word: 'aa' },
  { id: 'leftRecursive', grammar: 'E -> E + T | T\nT -> a', word: 'a+a' },
];
