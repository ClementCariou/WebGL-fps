'use strict';
const genNormals = require('angle-normals');

module.exports = (regl, { elements, positions, normals, texcoords }, modelMatrices) =>
	regl({
		attributes: {
			position: positions,
			normal: normals || genNormals(elements, positions),
			uv: texcoords || [],
			m0: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(0, 4))),
				divisor: 1
			},
			m1: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(4, 8))),
				divisor: 1
			},
			m2: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(8, 12))),
				divisor: 1
			},
			m3: {
				buffer: regl.buffer(modelMatrices.map((m) => m.model.slice(12, 16))),
				divisor: 1
			}
		},
		elements: elements,
		instances: modelMatrices.length
	});
