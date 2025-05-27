import * as THREE from "three";

export class TextureGenerator {
    static generateFieldTexture(size = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#90ee90';
        ctx.fillRect(0, 0, size, size);

        const colors = ['white', 'yellow', 'lavender', '#ADD8E6'];

        for(let i = 0; i < 400; i++) {
            ctx.beginPath();
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 2 + 1;
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        return texture;
    }
}