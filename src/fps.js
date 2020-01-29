'use strict';
const mat4 = require('gl-mat4');
const vec3 = require('gl-vec3');
const lock = require('pointer-lock');

const sensibility = 0.002;
const limitAngle = 3 / 2 * Math.PI;
//Basic physic is simulated manually for now
const walkSpeed = 0.6;
const runSpeed = 1;
const floor = 0.1;
const gravitySmall = -3;
const gravity = -2;
const gravityDrop = -3;
const jumpSpeed = 0.8;

module.exports = function() {
	var mouse = [ 0, 0 ];
	var dir = [ 0, 0, 0 ];
	var pos = [ 0, floor, 0 ];
	var force = [ 0, 0, 0 ];
	var view = mat4.identity([]);
	var rotate = true;
	var sprint = false;
	var jump = false;

	// Mouse input
	const pointer = lock(document.body);
	pointer.on('attain', (movements) => {
		movements.on('data', (move) => {
			mouse[1] += move.dx * sensibility;
			mouse[0] += move.dy * sensibility;
			mouse[0] = Math.min(Math.max(mouse[0], -limitAngle), limitAngle);
			rotate = true;
		});
	});

	// Keyboard input
	var keys = {};
	const handleKey = (e) => {
		if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
		keys[e.code] = e.type === 'keydown';
		sprint = e.shiftKey;
		if (keys['Space'] && !jump) jump = jumpSpeed;
		const left = keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0;
		const right = keys['KeyD'] || keys['ArrowRight'] ? 1 : 0;
		const up = keys['KeyW'] || keys['ArrowUp'] ? 1 : 0;
		const down = keys['KeyS'] || keys['ArrowDown'] ? 1 : 0;
		dir = [ right - left, 0, down - up ];
		e.preventDefault();
	};
	window.addEventListener('keydown', handleKey);
	window.addEventListener('keyup', handleKey);

	// First person scope
	var lastTime = 0;
	return {
		pos,
		view: () => view,
		tick: ({ fly, time }) => {
			// Delta time
			let dt = time - lastTime;
			lastTime = time;
			// Cache matrix
			if (!rotate && !jump && dir[0] === 0 && dir[2] === 0) return;
			rotate = false;
			// Rotation
			mat4.identity(view);
			mat4.rotateX(view, view, mouse[0]);
			mat4.rotateY(view, view, mouse[1]);
			// Forward direction
			vec3.transformMat4(force, dir, mat4.invert([], view));
			if (!fly) force[1] = 0;
			vec3.normalize(force, force);
			// Translation
			vec3.add(pos, pos, vec3.scale(force, force, (sprint ? runSpeed : walkSpeed) * dt));
			if (jump && !fly) {
				jump += (jump > 0 ? (keys['Space'] ? gravity : gravitySmall) : gravityDrop) * dt;
				pos[1] += jump * dt;
				if (pos[1] < floor) {
					pos[1] = floor;
					jump = false;
				}
			}
			mat4.translate(view, view, vec3.scale([], pos, -1));
			return;
		}
	};
};
