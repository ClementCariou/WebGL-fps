'use strict';

module.exports = (regl) =>
	regl({
		frag: `
      precision mediump float;
      varying vec3 vnormal;
      varying vec2 vuv;
      void main () {
        gl_FragColor = vec4(mix(vec3(vuv.xy, 1.0),vnormal,0.5), 1.0);
      }`,
		vert: `
      precision mediump float;
      uniform mat4 projection, view;
      attribute vec4 m0, m1, m2, m3;
      attribute vec3 position, normal;
      attribute vec2 uv;
      varying vec3 vnormal;
      varying vec2 vuv;
      void main () {
        vnormal = normal;
        vuv = uv;
        mat4 model = mat4(m0, m1, m2, m3);
        gl_Position = projection * view * model * vec4(position, 1.0);
      }`
	});
