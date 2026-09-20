export interface Safehouse {
    id: string;
    pos: { x: number; z: number };
    radius: number;
    name: string;
}

export class SafehouseManager {
    private safehouses: Safehouse[] = [];

    constructor() {
        // Define some initial safehouses
        this.safehouses = [
            { id: 'sh-1', pos: { x: 0, z: 0 }, radius: 5, name: 'Central Hub' },
            { id: 'sh-2', pos: { x: 50, z: -30 }, radius: 8, name: 'Abandoned Police Station' },
            { id: 'sh-3', pos: { x: -40, z: 60 }, radius: 6, name: 'Old Warehouse' },
        ];
    }

    isPlayerSafe(x: number, z: number): Safehouse | null {
        for (const sh of this.safehouses) {
            const dist = Math.sqrt((x - sh.pos.x)**2 + (z - sh.pos.z)**2);
            if (dist < sh.radius) return sh;
        }
        return null;
    }

    getSafehouses() {
        return this.safehouses;
    }
}
