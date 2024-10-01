import * as THREE from "https://cdn.skypack.dev/three@0.146.0";

// Scenes
const scene = new THREE.Scene();
const bufferScene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Textures
const dataTexture = createDataTexture();

// Geometry
const geometry = new THREE.PlaneGeometry(2, 2);

// Screen resolution
const resolution = new THREE.Vector3(sizes.width, sizes.height, window.devicePixelRatio);

// Render Buffers
let renderBufferA = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
  stencilBuffer: false
});

let renderBufferB = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
  stencilBuffer: false
});

// Buffer Material
const bufferMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: dataTexture },
    uResolution: { value: resolution }
  },
  vertexShader: document.getElementById("vertexShader").textContent,
  fragmentShader: document.getElementById("fragmentShaderBuffer").textContent
});

// Screen Material
const quadMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: null },
    uResolution: { value: resolution }
  },
  vertexShader: document.getElementById("vertexShader").textContent,
  fragmentShader: document.getElementById("fragmentShaderScreen").textContent
});

// Meshes
const mesh = new THREE.Mesh(geometry, quadMaterial);
scene.add(mesh);

const bufferMesh = new THREE.Mesh(geometry, bufferMaterial);
bufferScene.add(bufferMesh);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const onWindowResize = () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  quadMaterial.uniforms.uResolution.value.x = sizes.width;
  quadMaterial.uniforms.uResolution.value.y = sizes.height;
};

window.addEventListener('resize', onWindowResize);

// Camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Animation loop
const tick = () => {
  renderer.setRenderTarget(renderBufferA);
  renderer.render(bufferScene, camera);

  mesh.material.uniforms.uTexture.value = renderBufferA.texture;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  const temp = renderBufferA;
  renderBufferA = renderBufferB;
  renderBufferB = temp;
  bufferMaterial.uniforms.uTexture.value = renderBufferB.texture;

  window.requestAnimationFrame(tick);
};

tick();

// Create random noisy texture
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

  const texture = new THREE.DataTexture(data, sizes.width, sizes.height, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}
