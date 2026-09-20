export interface Recipe {
    result: string;
    ingredients: Record<string, number>;
}

export const CRAFTING_RECIPES: Recipe[] = [
    { result: 'Bandage', ingredients: { 'Cloth': 2 } },
    { result: 'Medkit', ingredients: { 'Bandage': 2, 'Medicine': 1 } },
    { result: 'Barricade', ingredients: { 'Wood': 5 } },
    { result: 'Torch', ingredients: { 'Wood': 2, 'Coal': 1 } }
];

export class CraftingManager {
    static canCraft(recipe: Recipe, inventory: string[]): boolean {
        const counts: Record<string, number> = {};
        inventory.forEach(item => counts[item] = (counts[item] || 0) + 1);
        
        for (const [ing, amount] of Object.entries(recipe.ingredients)) {
            if ((counts[ing] || 0) < amount) return false;
        }
        return true;
    }

    static craft(recipe: Recipe, inventory: string[]): string[] {
        const newInv = [...inventory];
        for (const [ing, amount] of Object.entries(recipe.ingredients)) {
            for (let i = 0; i < amount; i++) {
                const index = newInv.indexOf(ing);
                if (index > -1) newInv.splice(index, 1);
            }
        }
        newInv.push(recipe.result);
        return newInv;
    }
}
