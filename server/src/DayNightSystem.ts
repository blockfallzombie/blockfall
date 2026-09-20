export class DayNightSystem {
    private time = 0; // 0 to 2400
    private speed = 1; // time units per tick

    constructor() {
        this.time = 1200; // Start at noon
    }

    update() {
        this.time = (this.time + this.speed) % 2400;
    }

    getTime() {
        return this.time;
    }

    isNight() {
        return this.time < 600 || this.time > 1800;
    }

    getFormattedTime() {
        const h = Math.floor(this.time / 100);
        const m = Math.floor((this.time % 100) * 0.6);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
}
