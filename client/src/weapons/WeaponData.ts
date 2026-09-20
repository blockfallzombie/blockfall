export interface WeaponConfig {
    name: string;
    damage: number;
    fireRate: number;
    magazineSize: number;
    reloadTime: number;
    recoil: number;
    color: number;
}

export const WEAPON_DATABASE: Record<string, WeaponConfig> = {
    'Pistol': {
        name: 'Pistol',
        damage: 25,
        fireRate: 0.4,
        magazineSize: 12,
        reloadTime: 1.5,
        recoil: 0.02,
        color: 0x444444
    },
    'Assault Rifle': {
        name: 'Assault Rifle',
        damage: 30,
        fireRate: 0.1,
        magazineSize: 30,
        reloadTime: 2.5,
        recoil: 0.05,
        color: 0x223322
    },
    'Shotgun': {
        name: 'Shotgun',
        damage: 15, // Per pellet
        fireRate: 0.8,
        magazineSize: 6,
        reloadTime: 3.0,
        recoil: 0.15,
        color: 0x553311
    }
};
