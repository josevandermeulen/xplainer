document.addEventListener('DOMContentLoaded', async () => {
    // Wait for localization to be initialized
    try {
        // Wait for translations to be loaded
        await new Promise(resolve => {
            const checkTranslations = () => {
                if (Object.keys(translations).length > 0) {
                    resolve();
                } else {
                    setTimeout(checkTranslations, 100);
                }
            };
            checkTranslations();
        });

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
        // Le bouton startPointsButton a été supprimé du HTML et du JS
        const pointsEquationResultDiv = document.getElementById('pointsEquationResult');

        // --- CONFIGURATION COMMUNE DES CANVAS ---
        const canvasWidth = linesCanvas.width;
        const canvasHeight = linesCanvas.height;
        const scale = 30;
        const originX = canvasWidth / 2;
        const originY = canvasHeight / 2;

        // --- VARIABLES SPÉCIFIQUES AU CANVAS 1 (linesGraphCanvas) ---
        let drawnLines = [];
        const lineColors = ['blue', 'red', 'green', 'purple', 'orange', 'brown', 'teal', 'magenta'];
        let colorIndex = 0;

        // --- VARIABLES SPÉCIFIQUES AU CANVAS 2 (pointsGraphCanvas) ---
        // La variable selectingPointsMode est supprimée
        let selectedPoints = []; // Stocke les points {x, y} en coordonnées du graphique

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
            ctx.moveTo(0, oY);
            ctx.lineTo(width, oY);
            ctx.moveTo(width - 10, oY - 5);
            ctx.lineTo(width, oY);
            ctx.lineTo(width - 10, oY + 5);
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
            ctx.strokeStyle = '#ccc';
            for (let x = -Math.floor(oX / scale); x <= Math.floor((width - oX) / scale); x++) {
                if (x === 0) continue;
                const pixelX = oX + x * scale;
                ctx.moveTo(pixelX, oY - 3);
                ctx.lineTo(pixelX, oY + 3);
                if (x % 2 === 0) ctx.fillText(x.toString(), pixelX - (x < 0 ? 8 : 4), oY + 15);
            }
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
            listItem.textContent = getString('equation_format_y_ax_b', { a: a, b: b });
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
                alert(getString('alert_invalid_values_a_b'));
                return;
            }
            const existingLine = drawnLines.find(line => line.a === a && line.b === b);
            if (existingLine) {
                alert(getString('alert_line_already_drawn'));
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
            redrawLinesOnCanvas1();
        });

        // --- LOGIQUE POUR CANVAS 2 (pointsGraphCanvas) ---
        // Pas de bouton startPointsButton, le canvas est toujours "actif" implicitement.
        pointsCanvas.addEventListener('click', (event) => {
            // Si 2 points ont déjà été sélectionnés (et donc une équation calculée),
            // le prochain clic réinitialise le processus pour une nouvelle sélection.
            if (selectedPoints.length === 2) {
                selectedPoints = []; // Vide les points pour une nouvelle sélection
                clearCanvasCtx(pointsCtx); // Efface le canvas des points
                drawAxes(pointsCtx);       // Redessine les axes
                pointsEquationResultDiv.innerHTML = ""; // Vide la zone de résultat précédente
            }

            const rect = pointsCanvas.getBoundingClientRect();
            const pixelX = event.clientX - rect.left;
            const pixelY = event.clientY - rect.top;

            const oX = pointsCanvas.width / 2;
            const oY = pointsCanvas.height / 2;
            const graphX = parseFloat(((pixelX - oX) / scale).toFixed(2));
            const graphY = parseFloat(((oY - pixelY) / scale).toFixed(2));

            selectedPoints.push({ x: graphX, y: graphY });
            drawPoint(pointsCtx, graphX, graphY); // Dessine le point cliqué

            if (selectedPoints.length === 1) {
                pointsEquationResultDiv.innerHTML = `<p>${getString('point_selection_first_point', { graphX: graphX, graphY: graphY })}</p>`;
            } else if (selectedPoints.length === 2) {
                const [p1, p2] = selectedPoints;
                // Met à jour le message pour inclure les deux points avant le calcul
                // This message is temporary and overwritten by calculateAndDisplayEquationOnCanvas2, so no need to translate this exact temporary string.
                // However, the structure of calculateAndDisplayEquationOnCanvas2 will be updated.
                pointsEquationResultDiv.innerHTML = `<p>Points sélectionnés : (x1: ${p1.x}, y1: ${p1.y}) et (x2: ${p2.x}, y2: ${p2.y}).</p>`; // Keeping this as is, as it's immediately replaced.
                calculateAndDisplayEquationOnCanvas2(p1, p2);
                // Les points et la droite restent visibles. Le prochain clic effacera (géré au début de cet écouteur).
            }
        });

        function calculateAndDisplayEquationOnCanvas2(p1, p2) {
            let equationText = "";
            let stepsText = "";
            let lineA, lineB;

            // The initial message with point coordinates is set by the caller,
            // and it's a temporary message. We'll build the full translated message here.
            let initialMessage = `<p>${getString('points_selection_message', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })}</p>`;


            if (p1.x === p2.x) {
                equationText = `<span class="equation">${getString('equation_format_vertical_line', { x_value: p1.x })}</span>`;
                stepsText = `<div class="steps">${getString('explanation_vertical_line', { x_value: p1.x })}</div>`;
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
                equationText = `<span class="equation">${getString('equation_format_y_ax_b_detailed', { a: a_rounded, sign: (b_rounded < 0 ? '-' : '+'), b: Math.abs(b_rounded) })}</span>`;
                stepsText = `<div class="steps">${getString('explanation_slope_intercept', { p2y: p2.y, p1y: p1.y, p2x: p2.x, p1x: p1.x, a: a_rounded, b: b_rounded })}</div>`;
                drawSingleLine(pointsCtx, lineA, lineB, 'purple');
            }
            // The initialMessage part is already set by the caller if selectedPoints.length === 2
            // We append the new equation and steps.
            pointsEquationResultDiv.innerHTML = initialMessage + equationText + stepsText;
        }

        // --- INITIALISATION ---
        function init() {
            clearCanvasCtx(linesCtx);
            drawAxes(linesCtx);
            clearCanvasCtx(pointsCtx);
            drawAxes(pointsCtx);
            // Le curseur pour pointsCanvas est maintenant géré par CSS.
            // Si un message initial est souhaité pour pointsEquationResultDiv :
            pointsEquationResultDiv.innerHTML = `<p>${getString('points_graph_initial_prompt')}</p>`;
        }

        init();
    } catch (error) {
        console.error("Error initializing script:", error);
    }
});
