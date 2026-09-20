export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      const id = env.WORLD_ROOM.idFromName("WORLD-001");
      const room = env.WORLD_ROOM.get(id);
      return room.fetch(request);
    }
    return new Response("BlockFall Server Running", { status: 200 });
  }
};
