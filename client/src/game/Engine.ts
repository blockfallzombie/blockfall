import * as THREE from 'three';
import { Network } from '../network/Network';
import { PlayerController } from '../player/PlayerController';
import { World } from '../world/World';
import { UIManager } from '../ui/UIManager';
import { WeaponVisualizer } from '../weapons/WeaponVisualizer';

export class Engine {
    private scene = new THREE.Scene();
    private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private renderer = new THREE.WebGLRenderer({ antialias: true });
    private network: Network;
    private playerController: PlayerController;
    private world: World | null = null;
    private ui: UIManager;
    private weaponVisualizer: WeaponVisualizer;
    private otherPlayers = new Map<string, THREE.Mesh>();
    private zombies = new Map<string, THREE.Mesh>();
    private lootCrates = new Map<string, THREE.Mesh>();
    private myPlayerId: string | null = null;

    constructor() {
        this.ui = new UIManager();
        this.initGraphics();
        this.initNetwork();
        this.weaponVisualizer = new WeaponVisualizer(this.scene, this.camera);
        this.weaponVisualizer.setWeapon('Pistol');
        this.animate();
    }

    private initGraphics() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        this.scene.background = new THREE.Color(0x87ceeb);
    }

    private initNetwork() {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8787';
        this.network = new Network(wsUrl);
        
        this.network.onInit((data) => {
            this.myPlayerId = data.playerId;
            this.world = new World(this.scene, data.seed);
            for(let x = -2; x <= 2; x++) {
                for(let z = -2; z <= 2; z++) {
                    this.world!.generateChunk(x, z);
                }
            }
        });

        this.network.onUpdate((data) => {
            this.updateWorldState(data);
        });

        this.network.onStatus = (status) => {
            if (status.zone === 'SAFE') {
                this.showSafeZoneNotification(status.name);
            }
        };

        this.network.connect();

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) { 
                const direction = new THREE.Vector3();
                this.camera.getWorldDirection(direction);
                this.network.send('fire', { direction: { x: direction.x, y: direction.y, z: direction.z } });
                
                // Visuals
                this.weaponVisualizer.fire();
                this.camera.rotation.x += 0.02; // Simple recoil
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e') {
                this.network.send('interact', {});
            }
        });
    }

    private showSafeZoneNotification(name: string) {
        const banner = document.getElementById('safe-banner');
        if (!banner) {
            const b = document.createElement('div');
            b.id = 'safe-banner';
            b.style.position = 'absolute';
            b.style.top = '20%';
            b.style.left = '50%';
            b.style.transform = 'translateX(-50%)';
            b.style.color = '#44ff44';
            b.style.fontSize = '24px';
            b.style.fontWeight = 'bold';
            b.style.transition = 'opacity 0.5s';
            document.body.appendChild(b);
        }
        const el = document.getElementById('safe-banner')!;
        el.innerText = `SAFE ZONE: ${name}`;
        el.style.opacity = '1';
        setTimeout(() => { el.style.opacity = '0'; }, 2000);
    }

    private animate() {
        const time = performance.now() / 1000;
        requestAnimationFrame(() => this.animate());
        if (this.playerController) {
            this.playerController.update();
        }
        this.weaponVisualizer.updatePosition(time);
        this.renderer.render(this.scene, this.camera);
    }

    private updateWorldState(data: any) {
        data.players.forEach((p: any) => {
            if (p.id === this.myPlayerId) {
                this.camera.position.set(p.pos.x, p.pos.y, p.pos.z);
                this.ui.updateHP(p.health);
                if (p.equippedWeapon) this.weaponVisualizer.setWeapon(p.equippedWeapon);
                return;
            }

            let mesh = this.otherPlayers.get(p.id);
            if (!mesh) {
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 2, 1),
                    new THREE.MeshStandardMaterial({ color: 0xff0000 })
                );
                this.scene.add(mesh);
                this.otherPlayers.set(p.id, mesh);
            }
            mesh.position.set(p.pos.x, p.pos.y, p.pos.z);
        });

        data.zombies.forEach((z: any) => {
            let mesh = this.zombies.get(z.id);
            if (!mesh) {
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 2, 1),
                    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
                );
                this.scene.add(mesh);
                this.zombies.set(z.id, mesh);
            }
            mesh.position.set(z.pos.x, z.pos.y, z.pos.z);
        });

        if (data.loot) {
            data.loot.forEach((l: any) => {
                let mesh = this.lootCrates.get(l.id);
                if (!mesh) {
                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(0.8, 0.8, 0.8),
                        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
                    );
                    this.scene.add(mesh);
                    this.lootCrates.set(l.id, mesh);
                }
                mesh.position.set(l.pos.x, l.pos.y, l.pos.z);
            });
        }
    }
}

new Engine();
