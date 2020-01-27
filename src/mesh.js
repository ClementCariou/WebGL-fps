const genNormals = require('angle-normals');
const glsl = require('glslify');

module.exports = (regl, { elements, positions, normals, texcoords }) =>
	regl({
		frag: glsl`
      precision mediump float;
      varying vec3 vnormal;
      varying vec2 vuv;
      void main () {
        gl_FragColor = vec4(mix(vec3(vuv.xy, 1.0),vnormal,0.5), 1.0);
      }`,
		vert: glsl`
      precision mediump float;
      uniform mat4 projection, view, model;
      attribute vec3 position, normal;
      attribute vec2 uv;
      varying vec3 vnormal;
      varying vec2 vuv;
      void main () {
        vnormal = normal;
        vuv = uv;
        gl_Position = projection * view * model * vec4(position, 1.0);
      }`,
		attributes: {
			position: positions,
			normal: normals || genNormals(elements, positions),
			uv: texcoords || []
		},
		uniforms: {
			model: regl.prop('model')
		},
		elements: elements
	});
