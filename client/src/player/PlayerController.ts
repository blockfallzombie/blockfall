import * as THREE from 'three';
import { Network } from '../network/Network';

export class PlayerController {
    public camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private keys: Set<string> = new Set();
    private pitch = 0;
    private yaw = 0;

    constructor(private network: Network) {
        this.setupInput();
    }

    private setupInput() {
        window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
        window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
        
        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) {
                this.yaw -= e.movementX * 0.002;
                this.pitch -= e.movementY * 0.002;
                this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
                
                this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
            }
        });

        window.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    update() {
        const input = {
            keys: Array.from(this.keys),
            rotation: { 
                x: this.camera.rotation.x, 
                y: this.camera.rotation.y, 
                z: this.camera.rotation.z 
            }
        };
        this.network.send('input', input);
    }
}
