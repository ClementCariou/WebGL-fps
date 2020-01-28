'use strict';
const gen = (n, c, i = []) =>
	Array(n[0]).fill().flatMap((_, j) => (n.length === 1 ? [ c(...i, j) ] : gen(n.slice(1), c, [ ...i, j ])));

module.exports = {
	cube: (radius = 1) => ({
		//https://github.com/evanw/csg.js/blob/master/csg.js
		positions: [ 0, 4, 6, 2, 1, 3, 7, 5, 0, 1, 5, 4, 2, 6, 7, 3, 0, 2, 3, 1, 4, 5, 7, 6 ]
			.flatMap((i) => [ i & 1, i & 2, i & 4 ])
			.map((i) => (radius || 1) * (2 * !!i - 1)),
		normals: gen([ 3, 2, 4, 3 ], (i, j, _, k) => (i == k ? 2 * j - 1 : 0)),
		texcoords: gen([ 6, 8 ], (_, i) => [ 0, 0, 0, 1, 1, 1, 1, 0 ][i]),
		elements: gen([ 6, 6 ], (i, j) => i * 4 + [ 0, 1, 2, 0, 2, 3 ][j])
	}),
	cylinder: (radius = 1, height = 2, radialSubdivisions = 20) => {
		//https://github.com/greggman/twgl.js/blob/master/src/primitives.js
		//TODO: convert to functionnal programming
		const positions = [];
		const normals = [];
		const texcoords = [];
		for (let yy = -2; yy <= 3; ++yy) {
			let v = yy;
			let y = height * v;
			let ringRadius = radius;
			if (yy < 0) {
				y = 0;
				v = 1;
			} else if (yy > 1) {
				y = height;
				v = 1;
			}
			if (yy === -2 || yy === 3) {
				ringRadius = 0;
				v = 0;
			}
			y -= height / 2;
			for (let ii = 0; ii <= radialSubdivisions; ++ii) {
				const sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
				const cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
				positions.push(sin * ringRadius, y, cos * ringRadius);
				if (yy < 0) normals.push(0, -1, 0);
				else if (yy > 1) normals.push(0, 1, 0);
				else if (ringRadius === 0.0) normals.push(0, 0, 0);
				else normals.push(sin, 0, cos);
				texcoords.push(ii / radialSubdivisions, 1 - v);
			}
		}
		const vertsAroundEdge = radialSubdivisions + 1;
		return {
			positions,
			normals,
			texcoords,
			elements: gen([ 3, radialSubdivisions ], (yy, ii) => [
				vertsAroundEdge * yy * 2 + ii,
				vertsAroundEdge * yy * 2 + 1 + ii,
				vertsAroundEdge * (yy * 2 + 1) + 1 + ii,
				vertsAroundEdge * yy * 2 + ii,
				vertsAroundEdge * (yy * 2 + 1) + 1 + ii,
				vertsAroundEdge * (yy * 2 + 1) + ii
			])
		};
	},
	sphere: (radius = 1, subdivisionsAxis = 12, subdivisionsHeight = 12) => {
		//https://github.com/greggman/twgl.js/blob/master/src/primitives.js
		const texcoords = gen([ subdivisionsAxis + 1, subdivisionsHeight + 1 ], (x, y) => [
			x / subdivisionsAxis,
			y / subdivisionsHeight
		]);
		const coords = texcoords
			.map(([ u, v ]) => [ -u * 2 * Math.PI, v * Math.PI ])
			.flatMap(([ theta, phi ]) => [
				Math.cos(theta) * Math.sin(phi),
				Math.cos(phi),
				Math.sin(theta) * Math.sin(phi)
			]);
		const numVertsAround = subdivisionsAxis + 1;
		return {
			positions: coords.map((c) => c * radius),
			normals: coords,
			texcoords: texcoords.flat(),
			elements: gen([ subdivisionsAxis, subdivisionsHeight ], (x, y) => [
				y * numVertsAround + x,
				y * numVertsAround + x + 1,
				(y + 1) * numVertsAround + x,
				(y + 1) * numVertsAround + x,
				y * numVertsAround + x + 1,
				(y + 1) * numVertsAround + x + 1
			])
		};
	}
};
