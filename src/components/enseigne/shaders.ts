/* Shaders GLSL de la scène de l'enseigne. Couleurs en espace linéaire, converties en sRGB à la sortie. */

import { NB_LETTRES } from './sequence'

const LETTRES = /* glsl */ `
#define NB_LETTRES ${NB_LETTRES}
uniform float uAllume[NB_LETTRES];
`

/* Tubes du néon : verre éteint (reflets, bord clair) ou gaz allumé (cœur blanc rosé, bords rouges) */

export const tubeVertex = /* glsl */ `
${LETTRES}
attribute float aLettre;
varying float vAllume;
varying float vLettre;
varying vec3 vNormale;
varying vec3 vVue;

void main() {
  int i = int(aLettre + 0.5);
  vAllume = uAllume[i];
  vLettre = aLettre;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormale = normalize(normalMatrix * normal);
  vVue = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

export const tubeFragment = /* glsl */ `
uniform float uTemps;
uniform vec3 uLumiereVue;
uniform float uAmbiance;
varying float vAllume;
varying float vLettre;
varying vec3 vNormale;
varying vec3 vVue;

void main() {
  vec3 n = normalize(vNormale);
  vec3 v = normalize(vVue);
  float face = clamp(dot(n, v), 0.0, 1.0);

  // Verre éteint : sombre, bord clair et reflet des lustres
  float bord = pow(1.0 - face, 2.5);
  float reflet = pow(max(dot(reflect(-v, n), uLumiereVue), 0.0), 38.0);
  vec3 verre = vec3(0.035, 0.018, 0.02) + vec3(0.32, 0.2, 0.2) * bord * uAmbiance + vec3(1.0, 0.85, 0.7) * reflet * (0.25 + 0.6 * uAmbiance);

  // Gaz allumé, avec un bourdonnement à peine perceptible
  float bourdon = 0.965 + 0.035 * sin(uTemps * 91.0 + vLettre * 2.3) * sin(uTemps * 13.0 + vLettre);
  vec3 coeur = mix(vec3(1.0, 0.12, 0.2), vec3(1.0, 0.86, 0.9), smoothstep(0.15, 0.9, face));
  vec3 gaz = coeur * (1.6 + 0.4 * face) * bourdon;

  gl_FragColor = vec4(mix(verre, gaz, vAllume), 1.0);
  #include <colorspace_fragment>
}
`

/* Halo : particules additives réparties le long des tubes */

export const haloVertex = /* glsl */ `
${LETTRES}
attribute float aLettre;
uniform float uTaille;
uniform float uEchelle;
varying float vAllume;

void main() {
  vAllume = uAllume[int(aLettre + 0.5)];
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = vAllume > 0.001 ? min(uTaille * uEchelle / -mv.z, 256.0) : 0.0;
  gl_Position = projectionMatrix * mv;
}
`

export const haloFragment = /* glsl */ `
uniform vec3 uCouleur;
varying float vAllume;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float a = (exp(-d * 5.0) - 0.0067) * vAllume;
  gl_FragColor = vec4(uCouleur * a, 1.0);
}
`

/* Stuc, peinture et marbre : Lambert, éclairés par les lustres et par chaque lettre du néon */

export const stucVertex = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormale;

void main() {
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    p = instanceMatrix * p;
    n = mat3(instanceMatrix) * n;
  #endif
  vec4 monde = modelMatrix * p;
  vPosition = monde.xyz;
  vNormale = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * monde;
}
`

