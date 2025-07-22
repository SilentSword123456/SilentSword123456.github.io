const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load logo image
const logoImg = new Image();
logoImg.src = "logo.png";

logoImg.onload = () => {
    // Create an offscreen canvas to draw logo + text and get pixel data
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d");
    off.width = canvas.width;
    off.height = canvas.height;

    // Center positions
    const centerX = canvas.width / 2;
    const topY = canvas.height / 4;

    // Draw logo
    const logoW = 200;
    const logoH = logoImg.height * (logoW / logoImg.width);
    offCtx.drawImage(logoImg, centerX - logoW / 2, topY, logoW, logoH);

    // Draw text
    offCtx.font = "30px monospace";
    offCtx.fillStyle = "#00ffcc";
    offCtx.textAlign = "center";
    offCtx.fillText("Welcome to SilentLab", centerX, topY + logoH + 40);
    offCtx.fillText("This is the beginning of something awesome.", centerX, topY + logoH + 80);

    // Get pixel data
    const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;

    const pixels = [];
    const gap = 4; // skip every few pixels for performance
    for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
            const idx = (y * canvas.width + x) * 4;
            const alpha = imageData[idx + 3];
            if (alpha > 128) {
                pixels.push({
                    x,
                    y,
                    color: `rgb(${imageData[idx]}, ${imageData[idx+1]}, ${imageData[idx+2]})`,
                    currY: Math.random() * -canvas.height,
                    velocity: 0
                });
            }
        }
    }

    animatePixels(pixels);
};

function animatePixels(pixels) {
    const gravity = 0.8;
    const friction = 0.88;
    let animationRunning = true;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        animationRunning = false;

        for (const p of pixels) {
            const dy = p.y - p.currY;

            if (Math.abs(dy) > 1) {
                p.velocity += gravity;
                p.velocity *= friction;
                p.currY += p.velocity;
                if (p.currY > p.y) p.currY = p.y;
                animationRunning = true;
            } else {
                p.currY = p.y;
            }

            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.currY, 2, 2);
        }

        if (animationRunning) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}
