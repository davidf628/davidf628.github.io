
function CleanUpFunction (f) {
	f = f.replace(/- -/g, '+ ');
	return f;
}


// TODO: Make sure x, y and z are in the viewalbe region

function Point (arg) {
	
	var coords = arg.coords ? arg.coords : [ 0, 0, 0 ];
	var radius = arg.radius ? arg.radius : 0.2;
	var hexcolor = arg.color ? arg.color : 0x000000;
	
	var geometry = new THREE.SphereGeometry(radius);
	var material = new THREE.MeshBasicMaterial( { color: hexcolor } );
	var sphere = new THREE.Mesh(geometry, material);
	sphere.position.x = coords[0];
	sphere.position.y = coords[1];
	sphere.position.z = coords[2];
	return sphere;
	
}

function Vector (arg) {

	var start = arg.start ? arg.start : [0, 0, 0];
	var end = arg.end ? arg.end : [1, 1, 1];
	
	var from = new THREE.Vector3( start[0], start[1], start[2] );
	var to = new THREE.Vector3( end[0], end[1], end[2] );
	var direction = to.clone().sub(from);
	var length = arg.length ? arg.length : direction.length();
	var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xff0000, 1, .5 );
	
	return arrowHelper;
	
}

function Plane (a, b, c, d) {
	var eqn = '( ' + d + ' - ' + a + ' * x - ' + b + ' * y ) / ' + c;
	eqn = CleanUpFunction(eqn);
	s = Surface(eqn, 0x00ffff);
	return s;
}

function Plane2 (a, b, c, d) {

	var geometry = new THREE.PlaneGeometry( 200, 200);
	var plane = createMesh(geometry, 0x00ffff);
	return plane;

}

function rotatePlane(plane, eqnArr) {
		if(Number(eqnArr[0]) === 0) {a = 1e-20} else {a =  eqnArr[0];}
		if(Number(eqnArr[1]) === 0) {b = 1e-20} else {b =  eqnArr[1];}
		if(Number(eqnArr[2]) === 0) {c = 1e-20} else {c =  eqnArr[2];}	  
		if(Number(eqnArr[3]) === 0) {d = 1e-20} else {d =  eqnArr[3];}			  
		var x = new THREE.Vector3(d/a, 0, 0);
		var y = new THREE.Vector3(0, d/b, 0);
		var z = new THREE.Vector3(0, 0, d/c);
		var xy = new THREE.Vector3().subVectors(y, x);
		var xz = new THREE.Vector3().subVectors(z, x);
		var normal = new THREE.Vector3().crossVectors(xy, xz).normalize();
		var distanceToPlane = x.dot(normal);  
		if (distanceToPlane < 0) {
			distanceToPlane *= -1;
			normal.multiplyScalar(-1);
		}
		plane.position.copy(normal.clone().multiplyScalar(distanceToPlane));
		plane.up.set( 0, 0, 1 );	  
		plane.lookAt(normal);	  
	}


function Surface(f, color) {
	
	var f_z = Parser.parse(f).toJSFunction(['x', 'y']);
	
	zFunc = function (u, v) {
      
        x = xRange * u + xMin;
        y = yRange * v + yMin;
		var z = f_z(x, y);

	    return new THREE.Vector3(x, y, z);
    };

	return createMesh(new THREE.ParametricGeometry(zFunc, 60, 60, true), color);
		
}

function createMesh(geom, color) {

	upperZClip = new THREE.Plane( new THREE.Vector3(0, 0, zMin), 1);
	lowerZClip = new THREE.Plane( new THREE.Vector3(0, 0, zMax), 1);
	upperXClip = new THREE.Plane( new THREE.Vector3(xMin, 0, 0), 1);
	lowerXClip = new THREE.Plane( new THREE.Vector3(xMax, 0, 0), 1);
	upperYClip = new THREE.Plane( new THREE.Vector3(0, yMin, 0), 1);
	lowerYClip = new THREE.Plane( new THREE.Vector3(0, yMax,0), 1);
    var meshMaterial = new THREE.MeshLambertMaterial({
		color: color, 
		clippingPlanes: [upperZClip, lowerZClip, lowerXClip, upperXClip, lowerYClip, upperYClip], 
		transparent: true,
		side: THREE.DoubleSide,
		opacity: .3
	});

	var mesh2material = new THREE.MeshBasicMaterial({
		color: color,
		clippingPlanes: [upperZClip,lowerZClip, lowerXClip, upperXClip, lowerYClip, upperYClip],
		transparent: true,
		side: THREE.DoubleSide,
		depthTest: false,
		opacity: 0.15
	});
		
	return new THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, mesh2material]);
}
