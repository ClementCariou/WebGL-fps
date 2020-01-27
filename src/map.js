const mat4 = require('gl-mat4');

function parse(arr) {
	let result = [];
	for (let i = 0; i < arr.length; i += 9) {
		let m = mat4.fromTranslation([], [ arr[i], arr[i + 1], arr[i + 2] ]);
		mat4.rotateZ(m, m, arr[i + 5] * Math.PI / 180);
		mat4.rotateY(m, m, arr[i + 4] * Math.PI / 180);
		mat4.rotateX(m, m, arr[i + 3] * Math.PI / 180);
		mat4.scale(m, m, [ arr[i + 6], arr[i + 7], arr[i + 8] ]);
		result.push({ model: m });
	}
	return result;
}

module.exports = (map) => ({
	cubes: parse(map[0]),
	cylinders: parse(map[1]),
	spheres: parse(map[2])
});
