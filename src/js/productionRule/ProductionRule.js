class ProductionRule {
    constructor(left, right, terminals = "", nonTerminals = "") {
        this._left = left;
        this._right = right;
        this._terminals = new Set(terminals.split(''));
        this._nonTerminals = new Set(nonTerminals.split(''));

        // Vérification conditionnelle pour chaque symbole des attributs left et right
        if (!this._nonTerminals.has(this._left)) {
            throw new Error(`Le symbole '${this._left}' n'est pas un non-terminal valide.`);
        }

        for (let symbol of this._right.split('').filter(s => s !== 'ε')) {
            if (!this._terminals.has(symbol) && !this._nonTerminals.has(symbol)) {
                throw new Error(`Le symbole '${symbol}' n'est ni un terminal ni un non-terminal valide.`);
            }
        }
    }

    // Méthode pour obtenir la valeur de la variable 'left'
    getLeft() {
        return this._left;
    }

    // Méthode pour obtenir la valeur de la variable 'right'
    getRight() {
        return this._right;
    }

    // Méthode pour obtenir la valeur de la variable '_terminals'
    getTerminals() {
        return this._terminals;
    }

    // Méthode pour obtenir la valeur de la variable '_nonTerminals'
    getNonTerminals() {
        return this._nonTerminals;
    }

    toString() {
        return this._left + " -> " + this._right;
    }
}

/*
Ce fichier contient la définition d'une classe JavaScript appelée ProductionRule. Voici une 
description de cette classe :
La classe ProductionRule est utilisée pour représenter une règle de production dans une grammaire 
formelle. Elle prend quatre paramètres lors de son instanciation : left, right, terminals, et nonTerminals.

1. left (gauche) : Représente le symbole non-terminal à gauche de la règle de production.
2. right (droite) : Représente la séquence de symboles (terminaux et non-terminaux) à droite de la règle de production.
3. terminals (terminaux) : Une chaîne de caractères représentant les symboles terminaux de la règle, séparés par des caractères individuels.
4. nonTerminals (non-terminaux) : Une chaîne de caractères représentant les symboles non-terminaux de la règle, séparés par des caractères individuels.

La classe ProductionRule vérifie la validité des symboles lors de son instanciation :
    * Vérifie si le symbole à gauche est un non-terminal valide. Si ce n'est pas le cas, elle lève une erreur.
    * Vérifie chaque symbole dans la séquence à droite de la règle et s'assure qu'ils sont soit des 
    terminaux, soit des non-terminaux valides. Si un symbole n'est ni terminal ni non-terminal valide, 
    elle lève une erreur.

Cette classe offre également des méthodes pour accéder aux différentes parties de la règle :
    * getLeft() : Retourne le symbole non-terminal à gauche de la règle.
    * getRight() : Retourne la séquence de symboles à droite de la règle.
    * getTerminals() : Retourne l'ensemble des symboles terminaux de la règle.
    * getNonTerminals() : Retourne l'ensemble des symboles non-terminaux de la règle.

De plus, elle possède une méthode toString() qui retourne une représentation textuelle de la règle 
sous la forme "left -> right".
*/