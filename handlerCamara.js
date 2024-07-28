import { config } from "dotenv";
import fetch from "node-fetch";
config();
async function handlerCamara(command, onestep) {
    try {
        const params = new URLSearchParams({
            loginuse: process.env.LOGIN_USER,
            loginpas: process.env.LOGIN_PASS,
            command,
            onestep
        });
        const response = await fetch(`${process.env.CONTROL_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        //console.log('moviendo camara a posicion: ' + command + ' steps: ' + onestep )

    } catch (error) {
        console.error("Error in movecam:", error);
    }
}

export {handlerCamara};
  