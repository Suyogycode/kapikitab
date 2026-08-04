// public/workers/aerodynamicsWorker.js

let particles = [];
const PARTICLE_COUNT = 800; // Increased for a denser visual stream

// Initialize particles in a grid-like stream on the left side
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: -2.0 - Math.random() * 2, // Start off-screen to the left
    y: (Math.random() - 0.5) * 1.5 + 1.5, 
    z: (Math.random() - 0.5) * 1.0,
    baseY: 0, // Remembers original height for smooth flowing
    speed: Math.random() * 0.015 + 0.01,
  });
  particles[i].baseY = particles[i].y;
}

// Simulation State
let windSpeedMultiplier = 1.0;
let wingTilt = 0; // In radians

self.onmessage = function (e) {
  if (e.data.type === 'UPDATE_PARAMS') {
    windSpeedMultiplier = e.data.windSpeed;
    // Receive tilt from React, convert degrees to radians for JS Math
    wingTilt = e.data.wingTilt * (Math.PI / 180); 
  }
};

function calculatePhysics() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let p = particles[i];

    // 1. Forward Momentum
    p.x += p.speed * windSpeedMultiplier;

    // 2. Upgraded Fluid Deflection & Collision Math
    if (p.x > -0.8 && p.x < 1.0) {
      // Find the distance from the particle to the vertical center of the tunnel
      let verticalDist = p.baseY - 1.5; 
      
      // Calculate how close it is to the wing's core
      let proximity = Math.max(0, 0.4 - Math.abs(verticalDist));
      
      // THE FIX: Add a repulsion force. If it's above the center, push it up. If below, push it down.
      // This creates the "envelope" around the wing thickness so they don't clip through!
      let repulsion = (verticalDist >= 0 ? 1 : -1) * proximity * 0.8;
      
      // Combine the tilt deflection with the new repulsion envelope
      p.y = p.baseY + (Math.sin(wingTilt) * proximity * 2) + (repulsion * Math.cos(wingTilt));
    } else {
      p.y += (p.baseY - p.y) * 0.05; 
    }

    // 3. Reset Particle Loop
    if (p.x > 2.0) {
      p.x = -2.0 - Math.random();
      p.y = p.baseY; 
    }

    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }

  self.postMessage({ type: 'PHYSICS_TICK', positions: positions });
  requestAnimationFrame(calculatePhysics);
}

calculatePhysics();