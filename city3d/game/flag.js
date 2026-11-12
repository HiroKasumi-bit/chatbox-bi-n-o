// Loaded before the city builders run: tells src/kit.js to leave out the static cars and walking people,
// because game/agents.js puts moving ones in the streets.
globalThis.__AH_GAME = true;
