export let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}

export let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    
    // Draw black frames continuously to ensure the stream stays active and black
    let stream = canvas.captureStream(30); // Request 30 FPS
    
    // Keep drawing to the canvas to ensure new frames are generated
    function draw() {
        if (stream.active) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, width, height);
            requestAnimationFrame(draw);
        }
    }
    draw();
    
    return Object.assign(stream.getVideoTracks()[0], { enabled: true }); // Enable track
}