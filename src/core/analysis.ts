import { isNonTerminal } from './grammar';
import { END, EPSILON } from './types';
import type { FirstOfSequence, Grammar, GrammarSets } from './types';

/**
 * Calcule les non-terminaux annulables, PREMIER et SUIVANT
 * par itération jusqu'au point fixe (plus aucun ensemble ne change).
 */
export function computeSets(grammar: Grammar): GrammarSets {
  const nullable = new Set<string>();
  const first = new Map<string, Set<string>>(grammar.nonTerminals.map((a) => [a, new Set()]));
  const follow = new Map<string, Set<string>>(grammar.nonTerminals.map((a) => [a, new Set()]));

  // PREMIER d'une suite de symboles : on avance tant que les symboles sont annulables.
  // C'est ce parcours complet qui manquait dans la version de 2023 (bug 3).
  const firstOfSequence = (symbols: readonly string[]): FirstOfSequence => {
    const terminals = new Set<string>();
    for (const symbol of symbols) {
      if (!isNonTerminal(symbol)) {
        terminals.add(symbol);
        return { terminals, nullable: false };
      }
      for (const t of first.get(symbol) ?? []) terminals.add(t);
      if (!nullable.has(symbol)) return { terminals, nullable: false };
    }
    return { terminals, nullable: true };
  };

  // 1. Annulables et PREMIER (sans ε, ajouté à la fin pour l'affichage).
  for (let changed = true; changed; ) {
    changed = false;
    for (const { lhs, rhs } of grammar.productions) {
      const target = first.get(lhs) as Set<string>;
      const seq = firstOfSequence(rhs);
      for (const t of seq.terminals) {
        if (!target.has(t)) {
          target.add(t);
          changed = true;
        }
      }
      if (seq.nullable && !nullable.has(lhs)) {
        nullable.add(lhs);
        changed = true;
      }
    }
  }

  // 2. SUIVANT : pour chaque B dans A → α B β, PREMIER(β) ⊂ SUIVANT(B),
  //    et SUIVANT(A) ⊂ SUIVANT(B) si β est annulable.
  (follow.get(grammar.start) as Set<string>).add(END);
  for (let changed = true; changed; ) {
    changed = false;
    for (const { lhs, rhs } of grammar.productions) {
      rhs.forEach((symbol, i) => {
        if (!isNonTerminal(symbol)) return;
        const target = follow.get(symbol) as Set<string>;
        const rest = firstOfSequence(rhs.slice(i + 1));
        const additions = rest.nullable ? [...rest.terminals, ...(follow.get(lhs) ?? [])] : rest.terminals;
        for (const t of additions) {
          if (!target.has(t)) {
            target.add(t);
            changed = true;
          }
        }
      });
    }
  }

  const firstWithEpsilon = new Map<string, Set<string>>();
  for (const [a, set] of first) {
    firstWithEpsilon.set(a, nullable.has(a) ? new Set([...set, EPSILON]) : new Set(set));
  }

  return { nullable, first: firstWithEpsilon, follow, firstOfSequence };
}
