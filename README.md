# Word Wizard — analyseur syntaxique LL(1)

*[English version below](#english)*

Word Wizard teste une grammaire algébrique et analyse un mot par la méthode **LL(1)** (analyse descendante prédictive). L'outil montre chaque étape : les ensembles PREMIER et SUIVANT, la table d'analyse, les éventuels conflits et l'analyse pas à pas du mot avec sa pile.

**Démo en ligne** : https://theblackmamba08.github.io/compilerProject/

## Écrire une grammaire

Une règle par ligne :

```text
E  -> T E'
E' -> + T E' | ε
T  -> F T'
T' -> * F T' | ε
F  -> ( E ) | a
```

- Un **non-terminal** est une majuscule, éventuellement suivie de primes : `S`, `E'`, `T''`.
- Tout autre caractère visible est un **terminal** d'un seul caractère.
- `ε` désigne le mot vide ; il doit être seul dans son alternative.
- `->` ou `→` sépare les deux parties ; `|` sépare les alternatives.
- La première règle donne l'axiome (modifiable dans l'interface).
- Les lignes vides et celles qui commencent par `#` sont ignorées.
- `$` est réservé : il marque la fin du mot.

## Ce que l'outil affiche

- le verdict (mot reconnu ou non) et, en cas d'échec, le symbole fautif et les symboles attendus ;
- la dérivation la plus à gauche ;
- la trace de l'analyse : pile, reste du mot, action ; survoler une étape éclaire la case de la table utilisée ;
- les ensembles PREMIER et SUIVANT ;
- la table LL(1), avec les conflits encadrés ;
- un avertissement en cas de récursivité à gauche.

## Développement

Prérequis : Node.js 22.12 ou plus.

```bash
npm ci            # installe les dépendances
npm run dev       # serveur de développement
npm run check     # types, lint, tests et build
npm test          # tests seuls
```

Organisation :

- `src/core/` : le moteur, en fonctions pures sans accès au DOM (`grammar.ts` lit la saisie, `analysis.ts` calcule annulables, PREMIER et SUIVANT, `table.ts` construit la table et détecte conflits et récursivité à gauche, `parser.ts` analyse le mot) ;
- `src/ui/` : l'interface (textes FR/EN, rendu des tableaux) ;
- `tests/` : tests Vitest, dont des valeurs de référence (grammaire des expressions) et la non-régression des bugs de 2023.

Le site est publié sur GitHub Pages par `.github/workflows/deploy.yml` à chaque envoi sur `main`.

## Historique

- **2023 — version 1.0** (étiquette `v1.0`) : projet universitaire du **Groupe 10**, en JavaScript sans outil, saisie au format `A->B"C"D`. Elle fonctionnait sur les grammaires LL(1) simples, mais avec trois défauts :
  1. un mot suivi de symboles en trop était accepté (`a)` avec la grammaire des expressions), car l'analyse s'arrêtait dès que la pile était vide ;
  2. les conflits n'étaient jamais détectés : chaque case de la table ne gardait que la dernière règle écrite ;
  3. PREMIER ne traversait pas plusieurs symboles annulables (`c` refusé avec `S → A B c`, `A → a | ε`, `B → b | ε`).
- **2026 — version 2.0** : réécriture complète en TypeScript, avec tests (dont un test pour chacun des trois défauts), saisie standard, interface bilingue et déploiement automatique. Réécriture menée par Cabrel FOSSO avec l'assistance de Claude (Anthropic).

## Licence

MIT, voir [LICENSE](LICENSE).

---

<a id="english"></a>

# Word Wizard — LL(1) parser

Word Wizard checks a context-free grammar and parses a word with the **LL(1)** method (predictive top-down parsing). It shows every step: FIRST and FOLLOW sets, the parsing table, any conflicts, and a step-by-step parse with its stack.

**Live demo**: https://theblackmamba08.github.io/compilerProject/

## Writing a grammar

One rule per line, as in the French section above. An uppercase letter, optionally followed by primes (`E'`), is a non-terminal; any other visible character is a single-character terminal. Write the empty word as `ε`, on its own in its alternative. Use `->` or `→` between the two sides and `|` between alternatives. The first rule sets the start symbol, which you can change in the interface. Blank lines and lines starting with `#` are ignored, and `$` is reserved for the end of the word.

## Development

Requires Node.js 22.12 or later. `npm ci`, then `npm run dev` for the dev server, `npm run check` for types, lint, tests and build. The engine lives in `src/core/` as pure functions; the interface is in `src/ui/`; tests are in `tests/`.

## History

Version 1.0 (2023, tag `v1.0`) was a university project by **Group 10**, in plain JavaScript. It worked on simple LL(1) grammars but had three bugs: it accepted words with trailing symbols, never detected table conflicts, and computed FIRST incorrectly across several nullable symbols. Version 2.0 (2026) is a full rewrite in TypeScript with tests for each of those bugs, a standard input format, a bilingual interface and automatic deployment. It was carried out by Cabrel FOSSO with help from Claude (Anthropic).

## License

MIT, see [LICENSE](LICENSE).
