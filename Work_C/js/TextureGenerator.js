import * as THREE from "three";

export class TextureGenerator {
    static generateFieldTexture(size = 512) {
        let x, y, radius, ctx, texture;
        const colors = ['white', 'yellow', 'lavender', '#ADD8E6'];
        const canvas = document.createElement('canvas');

        canvas.width = canvas.height = size;
        ctx = canvas.getContext('2d');

        ctx.fillStyle = '#90ee90'; // Light Green
        ctx.fillRect(0, 0, size, size);

        for(let i = 0; i < 1000; i++) {
            ctx.beginPath();
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            x = Math.random() * size;
            y = Math.random() * size;
            radius = Math.random() * 2 + 1;
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        return texture;
    }

    static generateSkyTexture(width = 2048, height = 1024) {
        let x, y, radius, ctx, gradient, texture;
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#00008b'); // Dark Blue
        gradient.addColorStop(1, '#4B0082'); // Dark Violet
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        for(let i = 0; i < 3000; i++) {
            x = Math.random() * width;
            y = Math.random() * height;
            radius = Math.random() * 0.4 + 0.3;

            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 2;
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        return texture;
    }
}