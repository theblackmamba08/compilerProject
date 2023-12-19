class SyntaxAnalyzer {
    constructor(grammar, axiom) {
        this.grammar = grammar;
        this.axiom = axiom;
        this.firstSet = this.grammar.computeFirstSet();
        this.followSet = this.grammar.computeFollowSet(this.axiom);
        this.parsingTable = this.constructParsingTable();
    }

    // Méthode pour construire la table d'analyse syntaxique
    constructParsingTable() {
        let parsingTable = {};
    
        // Parcours de chaque règle de la grammaire
        for (let rule of this.grammar.rules) {
            let left = rule.getLeft();
            let right = rule.getRight();
    
            // Récupération des premiers de la partie droite de la règle
            let firstOfRight = this.getFirstOfRight(right);
    
            // Ajout des actions pour chaque terminal dans les premiers de la partie droite
            for (let terminal of firstOfRight) {
                if (terminal !== 'ε') {
                    parsingTable[`${left},${terminal}`] = rule;
                } else {
                    // Si ε est dans les premiers de la partie droite, ajouter les suivants du non-terminal de la règle
                    for (let followTerminal of this.followSet[left]) {
                        parsingTable[`${left},${followTerminal}`] = rule;
                    }
                }
            }

            // Si la règle est de la forme A -> ε, ajouter les suivants de A
            if (firstOfRight.has('ε')) {
                for (let followTerminal of this.followSet[left]) {
                    parsingTable[`${left},${followTerminal}`] = rule;
                }
            }

        }
    
        return parsingTable;
    }

    
    getFirstOfRight(symbolSequence) {
        let firstSet = new Set();

        if (symbolSequence.length === 0) {
            firstSet.add('ε'); // Ajoute ε si la séquence est vide
            return firstSet;
        }

        if (symbolSequence === 'ε') {
            firstSet.add('ε'); // Ajoute ε si la séquence est vide
            return firstSet;
        }
    
        for (let symbol of symbolSequence) {
            if (this.grammar._terminals.has(symbol)) {
                firstSet.add(symbol);
                break;
            } else {
                let firstOfSymbol = this.firstSet[symbol];
                if (firstOfSymbol) {
                    firstSet = new Set([...firstSet, ...firstOfSymbol]);
                    if (!firstOfSymbol.has('ε')) {
                        break;
                    }
                } else {
                    break; // Sortir de la boucle si le premier du symbole n'est pas défini
                }
            }
        }
    
        return firstSet;
    }
    
    analyzeWord(word) {
        let usedRules = []; // Liste pour stocker les règles utilisées
    
        if (this.isLL1()) {
            let stack = [this.axiom];
            let input = word.split('').concat('$');
    
            while (stack.length > 0) {
                let top = stack[stack.length - 1];
    
                if (this.grammar._terminals.has(top)) {
                    if (top === input[0]) {
                        stack.pop();
                        input.shift();
                    } else {
                        return { success: false, usedRules: usedRules }; // Retourne faux et les règles utilisées jusqu'à présent
                    }
                } else {
                    let key = `${top},${input[0]}`;
    
                    if (this.parsingTable[key]) {
                        let rule = this.parsingTable[key];
                        stack.pop();
    
                        let right = rule.getRight().split('').reverse();
                        usedRules.push(rule); // Ajout de la règle utilisée
                        for (let symbol of right) {
                            if (symbol !== 'ε') {
                                stack.push(symbol);
                            }
                        }
                    } else {
                        return { success: false, usedRules: usedRules }; // Retourne faux et les règles utilisées jusqu'à présent
                    }
                }
            }
    
            return { success: true, usedRules: usedRules }; // Retourne vrai et les règles utilisées si l'analyse est terminée avec succès
        } else {
            console.log("La grammaire n'est pas de type LL(1). L'analyse ne peut pas être effectuée.");
            return { success: false, usedRules: usedRules }; // ou une autre action si nécessaire
        }
    }
    isLL1() {
        // Parcours de chaque case de la table d'analyse
        for (let key in this.parsingTable) {
            // Vérification des conflits
            if (this.parsingTable.hasOwnProperty(key)) {
                if (this.parsingTable[key].length > 1) {
                    // Si une case a plus d'une règle associée, ce n'est pas LL(1)
                    return false;
                }
            }
        }
        // Si aucune case n'a plus d'une règle associée, la grammaire est LL(1)
        return true;
    }
}

/*
Le code présent déclare une classe nommée SyntaxAnalyzer, conçue pour effectuer l'analyse 
syntaxique d'une grammaire et vérifier si une chaîne donnée respecte cette grammaire. Voici une 
description de ses principales fonctionnalités :

1. Constructeur : Prend une grammaire (grammar) et un axiome (axiom) en entrée. Initialise les 
données relatives aux ensembles firstSet, followSet, et parsingTable utilisés pour l'analyse syntaxique.
2. Méthode constructParsingTable() : Génère la table d'analyse syntaxique (parsingTable) en parcourant 
les règles de la grammaire. Elle utilise les ensembles firstSet et followSet pour déterminer les 
actions associées à chaque combinaison de symboles terminaux et non-terminaux.
3. Méthode getFirstOfRight(symbolSequence) : Calcule l'ensemble des premiers (firstSet) d'une séquence 
de symboles.
4. Méthode analyzeWord(word) : Analyse une chaîne de caractères (word) en utilisant la table d'analyse
 générée. Elle effectue une analyse ascendante en utilisant une pile pour suivre les étapes et les 
 règles appliquées.
5. Méthode isLL1() : Vérifie si la grammaire est de type LL(1) en inspectant la table d'analyse 
générée pour des conflits (lorsqu'une cellule de la table a plus d'une règle associée). Renvoie 
true si la grammaire est LL(1), sinon false.

En résumé, cette classe fournit des méthodes pour construire une table d'analyse syntaxique à partir 
d'une grammaire, analyser une chaîne de caractères conformément à cette grammaire et vérifier si la 
grammaire respecte les contraintes du type LL(1).
*/
