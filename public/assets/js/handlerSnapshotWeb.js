function takeSnapshot() {
    const canvas = document.getElementById('video-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const dataURL = canvas.toDataURL('image/jpeg');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'snapshot.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export { takeSnapshot };