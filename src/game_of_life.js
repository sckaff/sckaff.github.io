import * as THREE from "three";

/**
 * GLSL Shaders
 */
const vertexShaderSource = `
  varying vec2 vUvs;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUvs = uv;
  }
`;

const fragmentShaderScreenSource = `
  precision mediump float;

  uniform sampler2D uTexture; 
  varying vec2 vUvs;

  void main() {
    vec4 initTexture = texture2D(uTexture, vUvs);
    vec3 colour = initTexture.rgb;
    gl_FragColor = vec4(colour, 1.0);
  }
`;

const fragmentShaderBufferSource = `
  precision highp float;

  uniform sampler2D uTexture; 
  uniform vec2 uResolution;

  varying vec2 vUvs;

  float GetNeighbours(vec2 p) {
    float count = 0.0;

    for (float y = -1.0; y <= 1.0; y++) {
      for (float x = -1.0; x <= 1.0; x++) {
        if (x == 0.0 && y == 0.0)
            continue;

        vec2 offset = vec2(x, y) / uResolution.xy;
        vec4 lookup = texture2D(uTexture, p + offset);
        float luminance = (lookup.r + lookup.g + lookup.b) / 3.0;
        count += luminance > 0.18 ? 1.0 : 0.0;
      }
    }
    return count;
  }

  void main() {
    vec3 deadColor = vec3(0.06, 0.06, 0.06);
    vec3 aliveColor = vec3(0.19, 0.19, 0.19);

    float neighbors = GetNeighbours(vUvs);

    vec4 currentCell = texture2D(uTexture, vUvs);
    float luminance = (currentCell.r + currentCell.g + currentCell.b) / 3.0;
    bool alive = luminance > 0.18;

    vec3 color = deadColor;

    if (alive && (neighbors == 2.0 || neighbors == 3.0)) {
        color = aliveColor;
    } else if (!alive && neighbors == 3.0) {
        color = vec3(0.471, 0.294, 0.);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Base
 */

// Scenes
const scene = new THREE.Scene();
const bufferScene = new THREE.Scene();

/**
 * Sizes
 */
const container = document.getElementById('game-of-life');
const sizes = {
  width: container.clientWidth,
  height: container.clientHeight
};

/**
 * Textures
 */
const dataTexture = createDataTexture();

/**
 * Meshes
 */
// Geometry
const geometry = new THREE.PlaneGeometry(2, 2);

//Screen resolution
const resolution = new THREE.Vector3(
  sizes.width,
  sizes.height,
  window.devicePixelRatio
);

/**
 * Render Buffers
 */
let renderBufferA = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height,
  {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false
  }
);

let renderBufferB = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height,
  {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false
  }
);

// Buffer Material
const bufferMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: dataTexture },
    uResolution: {
      value: resolution
    }
  },
  vertexShader: vertexShaderSource,
  fragmentShader: fragmentShaderBufferSource
});

// Screen Material
const quadMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: null },
    uResolution: {
      value: resolution
    }
  },
  vertexShader: vertexShaderSource,
  fragmentShader: fragmentShaderScreenSource
});

// Meshes
const mesh = new THREE.Mesh(geometry, quadMaterial);
scene.add(mesh);

// Meshes
const bufferMesh = new THREE.Mesh(geometry, bufferMaterial);
bufferScene.add(bufferMesh);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Append to the scene-container element instead of body
container.appendChild(renderer.domElement);

const onWindowResize = () => {
  // Update sizes based on the container
  sizes.width = container.clientWidth;
  sizes.height = container.clientHeight;

  // Update camera
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update uniforms
  quadMaterial.uniforms.uResolution.value.x = sizes.width;
  quadMaterial.uniforms.uResolution.value.y = sizes.height;
};

window.addEventListener('resize', onWindowResize);

/**
 * Camera
 */
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

/**
 * Animate
 */
const tick = () => {
  // Render to framebuffer
  renderer.setRenderTarget(renderBufferA);
  renderer.render(bufferScene, camera);

  mesh.material.uniforms.uTexture.value = renderBufferA.texture;
  renderer.setRenderTarget(null);  // Render to screen
  renderer.render(scene, camera);

  // Ping-pong framebuffers
  const temp = renderBufferA;
  renderBufferA = renderBufferB;
  renderBufferB = temp;
  bufferMaterial.uniforms.uTexture.value = renderBufferB.texture;

  window.requestAnimationFrame(tick);
};

tick();

/**
 * CREATE RANDOM NOISY TEXTURE
 */
function createDataTexture() {
  const size = sizes.width * sizes.height;
  const data = new Uint8Array(4 * size);

  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    if (Math.random() < 0.5) {
      data[stride] = 255;
      data[stride + 1] = 255;
      data[stride + 2] = 255;
      data[stride + 3] = 255;
    } else {
      data[stride] = 0;
      data[stride + 1] = 0;
      data[stride + 2] = 0;
      data[stride + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(
    data,
    sizes.width,
    sizes.height,
    THREE.RGBAFormat
  );
  texture.needsUpdate = true;

  return texture;
}