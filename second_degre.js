document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DU DOM ---
    const valeurAInput = document.getElementById('valeurA_sd');
    const valeurBInput = document.getElementById('valeurB_sd');
    const valeurCInput = document.getElementById('valeurC_sd');
    const analyzeButton = document.getElementById('analyzeButton');
    const parabolaCanvas = document.getElementById('parabolaCanvas');
    const pCtx = parabolaCanvas.getContext('2d'); // 'pCtx' pour parabola context

    // Zones d'affichage des résultats
    const equationDetailsDiv = document.getElementById('equationDetails');
    const discriminantResultDiv = document.getElementById('discriminantResult');
    const rootsResultDiv = document.getElementById('rootsResult');
    const vertexResultDiv = document.getElementById('vertexResult');

    // --- CONFIGURATION DU CANVAS ---
    const canvasWidth = parabolaCanvas.width;
    const canvasHeight = parabolaCanvas.height;
    let scale = 20; // Pixels par unité, peut être ajusté dynamiquement
    let originX = canvasWidth / 2;
    let originY = canvasHeight / 1.5; // Placer l'origine plus bas pour mieux voir les paraboles ouvertes vers le haut

    // --- FONCTIONS DE DESSIN (adaptées pour les paraboles) ---
    function clearCanvas() {
        pCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function drawAxes(currentOriginX, currentOriginY, currentScale) {
        pCtx.beginPath();
        pCtx.strokeStyle = '#333';
        pCtx.lineWidth = 1;

        // Axe X
        pCtx.moveTo(0, currentOriginY);
        pCtx.lineTo(canvasWidth, currentOriginY);
        pCtx.moveTo(canvasWidth - 10, currentOriginY - 5);
        pCtx.lineTo(canvasWidth, currentOriginY);
        pCtx.lineTo(canvasWidth - 10, currentOriginY + 5);

        // Axe Y
        pCtx.moveTo(currentOriginX, 0);
        pCtx.lineTo(currentOriginX, canvasHeight);
        pCtx.moveTo(currentOriginX - 5, 10);
        pCtx.lineTo(currentOriginX, 0);
        pCtx.lineTo(currentOriginX + 5, 10);

        pCtx.font = '12px Arial';
        pCtx.fillStyle = '#333';
        pCtx.fillText('X', canvasWidth - 15, currentOriginY - 10);
        pCtx.fillText('Y', currentOriginX + 10, 15);
        pCtx.fillText('0', currentOriginX + 5, currentOriginY + 15); // Près de l'origine du canvas

        // Graduations (simplifiées pour la parabole, ajuster si besoin)
        pCtx.strokeStyle = '#ccc';
        // Axe X
        for (let i = -Math.floor(currentOriginX / currentScale); i * currentScale < canvasWidth - currentOriginX; i++) {
            if (i === 0) continue;
            const xTick = currentOriginX + i * currentScale;
            pCtx.moveTo(xTick, currentOriginY - 4);
            pCtx.lineTo(xTick, currentOriginY + 4);
             if (i % 2 === 0) pCtx.fillText(i.toString(), xTick - 5, currentOriginY + 15);
        }
        // Axe Y
        for (let i = -Math.floor((canvasHeight-currentOriginY) / currentScale) +1; i * currentScale < currentOriginY; i++) {
            if (i === 0) continue;
            const yTick = currentOriginY - i * currentScale; // i est positif pour le haut, négatif pour le bas
            pCtx.moveTo(currentOriginX - 4, yTick);
            pCtx.lineTo(currentOriginX + 4, yTick);
            if (i % 2 === 0) pCtx.fillText(i.toString(), currentOriginX + 10, yTick + 4);
        }
        pCtx.stroke();
    }

    function drawPoint(currentOriginX, currentOriginY, currentScale, graphX, graphY, color = 'red', radius = 4) {
        const pixelX = currentOriginX + graphX * currentScale;
        const pixelY = currentOriginY - graphY * currentScale; // Attention à l'inversion de l'axe Y
        pCtx.beginPath();
        pCtx.arc(pixelX, pixelY, radius, 0, 2 * Math.PI, false);
        pCtx.fillStyle = color;
        pCtx.fill();
    }

    function drawParabola(a, b, c, currentOriginX, currentOriginY, currentScale) {
        pCtx.beginPath();
        pCtx.strokeStyle = 'blue';
        pCtx.lineWidth = 2;
        let firstPlotPoint = true;

        for (let pixelX = 0; pixelX < canvasWidth; pixelX++) {
            // Convertir coordonnée pixel X en coordonnée du graphique
            const graphX = (pixelX - currentOriginX) / currentScale;
            // Calculer y avec l'équation : y = ax² + bx + c
            const graphY = a * graphX * graphX + b * graphX + c;
            // Convertir coordonnée y du graphique en coordonnée pixel Y
            const pixelY = currentOriginY - (graphY * currentScale);

            if (pixelY > canvasHeight || pixelY < 0) { // Si le point sort du canvas verticalement
                 if (!firstPlotPoint) pCtx.stroke(); // Termine le tracé actuel si on sort
                 firstPlotPoint = true; // Prépare pour un nouveau tracé si on rentre à nouveau
                 continue;
            }

            if (firstPlotPoint) {
                pCtx.moveTo(pixelX, pixelY);
                firstPlotPoint = false;
            } else {
                pCtx.lineTo(pixelX, pixelY);
            }
        }
        pCtx.stroke();
    }

    // --- LOGIQUE PRINCIPALE ---
    analyzeButton.addEventListener('click', () => {
        const a = parseFloat(valeurAInput.value);
        const b = parseFloat(valeurBInput.value);
        const c = parseFloat(valeurCInput.value);

        equationDetailsDiv.innerHTML = getString('quadratic_equation_display', { a: a, b: b, c: c });

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            discriminantResultDiv.innerHTML = `<p style='color:red;'>${getString('alert_invalid_coeffs_abc')}</p>`;
            rootsResultDiv.innerHTML = "";
            vertexResultDiv.innerHTML = "";
            clearCanvas();
            return;
        }

        if (a === 0) {
            discriminantResultDiv.innerHTML = `<p style='color:red;'>${getString('alert_a_cannot_be_zero_quadratic')}</p>`;
            rootsResultDiv.innerHTML = "";
            vertexResultDiv.innerHTML = "";
            // On pourrait dessiner la droite ici si on veut, ou juste effacer.
            clearCanvas();
            // Pour l'instant, dessine les axes par défaut en cas d'erreur 'a=0' pour ne pas laisser vide.
            drawAxes(originX, originY, scale);
            return;
        }

        // Calculs algébriques
        const delta = b * b - 4 * a * c;
        const sommetX = -b / (2 * a);
        const sommetY = a * sommetX * sommetX + b * sommetX + c; // Ou: (-delta) / (4*a)

        discriminantResultDiv.innerHTML = getString('discriminant_display', { delta: delta.toFixed(3) });
        vertexResultDiv.innerHTML = getString('vertex_display', { x: sommetX.toFixed(3), y: sommetY.toFixed(3) });

        let rootsMessage = getString('roots_solutions_title');
        let x1, x2;
        if (delta > 0) {
            x1 = (-b - Math.sqrt(delta)) / (2 * a);
            x2 = (-b + Math.sqrt(delta)) / (2 * a);
            rootsMessage += getString('roots_two_distinct_real', { x1: x1.toFixed(3), x2: x2.toFixed(3) });
        } else if (delta === 0) {
            x1 = -b / (2 * a);
            rootsMessage += getString('roots_one_double_real', { x1: x1.toFixed(3) });
        } else {
            rootsMessage += getString('roots_no_real_complex_conjugate');
        }
        rootsResultDiv.innerHTML = rootsMessage;

        // --- DESSIN ---
        clearCanvas();

        // Ajustement dynamique simple de l'échelle et de l'origine (peut être amélioré)
        let currentScale = scale;
        let currentOriginX = canvasWidth / 2;
        let currentOriginY = canvasHeight / 2 + Math.abs(sommetY * currentScale / 3); // Essayer de centrer un peu sur Y
        if (currentOriginY > canvasHeight * 0.85) currentOriginY = canvasHeight * 0.85; // Limite basse de l'origine Y
        if (currentOriginY < canvasHeight * 0.15) currentOriginY = canvasHeight * 0.15; // Limite haute de l'origine Y

        // Ajustement de l'échelle si la parabole est très "serrée" ou "large" autour du sommet
        // Ceci est une heuristique simple et pourrait nécessiter des ajustements plus fins
        const rangeYVisibleApprox = Math.abs(a * (canvasWidth / (2*currentScale)) * (canvasWidth / (2*currentScale)));
        if (a !== 0 && rangeYVisibleApprox > canvasHeight * 5) { // Si la parabole explose verticalement
            currentScale = currentScale * (rangeYVisibleApprox / (canvasHeight * 2));
        } else if (a !== 0 && rangeYVisibleApprox < canvasHeight / 5) { // Si la parabole est très plate
             currentScale = Math.max(5, currentScale / (canvasHeight / (rangeYVisibleApprox*2)));
        }
        // Re-centrer X sur le sommet
        currentOriginX = canvasWidth / 2 - sommetX * currentScale;


        drawAxes(currentOriginX, currentOriginY, currentScale);
        drawParabola(a, b, c, currentOriginX, currentOriginY, currentScale);

        // Marquer le sommet
        drawPoint(currentOriginX, currentOriginY, currentScale, sommetX, sommetY, 'green', 5);
        // Marquer les racines réelles si elles existent
        if (delta >= 0) {
            drawPoint(currentOriginX, currentOriginY, currentScale, x1, 0, 'red', 5); // x1, y=0
            if (delta > 0) { // Si x2 est différent de x1
                drawPoint(currentOriginX, currentOriginY, currentScale, x2, 0, 'red', 5); // x2, y=0
            }
        }
    });

    // Initialisation: dessiner les axes une première fois
    drawAxes(originX, originY, scale);
    equationDetailsDiv.innerHTML = getString('quadratic_initial_prompt');
});
