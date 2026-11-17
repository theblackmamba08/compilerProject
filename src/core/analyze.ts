import { computeSets } from './analysis';
import { parseGrammar, tokenize, withStart } from './grammar';
import { parseWord } from './parser';
import { buildTable, findLeftRecursion } from './table';
import type { Grammar, GrammarError, GrammarSets, ParseResult, ParsingTable } from './types';

export interface Analysis {
  readonly ok: true;
  readonly grammar: Grammar;
  readonly sets: GrammarSets;
  readonly table: ParsingTable;
  readonly leftRecursive: readonly string[];
  readonly word: readonly string[];
  readonly parse: ParseResult;
}

export type AnalyzeResult = Analysis | { readonly ok: false; readonly errors: readonly GrammarError[] };

/** Point d'entrée unique : lit la grammaire, calcule tout et analyse le mot. */
export function analyze(grammarText: string, wordText: string, start?: string): AnalyzeResult {
  const read = parseGrammar(grammarText);
  if (!read.ok) return read;
  const chosen = start ? withStart(read.grammar, start) : read;
  if (!chosen.ok) return chosen;

  const grammar = chosen.grammar;
  const sets = computeSets(grammar);
  const table = buildTable(grammar, sets);
  const word = tokenize(wordText);
  return {
    ok: true,
    grammar,
    sets,
    table,
    leftRecursive: findLeftRecursion(grammar, sets.nullable),
    word,
    parse: parseWord(grammar, table, word),
  };
}
