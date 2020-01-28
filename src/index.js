'use strict';
const mat4 = require('gl-mat4');
const regl = require('regl')({ extensions: [ 'angle_instanced_arrays' ] });
const fps = require('./fps')();
const mesh = require('./instanceMesh');
const { cube, cylinder, sphere } = require('./primitives');
const mapLoader = require('./map');
const maps = require('../map/map.json');

const map = mapLoader(maps[0]);
const drawCube = mesh(regl, cube(), map.cubes);
const drawCylinder = mesh(regl, cylinder(), map.cylinders);
const drawSphere = mesh(regl, sphere(), map.spheres);
const worldScale = 0.02;

const globalScope = regl({
	cull: {
		enable: true,
		face: 'back'
	},
	uniforms: {
		projection: ({ viewportWidth, viewportHeight }) =>
			mat4.perspective([], Math.PI / 3, viewportWidth / viewportHeight, 0.01, 1000),
		view: () => mat4.scale([], fps.view(), [ worldScale, worldScale, worldScale ])
	}
});

regl.frame(({ time }) => {
	regl.clear({
		color: [ 0.3, 0.5, 1, 1 ],
		depth: 1
	});
	fps.tick({ fly: false, time });
	globalScope(() => {
		drawCube();
		drawCylinder();
		drawSphere();
	});
});
