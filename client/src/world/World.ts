import * as THREE from 'three';
import { Chunk, Block } from './Chunk';
import { Noise } from './Noise';

export class World {
    private chunks = new Map<string, Chunk>();
    public scene: THREE.Scene;
    private noise: Noise;

    constructor(scene: THREE.Scene, seed: number) {
        this.scene = scene;
        this.noise = new Noise(seed);
    }

    generateChunk(cx: number, cz: number) {
        const blocks: Block[] = [];
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                const worldX = cx * 16 + x;
                const worldZ = cz * 16 + z;
                
                // Base Terrain
                const h = Math.floor(this.noise.perlin(worldX / 30, 0, worldZ / 30) * 5 + 2);
                
                for (let y = 0; y <= h; y++) {
                    let type = 'dirt';
                    if (y === h) type = 'grass';
                    if (y < h - 2) type = 'stone';
                    blocks.push({ type, x: worldX, y, z: worldZ });
                }

                // Simple City Logic: If close to origin, spawn buildings
                const distToCenter = Math.sqrt(worldX**2 + worldZ**2);
                if (distToCenter < 50 && Math.random() < 0.01) {
                    this.spawnBuilding(blocks, worldX, h + 1, worldZ);
                }
            }
        }
        
        const key = `${cx},${cz}`;
        const chunk = new Chunk(cx, cz, blocks);
        this.chunks.set(key, chunk);
        this.scene.add(chunk.mesh);
    }

    private spawnBuilding(blocks: Block[], x: number, y: number, z: number) {
        const w = Math.floor(Math.random() * 3) + 3;
        const h = Math.floor(Math.random() * 5) + 4;
        const d = Math.floor(Math.random() * 3) + 3;

        for (let bx = 0; bx < w; bx++) {
            for (let by = 0; by < h; by++) {
                for (let bz = 0; bz < d; bz++) {
                    // Only walls and roof for simple MVP
                    if (bx === 0 || bx === w-1 || bz === 0 || bz === d-1 || by === h-1) {
                        blocks.push({ type: 'brick', x: x + bx, y: y + by, z: z + bz });
                    }
                }
            }
        }
    }

    removeChunk(cx: number, cz: number) {
        const key = `${cx},${cz}`;
        const chunk = this.chunks.get(key);
        if (chunk) {
            this.scene.remove(chunk.mesh);
            this.chunks.delete(key);
        }
    }
}
