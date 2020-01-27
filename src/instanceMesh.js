const genNormals = require('angle-normals');
const glsl = require('glslify');

module.exports = (regl, { elements, positions, normals, texcoords }, modelMatrices) =>
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
      uniform mat4 projection, view;
      attribute vec4 model0, model1, model2, model3;
      attribute vec3 position, normal;
      attribute vec2 uv;
      varying vec3 vnormal;
      varying vec2 vuv;
      void main () {
        vnormal = normal;
        vuv = uv;
        mat4 model = mat4(model0, model1, model2, model3);
        gl_Position = projection * view * model * vec4(position, 1.0);
      }`,
		attributes: {
			position: positions,
			normal: normals || genNormals(elements, positions),
			uv: texcoords || [],
			model0: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(0, 4))),
				divisor: 1
			},
			model1: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(4, 8))),
				divisor: 1
			},
			model2: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(8, 12))),
				divisor: 1
			},
			model3: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(12, 16))),
				divisor: 1
			}
		},
		elements: elements,
		instances: modelMatrices.length
	});
