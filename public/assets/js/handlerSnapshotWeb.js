function takeSnapshot() {
    const video = document.querySelector('img');

    if (!video) {
        console.error('Video element not found');
        return;
    }
    const videoWidth = video.naturalWidth || video.width;
    const videoHeight = video.naturalHeight || video.height;

    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    const dataURL = canvas.toDataURL('image/jpeg', 1.0); 

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'snapshot.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export { takeSnapshot };