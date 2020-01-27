//Code modified from http://mikolalysenko.github.io/MinecraftMeshes/index.html
//cubes: [[x0,y0,z0,x1,y1,z1],...]
module.exports = function(cubes, dims) {
	function f(i, j, k) {
		for (let cube of cubes)
			if (i >= cube[0] && i < cube[1] && j >= cube[2] && j < cube[3] && k >= cube[4] && k < cube[5]) return true;
		return false;
	}
	//Sweep over 3-axes
	var verts = [],
		ids = [];
	for (var d = 0; d < 3; ++d) {
		var i, j, k, l, w, h;
		var u = (d + 1) % 3,
			v = (d + 2) % 3;
		var x = [ 0, 0, 0 ],
			q = [ 0, 0, 0 ];
		var mask = new Int32Array(dims[u] * dims[v]);
		q[d] = 1;
		for (x[d] = -1; x[d] < dims[d]; ) {
			//Compute mask
			var n = 0;
			for (x[v] = 0; x[v] < dims[v]; ++x[v])
				for (x[u] = 0; x[u] < dims[u]; ++x[u]) {
					mask[n++] =
						(0 <= x[d] ? f(x[0], x[1], x[2]) : false) !=
						(x[d] < dims[d] - 1 ? f(x[0] + q[0], x[1] + q[1], x[2] + q[2]) : false);
				}
			//Increment x[d]
			++x[d];
			//Generate mesh for mask using lexicographic ordering
			n = 0;
			for (j = 0; j < dims[v]; ++j)
				for (i = 0; i < dims[u]; ) {
					if (mask[n]) {
						//Compute width
						for (w = 1; mask[n + w] && i + w < dims[u]; ++w) {}
						//Compute height (this is slightly awkward
						var done = false;
						for (h = 1; j + h < dims[v]; ++h) {
							for (k = 0; k < w; ++k) {
								if (!mask[n + k + h * dims[u]]) {
									done = true;
									break;
								}
							}
							if (done) {
								break;
							}
						}
						//Add quad
						x[u] = i;
						x[v] = j;
						var du = [ 0, 0, 0 ];
						du[u] = w;
						var dv = [ 0, 0, 0 ];
						dv[v] = h;
						var id = verts.length;
						ids.push(id, id + 1, id + 2, id + 2, id + 3, id);
						verts.push(
							x[0],
							x[1],
							x[2],
							x[0] + du[0],
							x[1] + du[1],
							x[2] + du[2],
							x[0] + du[0] + dv[0],
							x[1] + du[1] + dv[1],
							x[2] + du[2] + dv[2],
							x[0] + dv[0],
							x[1] + dv[1],
							x[2] + dv[2]
						);
						//Zero-out mask
						for (l = 0; l < h; ++l)
							for (k = 0; k < w; ++k) {
								mask[n + k + l * dims[u]] = false;
							}
						//Increment counters and continue
						i += w;
						n += w;
					} else {
						++i;
						++n;
					}
				}
		}
	}
	return { positions: verts, cells: ids };
};
