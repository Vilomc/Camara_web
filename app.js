// server.js
import express from "express";
import { config } from "dotenv";
import { handlerCamara } from './handlerCamara.js';
import { device } from "./handlerJoystick.js";
config();
const app = express();
app.use(express.json());
const port = process.env.PORT ?? 3000;

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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});