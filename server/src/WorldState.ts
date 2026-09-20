export interface Block {
    type: string;
    x: number;
    y: number;
    z: number;
}

export class WorldState {
    private blocks = new Map<string, string>(); // "x,y,z" -> type
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    private getKey(x: number, y: number, z: number) {
        return `${x},${y},${z}`;
    }

    setBlock(x: number, y: number, z: number, type: string) {
        if (type === 'air') {
            this.blocks.delete(this.getKey(x, y, z));
        } else {
            this.blocks.set(this.getKey(x, y, z), type);
        }
    }

    getBlock(x: number, y: number, z: number): string {
        return this.blocks.get(this.getKey(x, y, z)) || 'air';
    }

    // Return changes to be synced to clients
    getModifiedBlocks() {
        const modified: Block[] = [];
        this.blocks.forEach((type, key) => {
            const [x, y, z] = key.split(',').map(Number);
            modified.push({ type, x, y, z });
        });
        return modified;
    }
}
