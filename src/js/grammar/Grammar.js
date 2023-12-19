
class Grammar {
    constructor(rules = []) {
        this.rules = rules;
        this._terminals = new Set();
        this._nonTerminals = new Set();

        for (let rule of this.rules) {
            this._terminals = new Set([...this._terminals, ...rule.getTerminals()]);
            this._nonTerminals = new Set([...this._nonTerminals, ...rule.getNonTerminals()]);
        }
    }

    // Fonction pour ajouter une règle de production à la grammaire
    addRule(rule) {
        this.rules.push(rule);
        this._terminals = new Set([...this._terminals, ...rule.getTerminals()]);
        this._nonTerminals = new Set([...this._nonTerminals, ...rule.getNonTerminals()]);
    }

    // Fonction pour afficher la grammaire
    display() {
        for (let rule of this.rules) {
            console.log(rule.toString());
        }
    }

    // Fonction pour lister les terminaux
    listTerminals() {
        return Array.from(this._terminals);
    }

    // Fonction pour lister les non terminaux
    listNonTerminals() {
        return Array.from(this._nonTerminals);
    }

    computeFirstSet() {
        let firstSet = {};

        // Initialisation du fixpoint
        for (let nonTerminal of this._nonTerminals) {
            firstSet[nonTerminal] = new Set();
        }

        // Fixpoint
        let changed = true;
        while (changed) {
            changed = false;

            for (let rule of this.rules) {
                let nonTerminal = rule.getLeft();
                let first = firstSet[nonTerminal];
                let firstPart = rule.getRight().split('')[0];

                if (firstPart === "" || firstPart === "ε") {
                    // Si la première partie de la règle est vide, ajouter le premier de la règle entière
                    if (!first.has('ε')) {
                        first.add('ε');
                        changed = true;
                    }
                } else if (this._terminals.has(firstPart)) {
                    // Si la première partie de la règle est un terminal, ajouter ce terminal au premier
                    if (!first.has(firstPart)) {
                        first.add(firstPart);
                        changed = true;
                    }
                } else {
                    // Si la première partie de la règle est un non-terminal, ajouter le premier de ce non-terminal au premier
                    for (let terminal of firstSet[firstPart]) {
                        if (terminal === 'ε' && rule.getRight().split('')[1] !== undefined) {
                            for (let terminal of firstSet[rule.getRight().split('')[1]]) {
                                if (!first.has(terminal)) {
                                    first.add(terminal);
                                    changed = true;
                                }
                            }
                        }
                        if (!first.has(terminal)) {
                            first.add(terminal);
                            changed = true;
                        }
                    }
                }
            }
        }

        return firstSet;
    }

    computeFollowSet(axiom) {
        let followSet = {};

        // Initialisation du fixpoint
        for (let nonTerminal of this._nonTerminals) {
            followSet[nonTerminal] = new Set();
        }

        // Calcul des premiers
        let firstSet = this.computeFirstSet();

        // Ajout du symbole de fin de chaîne ($) à l'axiome
        followSet[axiom].add('$');

        // Fixpoint
        let changed = true;
        while (changed) {
            changed = false;

            for (let rule of this.rules) {
                let rightSymbols = rule.getRight().split('');
                for (let i = 0; i < rightSymbols.length; i++) {
                    let symbol = rightSymbols[i];

                    if (this._nonTerminals.has(symbol)) {
                        let follow = followSet[symbol];
                        let nextSymbol = rightSymbols[i + 1];

                        if (nextSymbol !== undefined) {
                            let nextFirst = this._calculateFirstOfRight(rightSymbols.slice(i + 1).join(''), firstSet);
                            let epsilonInNextFirst = nextFirst.has('ε');

                            nextFirst.delete('ε');

                            // Ajoutez les premiers de la partie droite après le symbole actuel
                            for (let terminal of nextFirst) {
                                if (!follow.has(terminal)) {
                                    follow.add(terminal);
                                    changed = true;
                                }
                            }

                            // Si ε est dans les premiers de la partie droite après le symbole actuel
                            if (epsilonInNextFirst) {
                                for (let terminal of followSet[rule.getLeft()]) {
                                    if (!follow.has(terminal)) {
                                        follow.add(terminal);
                                        changed = true;
                                    }
                                }
                            }
                        } else {
                            // Si le symbole est à la fin de la règle, ajoutez les suivants du non-terminal de la règle
                            for (let terminal of followSet[rule.getLeft()]) {
                                if (!follow.has(terminal)) {
                                    follow.add(terminal);
                                    changed = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        return followSet;
    }

    _calculateFirstOfRight(symbols, firstSet) {
        let first = new Set();

        let firstPart = symbols.split('')[0];

        if (firstPart === "" || firstPart === "ε") {
            first.add('ε');
        } else if (this._terminals.has(firstPart)) {
            first.add(firstPart);
        } else {
            for (let terminal of firstSet[firstPart]) {
                first.add(terminal);
            }
        }

        return first;
    }
}

/* 
Ce code JavaScript représente une classe Grammar utilisée pour gérer une grammaire. 
Voici une description textuelle de ses fonctionnalités :

1. Constructeur (constructor): Prend en paramètre un tableau de règles de production et initialise la grammaire
 avec ces règles. Il crée des ensembles pour stocker les terminaux (_terminals) et les non-terminaux (_nonTerminals) 
 de la grammaire.
2. addRule: Méthode pour ajouter une nouvelle règle de production à la grammaire. Elle met à jour les ensembles 
de terminaux et de non-terminaux avec les nouvelles règles ajoutées.
3. display: Affiche les règles de production de la grammaire dans la console.
4. listTerminals: Retourne un tableau contenant tous les terminaux de la grammaire.
5. listNonTerminals: Retourne un tableau contenant tous les non-terminaux de la grammaire.
6. computeFirstSet: Calcule l'ensemble First de la grammaire en utilisant l'algorithme du fixpoint. Il détermine 
les premiers symboles qui peuvent apparaître dans les dérivations des non-terminaux de la grammaire.
7. computeFollowSet: Calcule l'ensemble Follow de la grammaire en utilisant l'ensemble First précédemment calculé. 
Il détermine les symboles qui peuvent apparaître directement après chaque non-terminal.
8. _calculateFirstOfRight: Méthode auxiliaire pour calculer l'ensemble First d'une séquence de symboles, 
utilisée dans computeFollowSet.

Ce code offre des méthodes pour gérer et analyser une grammaire en identifiant les terminaux, les non-terminaux, 
et en calculant les ensembles First et Follow, qui sont importants dans l'analyse syntaxique des langages formels. 
*/