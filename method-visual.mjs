import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = new URL('./static/models/sas-20261118/koala-sas.glb', import.meta.url).href;
const TURN_SECONDS = 35;
const FRAME_INTERVAL = 1000 / 30;

function createMethodVisual(host) {
  const card = host.closest('.method-visual-card') || host.closest('article') || host.parentElement;
  const button = card.querySelector('[data-method-motion]');
  const status = host.querySelector('[data-method-status]');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer, scene, camera, model;
  let initialized = false, loaded = false, failed = false, contextLost = false;
  let inView = false, hovering = false, paused = motionPreference.matches;
  let frameId = 0, lastPaint = 0, dirty = true, modelRadius = 1.5;

  function showStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
  }

  function updateButton() {
    if (!button) return;
    button.disabled = !loaded || failed || contextLost;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Resume rotation' : 'Pause rotation';
    button.setAttribute('aria-label', paused ? 'Resume 3D model rotation' : 'Pause 3D model rotation');
    button.title = 'Rotation pauses while this card is hovered or has keyboard focus.';
  }

  function keyboardFocused() {
    const focused = document.activeElement;
    return focused && card.contains(focused) && focused.matches(':focus-visible');
  }

  function canRender() {
    return loaded && !failed && !contextLost && inView && !document.hidden;
  }

  function canRotate() {
    return !paused && !hovering && !keyboardFocused();
  }

  function stop() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastPaint = 0;
  }

  function fail(message = '3D preview unavailable.') {
    failed = true;
    stop();
    host.dataset.methodState = 'unavailable';
    if (renderer) renderer.domElement.hidden = true;
    showStatus(message);
    updateButton();
  }

  function paint(now) {
    frameId = 0;
    if (!canRender()) {
      lastPaint = 0;
      return;
    }
    const rotating = canRotate();
    if (dirty || !lastPaint || now - lastPaint >= FRAME_INTERVAL) {
      if (rotating && lastPaint) {
        const seconds = Math.min((now - lastPaint) / 1000, .1);
        model.rotation.y += seconds * Math.PI * 2 / TURN_SECONDS;
      }
      try {
        renderer.render(scene, camera);
      } catch {
        fail();
        return;
      }
      dirty = false;
      lastPaint = now;
    }
    if (rotating) frameId = requestAnimationFrame(paint);
    else lastPaint = 0;
  }

  function updateActivity() {
    if (!canRender() || (!dirty && !canRotate())) {
      stop();
      return;
    }
    if (!frameId) frameId = requestAnimationFrame(paint);
  }

  function resize() {
    if (!renderer || !camera || failed || contextLost) return;
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // A sphere encloses every turn, including the widest view on a narrow card.
    const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const halfFov = Math.min(verticalHalfFov, Math.atan(Math.tan(verticalHalfFov) * camera.aspect));
    const distance = modelRadius / Math.sin(halfFov) * 1.06;
    camera.position.set(.08, .12, 1).normalize().multiplyScalar(distance);
    camera.near = Math.max(.01, distance - modelRadius * 1.5);
    camera.far = distance + modelRadius * 3;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    dirty = true;
    updateActivity();
  }

  async function initialize() {
    if (initialized) return;
    initialized = true;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setClearColor(0xffffff, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      host.append(renderer.domElement);
      renderer.domElement.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        contextLost = true;
        stop();
        host.dataset.methodState = 'unavailable';
        showStatus('3D view paused. Waiting to reconnect…');
        updateButton();
      });
      renderer.domElement.addEventListener('webglcontextrestored', () => {
        if (failed) return;
        contextLost = false;
        host.dataset.methodState = loaded ? 'ready' : 'loading';
        showStatus(loaded ? '' : 'Loading 3D…');
        updateButton();
        resize();
      });
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, 1, .01, 100);
      scene.add(new THREE.HemisphereLight(0xf9f6ff, 0x74718a, 2.5));
      const key = new THREE.DirectionalLight(0xfffaff, 3.4);
      key.position.set(-3, 4, 5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xd6d4ff, 1.8);
      fill.position.set(4, 1, 2);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 3);
      rim.position.set(2, 4, -4);
      scene.add(rim);

      const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
      const bounds = new THREE.Box3().setFromObject(gltf.scene);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      if (bounds.isEmpty() || ![size.x, size.y, size.z].every(Number.isFinite) || size.y <= 0) {
        throw new Error('Empty model bounds');
      }
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x8270c2,
        roughness: .35,
        metalness: .12,
        clearcoat: .42,
        clearcoatRoughness: .3,
      });
      const oldMaterials = new Set(), oldTextures = new Set();
      gltf.scene.traverse(child => {
        if (!child.isMesh) return;
        if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();
        for (const previous of Array.isArray(child.material) ? child.material : [child.material]) {
          if (!previous) continue;
          oldMaterials.add(previous);
          for (const value of Object.values(previous)) if (value?.isTexture) oldTextures.add(value);
        }
        child.material = material;
      });
      oldMaterials.forEach(item => item.dispose());
      oldTextures.forEach(item => item.dispose());

      // This GLB is already Y-up. Preserve its scene transforms and orientation.
      const scale = 2 / size.y;
      const centered = new THREE.Group();
      centered.add(gltf.scene);
      centered.scale.setScalar(scale);
      centered.position.copy(center).multiplyScalar(-scale);
      model = new THREE.Group();
      model.add(centered);
      scene.add(model);
      modelRadius = size.length() * scale / 2;
      loaded = true;
      host.dataset.methodState = contextLost ? 'unavailable' : 'ready';
      showStatus(contextLost ? '3D view paused. Waiting to reconnect…' : '');
      updateButton();
      resize();
    } catch {
      fail();
    }
  }

  button?.addEventListener('click', () => {
    paused = !paused;
    updateButton();
    updateActivity();
  });
  card.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovering = true;
    updateActivity();
  });
  card.addEventListener('pointerleave', () => {
    hovering = false;
    updateActivity();
  });
  card.addEventListener('focusin', updateActivity);
  card.addEventListener('focusout', () => queueMicrotask(updateActivity));
  document.addEventListener('visibilitychange', updateActivity);
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) paused = true;
    updateButton();
    updateActivity();
  });
  new ResizeObserver(resize).observe(host);
  const visibilityObserver = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    updateActivity();
  });
  visibilityObserver.observe(host);
  const loadObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    loadObserver.disconnect();
    initialize();
  }, { rootMargin: '300px' });
  loadObserver.observe(host);
  updateButton();
}

document.querySelectorAll('[data-method-model]').forEach(createMethodVisual);
