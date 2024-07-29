function takeSnapshot() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = document.querySelector('img');

    if (!video) {
        console.error('Video element not found');
        return;
    }

    canvas.width = video.width;
    canvas.height = video.height;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/jpeg');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'snapshot.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export { takeSnapshot };