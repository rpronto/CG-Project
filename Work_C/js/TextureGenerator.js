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

        for(let i = 0; i < 400; i++) {
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

    static generateSkyTexture(size = 512) {
        let x, y, radius, ctx, gradient, texture;
        const canvas = document.createElement('canvas');

        canvas.width = canvas.height = size;
        ctx = canvas.getContext('2d');

        gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#00008b'); // Dark Blue
        gradient.addColorStop(1, '#9400D3'); // Dark Violet
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        for(let i = 0; i < 400; i++) {
            ctx.beginPath();
            ctx.fillStyle = 'white';
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
}