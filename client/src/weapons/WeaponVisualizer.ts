import * as THREE from 'three';
import { WEAPON_DATABASE } from './WeaponData';

export class WeaponVisualizer {
    private currentWeaponMesh: THREE.Group | null = null;
    private muzzleFlash: THREE.PointLight | null = null;
    private flashMesh: THREE.Mesh | null = null;

    constructor(private scene: THREE.Scene, private camera: THREE.PerspectiveCamera) {
        this.initMuzzleFlash();
    }

    private initMuzzleFlash() {
        this.muzzleFlash = new THREE.PointLight(0xffaa00, 0, 2);
        this.scene.add(this.muzzleFlash!);

        const flashGeom = new THREE.SphereGeometry(0.05, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
        this.flashMesh = new THREE.Mesh(flashGeom, flashMat);
        this.scene.add(this.flashMesh!);
    }

    setWeapon(weaponName: string) {
        if (this.currentWeaponMesh) this.scene.remove(this.currentWeaponMesh);

        const config = WEAPON_DATABASE[weaponName] || WEAPON_DATABASE['Pistol'];
        const group = new THREE.Group();

        const bodyGeom = new THREE.BoxGeometry(0.1, 0.1, 0.4);
        const mat = new THREE.MeshStandardMaterial({ color: config.color });
        const body = new THREE.Mesh(bodyGeom, mat);
        group.add(body);

        const handleGeom = new THREE.BoxGeometry(0.08, 0.2, 0.1);
        const handle = new THREE.Mesh(handleGeom, mat);
        handle.position.set(0, -0.1, 0.1);
        group.add(handle);

        this.currentWeaponMesh = group;
        this.scene.add(group);
    }

    fire() {
        if (!this.currentWeaponMesh) return;

        // Position flash at the end of the barrel
        const flashPos = new THREE.Vector3(0, 0, -0.2);
        flashPos.applyMatrix4(this.currentWeaponMesh!.matrixWorld);
        
        this.muzzleFlash!.position.copy(flashPos);
        this.muzzleFlash!.intensity = 2;
        this.flashMesh!.position.copy(flashPos);
        (this.flashMesh!.material as THREE.MeshBasicMaterial).opacity = 1;

        setTimeout(() => {
            this.muzzleFlash!.intensity = 0;
            (this.flashMesh!.material as THREE.MeshBasicMaterial).opacity = 0;
        }, 50);
    }

    updatePosition(time: number) {
        if (!this.currentWeaponMesh) return;
        
        // Weapon Sway (Nefes alma efekti)
        const swayX = Math.sin(time * 1.5) * 0.01;
        const swayY = Math.cos(time * 2) * 0.01;
        
        const offset = new THREE.Vector3(0.3 + swayX, -0.3 + swayY, -0.5);
        offset.applyQuaternion(this.camera.quaternion);
        
        this.currentWeaponMesh.position.copy(this.camera.position).add(offset);
        this.currentWeaponMesh.quaternion.copy(this.camera.quaternion);
    }
}
