// Attend que le DOM soit entièrement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', () => {
    // Récupération des éléments HTML
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const valeurAInput = document.getElementById('valeurA');
    const valeurBInput = document.getElementById('valeurB');
    const drawButton = document.getElementById('drawButton');

    // Dimensions du canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Centre du repère (origine)
    const originX = canvasWidth / 2;
    const originY = canvasHeight / 2;

    // Échelle pour le graphique (combien d'unités du graphique correspondent à X pixels)
    // Cela peut être ajusté pour zoomer/dézoomer. Pour l'instant, une simple échelle.
    // Par exemple, 50 pixels représentent 1 unité.
    const scale = 30;

    // Fonction pour effacer le canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    // Fonction pour dessiner le repère cartésien
    function drawAxes() {
        ctx.beginPath();
        ctx.strokeStyle = '#000'; // Couleur des axes
        ctx.lineWidth = 1;

        // Axe X
        ctx.moveTo(0, originY);
        ctx.lineTo(canvasWidth, originY);
        // Flèche X
        ctx.moveTo(canvasWidth - 10, originY - 5);
        ctx.lineTo(canvasWidth, originY);
        ctx.lineTo(canvasWidth - 10, originY + 5);

        // Axe Y
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, canvasHeight);
        // Flèche Y
        ctx.moveTo(originX - 5, 10);
        ctx.lineTo(originX, 0);
        ctx.lineTo(originX + 5, 10);

        // Libellés des axes
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('X', canvasWidth - 15, originY - 10);
        ctx.fillText('Y', originX + 10, 15);
        ctx.fillText('0', originX + 5, originY + 15); // Origine

        // Graduations (simplifiées)
        // Graduations sur l'axe X
        for (let x = -Math.floor(originX / scale); x <= Math.floor((canvasWidth - originX) / scale); x++) {
            if (x === 0) continue; // Ne pas redessiner sur l'origine
            const pixelX = originX + x * scale;
            ctx.moveTo(pixelX, originY - 5);
            ctx.lineTo(pixelX, originY + 5);
            if (x % 2 === 0) { // Afficher le nombre toutes les deux graduations pour la lisibilité
                 ctx.fillText(x.toString(), pixelX - (x < 0 ? 10 : 5) , originY + 20);
            }
        }

        // Graduations sur l'axe Y
        for (let y = -Math.floor(originY / scale); y <= Math.floor((canvasHeight - originY) / scale); y++) {
            if (y === 0) continue;
            const pixelY = originY - y * scale; // Inversion car l'axe Y du canvas est vers le bas
            ctx.moveTo(originX - 5, pixelY);
            ctx.lineTo(originX + 5, pixelY);
             if (y % 2 === 0) { // Afficher le nombre toutes les deux graduations
                ctx.fillText(y.toString(), originX - 20 - (y < 0 ? 5 : 0), pixelY + 5);
            }
        }

        ctx.stroke(); // Dessine les axes et graduations
    }

    // Fonction pour dessiner l'équation y = ax + b
    function drawEquation(a, b) {
        ctx.beginPath();
        ctx.strokeStyle = 'blue'; // Couleur de la droite
        ctx.lineWidth = 2;

        let firstPoint = true;

        // Itérer sur la largeur du canvas en pixels
        for (let pixelX = 0; pixelX < canvasWidth; pixelX++) {
            // Convertir la coordonnée pixel X en coordonnée du graphique
            // x_graph = (pixelX_canvas - originX_canvas) / scale_graph
            const graphX = (pixelX - originX) / scale;

            // Calculer y avec l'équation : y = ax + b
            const graphY = a * graphX + b;

            // Convertir la coordonnée y du graphique en coordonnée pixel Y
            // pixelY_canvas = originY_canvas - (graphY_monde * scale_graph)
            // Le signe moins est dû au fait que l'axe Y du canvas est inversé (0 en haut)
            const pixelY = originY - (graphY * scale);

            // Si c'est le premier point, on utilise moveTo, sinon lineTo
            if (firstPoint) {
                ctx.moveTo(pixelX, pixelY);
                firstPoint = false;
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        ctx.stroke(); // Dessine la droite
    }

    // Fonction principale pour dessiner/redessiner le graphique
    function redrawGraph() {
        // Récupérer les valeurs de a et b depuis les inputs
        // Convertir en nombre, s'assurer que ce sont bien des nombres
        const a = parseFloat(valeurAInput.value);
        const b = parseFloat(valeurBInput.value);

        // Vérifier si a et b sont des nombres valides
        if (isNaN(a) || isNaN(b)) {
            alert("Veuillez entrer des valeurs numériques valides pour 'a' et 'b'.");
            return;
        }

        clearCanvas();
        drawAxes();
        drawEquation(a, b);
    }

    // Écouteur d'événement pour le bouton "Dessiner la droite"
    drawButton.addEventListener('click', redrawGraph);

    // Dessiner le graphique initial avec les valeurs par défaut
    redrawGraph();
});
