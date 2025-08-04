const lib = new HydraCanvasLib('game', { canvasWidth: 500, canvasHeight: 400 });

// Create a 3D cube with proper perspective
class Cube3D {
  constructor(size) {
    this.size = size;
    this.halfSize = size / 2;
    
    // Define the 8 vertices of a cube in 3D space (x, y, z)
    this.vertices = [
      [-this.halfSize, -this.halfSize, -this.halfSize], // 0: back bottom left
      [this.halfSize, -this.halfSize, -this.halfSize],  // 1: back bottom right
      [this.halfSize, this.halfSize, -this.halfSize],   // 2: back top right
      [-this.halfSize, this.halfSize, -this.halfSize],  // 3: back top left
      [-this.halfSize, -this.halfSize, this.halfSize],  // 4: front bottom left
      [this.halfSize, -this.halfSize, this.halfSize],   // 5: front bottom right
      [this.halfSize, this.halfSize, this.halfSize],    // 6: front top right
      [-this.halfSize, this.halfSize, this.halfSize]    // 7: front top left
    ];
    
    // Define the 6 faces of the cube (using vertex indices)
    this.faces = [
      [0, 1, 2, 3], // back face
      [4, 5, 6, 7], // front face
      [0, 3, 7, 4], // left face
      [1, 5, 6, 2], // right face
      [3, 2, 6, 7], // top face
      [0, 1, 5, 4]  // bottom face
    ];
    
    // Colors for each face
    this.colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
    
    // Initial rotation angles
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
  }
  
  // Apply rotation to vertices
  rotatePoint(point, rotX, rotY, rotZ) {
    let [x, y, z] = point;
    
    // Convert degrees to radians
    const radX = rotX * Math.PI / 180;
    const radY = rotY * Math.PI / 180;
    const radZ = rotZ * Math.PI / 180;
    
    // Rotate around X axis
    let temp = y;
    y = y * Math.cos(radX) - z * Math.sin(radX);
    z = temp * Math.sin(radX) + z * Math.cos(radX);
    
    // Rotate around Y axis
    temp = x;
    x = x * Math.cos(radY) + z * Math.sin(radY);
    z = -temp * Math.sin(radY) + z * Math.cos(radY);
    
    // Rotate around Z axis
    temp = x;
    x = x * Math.cos(radZ) - y * Math.sin(radZ);
    y = temp * Math.sin(radZ) + y * Math.cos(radZ);
    
    return [x, y, z];
  }
  
  // Project a 3D point to 2D with perspective
  projectPoint(point) {
    const focalLength = 300;
    const z = point[2] + 200; // Add 200 to z to move the cube "away" from the camera
    
    if (z <= 0) z = 0.1; // Avoid division by zero
    
    const factor = focalLength / z;
    return {
      x: point[0] * factor,
      y: point[1] * factor,
      z: point[2] // Keep z for depth sorting
    };
  }
  
  // Calculate the center point (centroid) of a face
  getFaceCenter(faceIdx) {
    const face = this.faces[faceIdx];
    let sumX = 0, sumY = 0, sumZ = 0;
    
    for (let i = 0; i < face.length; i++) {
      const vertexIdx = face[i];
      const rotatedPoint = this.rotatePoint(
        this.vertices[vertexIdx], 
        this.rotationX, 
        this.rotationY, 
        this.rotationZ
      );
      sumX += rotatedPoint[0];
      sumY += rotatedPoint[1];
      sumZ += rotatedPoint[2];
    }
    
    return [sumX / face.length, sumY / face.length, sumZ / face.length];
  }
  
  // Render the cube
  render(ctx, centerX, centerY) {
    // Calculate and sort faces by z-depth (painter's algorithm)
    const facesWithDepth = [];
    
    for (let i = 0; i < this.faces.length; i++) {
      const center = this.getFaceCenter(i);
      facesWithDepth.push({
        index: i,
        z: center[2]
      });
    }
    
    // Sort faces from back to front
    facesWithDepth.sort((a, b) => a.z - b.z);
    
    // Draw faces in order
    for (const faceInfo of facesWithDepth) {
      const faceIdx = faceInfo.index;
      const face = this.faces[faceIdx];
      const color = this.colors[faceIdx];
      
      // Get 2D projected points
      const projectedPoints = [];
      for (let i = 0; i < face.length; i++) {
        const vertexIdx = face[i];
        const rotatedPoint = this.rotatePoint(
          this.vertices[vertexIdx], 
          this.rotationX, 
          this.rotationY, 
          this.rotationZ
        );
        const projected = this.projectPoint(rotatedPoint);
        projectedPoints.push(projected);
      }
      
      // Draw the face
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX + projectedPoints[0].x, centerY + projectedPoints[0].y);
      
      for (let i = 1; i < projectedPoints.length; i++) {
        ctx.lineTo(centerX + projectedPoints[i].x, centerY + projectedPoints[i].y);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Draw edges
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  
  // Update rotation angles
  rotate(deltaX, deltaY, deltaZ) {
    this.rotationX += deltaX;
    this.rotationY += deltaY;
    this.rotationZ += deltaZ;
  }
}

// Create cube renderer function in the required format
const createCubeRenderer = (size, rotation) => {
  // Create a cube instance
  const cube3D = new Cube3D(size);
  
  // Return a HydraSpriteRenderer with the cube
  return new HydraSpriteRenderer((ctx, sprite, params) => {
    // Set rotation values from params
    cube3D.rotationX = params.rotation.x;
    cube3D.rotationY = params.rotation.y;
    cube3D.rotationZ = params.rotation.z;
    
    // Render the cube at the sprite's position using sprite.x and sprite.y
    // The key fix: use sprite.x and sprite.y as center point for rendering
    cube3D.render(ctx, sprite.x, sprite.y);
  }, { 
    rotation: { 
      x: rotation.x || 0, 
      y: rotation.y || 0, 
      z: rotation.z || 0 
    } 
  });
};

// Create a rotating cube in the center of the screen
const cubeSize = 100;
const cube = lib.sprites.createNew(
    lib.utility.getScreenCenter().x, // This positions the sprite at center X
    lib.utility.getScreenCenter().y, // This positions the sprite at center Y
    createCubeRenderer(cubeSize, { x: 0, y: 0, z: 0 })
);

// Animate the cube to rotate
let rotX = 0, rotY = 0, rotZ = 0;
lib.listen.addTicker((deltaTime) => {
    rotX += 0.5;
    rotY += 0.8;
    rotZ += 0.2;
    
    // Update the cube renderer with new rotation values
    cube.renderer = createCubeRenderer(cubeSize, { x: rotX, y: rotY, z: rotZ });
});

// Start the game loop
lib.loop(60);