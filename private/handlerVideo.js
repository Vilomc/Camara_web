import fetch from 'node-fetch';
export const streamVideo = async (req, res) => {
    try {
        const UlrVideo = process.env.VIDEOSTREAM_URL;
        const params = new URLSearchParams({
            loginuse: process.env.LOGIN_USER,
            loginpas: process.env.LOGIN_PASS,
            
        });
      
        const response = await fetch(`${UlrVideo}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        res.setHeader('Content-Type', 'multipart/x-mixed-replace;boundary=ipcam264');
        response.body.pipe(res);
    } catch (error) {
        res.status(500).send('Error fetching the video stream');
        console.log(error);
    }
};