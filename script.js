document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DU DOM ---
    // Section 1: Joue avec les droites (y = ax + b)
    const linesCanvas = document.getElementById('linesGraphCanvas');
    const linesCtx = linesCanvas.getContext('2d');
    const valeurAInput = document.getElementById('valeurA');
    const valeurBInput = document.getElementById('valeurB');
    const drawUserLineButton = document.getElementById('drawUserLineButton');
    const clearLinesButton = document.getElementById('clearLinesButton');
    const equationsListUL = document.getElementById('equationsList');

    // Section 2: Trouver l'équation à partir de deux points
    const pointsCanvas = document.getElementById('pointsGraphCanvas');
    const pointsCtx = pointsCanvas.getContext('2d');
    const startPointsButton = document.getElementById('startPointsButton');
    const pointsEquationResultDiv = document.getElementById('pointsEquationResult');

    // --- CONFIGURATION COMMUNE DES CANVAS ---
    const canvasWidth = linesCanvas.width; // Supposons que les deux canvas ont la même taille
    const canvasHeight = linesCanvas.height;
    const scale = 30; // Pixels par unité
    const originX = canvasWidth / 2;
    const originY = canvasHeight / 2;

    // --- VARIABLES SPÉCIFIQUES AU CANVAS 1 (linesGraphCanvas) ---
    let drawnLines = []; // {a, b, color}
    const lineColors = ['blue', 'red', 'green', 'purple', 'orange', 'brown', 'teal', 'magenta'];
    let colorIndex = 0;

    // --- VARIABLES SPÉCIFIQUES AU CANVAS 2 (pointsGraphCanvas) ---
    let selectingPointsMode = false;
    let selectedPoints = []; // {x, y} en coordonnées du graphique

    // --- FONCTIONS DE DESSIN GÉNÉRIQUES ---
    function clearCanvasCtx(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    function drawAxes(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const oX = width / 2;
        const oY = height / 2;

        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        // Axe X
        ctx.moveTo(0, oY);
        ctx.lineTo(width, oY);
        ctx.moveTo(width - 10, oY - 5);
        ctx.lineTo(width, oY);
        ctx.lineTo(width - 10, oY + 5);

        // Axe Y
        ctx.moveTo(oX, 0);
        ctx.lineTo(oX, height);
        ctx.moveTo(oX - 5, 10);
        ctx.lineTo(oX, 0);
        ctx.lineTo(oX + 5, 10);

        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('X', width - 15, oY - 10);
        ctx.fillText('Y', oX + 10, 15);
        ctx.fillText('0', oX + 5, oY + 15);

        // Graduations
        ctx.strokeStyle = '#ccc';
        // Axe X
        for (let x = -Math.floor(oX / scale); x <= Math.floor((width - oX) / scale); x++) {
            if (x === 0) continue;
            const pixelX = oX + x * scale;
            ctx.moveTo(pixelX, oY - 3);
            ctx.lineTo(pixelX, oY + 3);
            if (x % 2 === 0) ctx.fillText(x.toString(), pixelX - (x < 0 ? 8 : 4), oY + 15);
        }
        // Axe Y
        for (let y = -Math.floor(oY / scale); y <= Math.floor((height - oY) / scale); y++) {
            if (y === 0) continue;
            const pixelY = oY - y * scale;
            ctx.moveTo(oX - 3, pixelY);
            ctx.lineTo(oX + 3, pixelY);
            if (y % 2 === 0) ctx.fillText(y.toString(), oX - 15 - (y < 0 ? 5 : 0), pixelY + 4);
        }
        ctx.stroke();
    }

    function drawSingleLine(ctx, a, b, color = 'blue') {
        const width = ctx.canvas.width;
        const oX = width / 2;
        const oY = ctx.canvas.height / 2;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        let firstPoint = true;
        for (let pixelX = 0; pixelX < width; pixelX++) {
            const graphX = (pixelX - oX) / scale;
            const graphY = a * graphX + b;
            const pixelY = oY - (graphY * scale);
            if (firstPoint) {
                ctx.moveTo(pixelX, pixelY);
                firstPoint = false;
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        ctx.stroke();
    }

    function drawPoint(ctx, graphX, graphY, color = 'red', radius = 5) {
        const oX = ctx.canvas.width / 2;
        const oY = ctx.canvas.height / 2;
        const pixelX = oX + graphX * scale;
        const pixelY = oY - graphY * scale;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }

    // --- LOGIQUE POUR CANVAS 1 (linesGraphCanvas) ---
    function addLineToEquationList(a, b, color) {
        const listItem = document.createElement('li');
        listItem.textContent = `y = ${a}x + ${b}`;
        listItem.style.color = color;
        equationsListUL.appendChild(listItem);
    }

    function redrawLinesOnCanvas1() {
        clearCanvasCtx(linesCtx);
        drawAxes(linesCtx);
        drawnLines.forEach(line => {
            drawSingleLine(linesCtx, line.a, line.b, line.color);
        });
        updateEquationsListDisplay();
    }

    function updateEquationsListDisplay() {
        equationsListUL.innerHTML = '';
        drawnLines.forEach(line => {
            addLineToEquationList(line.a, line.b, line.color);
        });
    }

    drawUserLineButton.addEventListener('click', () => {
        const a = parseFloat(valeurAInput.value);
        const b = parseFloat(valeurBInput.value);
        if (isNaN(a) || isNaN(b)) {
            alert("Veuillez entrer des valeurs numériques valides pour 'a' et 'b'.");
            return;
        }
        const existingLine = drawnLines.find(line => line.a === a && line.b === b);
        if (existingLine) {
            alert("Cette droite est déjà dessinée. Modifiez 'a' ou 'b' ou effacez le graphique.");
            return;
        }
        const color = lineColors[colorIndex % lineColors.length];
        drawnLines.push({ a, b, color });
        colorIndex++;
        redrawLinesOnCanvas1();
    });

    clearLinesButton.addEventListener('click', () => {
        drawnLines = [];
        colorIndex = 0;
        redrawLinesOnCanvas1(); // Redessine juste les axes et vide la liste
    });

    // --- LOGIQUE POUR CANVAS 2 (pointsGraphCanvas) ---
    startPointsButton.addEventListener('click', () => {
        selectingPointsMode = !selectingPointsMode;
        if (selectingPointsMode) {
            startPointsButton.textContent = "Arrêter la sélection";
            startPointsButton.classList.add('active');
            pointsCanvas.classList.add('crosshair-cursor');
            selectedPoints = [];
            clearCanvasCtx(pointsCtx); // Efface le canvas des points
            drawAxes(pointsCtx);       // Redessine les axes
            pointsEquationResultDiv.innerHTML = "<p>Cliquez sur le graphique pour choisir le premier point.</p>";
        } else {
            startPointsButton.textContent = "Commencer la sélection des points";
            startPointsButton.classList.remove('active');
            pointsCanvas.classList.remove('crosshair-cursor');
            // Ne pas effacer le résultat ici, l'utilisateur pourrait vouloir le voir
        }
    });

    pointsCanvas.addEventListener('click', (event) => {
        if (!selectingPointsMode) return;

        const rect = pointsCanvas.getBoundingClientRect();
        const pixelX = event.clientX - rect.left;
        const pixelY = event.clientY - rect.top;

        const oX = pointsCanvas.width / 2;
        const oY = pointsCanvas.height / 2;
        const graphX = parseFloat(((pixelX - oX) / scale).toFixed(2));
        const graphY = parseFloat(((oY - pixelY) / scale).toFixed(2));

        selectedPoints.push({ x: graphX, y: graphY });
        // Efface et redessine les axes et les points pour éviter de dessiner sur l'ancienne ligne calculée
        clearCanvasCtx(pointsCtx);
        drawAxes(pointsCtx);
        selectedPoints.forEach(p => drawPoint(pointsCtx, p.x, p.y));


        if (selectedPoints.length === 1) {
            pointsEquationResultDiv.innerHTML = `<p>Premier point : (x: ${graphX}, y: ${graphY}). Cliquez pour le deuxième point.</p>`;
        } else if (selectedPoints.length === 2) {
            const [p1, p2] = selectedPoints;
            calculateAndDisplayEquationOnCanvas2(p1, p2);
            selectingPointsMode = false; // Quitte le mode sélection
            startPointsButton.textContent = "Commencer la sélection des points";
            startPointsButton.classList.remove('active');
            pointsCanvas.classList.remove('crosshair-cursor');
        }
    });

    function calculateAndDisplayEquationOnCanvas2(p1, p2) {
        let equationText = "";
        let stepsText = "";
        let lineA, lineB; // Pour stocker a et b pour le dessin

        // On ne vide plus pointsEquationResultDiv ici pour garder les coordonnées des points
        // mais on s'assure de ne pas dupliquer le contenu si l'utilisateur reclique rapidement.
        // Une approche plus robuste serait de séparer l'affichage des points de celui de l'équation.
        let baseInfo = `<p>Points : (x1: ${p1.x}, y1: ${p1.y}) et (x2: ${p2.x}, y2: ${p2.y}).</p>`;


        if (p1.x === p2.x) {
            equationText = `<span class="equation">x = ${p1.x}</span>`;
            stepsText = `<div class="steps">Les deux points ont la même abscisse (x = ${p1.x}). C'est une droite verticale.</div>`;
            // Pour dessiner une droite verticale, on ne peut pas utiliser drawSingleLine directement
            // On la dessine manuellement ici
            pointsCtx.beginPath();
            pointsCtx.strokeStyle = 'purple';
            pointsCtx.lineWidth = 2;
            const canvasP1X = pointsCtx.canvas.width/2 + p1.x * scale;
            pointsCtx.moveTo(canvasP1X, 0);
            pointsCtx.lineTo(canvasP1X, pointsCtx.canvas.height);
            pointsCtx.stroke();
        } else {
            lineA = (p2.y - p1.y) / (p2.x - p1.x);
            lineB = p1.y - lineA * p1.x;
            const a_rounded = parseFloat(lineA.toFixed(3));
            const b_rounded = parseFloat(lineB.toFixed(3));
            equationText = `<span class="equation">y = ${a_rounded}x ${b_rounded < 0 ? '-' : '+'} ${Math.abs(b_rounded)}</span>`;
            stepsText = `<div class="steps">
                1. Pente (a) = (y2 - y1) / (x2 - x1) = (${p2.y} - ${p1.y}) / (${p2.x} - ${p1.x}) = ${a_rounded}<br>
                2. Ordonnée à l'origine (b) = y1 - a * x1 = ${p1.y} - (${a_rounded} * ${p1.x}) = ${b_rounded}
            </div>`;
            drawSingleLine(pointsCtx, lineA, lineB, 'purple');
        }
        pointsEquationResultDiv.innerHTML = baseInfo + equationText + stepsText;
    }

    // --- INITIALISATION ---
    function init() {
        // Canvas 1 (linesGraphCanvas)
        clearCanvasCtx(linesCtx);
        drawAxes(linesCtx);
        // Dé-commenter pour une droite par défaut au chargement pour linesGraphCanvas
        // const initialA = parseFloat(valeurAInput.value);
        // const initialB = parseFloat(valeurBInput.value);
        // if (!isNaN(initialA) && !isNaN(initialB)) {
        //     const initialColor = lineColors[colorIndex % lineColors.length];
        //     drawnLines.push({ a: initialA, b: initialB, color: initialColor });
        //     colorIndex++;
        //     redrawLinesOnCanvas1();
        // } else {
        //     updateEquationsListDisplay(); // Assure que la liste est vide si pas de droite initiale
        // }


        // Canvas 2 (pointsGraphCanvas)
        clearCanvasCtx(pointsCtx);
        drawAxes(pointsCtx);
    }

    init();
});
