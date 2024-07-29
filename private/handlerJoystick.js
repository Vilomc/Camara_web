import HID  from "node-hid";
import { handlerCamara } from "./handlerCamara.js";
let reconnectInterval;

// Encontrar el dispositivo específico por VID y PID
const vendorId = 0x045E;
const productId = 0x028E;
const devices = HID.devices();
const deviceInfo = devices.find(d => d.vendorId === vendorId && d.productId === productId);
if (!deviceInfo) {
  console.error(`Dispositivo con VID: ${vendorId.toString(16)} y PID: ${productId.toString(16)} no encontrado`);
  process.exit(1);
}
let device;
try {
// Abrir la conexión con el dispositivo
  device = new HID.HID(deviceInfo.path);
  console.log('Dispositivo conectado exitosamente');
  clearInterval(reconnectInterval);

} catch (err) {
  
  console.error(`Error al abrir el dispositivo con VID: ${vendorId.toString(16)} y PID: ${productId.toString(16)}`);
  console.error(err);
  process.exit(1);
}
// Mapeo de botones inactivos
const idleState = [0, 128, 255, 127, 0, 128, 255, 127, 0, 128, 0, 0, 0, 0];
// Mapeo de botones
const actionsMap = {
  '00 80 ff 7f 00 80 ff 7f 00 80 08 00 00 00': 'Botton A',
  '00 80 ff 7f 00 80 ff 7f 00 80 02 00 00 00': 'Botton B',
  '00 80 ff 7f 00 80 ff 7f 00 80 01 00 00 00': 'Botton C',
  '00 80 ff 7f 00 80 ff 7f 00 80 04 00 00 00': 'Botton D',
  '00 80 ff 7f 00 80 ff 7f 00 80 00 04 00 00': 'Up',
  '00 80 ff 7f 00 80 ff 7f 00 80 00 14 00 00': 'Down',
  '00 80 ff 7f 00 80 ff 7f 00 80 00 0c 00 00': 'Right',
  '00 80 ff 7f 00 80 ff 7f 00 80 00 1c 00 00': 'Left',
  '00 80 ff 7f 00 80 ff 7f 00 80 20 00 00 00': 'Botton R1',
  '00 80 ff 7f 00 80 ff 7f 80 00 00 00 00 00': 'Botton R2',
  '00 80 ff 7f 00 80 ff 7f 00 80 10 00 00 00': 'Botton L1',
  '00 80 ff 7f 00 80 ff 7f 80 ff 00 00 00 00': 'Botton L2',
  '00 00 ff 7f 00 80 ff 7f 00 80 00 00 00 00': 'Left Stick X Left',
  'ff ff ff 7f 00 80 ff 7f 00 80 00 00 00 00': 'Left Stick X Right',
  '00 80 ff ff 00 80 ff 7f 00 80 00 00 00 00': 'Left Stick Y Down',
  '00 80 00 00 00 80 ff 7f 00 80 00 00 00 00': 'Left Stick Y Up',
  '00 80 ff 7f 00 00 ff 7f 00 80 00 00 00 00': 'Right Stick X Left',
  '00 80 ff 7f ff ff ff 7f 00 80 00 00 00 00': 'Right Stick X Right',
  '00 80 ff 7f 00 80 00 00 00 80 00 00 00 00': 'Right Stick Y Up',
  '00 80 ff 7f 00 80 ff ff 00 80 00 00 00 00': 'Right Stick Y Down'
};

// Buffer a texto
function bufferToString(buffer) {
  return buffer.map(value => value.toString(16).padStart(2, '0')).join(' ');
}

const interval = 50;

// Leer datos del dispositivo a intervalos regulares
setInterval(() => {
  device.read((err, data) => {
    if (err) {
      console.error('Error al leer datos del dispositivo:', err);
      return;
    }

    const dataArray = Array.from(data);

    // chequeo si el joystick está en estado inactivo
    const isIdle = dataArray.every((value, index) => value === idleState[index]);

    if (isIdle) {
      //si esta inactivo, no registramos para no spamear la consola
      return;
    }

    // Convertir el dataArray a string para la comparación en actionsMap
    const dataString = bufferToString(dataArray);

    // Verificar si la acción ha cambiado
      const action = actionsMap[dataString];
      if (action) {
        const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  
        console.log(`Timestamp: ${timeString} Action detected: ${action}`);
        switch (action) {
          case "Up":
            handlerCamara(0, 1);
            break;
          case "Botton L1":
            handlerCamara(1, 1);
            break;
          case "Down":
            handlerCamara(2, 1);
            break;
          case "Left":
            handlerCamara(4, 1);
            break;
          case "Right":
            handlerCamara(6, 1);
            break;

          default:
            console.log("This button is not defined to function");
            break;
        }

 
    }
  });
}, interval);

// Manejar errores del dispositivo
device.on('error', function(err) {
  console.error('Error:', err);
});

// Función para finalizar la conexión del dispositivo de forma segura
function exitHandler(options, exitCode) {
  if (options.cleanup) device.close();
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

// Manejadores para diferentes tipos de salida
process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

export {device}