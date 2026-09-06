import * as THREE from "three";

export function createNeutronBinaryFabric(blackHoles = false) {
  const geometry = new THREE.PlaneGeometry(48, 48, 240, 240);
  geometry.rotateX(-Math.PI / 2);
  const uniforms = { time: { value: 0 }, star: { value: new THREE.Vector2() }, merged: { value: 0 }, depth: { value: blackHoles ? 1.5 : 1 } };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    vertexShader: `
      uniform float time; uniform vec2 star; uniform float merged; uniform float depth;
      varying vec2 coord; varying float wave; varying float height;
      float phaseAt(float t) {
        float rate = (pow(3.4,4.)-pow(.62,4.))/42.;
        float r = pow(max(pow(.62,4.),pow(3.4,4.)-rate*min(t,42.)),.25);
        return .4 + (.62*pow(3.4,1.5)*8./(5.*rate))*(pow(3.4,2.5)-pow(r,2.5));
      }
      void main() {
        coord=position.xz; float r=length(coord); float theta=atan(coord.y,coord.x);
        // Retarded source time gives outward propagation; m=2 quadrupole pattern.
        float ret=time-r/2.8;
        float a=pow(mix(pow(3.4,4.),pow(.62,4.),clamp(ret/42.,0.,1.)),.25);
        float envelope=ret<42. ? 1. : exp(-(ret-42.)*1.1);
        float p=phaseAt(ret)+max(0.,ret-42.)*5.;
        wave=sin(2.*theta-2.*p)*envelope;
        float amplitude=.8/(a*(1.+r*.13))*smoothstep(1.,4.,r);
        float well=-1.35/sqrt(dot(coord-star,coord-star)+.65)
                   -1.35/sqrt(dot(coord+star,coord+star)+.65);
        float single=-2.7/sqrt(dot(coord,coord)+1.);
        height=mix(well,single,merged)*depth+wave*amplitude;
        vec3 pos=position; pos.y=height-1.25;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
      }`,
    fragmentShader: `
      varying vec2 coord; varying float wave; varying float height;
      void main(){
        float r=length(coord);
        vec2 cell=abs(fract(coord*.8-.5)-.5)/max(fwidth(coord*.8),vec2(.001));
        float grid=1.-min(min(cell.x,cell.y),1.);
        float crest=pow(max(0.,wave),7.);
        vec3 color=mix(vec3(.08,.018,.22),vec3(.36,.10,.76),wave*.5+.5);
        color+=crest*vec3(.16,.2,.38)+grid*vec3(.14,.28,.39);
        float fade=1.-smoothstep(16.,23.,r);
        gl_FragColor=vec4(color,fade*(.32+crest*.32+grid*.16));
      }`,
  });
  const group = new THREE.Mesh(geometry, material);
  group.frustumCulled = false;
  return { group, update(time, x, z, merged) {
    uniforms.time.value = time;
    uniforms.star.value.set(x, z);
    uniforms.merged.value = merged;
  } };
}
