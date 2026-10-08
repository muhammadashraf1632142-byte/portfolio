export const vertexShader = /* glsl */ `
  attribute vec2 aCenter;
  attribute float aSeed;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uAspect;
  uniform float uTime;
  uniform float uScatterStrength;
  uniform float uReturnStrength;
  uniform float uProgress;
  varying vec2 vUv;
  varying float vScatter;
  varying float vSeed;

  void main() {
    vUv = uv;
    vSeed = aSeed;
    vec2 distance = (aCenter - uMouse) * vec2(uAspect, 1.0);
    float falloff = exp(-dot(distance, distance) * 16.0);
    float sweep = smoothstep(aSeed * 0.5, aSeed * 0.5 + 0.5, uProgress);
    float strength = max(falloff * uScatterStrength, sweep * uProgress * 1.7) * uReturnStrength;
    vScatter = strength;
    vec2 center = aCenter - 0.5;
    vec2 piece = position.xy - center;
    float angle = (aSeed - 0.5) * strength * 2.8;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    piece = rotation * piece * (1.0 - min(strength * 0.5, 0.65));
    vec2 randomDirection = vec2(sin(aSeed * 138.0), cos(aSeed * 217.0));
    vec2 direction = uVelocity * (0.6 + aSeed) + randomDirection * 0.55;
    vec2 displacement = direction * strength * 0.115;
    displacement += normalize(distance + 0.001) * strength * aSeed * 0.045;
    displacement += randomDirection * sin(uTime * 5.0 + aSeed * 20.0) * strength * 0.004;
    vec3 moved = vec3(center + piece + displacement, strength * aSeed * 0.08);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(moved, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uVelocity;
  uniform float uProgress;
  varying vec2 vUv;
  varying float vScatter;
  varying float vSeed;
  void main() {
    if (uProgress > 0.75 && vSeed < (uProgress - 0.75) * 2.0) discard;
    vec2 split = uVelocity * vScatter * 0.008;
    vec4 base = texture2D(uTexture, vUv);
    float red = texture2D(uTexture, clamp(vUv + split, 0.0, 1.0)).r;
    float blue = texture2D(uTexture, clamp(vUv - split, 0.0, 1.0)).b;
    gl_FragColor = vec4(red, base.g, blue, base.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
