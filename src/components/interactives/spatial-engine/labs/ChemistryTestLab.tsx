'use client';

import React, { useState } from 'react';
import { Billboard } from '@react-three/drei';

// Import the Engine Core and our Prefabs
import KapikitabAREnvironment from '../core/KapikitabAREnvironment';
import SpatialButton from '../ui/SpatialButton';
import ChemistryBeaker from '../prefabs/ChemistryBeaker';

export default function ChemistryTestLab() {
  // State for the GLSL fluid engine
  const [fillLevel, setFillLevel] = useState(0.2);
  const [fluidColor, setFluidColor] = useState('#3b82f6'); // Start with blue liquid

  return (
    <KapikitabAREnvironment>
      <group scale={1.5} position={[0, 0, 0]}>
        
        {/* THE UI DASHBOARD */}
        <Billboard position={[0, 1.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
          {/* Fill Controls */}
          <SpatialButton 
            position={[-0.3, 0.2, 0]} 
            label="DRAIN" 
            onTrigger={() => setFillLevel(prev => Math.max(0.01, prev - 0.2))} 
          />
          <SpatialButton 
            position={[0.3, 0.2, 0]} 
            label="FILL" 
            onTrigger={() => setFillLevel(prev => Math.min(1, prev + 0.2))} 
          />
          
          {/* Color Controls (Chemical Reactions) */}
          <SpatialButton 
            position={[-0.3, 0, 0]} 
            label="ACID (RED)" 
            isDanger={true}
            onTrigger={() => setFluidColor('#ef4444')} 
          />
          <SpatialButton 
            position={[0.3, 0, 0]} 
            label="BASE (BLUE)" 
            isPrimary={true}
            onTrigger={() => setFluidColor('#3b82f6')} 
          />

          {/* Built-in AR Re-Anchor */}
          <SpatialButton position={[0, -0.2, 0]} label="RE-ANCHOR" isDanger={true} onTrigger={() => {}} />
        </Billboard>

        {/* THE PREFAB MODEL */}
        {/* The beaker automatically handles the fluid physics scaling and color shifts! */}
        <ChemistryBeaker 
          position={[0, 0, 0]} 
          fillLevel={fillLevel} 
          fluidColor={fluidColor} 
          scale={1} 
        />
        
      </group>
    </KapikitabAREnvironment>
  );
}