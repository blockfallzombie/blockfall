import * as THREE from 'three';

export interface Block {
    type: string;
    x: number;
    y: number;
    z: number;
}

export class Chunk {
    public mesh: THREE.Group = new THREE.Group();
    private instancedMeshes = new Map<string, THREE.InstancedMesh>();
    public readonly size = 16;

    constructor(public x: number, public z: number, blocks: Block[]) {
        this.generateMesh(blocks);
    }

    private generateMesh(blocks: Block[]) {
        const typeGroups = new Map<string, Block[]>();
        blocks.forEach(b => {
            if (!typeGroups.has(b.type)) typeGroups.set(b.type, []);
            typeGroups.get(b.type)!.push(b);
        });

        typeGroups.forEach((blocksOfType, type) => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ 
                color: this.getColorForType(type) 
            });
            const mesh = new THREE.InstancedMesh(geometry, material, blocksOfType.length);
            
            const dummy = new THREE.Object3D();
            blocksOfType.forEach((b, i) => {
                dummy.position.set(b.x, b.y, b.z);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            });
            
            this.instancedMeshes.set(type, mesh);
            this.mesh.add(mesh);
        });
    }

    private getColorForType(type: string): number {
        const colors: Record<string, number> = {
            'grass': 0x4caf50,
            'dirt': 0x8b4513,
            'stone': 0x808080,
            'sand': 0xc2b280,
            'wood': 0x5d4037,
            'concrete': 0xbcbcbc,
            'asphalt': 0x333333,
            'metal': 0xaaaab3,
            'glass': 0xadd8e6,
            'brick': 0xb22222
        };
        return colors[type] || 0xffffff;
    }
}
