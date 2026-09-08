import type { RootState } from '@react-three/fiber'

/**
 * Browsers drop WebGL contexts under memory pressure (several heavy canvases,
 * tab backgrounding, GPU resets). Calling `preventDefault` on `webglcontextlost`
 * tells the browser we want `webglcontextrestored`, which three.js handles by
 * re-uploading resources — otherwise the canvas stays blank until reload.
 */
export function enableContextRecovery({ gl }: RootState) {
  gl.domElement.addEventListener('webglcontextlost', (event) => event.preventDefault(), false)
}
