// Attend que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Récupération des éléments HTML
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const valeurAInput = document.getElementById('valeurA');
    const valeurBInput = document.getElementById('valeurB');
    const redrawButton = document.getElementById('redrawButton'); // anciennement drawButton
    const addButton = document.getElementById('addButton');
    const equationsListUL = document.getElementById('equationsList'); // UL pour les équations

    const startPointsButton = document.getElementById('startPointsButton');
    const pointsEquationResultDiv = document.getElementById('pointsEquationResult');

    // Dimensions du canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Centre du repère (origine)
    const originX = canvasWidth / 2;
    const originY = canvasHeight / 2;
    const scale = 30; // Pixels par unité

    // Stockage pour les droites multiples
    let drawnLines = []; // Tableau pour stocker les objets {a, b, color}
    const lineColors = ['blue', 'red', 'green', 'purple', 'orange', 'brown'];
    let colorIndex = 0;

    // Variables pour la sélection de deux points
    let selectingPointsMode = false;
    let selectedPoints = []; // Stocke les points {x, y} en coordonnées du graphique

    // --- FONCTIONS DE BASE DU GRAPHIQUE ---

    function clearCanvas() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function drawAxes() {
        ctx.beginPath();
        ctx.strokeStyle = '#333'; // Couleur plus neutre pour les axes
        ctx.lineWidth = 1;

        // Axe X
        ctx.moveTo(0, originY);
        ctx.lineTo(canvasWidth, originY);
        ctx.moveTo(canvasWidth - 10, originY - 5);
        ctx.lineTo(canvasWidth, originY);
        ctx.lineTo(canvasWidth - 10, originY + 5);

        // Axe Y
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, canvasHeight);
        ctx.moveTo(originX - 5, 10);
        ctx.lineTo(originX, 0);
        ctx.lineTo(originX + 5, 10);

        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('X', canvasWidth - 15, originY - 10);
        ctx.fillText('Y', originX + 10, 15);
        ctx.fillText('0', originX + 5, originY + 15);

        // Graduations
        ctx.strokeStyle = '#ccc'; // Couleur plus légère pour les graduations
        // Axe X
        for (let x = -Math.floor(originX / scale); x <= Math.floor((canvasWidth - originX) / scale); x++) {
            if (x === 0) continue;
            const pixelX = originX + x * scale;
            ctx.moveTo(pixelX, originY - 3);
            ctx.lineTo(pixelX, originY + 3);
            if (x % 2 === 0) ctx.fillText(x.toString(), pixelX - (x < 0 ? 8 : 4), originY + 15);
        }
        // Axe Y
        for (let y = -Math.floor(originY / scale); y <= Math.floor((canvasHeight - originY) / scale); y++) {
            if (y === 0) continue;
            const pixelY = originY - y * scale;
            ctx.moveTo(originX - 3, pixelY);
            ctx.lineTo(originX + 3, pixelY);
            if (y % 2 === 0) ctx.fillText(y.toString(), originX - 15 - (y < 0 ? 5 : 0), pixelY + 4);
        }
        ctx.stroke(); // Dessine tout (axes et graduations)
    }

    // Fonction pour dessiner UNE équation y = ax + b
    function drawSingleLine(a, b, color = 'blue') {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        let firstPoint = true;
        for (let pixelX = 0; pixelX < canvasWidth; pixelX++) {
            const graphX = (pixelX - originX) / scale;
            const graphY = a * graphX + b;
            const pixelY = originY - (graphY * scale);
            if (firstPoint) {
                ctx.moveTo(pixelX, pixelY);
                firstPoint = false;
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        ctx.stroke();
    }

    // Fonction pour dessiner un point sur le graphique (utilisé pour la sélection)
    function drawPoint(graphX, graphY, color = 'red', radius = 5) {
        const pixelX = originX + graphX * scale;
        const pixelY = originY - graphY * scale;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }


    // --- GESTION DE PLUSIEURS DROITES ---

    function addLineToList(a, b, color) {
        const listItem = document.createElement('li');
        listItem.textContent = `y = ${a}x + ${b}`;
        listItem.style.color = color; // Applique la couleur aussi au texte
        equationsListUL.appendChild(listItem);
    }

    function redrawAllLines() {
        clearCanvas();
        drawAxes();
        drawnLines.forEach(line => {
            drawSingleLine(line.a, line.b, line.color);
        });
        // Redessiner les points sélectionnés s'il y en a
        selectedPoints.forEach(p => drawPoint(p.x, p.y));
    }

    function updateEquationsDisplay() {
        equationsListUL.innerHTML = ''; // Vide la liste
        drawnLines.forEach(line => {
            addLineToList(line.a, line.b, line.color);
        });
    }

    redrawButton.addEventListener('click', () => {
        const a = parseFloat(valeurAInput.value);
        const b = parseFloat(valeurBInput.value);
        if (isNaN(a) || isNaN(b)) {
            alert("Veuillez entrer des valeurs numériques valides pour 'a' et 'b'.");
            return;
        }

        drawnLines = []; // Efface les anciennes droites
        const color = lineColors[colorIndex % lineColors.length];
        drawnLines.push({ a, b, color });
        // colorIndex++; // On ne l'incrémente que si on garde la ligne

        redrawAllLines();
        updateEquationsDisplay();
        // Réinitialise l'index de couleur si on efface tout
        colorIndex = 0;
        drawnLines.find(line => line.a ===a && line.b ===b).color = lineColors[colorIndex % lineColors.length]; // Assigne la première couleur
        colorIndex++; // Prépare pour la prochaine *ajoutée*
        updateEquationsDisplay(); // Met à jour pour afficher la couleur
    });

    addButton.addEventListener('click', () => {
        const a = parseFloat(valeurAInput.value);
        const b = parseFloat(valeurBInput.value);
        if (isNaN(a) || isNaN(b)) {
            alert("Veuillez entrer des valeurs numériques valides pour 'a' et 'b'.");
            return;
        }

        // Vérifier si la ligne existe déjà pour éviter les doublons exacts
        const existingLine = drawnLines.find(line => line.a === a && line.b === b);
        if (existingLine) {
            alert("Cette droite est déjà dessinée.");
            return;
        }

        const color = lineColors[colorIndex % lineColors.length];
        drawnLines.push({ a, b, color });
        colorIndex++;

        redrawAllLines(); // Redessine tout, y compris la nouvelle ligne
        updateEquationsDisplay();
    });

    // --- TROUVER L'ÉQUATION À PARTIR DE DEUX POINTS ---

    startPointsButton.addEventListener('click', () => {
        selectingPointsMode = !selectingPointsMode; // Bascule le mode
        if (selectingPointsMode) {
            startPointsButton.textContent = "Arrêter la sélection";
            startPointsButton.classList.add('active');
            canvas.style.cursor = 'crosshair';
            selectedPoints = []; // Réinitialise les points à chaque démarrage
            pointsEquationResultDiv.innerHTML = "<p>Cliquez sur le graphique pour choisir le premier point.</p>";
            redrawAllLines(); // Efface les anciens points dessinés mais garde les droites
        } else {
            startPointsButton.textContent = "Commencer la sélection des points";
            startPointsButton.classList.remove('active');
            canvas.style.cursor = 'default';
            pointsEquationResultDiv.innerHTML = ""; // Vide les résultats précédents
            redrawAllLines(); // Redessine pour enlever les points potentiels si arrêt avant 2 points
        }
    });

    canvas.addEventListener('click', (event) => {
        if (!selectingPointsMode) return;

        const rect = canvas.getBoundingClientRect();
        const pixelX = event.clientX - rect.left;
        const pixelY = event.clientY - rect.top;

        // Convertir les coordonnées pixel en coordonnées du graphique
        const graphX = parseFloat(((pixelX - originX) / scale).toFixed(2)); // Arrondi pour la propreté
        const graphY = parseFloat(((originY - pixelY) / scale).toFixed(2)); // Arrondi

        selectedPoints.push({ x: graphX, y: graphY });
        drawPoint(graphX, graphY); // Dessine le point cliqué

        if (selectedPoints.length === 1) {
            pointsEquationResultDiv.innerHTML = `<p>Premier point sélectionné : (x: ${graphX}, y: ${graphY}).</p><p>Cliquez pour choisir le deuxième point.</p>`;
        } else if (selectedPoints.length === 2) {
            const [p1, p2] = selectedPoints;
            pointsEquationResultDiv.innerHTML = `<p>Points sélectionnés : (x1: ${p1.x}, y1: ${p1.y}) et (x2: ${p2.x}, y2: ${p2.y}).</p>`;

            calculateAndDisplayEquation(p1, p2);

            // Quitter le mode sélection après avoir trouvé l'équation
            selectingPointsMode = false;
            startPointsButton.textContent = "Commencer la sélection des points";
            startPointsButton.classList.remove('active');
            canvas.style.cursor = 'default';
        }
    });

    function calculateAndDisplayEquation(p1, p2) {
        let equationText = "";
        let stepsText = "";

        if (p1.x === p2.x) { // Droite verticale
            equationText = `<span class="equation">x = ${p1.x}</span>`;
            stepsText = `<div class="steps">Les deux points ont la même abscisse (x = ${p1.x}).<br>C'est une droite verticale. Son équation est x = constante.</div>`;
            // Dessiner la droite verticale
            ctx.beginPath();
            ctx.strokeStyle = 'purple'; // Couleur distincte
            ctx.lineWidth = 2;
            ctx.moveTo(originX + p1.x * scale, 0);
            ctx.lineTo(originX + p1.x * scale, canvasHeight);
            ctx.stroke();
        } else {
            // Calcul de la pente 'a'
            const a = (p2.y - p1.y) / (p2.x - p1.x);
            // Calcul de l'ordonnée à l'origine 'b'
            const b = p1.y - a * p1.x;

            const a_rounded = parseFloat(a.toFixed(3));
            const b_rounded = parseFloat(b.toFixed(3));

            equationText = `<span class="equation">y = ${a_rounded}x + ${b_rounded}</span>`;
            stepsText = `<div class="steps">
                1. Calcul de la pente (a) :<br>
                   a = (y2 - y1) / (x2 - x1)<br>
                   a = (${p2.y} - ${p1.y}) / (${p2.x} - ${p1.x})<br>
                   a = ${a_rounded}<br><br>
                2. Calcul de l'ordonnée à l'origine (b) :<br>
                   b = y1 - a * x1<br>
                   b = ${p1.y} - (${a_rounded} * ${p1.x})<br>
                   b = ${b_rounded}<br>
            </div>`;

            // Dessiner la droite calculée
            drawSingleLine(a, b, 'purple'); // Couleur distincte pour cette droite
        }
        pointsEquationResultDiv.innerHTML += equationText + stepsText;
    }

    // --- INITIALISATION ---
    function init() {
        clearCanvas();
        drawAxes();
        // Optionnel: dessiner une droite par défaut au chargement
        const initialA = parseFloat(valeurAInput.value);
        const initialB = parseFloat(valeurBInput.value);
        if (!isNaN(initialA) && !isNaN(initialB)) {
            const initialColor = lineColors[colorIndex % lineColors.length];
            drawnLines.push({ a: initialA, b: initialB, color: initialColor });
            colorIndex++;
            redrawAllLines();
            updateEquationsDisplay();
        }
    }

    init(); // Appel initial pour dessiner le repère et la droite par défaut
});
