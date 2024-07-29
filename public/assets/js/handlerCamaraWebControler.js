async function handlerCamaraWebControler(command, steps) {
    try {
        const params = new URLSearchParams({
            command,
            steps
        });
        const url = `http://localhost:9999/movecam?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const result = await response.text();
        console.log('Command executed:', result);
    } catch (error) {
        console.error("Error in movecam:", error);
    }
}

export { handlerCamaraWebControler };