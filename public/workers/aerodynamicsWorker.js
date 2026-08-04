// public/workers/aerodynamicsWorker.js

// 1. Initialize the state of our particles
let particles = [];
const PARTICLE_COUNT = 500; // High enough to look cool, low enough for mobile

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: (Math.random() - 0.5) * 4, // Spread across a 4-meter wind tunnel
    y: (Math.random() - 0.5) * 2 + 1.5, // Float at eye level
    z: (Math.random() - 0.5) * 2,
    speed: Math.random() * 0.02 + 0.01,
  });
}

// 2. Listen for variables sent from the 3D Engine (like wind speed or wing tilt)
let windSpeedMultiplier = 1.0;

self.onmessage = function (e) {
  if (e.data.type === 'UPDATE_PARAMS') {
    windSpeedMultiplier = e.data.windSpeed;
  }
};

// 3. The Math Loop (Runs 60 times a second on a background thread)
function calculatePhysics() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let p = particles[i];

    // Simple continuous flow: move left to right
    p.x += p.speed * windSpeedMultiplier;

    // Reset particle to the left side if it flies out of the tunnel
    if (p.x > 2.0) {
      p.x = -2.0;
      p.y = (Math.random() - 0.5) * 2 + 1.5;
      p.z = (Math.random() - 0.5) * 2;
    }

    // Flatten into the array format Three.js requires [x1, y1, z1, x2, y2, z2...]
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }

  // Send the calculated coordinates back to the main UI thread
  self.postMessage({ type: 'PHYSICS_TICK', positions: positions });

  // Schedule the next calculation
  requestAnimationFrame(calculatePhysics);
}

// Start the engine
calculatePhysics();