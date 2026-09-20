import { DurableObject } from "cloudflare:workers";
import { DayNightSystem } from "./DayNightSystem";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface PlayerState {
  id: string;
  pos: Vector3;
  rot: Vector3;
  health: number;
  username: string;
  inventory: string[];
  equippedWeapon: string;
}

interface ZombieState {
  id: string;
  pos: Vector3;
  type: string;
  health: number;
}

interface LootCrate {
  id: string;
  pos: Vector3;
  items: string[];
}

export class WorldRoom extends DurableObject {
  private players = new Map<string, { ws: WebSocket, state: PlayerState }>();
  private zombies = new Map<string, ZombieState>();
  private lootCrates = new Map<string, LootCrate>();
  private dayNight = new DayNightSystem();
  private worldSeed = Math.random();
  private gameTime = 0;
  private tickRate = 50;
  private tickInterval: any = null;

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    this.startGameLoop();
    this.spawnInitialZombies();
    this.spawnLoot();
  }

  async fetch(request: Request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    await server.accept();
    
    const playerId = crypto.randomUUID();
    const playerState: PlayerState = {
      id: playerId,
      pos: { x: 0, y: 2, z: 0 },
      rot: { x: 0, y: 0, z: 0 },
      health: 100,
      username: `Player_${playerId.slice(0, 4)}`,
      inventory: ['Pistol'],
      equippedWeapon: 'Pistol'
    };

    this.players.set(playerId, { ws: server, state: playerState });
    
    server.send(JSON.stringify({ 
      type: 'init', 
      payload: { 
        playerId, 
        seed: this.worldSeed, 
        players: this.getPlayersState() 
      } 
    }));

    server.addEventListener('message', event => {
      this.handleMessage(playerId, event.data);
    });

    server.addEventListener('close', () => {
      this.players.delete(playerId);
      this.broadcast({ type: 'player_left', payload: { playerId } });
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private handleMessage(playerId: string, data: string) {
    try {
      const message = JSON.parse(data);
      const player = this.players.get(playerId);
      if (!player) return;

      switch (message.type) {
        case 'input':
          this.processInput(player.state, message.payload);
          break;
        case 'fire':
          this.handleFire(player.state, message.payload);
          break;
        case 'interact':
          this.handleInteract(player.state);
          break;
        case 'chat':
          this.broadcast({ 
            type: 'chat', 
            payload: { playerId, username: player.state.username, text: message.payload.text } 
          });
          break;
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  }

  private processInput(state: PlayerState, input: any) {
    const moveSpeed = 0.15;
    const keys = input.keys || [];
    if (keys.includes('w')) state.pos.z -= moveSpeed;
    if (keys.includes('s')) state.pos.z += moveSpeed;
    if (keys.includes('a')) state.pos.x -= moveSpeed;
    if (keys.includes('d')) state.pos.x += moveSpeed;
    if (input.rotation) state.rot = input.rotation;
  }

  private handleFire(player: PlayerState, payload: any) {
    const rayDir = payload.direction;
    const startPos = player.pos;
    
    this.zombies.forEach(zombie => {
      const dist = this.getDistance(startPos, zombie.pos);
      if (dist < 20) {
        const toZombie = { x: zombie.pos.x - startPos.x, y: zombie.pos.y - startPos.y, z: zombie.pos.z - startPos.z };
        const mag = Math.sqrt(toZombie.x**2 + toZombie.y**2 + toZombie.z**2);
        const dot = (toZombie.x/mag)*rayDir.x + (toZombie.y/mag)*rayDir.y + (toZombie.z/mag)*rayDir.z;
        
        if (dot > 0.98) {
          zombie.health -= 34;
          if (zombie.health <= 0) {
            this.zombies.delete(zombie.id);
            this.broadcast({ type: 'zombie_death', payload: { id: zombie.id } });
          }
        }
      }
    });
  }

  private handleInteract(player: PlayerState) {
    this.lootCrates.forEach((crate, id) => {
      if (this.getDistance(player.pos, crate.pos) < 2) {
        const loot = crate.items.splice(0, 1);
        if (loot.length > 0) {
          player.inventory.push(loot[0]);
          this.players.get(player.id)?.ws.send(JSON.stringify({ 
            type: 'loot_pickup', 
            payload: { item: loot[0] } 
          }));
        }
      }
    });
  }

  private spawnInitialZombies() {
    for (let i = 0; i < 15; i++) {
      const id = crypto.randomUUID();
      this.zombies.set(id, {
        id,
        pos: { x: Math.random()*60-30, y: 2, z: Math.random()*60-30 },
        type: 'normal',
        health: 100
      });
    }
  }

  private spawnLoot() {
    for (let i = 0; i < 10; i++) {
      const id = crypto.randomUUID();
      this.lootCrates.set(id, {
        id,
        pos: { x: Math.random()*60-30, y: 1, z: Math.random()*60-30 },
        items: ['Ammo', 'Medkit', 'Assault Rifle', 'Food'][Math.floor(Math.random()*4)]
      });
    }
  }

  private startGameLoop() {
    this.tickInterval = setInterval(() => this.tick(), this.tickRate);
  }

  private tick() {
    this.gameTime++;
    this.dayNight.update();
    this.updateZombies();
    this.broadcast({
      type: 'update',
      payload: {
        time: this.gameTime,
        dayTime: this.dayNight.getTime(),
        dayTimeStr: this.dayNight.getFormattedTime(),
        players: this.getPlayersState(),
        zombies: this.getZombiesState(),
        loot: Array.from(this.lootCrates.values())
      }
    });
  }

  private updateZombies() {
    const zombieSpeed = this.dayNight.isNight() ? 0.08 : 0.04;
    this.zombies.forEach(zombie => {
      let nearestPlayer: PlayerState | null = null;
      let minDist = Infinity;
      this.players.forEach(p => {
        const d = this.getDistance(zombie.pos, p.state.pos);
        if (d < minDist) { minDist = d; nearestPlayer = p.state; }
      });
      if (nearestPlayer) {
        const dir = { x: nearestPlayer.pos.x - zombie.pos.x, y: 0, z: nearestPlayer.pos.z - zombie.pos.z };
        const mag = Math.sqrt(dir.x**2 + dir.z**2);
        zombie.pos.x += (dir.x / mag) * zombieSpeed;
        zombie.pos.z += (dir.z / mag) * zombieSpeed;
        if (minDist < 1.5) {
          const p = this.players.get(nearestPlayer.id);
          if (p) {
            p.state.health -= 0.2;
            if (p.state.health <= 0) {
              p.ws.send(JSON.stringify({ type: 'die', payload: { survivalTime: this.gameTime } }));
              p.state.health = 100;
              p.state.pos = { x: 0, y: 2, z: 0 };
            }
          }
        }
      }
    });
  }

  private getDistance(a: Vector3, b: Vector3) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
  }

  private getPlayersState(): PlayerState[] {
    return Array.from(this.players.values()).map(p => p.state);
  }

  private getZombiesState(): ZombieState[] {
    return Array.from(this.zombies.values());
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.players.forEach(p => p.ws.send(data));
  }
}