export const stucFragment = /* glsl */ `
${LETTRES}
uniform vec3 uLumieres[NB_LETTRES];
uniform vec3 uCouleur;
uniform vec3 uNeon;
uniform vec3 uCle;
uniform vec3 uCleDirection;
uniform vec3 uAmbiant;
uniform float uBrillance;
varying vec3 vPosition;
varying vec3 vNormale;

void main() {
  vec3 n = normalize(vNormale);
  vec3 lumiere = uAmbiant + uCle * max(dot(n, uCleDirection), 0.0);
  vec3 vue = normalize(cameraPosition - vPosition);
  float reflets = 0.0;
  for (int i = 0; i < NB_LETTRES; i++) {
    vec3 d = uLumieres[i] - vPosition;
    float d2 = dot(d, d);
    vec3 l = d * inversesqrt(d2);
    float lambert = max(dot(n, l), 0.0) * 0.85 + 0.15;
    float att = uAllume[i] / (1.0 + d2 * 2.4);
    lumiere += uNeon * att * lambert;
    reflets += att * pow(max(dot(reflect(-l, n), vue), 0.0), 24.0);
  }
  vec3 c = uCouleur * lumiere + uNeon * reflets * uBrillance;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}
`

/* Pampilles des lustres : facettes qui scintillent selon l'angle de vue */

export const cristalVertex = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormale;
varying float vGraine;

void main() {
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    p = instanceMatrix * p;
    n = mat3(instanceMatrix) * n;
  #endif
  vec4 monde = modelMatrix * p;
  vPosition = monde.xyz;
  vNormale = normalize(mat3(modelMatrix) * n);
  vGraine = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
  gl_Position = projectionMatrix * viewMatrix * monde;
}
`

export const cristalFragment = /* glsl */ `
uniform vec3 uChaud;
uniform vec3 uNeon;
uniform vec3 uCentreNeon;
uniform vec3 uAmpoules[2];
uniform float uTotal;
uniform float uTemps;
uniform float uAmbiance;
varying vec3 vPosition;
varying vec3 vNormale;
varying float vGraine;

vec3 arcEnCiel(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

void main() {
  vec3 n = normalize(vNormale);
  vec3 v = normalize(cameraPosition - vPosition);
  vec3 r = reflect(-v, n);
  float bord = pow(1.0 - abs(dot(n, v)), 2.0);

  // Ampoules du lustre (au-dessus) et néon (derrière, en contrebas)
  float eclatChaud = pow(max(dot(r, normalize(vec3(0.2, 1.0, 0.3))), 0.0), 28.0);
  float eclatNeon = pow(max(dot(r, normalize(uCentreNeon - vPosition)), 0.0), 16.0);
  float scintille = 0.55 + 0.45 * sin(uTemps * (1.2 + vGraine * 2.5) + vGraine * 40.0);

  // Ampoules vues à travers le cristal : la pampille s'illumine quand l'ampoule est derrière elle
  vec3 a0 = normalize(uAmpoules[0] - vPosition);
  vec3 a1 = normalize(uAmpoules[1] - vPosition);
  float transmis = pow(max(max(dot(-v, a0), dot(-v, a1)), 0.0), 6.0);
  float refracte = pow(max(max(dot(r, a0), dot(r, a1)), 0.0), 10.0);

  vec3 dispersion = mix(vec3(1.0), arcEnCiel(fract(dot(n, vec3(1.7, 2.3, 0.9)) + vGraine)), 0.4);
  vec3 c = vec3(0.03, 0.02, 0.022)
    + uChaud * (0.22 * bord + (eclatChaud * 2.6 + refracte * 1.4) * scintille + transmis * 0.9) * dispersion * uAmbiance
    + uNeon * (0.14 * bord + eclatNeon * 1.6 * scintille) * uTotal;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}
`

/* Mur du fond : pénombre rouge, éclairée depuis l'enseigne */

export const fondVertex = /* glsl */ `
varying vec3 vPosition;
void main() {
  vec4 monde = modelMatrix * vec4(position, 1.0);
  vPosition = monde.xyz;
  gl_Position = projectionMatrix * viewMatrix * monde;
}
`

export const fondFragment = /* glsl */ `
uniform vec3 uFond;
uniform vec3 uNeon;
uniform float uTotal;
uniform float uAmbiance;
varying vec3 vPosition;
void main() {
  float d = length(vPosition.xy * vec2(0.22, 0.3));
  vec3 c = uFond * (0.55 + 0.45 * uAmbiance) + uNeon * uTotal * 0.22 / (1.0 + d * d * 2.5);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}
`
