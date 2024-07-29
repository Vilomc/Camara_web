// server.js
import express from "express";
import { config } from "dotenv";
import { handlerCamara } from './handlerCamara.js';
import { device } from "./handlerJoystick.js";
import { fileURLToPath } from 'url';
import path from "path";
config();
const app = express();
app.use(express.json());
const port = process.env.PORT ?? 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//inicializamos endpoint
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
//inicializamos frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});