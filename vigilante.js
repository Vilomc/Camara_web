import express from "express";
import { config } from "dotenv";
import { handlerCamara } from './private/handlerCamara.js';
import { streamVideo } from './private/handlerVideo.js';
import { fileURLToPath } from 'url';
import path from "path";
import puppeteer from 'puppeteer';

config();
const app = express();
app.use(express.json());
const port = process.env.PORT ?? 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializamos endpoint Controles
app.get('/movecam', async (req, res) => {
    const { command, steps } = req.query;
    if (!command || !steps) {
        return res.status(400).json({ error: 'Both command and steps are required' });
    }
    try {
        const result = await handlerCamara(command, steps);
        res.send(result);
    } catch (error) {
        console.error("Error in movecam:", error);
        res.status(500).json({ error: error.message });
    }
});

// Inicialización endpoint Video
app.get('/streamvideo', streamVideo);

// Inicializamos frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});

// Función para detectar objetos y mover la cámara
async function detectObjectsAndMoveCamera() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(`http://localhost:${port}`);

    await page.evaluate(async () => {
        async function detectObjects() {
            const videoCanvas = document.getElementById('video-canvas');
            const img = videoCanvas.querySelector('img');

            // Cargar el modelo COCO-SSD
            const model = await cocoSsd.load();

            // Función para dibujar un cuadro y una etiqueta alrededor del objeto detectado
            function drawBox(prediction) {
                const box = document.createElement('div');
                box.style.position = 'absolute';
                box.style.border = '2px solid #42ff33';
                box.style.left = `${prediction.bbox[0]}px`;
                box.style.top = `${prediction.bbox[1]}px`;
                box.style.width = `${prediction.bbox[2]}px`;
                box.style.height = `${prediction.bbox[3]}px`;
                videoCanvas.appendChild(box);

                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.backgroundColor = '#42ff33';
                label.style.color = 'white';
                label.style.padding = '2px 4px';
                label.style.fontSize = '12px';
                label.style.left = `${prediction.bbox[0]}px`;
                label.style.top = `${prediction.bbox[1] - 20}px`;
                label.textContent = `${prediction.class} ${prediction.score.toFixed(2)}`;
                videoCanvas.appendChild(label);
            }

            // Función para limpiar los cuadros y etiquetas anteriores
            function clearBoxesAndLabels() {
                const elements = videoCanvas.querySelectorAll('div');
                elements.forEach(element => element.remove());
            }

            // Función para mover la cámara hacia la dirección de la persona detectada
            async function moveCameraTowardsPerson(bbox) {
                const imgWidth = img.naturalWidth || img.width;
                const imgHeight = img.naturalHeight || img.height;

                const centerX = bbox[0] + bbox[2] / 2;
                const centerY = bbox[1] + bbox[3] / 2;

                const threshold = 80; // Umbral para considerar el movimiento

                let command = '';

                if (centerX < imgWidth / 2 - threshold) {
                    command = '4'; // left
                } else if (centerX > imgWidth / 2 + threshold) {
                    command = '6'; // right
                }

                if (centerY < imgHeight / 2 - threshold) {
                    command = '0'; // up
                } else if (centerY > imgHeight / 2 + threshold) {
                    command = '2'; // down
                }

                if (command) {
                    console.log(`Moving camera: ${command}`); // Depuración
                    await handlerCamaraWebControler(command, '1');
                } else {
                    console.log('Camera centered on person'); // Depuración
                }
            }

            // Función para detectar objetos en la imagen
            async function detect() {
                // Limpiar los cuadros y etiquetas anteriores
                clearBoxesAndLabels();

                const predictions = await model.detect(img);

                // Filtrar predicciones para encontrar personas y gatos
                const objects = predictions.filter(prediction => prediction.class === 'person' || prediction.class === 'cat');

                if (objects.length > 0) {
                    console.log('Objetos detectados:', objects);
                    // Dibujar un cuadro y una etiqueta alrededor de cada objeto detectado
                    objects.forEach(drawBox);

                    // Mover la cámara hacia el primer objeto detectado
                    await moveCameraTowardsPerson(objects[0].bbox);
                }

                // Volver a ejecutar la detección después de un tiempo
                setTimeout(detect, 1000);
            }

            // Iniciar la detección
            detect();
        }

        // Llamar a la función de detección de objetos cuando la página se cargue
        window.addEventListener('load', detectObjects);
    });

    // Esperar a que la detección termine (puedes ajustar esto según tus necesidades)
    await page.waitForTimeout(60000); // Esperar 1 minuto

    await browser.close();
}

// Iniciar el servidor y la detección de objetos
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await detectObjectsAndMoveCamera();
});
