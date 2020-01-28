'use strict';
const mat4 = require('gl-mat4');

//the input is a base64 string of a json file containing only tables and numbers
module.exports = function(s) {
	// Decompress and parse the input string
	const lookup = '0123456789[].,- '.split('');
	const json = atob(s).split('').map((c) => c.charCodeAt(0)).map((c) => lookup[c >> 4] + lookup[c & 0xf]).join('');
	const nodes = JSON.parse(json);
	// 0: cube, 1: cylinder, 2: sphere, 3: nothing, > 3: templates
	const temp = [ [], [], [], [] ];
	// Traverse the json tree
	const traverse = ([ id, px, py, pz, rx, ry, rz, sx, sy, sz, ...children ], mat = mat4.identity([])) => {
		// TODO: cache the matrix calculation if performance is an issue
		let m = mat4.translate([], mat, [ px, py, pz ]);
		mat4.rotateZ(m, m, rz * Math.PI / 180);
		mat4.rotateY(m, m, ry * Math.PI / 180);
		mat4.rotateX(m, m, rx * Math.PI / 180);
		mat4.scale(m, m, [ sx, sy, sz ]);

		if (id < 3)
			// Save matrice
			temp[id].push({ model: m });
		else if (temp[id])
			// Apply template
			temp[id].map((c) => traverse(c, m));
		else
			// Save template
			temp[id] = children;
		// Recursion
		children.map((c) => traverse(c, m));
	};
	nodes.map((n) => traverse(n));
	return { cubes: temp[0], cylinders: temp[1], spheres: temp[2] };
};
