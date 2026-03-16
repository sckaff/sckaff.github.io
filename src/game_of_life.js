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
  uniform float uIntensity;
  uniform float uOpacity;
  varying vec2 vUvs;

  void main() {
    vec4 initTexture = texture2D(uTexture, vUvs);
    vec3 colour = clamp(initTexture.rgb * uIntensity, 0.0, 1.0);
    vec3 background = vec3(0.06, 0.06, 0.06);
    vec3 blended = mix(background, colour, uOpacity);
    gl_FragColor = vec4(blended, 1.0);
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

const container = document.getElementById("game-of-life");

if (container) {
  initGameOfLife(container);
}

function initGameOfLife(containerEl) {
  /**
   * Base
   */

  // Scenes
  const scene = new THREE.Scene();
  const bufferScene = new THREE.Scene();

  /**
   * Sizes
   */
  const sizes = {
    width: containerEl.clientWidth,
    height: containerEl.clientHeight
  };

  /**
   * Render sizing
   */
  const getPixelRatio = () => Math.min(window.devicePixelRatio, 2);
  const getRenderScale = () => {
    const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return isSmallScreen ? 0.28 : 0.5;
    return isSmallScreen ? 0.35 : 1;
  };
  const getRenderSize = () => {
    const pixelRatio = getPixelRatio();
    return {
      width: Math.max(1, Math.floor(sizes.width * pixelRatio * getRenderScale())),
      height: Math.max(1, Math.floor(sizes.height * pixelRatio * getRenderScale())),
      pixelRatio
    };
  };

  let renderSize = getRenderSize();

  /**
   * Textures
   */
  let dataTexture = createDataTexture(renderSize.width, renderSize.height);

  /**
   * Meshes
   */
  // Geometry
  const geometry = new THREE.PlaneGeometry(2, 2);

  // Screen resolution
  const resolution = new THREE.Vector3(
    renderSize.width,
    renderSize.height,
    renderSize.pixelRatio
  );

  /**
   * Render Buffers
   */
  let renderBufferA = new THREE.WebGLRenderTarget(
    renderSize.width,
    renderSize.height,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false
    }
  );

  let renderBufferB = new THREE.WebGLRenderTarget(
    renderSize.width,
    renderSize.height,
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
      uIntensity: { value: 1.0 },
      uOpacity: { value: 0.45 },
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
  renderer.setPixelRatio(renderSize.pixelRatio);

  // Append to the scene-container element instead of body
  containerEl.appendChild(renderer.domElement);

  const resetBuffers = () => {
    renderSize = getRenderSize();
    dataTexture = createDataTexture(renderSize.width, renderSize.height);

    renderBufferA.setSize(renderSize.width, renderSize.height);
    renderBufferB.setSize(renderSize.width, renderSize.height);

    resolution.set(renderSize.width, renderSize.height, renderSize.pixelRatio);
    bufferMaterial.uniforms.uTexture.value = dataTexture;
    bufferMaterial.uniforms.uResolution.value = resolution;
    quadMaterial.uniforms.uResolution.value = resolution;

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(renderSize.pixelRatio);
  };

  const onWindowResize = () => {
    sizes.width = containerEl.clientWidth;
    sizes.height = containerEl.clientHeight;
    resetBuffers();
  };

  window.addEventListener("resize", onWindowResize);

  /**
   * Camera
   */
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /**
   * Animate
   */
  const getTargetFps = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;
    if (prefersReducedMotion) return isSmallScreen ? 12 : 20;
    return isSmallScreen ? 20 : window.matchMedia("(max-width: 1000px)").matches ? 30 : 60;
  };
  let targetFps = getTargetFps();
  let frameInterval = 1000 / targetFps;
  let lastFrameTime = 0;
  let paused = false;

  const tick = (now) => {
    if (paused) {
      window.requestAnimationFrame(tick);
      return;
    }

    if (now - lastFrameTime >= frameInterval) {
      lastFrameTime = now;

      renderer.setRenderTarget(renderBufferA);
      renderer.render(bufferScene, camera);

      mesh.material.uniforms.uTexture.value = renderBufferA.texture;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      const temp = renderBufferA;
      renderBufferA = renderBufferB;
      renderBufferB = temp;
      bufferMaterial.uniforms.uTexture.value = renderBufferB.texture;
    }

    window.requestAnimationFrame(tick);
  };

  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
  });

  const onMotionPreferenceChange = () => {
    targetFps = getTargetFps();
    frameInterval = 1000 / targetFps;
    resetBuffers();
  };

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", onMotionPreferenceChange);

  resetBuffers();
  window.requestAnimationFrame(tick);
}

/**
 * CREATE RANDOM NOISY TEXTURE
 */
function createDataTexture(width, height) {
  const size = width * height;
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
    width,
    height,
    THREE.RGBAFormat
  );
  texture.needsUpdate = true;

  return texture;
}
