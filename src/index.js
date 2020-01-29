'use strict';
const mat4 = require('gl-mat4');
const regl = require('regl')({ extensions: [ 'angle_instanced_arrays', 'oes_texture_float' ] });
const fps = require('./fps')();
const mesh = require('./instanceMesh');
const shadow = require('./instanceMeshShaded')(regl);
const { cube, cylinder, sphere } = require('./primitives');
const mapLoader = require('./map');
const maps = require('../map/map.json');

const map = mapLoader(maps[0]);
const drawCube = mesh(regl, cube(), map.cubes);
const drawCylinder = mesh(regl, cylinder(), map.cylinders);
const drawSphere = mesh(regl, sphere(), map.spheres);
const worldScale = 0.02;

const globalScope = regl({
	context: {
		lightDir: [ 0.5, 0.8, 0.3 ]
	},
	cull: {
		enable: true
	},
	uniforms: {
		projection: ({ viewportWidth, viewportHeight }) =>
			mat4.perspective([], Math.PI / 3, viewportWidth / viewportHeight, 0.01, 1000),
		view: () => mat4.scale([], fps.view(), [ worldScale, worldScale, worldScale ]),
		lightDir: regl.context('lightDir'),
		lightView: (context) => {
			return mat4.lookAt([], context.lightDir, [ 0.0, 0.0, 0.0 ], [ 0.0, 1.0, 0.0 ]);
		},
		lightProjection: () => {
			return mat4.ortho([], -50, 50, -50, 50, -50, 50);
		}
	}
});

const drawMesh = () => {
	drawCube();
	drawCylinder();
	drawSphere();
};

regl.frame(({ time }) => {
	regl.clear({
		color: [ 0.3, 0.5, 1, 1 ],
		depth: 1
	});
	fps.tick({ fly: false, time });
	globalScope(() => {
		shadow.drawDepth(drawMesh);
		shadow.drawNormals(drawMesh);
	});
});
