// Fonction pour parser les entrées de l'utilisateur
function parseGrammarInput(input) {
    let rules = [];

    // Extraction des différentes règles de production
    let ruleStrings = input.split(';');

    for (let ruleString of ruleStrings) {
        let parts = ruleString.split('"');
        let left = parts[0].split('->')[0];
        let right = parts[0].split('->')[1];
        let terminals = parts[1];
        let nonTerminals = parts[2];

        if (right.split("|").length > 1){
            for (let r of right.split("|")) {
                rules.push(new ProductionRule(left, r, terminals, nonTerminals));
            }
        }else{ 
        // Création d'une règle de production et ajout à la liste
        rules.push(new ProductionRule(left, right, terminals, nonTerminals));
        }
    }

    // Création de la grammaire
    let grammar = new Grammar(rules);

    return grammar;
}

function execute(){
    document.addEventListener('DOMContentLoaded', function() {
        const btnValider = document.getElementById('btnValider');
    
        btnValider.addEventListener('click', function() {
            const inputGrammar = document.getElementById('inputGrammar').value;
            const inputWord = document.getElementById('inputWord').value;
            const inputAxiom = document.getElementById('inputAxiom').value;
        
            // Vérification si les champs sont remplis
            if (inputGrammar && inputWord && inputAxiom) {
                // Appel de la fonction parseGrammarInput() avec inputGrammar
                const grammar = parseGrammarInput(inputGrammar);
        
                // Stockage des autres valeurs dans des variables
                const wordValue = inputWord;
                const axiomValue = inputAxiom;
        
                // Création d'un objet SyntaxAnalyzer avec la grammaire et l'axiome
                const syntaxAnalyzer = new SyntaxAnalyzer(grammar, axiomValue);
        
                // Appel de la fonction analyzeWord() avec le mot wordValue
                const analysisResult = syntaxAnalyzer.analyzeWord(wordValue);

                // Mise à jour de l'interface en fonction du résultat de l'analyse
                const insideInput = document.getElementById('inside');
                if (analysisResult.success) {
                    // Ajout de la classe success-message pour styler le texte en vert
                    insideInput.classList.add('success-message');
                    // Si le mot est reconnu, mettre à jour l'input avec le message approprié
                    insideInput.value = 'Le mot est reconnu';
                } else {
                    // Si le mot n'est pas reconnu, faire une autre action (par exemple, afficher un autre message)
                    insideInput.value = 'Le mot n\'est pas reconnu';
                }
        
                const rulesTextarea = document.getElementById('derivation'); // Sélectionne la balise textarea

                // Vérifie si le résultat de l'analyse est un succès
                if (analysisResult.success) {
                    let rulesText = '';

                    // Parcours des règles utilisées et construction du texte à afficher
                    for (let rule of analysisResult.usedRules) {
                        const left = rule.getLeft();
                        const right = rule.getRight();

                        rulesText += `${left}->${right}\t`; // Ajout de la règle dans le format A->B suivi d'un saut de ligne
                    }

                    // Mettre à jour le contenu de la balise textarea avec les règles
                    rulesTextarea.value = rulesText;
                } else {
                    rulesTextarea.value = 'Impossible de montrer les règles - le mot n\'est pas reconnu.';
                }

            } else {
                // Si tous les champs ne sont pas remplis, affiche un message d'erreur
                console.log('Veuillez remplir tous les champs.');
            }
        });
    });   
}

execute();



/*
Ce fichier JavaScript est une collection de fonctions destinées à interagir avec une interface 
utilisateur HTML. Voici une description textuelle de son fonctionnement :

1. parseGrammarInput(input): Cette fonction prend une chaîne de caractères en entrée, analyse 
les règles de production grammaticale et crée une structure de données de grammaire. Les règles 
sont extraites en séparant les différentes règles de production par des points-virgules et en 
identifiant les parties gauche et droite de chaque règle.

2. execute(): Cette fonction est exécutée lorsque le document HTML est entièrement chargé. 
Elle écoute le clic sur un bouton nommé 'btnValider'. Lorsque le bouton est cliqué, elle récupère 
les valeurs de trois champs de saisie HTML : 'inputGrammar', 'inputWord', et 'inputAxiom'.
    Elle vérifie si tous les champs sont remplis. Si c'est le cas :
        * Elle appelle parseGrammarInput() pour analyser la grammaire.
        * Stocke les autres valeurs récupérées (mot et axiome) dans des variables.
        * Crée un objet SyntaxAnalyzer en utilisant la grammaire et l'axiome.
        * Appelle analyzeWord() sur l'objet SyntaxAnalyzer avec le mot saisi.
        * Met à jour l'interface utilisateur :
            * Modifie le contenu d'un champ de saisie nommé 'inside' en fonction du résultat de l'analyse.
            * Affiche les règles de dérivation utilisées dans une balise textarea nommée 'derivation' si le mot est reconnu.
            * En cas d'échec de la reconnaissance du mot, affiche un message indiquant que les règles ne peuvent pas être affichées.

Ce script est conçu pour fonctionner avec une interface HTML où les utilisateurs peuvent saisir des 
règles grammaticales, un mot, et un axiome, puis voir si ce mot est reconnu par la grammaire spécifiée. 
Il met à jour l'interface utilisateur en conséquence, affichant les résultats de l'analyse et, s'il 
est reconnu, les règles de dérivation utilisées.
*/