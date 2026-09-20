import './UI.css';
import { CRAFTING_RECIPES } from '../inventory/Crafting';

export class UIManager {
    private container: HTMLDivElement;

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'hud-container';
        this.setupHUD();
        this.setupInventory();
        document.body.appendChild(this.container);
    }

    private setupHUD() {
        const stats = document.createElement('div');
        stats.className = 'stats-panel';
        stats.innerHTML = `
            <div style="margin-bottom: 5px;">HEALTH</div>
            <div class="stat-bar"><div id="hp-fill" class="stat-fill hp-fill" style="width: 100%"></div></div>
            <div style="margin-bottom: 5px;">STAMINA</div>
            <div class="stat-bar"><div id="stamina-fill" class="stat-fill stamina-fill" style="width: 100%"></div></div>
        `;
        this.container.appendChild(stats);

        const weapon = document.createElement('div');
        weapon.className = 'weapon-panel';
        weapon.innerHTML = `
            <div id="weapon-name">PISTOL</div>
            <div id="ammo-count">12 / 48</div>
        `;
        this.container.appendChild(weapon);

        const crosshair = document.createElement('div');
        crosshair.className = 'crosshair';
        crosshair.innerText = '+';
        this.container.appendChild(crosshair);
    }

    private setupInventory() {
        const inv = document.createElement('div');
        inv.id = 'inventory-screen';
        inv.className = 'inventory-screen';
        inv.innerHTML = `
            <h2 style="text-align: center;">SURVIVAL MENU</h2>
            <div style="display: flex; justify-content: space-around; margin-bottom: 10px;">
                <button id="btn-inv" style="padding: 5px 15px; cursor: pointer;">Inventory</button>
                <button id="btn-craft" style="padding: 5px 15px; cursor: pointer;">Crafting</button>
            </div>
            <div id="inv-content" style="display: block;">
                <div class="inventory-grid" id="inv-grid"></div>
            </div>
            <div id="craft-content" style="display: none;">
                <div id="craft-list" style="max-height: 300px; overflow-y: auto;"></div>
            </div>
        `;
        this.container.appendChild(inv);

        const grid = inv.querySelector('#inv-grid')!;
        for (let i = 0; i < 25; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            grid.appendChild(slot);
        }

        const craftList = inv.querySelector('#craft-list')!;
        CRAFTING_RECIPES.forEach(recipe => {
            const item = document.createElement('div');
            item.style.padding = '10px';
            item.style.borderBottom = '1px solid #444';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.innerHTML = `
                <span>${recipe.result} (Ingredients: ${JSON.stringify(recipe.ingredients)})</span>
                <button class="craft-btn" data-result="${recipe.result}" style="cursor:pointer">Craft</button>
            `;
            craftList.appendChild(item);
        });

        const btnInv = inv.querySelector('#btn-inv')!;
        const btnCraft = inv.querySelector('#btn-craft')!;
        const contentInv = inv.querySelector('#inv-content')!;
        const contentCraft = inv.querySelector('#craft-content')!;

        btnInv.onclick = () => {
            contentInv.style.display = 'block';
            contentCraft.style.display = 'none';
        };
        btnCraft.onclick = () => {
            contentInv.style.display = 'none';
            contentCraft.style.display = 'block';
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const isVisible = inv.style.display === 'block';
                inv.style.display = isVisible ? 'none' : 'block';
                if (!isVisible) document.exitPointerLock();
            }
        });
    }

    updateHP(val: number) {
        const fill = document.getElementById('hp-fill');
        if (fill) fill.style.width = `${val}%`;
    }

    updateAmmo(weapon: string, current: number, total: number) {
        document.getElementById('weapon-name')!.innerText = weapon.toUpperCase();
        document.getElementById('ammo-count')!.innerText = `${current} / ${total}`;
    }
}
