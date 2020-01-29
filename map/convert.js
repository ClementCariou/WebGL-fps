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

function parseNode(node, nodes, templates) {
	let translation = node.translation ? roundVector(node.translation) : [ 0, 0, 0 ];
	let rotation = node.rotation ? quaternionToEuler(node.rotation) : [ 0, 0, 0 ];
	let scale = node.scale ? roundVector(node.scale) : [ 1, 1, 1 ];
	let type = 3;
	if (node.name.startsWith('Cube')) type = 0;
	else if (node.name.startsWith('Cylinder')) type = 1;
	else if (node.name.startsWith('Icosphere') || node.name.startsWith('Sphere')) type = 2;
	let children = [];
	if (node.children) children = node.children.map((i) => parseNode(nodes[i], nodes, templates));
	children.sort((a, b) => JSON.stringify(a) > JSON.stringify(b));
	let result = [ type, ...translation, ...rotation, ...scale, ...children ];
	//TODO: smarter template detection implementation to support partial templates (better compression and rubustness)
	const hash = JSON.stringify(children);
	if (templates[hash]) templates[hash].push(result);
	else templates[hash] = [ result ];
	return result;
}

let scenes = map.scenes.map((scene) => {
	let templates = {};
	let nodes = scene.nodes.map((n) => parseNode(map.nodes[n], map.nodes, templates));
	let i = 4;
	let templateArray = [];
	for (let name in templates) {
		if (name === '[]') continue;
		let template = templates[name];
		templateArray.push(template[0].slice(10));
		template.map((t) => {
			t[0] = i;
			t.splice(10);
		});
		i++;
	}
	const str = JSON.stringify([ templateArray, nodes ]);
	var indices = str.split('').map((c) => '0123456789[].,- '.indexOf(c));
	if (indices.length % 2) indices.push(15); //edge case: odd number of char => add a padding space char
	var len = indices.length / 2;
	var cumulated = new Uint8Array(len);
	// Pack the data
	for (let i = 0; i < len; i++) cumulated[i] = (indices[i * 2] << 4) | indices[i * 2 + 1];
	return Buffer.from(cumulated, 'binary').toString('base64');
});

fs.writeFileSync('map/map.json', JSON.stringify(scenes));
