'use strict';
const fs = require('fs');
require.extensions['.gltf'] = require.extensions['.json'];
let map = require('./map.gltf');

//from wikipedia: https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
//got problems with other implementations
function quaternionToEuler([ q0, q1, q2, q3 ]) {
	// roll (x-axis rotation)
	const sinr_cosp = 2 * (q3 * q0 + q1 * q2);
	const cosr_cosp = 1 - 2 * (q0 * q0 + q1 * q1);
	const Rx = Math.atan2(sinr_cosp, cosr_cosp);

	// pitch (y-axis rotation)
	const sinp = 2 * (q3 * q1 - q2 * q0);
	const Ry = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);

	// yaw (z-axis rotation)
	const siny_cosp = 2 * (q3 * q2 + q0 * q1);
	const cosy_cosp = 1 - 2 * (q1 * q1 + q2 * q2);
	const Rz = Math.atan2(siny_cosp, cosy_cosp);

	return [ Math.round(Rx * 180 / Math.PI), Math.round(Ry * 180 / Math.PI), Math.round(Rz * 180 / Math.PI) ];
}

function roundVector([ x, y, z ]) {
	return [ Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(z * 10) / 10 ];
}

let scenes = map.scenes.map((scene) => {
	let cube = [];
	let cylinder = [];
	let sphere = [];
	for (let node_id of scene.nodes) {
		let node = map.nodes[node_id];
		//(doesn't support matrices)
		let translation = node.translation ? roundVector(node.translation) : [ 0, 0, 0 ];
		let rotation = node.rotation ? quaternionToEuler(node.rotation) : [ 0, 0, 0 ];
		let scale = node.scale ? roundVector(node.scale) : [ 1, 1, 1 ];
		let data = [ ...translation, ...rotation, ...scale ];
		if (node.name.startsWith('Cube')) cube.push(...data);
		else if (node.name.startsWith('Cylinder')) cylinder.push(...data);
		else if (node.name.startsWith('Icosphere')) sphere.push(...data);
	}
	return [ cube, cylinder, sphere ];
});

fs.writeFileSync('map/map.json', JSON.stringify(scenes));
