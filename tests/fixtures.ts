// Grammaires de référence utilisées par plusieurs fichiers de tests.

/** Grammaire des expressions arithmétiques, sans récursivité à gauche (exemple classique des cours de compilation). */
export const EXPRESSIONS = `
E  -> T E'
E' -> + T E' | ε
T  -> F T'
T' -> * F T' | ε
F  -> ( E ) | a
`;

/** Bug 3 de la version de 2023 : deux non-terminaux annulables en tête de règle. */
export const NULLABLE_PREFIX = `
S -> A B c
A -> a | ε
B -> b | ε
`;

/** Bug 2 de la version de 2023 : grammaire non LL(1) (conflit sur S, a). */
export const NOT_LL1 = 'S -> a S | a';

/** Langage aⁿbⁿ. */
export const AN_BN = 'S -> a S b | ε';

/** Grammaire récursive à gauche : jamais LL(1). */
export const LEFT_RECURSIVE = `
E -> E + T | T
T -> a
`;
