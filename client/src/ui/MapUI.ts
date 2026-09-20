import * as THREE from 'three';

export class MapUI {
    private mapCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private exploredRegions = new Set<string>();

    constructor() {
        this.mapCanvas = document.createElement('canvas');
        this.mapCanvas.id = 'mini-map';
        this.mapCanvas.width = 200;
        this.mapCanvas.height = 200;
        this.mapCanvas.style.position = 'absolute';
        this.mapCanvas.style.top = '20px';
        this.mapCanvas.style.right = '20px';
        this.mapCanvas.style.border = '2px solid #444';
        this.mapCanvas.style.borderRadius = '50%';
        this.mapCanvas.style.background = 'rgba(0,0,0,0.7)';
        this.mapCanvas.style.display = 'none';
        this.mapCanvas.style.pointerEvents = 'none';
        
        this.ctx = this.mapCanvas.getContext('2d')!;
        document.body.appendChild(this.mapCanvas);

        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                const isVisible = this.mapCanvas.style.display === 'block';
                this.mapCanvas.style.display = isVisible ? 'none' : 'block';
            }
        });
    }

    update(myPos: THREE.Vector3, otherPlayers: any[], zombies: any[], safehouses: any[]) {
        const ctx = this.ctx;
        const w = this.mapCanvas.width;
        const h = this.mapCanvas.height;
        const scale = 2; // 1 unit = 2 pixels

        ctx.clearRect(0, 0, w, h);

        // Explore logic (Fog of War)
        const cx = Math.floor(myPos.x / 10);
        const cz = Math.floor(myPos.z / 10);
        for(let x = -2; x <= 2; x++) {
            for(let z = -2; z <= 2; z++) {
                this.exploredRegions.add(`${cx+x},${cz+z}`);
            }
        }

        // Center on player
        ctx.save();
        ctx.translate(w/2, h/2);
        
        // Draw Safehouses
        safehouses.forEach(sh => {
            ctx.fillStyle = '#44ff44';
            ctx.beginPath();
            ctx.arc((sh.pos.x - myPos.x) * scale, (sh.pos.z - myPos.z) * scale, sh.radius * scale, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Other Players
        ctx.fillStyle = 'red';
        otherPlayers.forEach(p => {
            ctx.beginPath();
            ctx.arc((p.pos.x - myPos.x) * scale, (p.pos.z - myPos.z) * scale, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Zombies
        ctx.fillStyle = 'green';
        zombies.forEach(z => {
            ctx.beginPath();
            ctx.arc((z.pos.x - myPos.x) * scale, (z.pos.z - myPos.z) * scale, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Player
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
