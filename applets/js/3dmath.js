
///////////////////////////////////////////////////////////////////////////////

// Need something to add text to scenes - preferably with math functions and whatnot

// Support for drawing filled polygons

// on button press - show the outline of the current viewing window

// Ability to intersect a surface with horizontal or vertical planes

///////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////
//
//  Notes: 
//
//   - The camera is set to an initial viewing window of -20 .. 20 units on the 
//     x, y, and z axes. If you see the value 40 throughout, that just the
//     linear distance of the original camera view.
//
///////////////////////////////////////////////////////////////////////////////


// This structure keeps track of all the variables required in maintaing the
// viewing window on screen, none of these variables should be directly
// changed as they are all dependent on each other. Changes can be made by
// the provided functions within the object.

// xMin, xMax, ... are all pretty self-explanatory. xStep is the x distance between
// tick marks. xScale is the ratio distance between units, and xShift is a linear
// translation of points.

// Modifying these variables may not result in what you expect, as changes to one
// variable has effects on others

var viewingWindow = {
	
		// These are the bounds of the viewing window
		
		xMin: -20, xMax: 20, xStep: 5,
		yMin: -20, yMax: 20, yStep: 5,
		zMin: -20, zMax: 20, zStep: 5,
		
		// These are affine transformations of the viewing window

		xScale: 1.0, yScale: 1.0, zScale: 1.0,
		xShift: 0.0, yShift: 0.0, zShift: 0.0,
		
		xRange: function() { return this.xMax - this.xMin; },
		yRange: function() { return this.yMax - this.yMin; },
		zRange: function() { return this.zMax - this.zMin; },
		
		setScale: function(xRatio, yRatio, zRatio) {

			this.xScale = xRatio;
			this.yScale = yRatio;
			this.zScale = zRatio;

			this.xMin /= xRatio;
			this.xMax /= xRatio;
			
			this.yMin /= yRatio;
			this.yMax /= yRatio;

			this.zMin /= zRatio;
			this.zMax /= zRatio;

		},
		
		setBounds: function(xMin, xMax, xStep, yMin, yMax, yStep, zMin, zMax, zStep) {

		    //this.xShift = this.xMin - xMin;
			this.xMin = xMin;
			this.xMax = xMax;
			this.xStep = xStep;
			this.xScale = 40 / (xMax - xMin);

			//this.yShift = this.yMin - yMin;
			this.yMin = yMin;
			this.yMax = yMax;
			this.yStep = yStep;
			this.yScale = 40 / (yMax - yMin);

			//this.zShift = this.zMin - zMin;
			this.zMin = zMin;
			this.zMax = zMax;
			this.zStep = zStep;
			this.zScale = 40 / (zMax - zMin);
			
		}	
		
	}

function getXMin() { return viewingWindow.xMin; }
function getXMax() { return viewingWindow.xMax; }
function getYMin() { return viewingWindow.yMin; }
function getYMax() { return viewingWindow.yMax; }
function getZMin() { return viewingWindow.zMin; }
function getZMax() { return viewingWindow.zMax; }

// The functions that handle plotting points using affine transformations
function xCoord(x) { return x * viewingWindow.xScale + viewingWindow.xShift; }
function yCoord(y) { return y * viewingWindow.yScale + viewingWindow.yShift; }
function zCoord(z) { return z * viewingWindow.zScale + viewingWindow.zShift; }

function sCoord(x, y, z) {
	return new THREE.Vector3(xCoord(x), yCoord(y), zCoord(z));
}

function sCoordV(vector) {
	return new THREE.Vector3(xCoord(vector[0]), yCoord(vector[1]), zCoord(vector[2]));
}

function buildAxis(src, dst, color, dashed) { 

	var geometry = new THREE.Geometry(), material;
	
	if(dashed) {
		material = new THREE.LineDashedMaterial( { linewidth: 2, color: color, dashSize: 0.5, gapSize: 0.5 } );
	} else {
		material = new THREE.LineBasicMaterial( { linewidth: 2, color: color } );
	}
	
	geometry.vertices.push(src.clone());
	geometry.vertices.push(dst.clone());
	var axis = new THREE.Line(geometry, material, THREE.LineSegments);	
	axis.computeLineDistances();
	
	return axis;
}

function buildAxisCone(color, posX, posY, posZ, axis) {
	
	var geometry = new THREE.CylinderGeometry(0, 0.2, 0.4, 20, 5, false) ;
	var material = new THREE.MeshBasicMaterial( { color: color } );
	var cone = new THREE.Mesh( geometry, material );
	cone.position.set(posX, posY, posZ);
	
	if(axis == "x") {
		geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( -Math.PI / 2));
	} else if(axis == "y") {
		geometry.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI / 2));
	} else if(axis == "z") {
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2));
	}
	
	return cone;
}

function createAxes(args) {

	var xyGrid = true;
	var yzGrid = false;
	var xzGrid = false;
	var showLabels = true;

	var axes = new THREE.Object3D();
	var origin = sCoord(0, 0, 0);
	
	axes.add(buildAxis(origin, sCoord(viewingWindow.xMax, 0, 0), new THREE.Color('red'), false)); // +X
	axes.add(buildAxis(origin, sCoord(viewingWindow.xMin, 0, 0), new THREE.Color('red'), true));  // -X
	axes.add(buildAxis(origin, sCoord(0, viewingWindow.yMax, 0), new THREE.Color('green'), false));   // +Y
	axes.add(buildAxis(origin, sCoord(0, viewingWindow.yMin, 0), new THREE.Color('green'), true));    // -Y
	axes.add(buildAxis(origin, sCoord(0, 0, viewingWindow.zMax), new THREE.Color('blue'), false));  // +Z
	axes.add(buildAxis(origin, sCoord(0, 0, viewingWindow.zMin), new THREE.Color('blue'), true));   // -Z

	axes.add(buildAxisCone(new THREE.Color('red'), xCoord(viewingWindow.xMax), yCoord(0), zCoord(0), "x")); // x-axis cone
	axes.add(buildAxisCone(new THREE.Color('green'),   xCoord(0), yCoord(viewingWindow.yMax), zCoord(0), "y")); // y-axis cone
	axes.add(buildAxisCone(new THREE.Color('blue'),  xCoord(0), yCoord(0), zCoord(viewingWindow.zMax), "z")); // z-axis cone
	
	if(args !== undefined) {
		xyGrid = (args.xyGrid == undefined) ? xyGrid : args.xyGrid;
		xzGrid = (args.xzGrid == undefined) ? xzGrid : args.xzGrid;
		yzGrid = (args.yzGrid == undefined) ? yzGrid : args.yzGrid;
		showLabels = (args.labels == undefined) ? showLabels : args.labels;
	}
	
	// Create the x-y grid
	
	var gridmaterial = new THREE.LineBasicMaterial( { color: 0xe0e0e0, linewidth: 1 });
	var gridgeometry = new THREE.Geometry();
	
	var xRange = viewingWindow.xMax - viewingWindow.xMin;
	var yRange = viewingWindow.yMax - viewingWindow.yMin;
	
	var xWidth = xRange / viewingWindow.xStep;
	var yWidth = yRange / viewingWindow.yStep;
    
	// Draw the x-y gridlines
	
	for(var i = viewingWindow.xMin; i <= viewingWindow.xMax; i += viewingWindow.xStep) {
		if(Math.abs(i) > 0.0001) { // Don't draw a gridline at zero, this covers the axis
			if(xyGrid) {
				gridgeometry = new THREE.Geometry();
				gridgeometry.vertices.push(sCoord(i, viewingWindow.yMin, 0));
				gridgeometry.vertices.push(sCoord(i, viewingWindow.yMax, 0));
				axes.add(new THREE.Line(gridgeometry, gridmaterial));
			}
			if(showLabels) {
				var label = makeTextSprite(i);
				label.position.set(xCoord(i), yCoord(0), zCoord(0));
				axes.add(label);
			}
		}
	}
	
	for(var i = viewingWindow.yMin; i <= viewingWindow.yMax; i += viewingWindow.yStep) {
		if(Math.abs(i) > 0.0001) {
			if(xyGrid) {
				gridgeometry = new THREE.Geometry();
				gridgeometry.vertices.push(sCoord(viewingWindow.xMin, i, 0));
				gridgeometry.vertices.push(sCoord(viewingWindow.xMax, i, 0));
				axes.add(new THREE.Line(gridgeometry, gridmaterial));
			}
		}
	}
	
	// x-z Gridlines
	
	for(var i = viewingWindow.zMin; i <= viewingWindow.zMax; i += viewingWindow.zStep) {
		if(Math.abs(i) > 0.0001) { // Don't draw a gridline at zero, this covers the axis
			if(xzGrid) {
				gridgeometry = new THREE.Geometry();
				gridgeometry.vertices.push(sCoord(viewingWindow.xMin, 0, i));
				gridgeometry.vertices.push(sCoord(viewingWindow.xMax, 0, i));
				axes.add(new THREE.Line(gridgeometry, gridmaterial));
			}
			if(showLabels) {
				var label = makeTextSprite(i);
				label.position.set(xCoord(0), yCoord(0), zCoord(i));
				axes.add(label);
			}
		}
	}
	
	for(var i = viewingWindow.xMin; i <= viewingWindow.xMax; i += viewingWindow.xStep) {
		if(Math.abs(i) > 0.0001) {
			if(xzGrid) {
				gridgeometry = new THREE.Geometry();
				gridgeometry.vertices.push(sCoord(i, 0, viewingWindow.zMin));
				gridgeometry.vertices.push(sCoord(i, 0, viewingWindow.zMax));
				axes.add(new THREE.Line(gridgeometry, gridmaterial));
			}
		}
	}
	
	// y-z Gridlines
	
	for(var i = viewingWindow.yMin; i <= viewingWindow.yMax; i += viewingWindow.yStep) {
		if(Math.abs(i) > 0.0001) {
			if(yzGrid) {
				gridgeometry = new THREE.Geometry();
				gridgeometry.vertices.push(sCoord(0, i, viewingWindow.zMin));
				gridgeometry.vertices.push(sCoord(0, i, viewingWindow.zMax));
				axes.add(new THREE.Line(gridgeometry, gridmaterial));
			}
			if(showLabels) {
				var label = makeTextSprite(i);
				label.position.set(xCoord(0), yCoord(i), zCoord(0));
				axes.add(label);
			}
		}
	}
	
	for(var i = viewingWindow.zMin; i <= viewingWindow.zMax; i += viewingWindow.zStep) {
		if(Math.abs(i) > 0.0001) { // Don't draw a gridline at zero, this covers the axis
			if(yzGrid) {
				gridgeometry = new THREE.Geometry();
				gridgeometry.vertices.push(sCoord(0, viewingWindow.yMin, i));
				gridgeometry.vertices.push(sCoord(0, viewingWindow.yMax, i));
				axes.add(new THREE.Line(gridgeometry, gridmaterial));
			}
		}
	}
	
	function makeTextSprite(message, opts) {
		var parameters = opts || {};
		var fontface = parameters.fontface || 'Helvetica';
		var fontsize = parameters.fontsize || 70;
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		context.font = fontsize + "px " + fontface;

		// get size data (height depends only on font size)
		var metrics = context.measureText(message);
		var textWidth = metrics.width;

		// text color
		context.fillStyle = 'rgba(0, 0, 0, 1.0)';
		context.fillText(message, 0, fontsize);

		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas)
		texture.minFilter = THREE.LinearFilter;
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial({
		  map: texture//,
		  //useScreenCoordinates: false
		});
		var sprite = new THREE.Sprite(spriteMaterial);
		//sprite.scale.set(100, 50, 1.0);
		sprite.scale.set(1.5, 1.5, 1.0);
		return sprite;
	}
		
	return axes;
	
}

class Point {

	constructor (args) {
		
		this.coords = [0, 0, 0];
		this.radius = 0.2;
		this.color = new THREE.Color('black');
		this.visible = true;
		
		if(args !== undefined) {
			this.coords = args.coords ? args.coords : this.coords;
			this.radius = args.radius ? args.radius : this.radius;
			this.color = args.color ? args.color : this.color;
			this.visible = (args.visible == undefined) ? this.visible : args.visible;
		}	
		
		if(typeof this.color === 'string' || this.color instanceof String) {
			this.color = new THREE.Color(this.color);
		}
	
		var geometry = new THREE.SphereGeometry(this.radius);
		var material = new THREE.MeshBasicMaterial( { color: this.color } );
		this.sphere = new THREE.Mesh(geometry, material);
	
		this.sphere.position.x = xCoord(this.coords[0]);
		this.sphere.position.y = yCoord(this.coords[1]);
		this.sphere.position.z = zCoord(this.coords[2]);
		
		this.sphere.visible = this.visible;
			
	}
	
	moveTo(p) {
		this.coords[0] = p[0];
		this.coords[1] = p[1];
		this.coords[2] = p[2];
		this.sphere.position.x = xCoord(p[0]);
		this.sphere.position.y = yCoord(p[1]);
		this.sphere.position.z = zCoord(p[2]);
	}
	
	traceTo(scene, p) {
	
		var geometry = new THREE.SphereGeometry(this.radius);
		var material = new THREE.MeshBasicMaterial( { color: this.color } );
		var s = new THREE.Mesh(geometry, material);
		s.position.x = xCoord(this.coords[0]);
		s.position.y = yCoord(this.coords[1]);
		s.position.z = zCoord(this.coords[2]);
		
		scene.add(s);
		
		this.moveTo(p);

	}
	
	getObject() { return this.sphere; }
	getCoords() { return this.coords; }
	getX() { return this.coords[0]; }
	getY() { return this.coords[1]; }
	getZ() { return this.coords[2]; }
	getColor() { return this.color; }
	getRadius() { return this.radius; }
	getVisible() { return this.visible; }
	
	setVisible(b) {
		this.visible = b;
		this.sphere.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.sphere.visible = this.visible;
	}
	
	setColor(c) {
		this.color = c;
		this.sphere.material.color = c;
	}

	setSize(scene, r) {
		this.radius = r;
		scene.remove(this.sphere);
        var geometry = new THREE.SphereGeometry(this.radius);
        var material = new THREE.MeshBasicMaterial( { color: this.color } );
        this.sphere = new THREE.Mesh(geometry, material);
		
		this.sphere.position.x = xCoord(this.coords[0]);
		this.sphere.position.y = yCoord(this.coords[1]);
		this.sphere.position.z = zCoord(this.coords[2]);
		
        scene.add(this.sphere);
	}
	
	X() {
		return this.coords[0];
	}
	
	Y() { 
		return this.coords[1];
	}
	
	Z() {
		return this.coords[2];
	}
	
}

class Sphere {

	constructor (args) {
		
		this.coords = [0, 0, 0];
		this.radius = 0.2;
		this.color = new THREE.Color('black');
		this.visible = true;
		
		if(args !== undefined) {
			this.coords = args.coords ? args.coords : this.coords;
			this.radius = args.radius ? args.radius : this.radius;
			this.color = args.color ? args.color : this.color;
			this.visible = (args.visible == undefined) ? this.visible : args.visible;
		}	
	
		var geometry = new THREE.SphereGeometry(this.radius, 32, 32);
		this.sphere = createNormalMesh(geometry);
	
		this.sphere.position.x = xCoord(this.coords[0]);
		this.sphere.position.y = yCoord(this.coords[1]);
		this.sphere.position.z = zCoord(this.coords[2]);
		
		this.sphere.visible = this.visible;
			
	}
	
	getObject() { return this.sphere; }
	getCoords() { return this.coords; }
	getX() { return this.coords[0]; }
	getY() { return this.coords[1]; }
	getZ() { return this.coords[2]; }
	getColor() { return this.color; }
	getRadius() { return this.radius; }
	getVisible() { return this.visible; }
	
	setVisible(b) {
		this.visible = b;
		this.sphere.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.sphere.visible = this.visible;
	}
	
}


class Vector {
	
	constructor (args) {

		this.start = [0, 0, 0];
		this.end = [1, 1, 1];		
		this.length = 1;
		this.color = new THREE.Color('red');
		this.visible = true;
		this.headLengh = 1;
		this.headWidth = 0.5;
		
		//var from = new THREE.Vector3( this.start[0], this.start[1], this.start[2] );
		var from = sCoord(this.start[0], this.start[1], this.start[2]);
		//var to = new THREE.Vector3( this.end[0], this.end[1], this.end[2] );
		var to = sCoord(this.end[0], this.end[1], this.end[2]);
		var direction = to.clone().sub(from);
	
		if(args !== undefined) {
			
			this.start = args.start ? args.start : this.start;
			this.end = args.end ? args.end : this.end;
			
			//from = new THREE.Vector3( this.start[0], this.start[1], this.start[2] );
			from = sCoord(this.start[0], this.start[1], this.start[2]);
			//to = new THREE.Vector3( this.end[0], this.end[1], this.end[2] );
			to = sCoord(this.end[0], this.end[1], this.end[2]);
			direction = to.clone().sub(from);
			this.length = args.length ? args.length : direction.length();
			
			this.color = args.color ? args.color : this.color;			
			this.visible = (args.visible == undefined) ? this.visible : args.visible;
			
			this.headLength = args.headLength ? args.headLength : this.headLength;
			this.headWidth = args.headWidth ? args.headWidth : this.headWidth;
		}	
		
		this.vector = new THREE.ArrowHelper(direction.normalize(), from, this.length, this.color, this.headLength, this.headWidth );
		this.vector.visible = this.visible;

	}
	
	// Getters //
	
	getObject() { return this.vector; }
	getVisible() { return this.visible;	}
	getColor() { return this.color;	}
	getStartPoint() { return start;	}
	getEndPoint() {	return end;	}
	getHeadLength() { return headLength; }
	getHeadWidth() { return headWidth; }
	
	
	// Setters //
	
	setVisible(b) {
		this.visible = b;
		this.vector.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.vector.visible = this.visible;
	}
	
	setColor(c) {
		this.color = c;
		this.vector.setColor(c);
	}
	
	setEndPoint(coords) {
		
		this.end[0] = coords[0];
		this.end[1] = coords[1];
		this.end[2] = coords[2];
		
		//var from = new THREE.Vector3( this.start[0], this.start[1], this.start[2] );
		var from = sCoord(this.start[0], this.start[1], this.start[2]);
		//var to = new THREE.Vector3( this.end[0], this.end[1], this.end[2] );
		var to = sCoord(this.end[0], this.end[1], this.end[2]);
		var direction = to.clone().sub(from);
		
		this.length = direction.length();
		this.vector.setLength(this.length, this.headLength, this.headWidth);
		this.vector.setDirection(direction.normalize());

	}
	
	setStartPoint(coords) {
		
		this.start[0] = coords[0];
		this.start[1] = coords[1];
		this.start[2] = coords[2];
		
		this.vector.position.x = coords[0];
		this.vector.position.y = coords[1];
		this.vector.position.z = coords[2];

	}
	
	// SetDirection
	// SetLength
	// Translate
	// SetCoords
	// SetHeadLength
	// SetHeadWidth
	
}

class Line {
	
	constructor(args) {
		
		if(args === undefined) {
			args = {};
		}
		
		this.color = args.color ? new THREE.Color(args.color) : new THREE.Color('black');
		this.start = args.start ? args.start : [0, 0, 0];
		this.end = args.end ? args.end : [1, 1, 1];
		this.dashed = args.dashed === undefined ? false : args.dashed;
		this.visible = (args.visible == undefined) ? true : args.visible;
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push(sCoordV(this.start));
		geometry.vertices.push(sCoordV(this.end));
		
		var material;
		if(this.dashed) {
			material = new THREE.LineDashedMaterial( { color: this.color, scale: 1, dashSize: 0.5, gapSize: 0.5 });
		} else {			
			material = new THREE.LineBasicMaterial( { color: this.color } );
		}
		
		this.line = new THREE.Line(geometry, material);
		if(this.dashed) {
			this.line.computeLineDistances();
		}
		this.line.visible = this.visible;
		
	}
	
	getObject() {
		return this.line;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.line.visible = this.visible;
	}
	
	updateEndPoint(coords) {
		this.end = coords;
		this.line.geometry.vertices[1].set(xCoord(coords[0]), yCoord(coords[1]), zCoord(coords[2]));
		this.line.geometry.verticesNeedUpdate = true;
	}

	updateStartPoint(coords) {
		this.start = coords;
		this.line.geometry.vertices[1].set(xCoord(coords[0]), yCoord(coords[1]), zCoord(coords[2]));
		this.line.geometry.verticesNeedUpdate = true;
	}

}

class Box {
	
	constructor(args) {
		
		if(args === undefined) {
			args = {};
		}
		
		this.color = args.color ? new THREE.Color(args.color) : new THREE.Color('green');
		this.position = args.position ? args.position : [0, 0, 0];
		this.width = args.width ? args.width : 1;       // x dimension
		this.height = args.height ? args.height : 1;    // y dimension
		this.depth = args.depth ? args.depth : 1;       // z dimension
		this.visible = (args.visible == undefined) ? true : args.visible;
		
		var geometry = new THREE.BoxGeometry(this.width, this.height, this.depth, 1, 1, 1);
		
		this.box = createTransparentMesh(geometry, this.color);
		this.box.translateX(this.position[0] + this.width / 2);
		this.box.translateY(this.position[1] + this.height / 2);
		this.box.translateZ(this.position[2] + this.depth / 2);

		this.box.visible = this.visible;
		
	}
	
	getObject() {
		return this.box;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.box.visible = this.visible;
	}
	
	setwidth(width) {
	
	}
	
	setHeight(height) {
	}
	
	setDept(depth) {
	}
	
	setDimensions (length, height, depth) {
		setWidth(length);
		setHeight(height);
		setDepth(depth);
	}
	
	setPosition(coords) {
		
	}

}

function addToScene(scene, obj) {
	scene.add(obj.getObject());
}

class Surface {

	// skin types:
	//   - transparent
	//   - wireframe
	//   - normal
	//   - shaded
	//   - vertexColor
	//   - rainbow

   	// slices — The count of slices to use for the parametric function 
	// stacks — The count of stacks to use for the parametric function

	constructor(f, args) {
		
		if(args === undefined) {
			args = {};
		}

		// Set default parameters
		this.color = args.color ? args.color : new THREE.Color('red');
		if(typeof this.color === 'string' || this.color instanceof String) {
			this.color = new THREE.Color(this.color);
		}
			
		this.wireframevisible = (args.wireframevisible !== undefined) ? args.wireframevisible : false;
		this.wireframecolor = args.wireframecolor ? args.wireframecolor : new THREE.Color('black');
		if(typeof this.color === 'string' || this.color instanceof String) {
			this.color = new THREE.Color(this.color);
		}
		
		this.func = f;	
			
		this.skin = args.skin ? args.skin : 'transparent';	
		
		this.slices = args.slices ? args.slices : 60;
		this.stacks = args.stacks ? args.stacks : 60;
			
		this.visible = (args.visible !== undefined) ? args.visible : true;
		
		this.dx = args.dx ? args.dx : 1;
		this.dy = args.dy ? args.dy : this.dx;
		
    	var geometry = createSurfaceGeometry(f, this.slices, this.stacks); 
		
		if(this.skin == 'transparent') {
			this.surface = createTransparentMesh(geometry, this.color); 	
		} else if(this.skin == 'normal') {
			this.surface = createNormalMesh(geometry);
		} else if(this.skin == 'shaded') {
			this.surface = createShadedMesh(geometry, this.color);
		} else if(this.skin == 'vertexColor') {
			this.surface = createVertexColorMesh(geometry, this.color);
		} else if(this.skin == 'solid') {
			this.surface = createSolidColorMesh(geometry, this.color);
		}
		
		this.wireframe = createWireFrame(f, this.wireframecolor, this.dx, this.dy);
		this.wireframe.visible = this.wireframevisible;
		this.surface.add(this.wireframe);
		this.surface.children
		
		this.surface.visible = this.visible;
		
	}

	getObject() { return this.surface; }
	getFunction() { return this.func; }
	
	setVisible(b) {
		this.visible = b;
		this.surface.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.surface.visible = this.visible;
	}
	
	toggleWireframe() {
		this.wireframevisible = !this.wireframevisible;
		this.wireframe.visible = this.wireframevisible;
	}
	setWireframeVisible(b) {
		this.wireframevisible = b;
		this.wireframe.visible = b;
	}

}

function createSurfaceGeometry(f, slices, stacks) {
	
	var f_z = Parser.parse(f).toJSFunction(['x', 'y']);
	
	var zFunc = function (u, v, target) {
      
        var x = viewingWindow.xRange() * u + viewingWindow.xMin;
        var y = viewingWindow.yRange() * v + viewingWindow.yMin;
		var z = f_z(x, y);

	    return target.set(xCoord(x), yCoord(y), zCoord(z));
    };

	return new THREE.ParametricGeometry(zFunc, slices, stacks);

}		
		
	/*
	///////////////////////////////////////////////
	// calculate vertex colors based on Z values //
	///////////////////////////////////////////////
	graphGeometry.computeBoundingBox();
	zMin = graphGeometry.boundingBox.min.z;
	zMax = graphGeometry.boundingBox.max.z;
	zRange = zMax - zMin;
	var color, point, face, numberOfSides, vertexIndex;
	// faces are indexed using characters
	var faceIndices = [ 'a', 'b', 'c', 'd' ];
	// first, assign colors to vertices as desired
	for ( var i = 0; i < graphGeometry.vertices.length; i++ ) 
	{
		point = graphGeometry.vertices[ i ];
		color = new THREE.Color( 0x0000ff );
		//color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
		color.setRGB(0.75 * (point.z - zMin)/zRange, 0, 0);
		graphGeometry.colors[i] = color; // use this array for convenience
	}
	// copy the colors as necessary to the face's vertexColors array.
	for ( var i = 0; i < graphGeometry.faces.length; i++ ) 
	{
		face = graphGeometry.faces[ i ];
		numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
		for( var j = 0; j < numberOfSides; j++ ) 
		{
			vertexIndex = face[ faceIndices[ j ] ];
			face.vertexColors[ j ] = graphGeometry.colors[ vertexIndex ];
		}
	}
	///////////////////////
	// end vertex colors //
	///////////////////////
	*/

function createWireFrame (f, color, dx, dy) {

	var wireFrame = new THREE.Object3D();

	var material = new THREE.LineBasicMaterial( { color: color } );	
	var geometry = new THREE.Geometry();
	var zFunc = Parser.parse(f).toJSFunction(['x', 'y']);

	for(var i = viewingWindow.xMin; i <= viewingWindow.xMax; i += dx) {
		geometry = new THREE.Geometry();
		for(var j = viewingWindow.yMin; j <= viewingWindow.yMax; j += dx) {
			var z = zFunc(i, j);
			if(z <= viewingWindow.zMax && z >= viewingWindow.zMin) {
				geometry.vertices.push(sCoord(i, j, z));
			}
			wireFrame.add(new THREE.Line(geometry, material));
		}
	}
	
	for(var j = viewingWindow.yMin; j <= viewingWindow.yMax; j += dy) {
		geometry = new THREE.Geometry();
		for(var i = viewingWindow.xMin; i <= viewingWindow.xMax; i += dy) {
			var z = zFunc(i, j);
			if(z <= viewingWindow.zMax && z >= viewingWindow.zMin) {
				geometry.vertices.push(sCoord(i, j, z));
			}
			wireFrame.add(new THREE.Line(geometry, material));
		}
	}
	
	return wireFrame;
}
	
class ParametricGraph {
	
	constructor (xFuncText, yFuncText, zFuncText, tMin, tMax, args) {
	
		if(args === undefined) {
			args = {};
		}
			
		this.color = args.color ? args.color : new THREE.Color('black');
		if(typeof this.color === 'string' || this.color instanceof String) {
			this.color = new THREE.Color(this.color);
		}
		this.visible = (args.visible !== undefined) ? args.visible : true;
		this.segments = args.segments ? args.segments : 200;
		this.radius = args.radius ? args.radius : 0.1;
		this.radialsegments = args.radialsegments ? args.radialsegments : 8;
		
		this.xFuncText = xFuncText;
		this.yFuncText = yFuncText;
		this.zFuncText = zFuncText;
		this.tMin = tMin;
		this.tMax = tMax;
	
		var tRange = tMax - tMin;
		
		var xFunc = Parser.parse(xFuncText).toJSFunction( ['t'] );
		var yFunc = Parser.parse(yFuncText).toJSFunction( ['t'] );
		var zFunc = Parser.parse(zFuncText).toJSFunction( ['t'] );

		function CustomCurve( scale ) {

			THREE.Curve.call( this );
			this.scale = ( scale === undefined ) ? 1 : scale;

		}

		CustomCurve.prototype = Object.create( THREE.Curve.prototype );
		CustomCurve.prototype.constructor = CustomCurve;

		CustomCurve.prototype.getPoint = function (t) {

			t = t * tRange + tMin;
			var tx = xFunc(t);
			var ty = yFunc(t);
			var tz = zFunc(t);

			return new THREE.Vector3( xCoord(tx), yCoord(ty), zCoord(tz));

		};
		
		var path = new CustomCurve( 1 );
		var geometry = new THREE.TubeGeometry( path, this.segments, this.radius, this.radialsegments, false );
	
		this.graph = createParametricMesh(geometry, this.color);
		
		this.graph.visible = this.visible;

	}
	
	getObject() { return this.graph; }

	setVisible(b) {
		this.visible = b;
		this.graph.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.graph.visible = this.visible;
	}

}	

class ParametricProjection {

	constructor(xFuncText, yFuncText, zFuncText, tMin, tMax, args) {
	
		if(args === undefined) {
			args = {};
		}
			
		this.color = args.color ? args.color : new THREE.Color('black');
		if(typeof this.color === 'string' || this.color instanceof String) {
			this.color = new THREE.Color(this.color);
		}
		this.visible = (args.visible !== undefined) ? args.visible : true;
		this.segments = args.segments ? args.segments : 200;
		this.radius = args.radius ? args.radius : 0.1;
		this.radialsegments = args.radialsegments ? args.radialsegments : 8;
		
		this.xFuncText = xFuncText;
		this.yFuncText = yFuncText;
		this.zFuncText = zFuncText;
		this.tMin = tMin;
		this.tMax = tMax;

		var tRange = tMax - tMin;
	
		var xFunc = Parser.parse(xFuncText).toJSFunction( ['t'] );
		var yFunc = Parser.parse(yFuncText).toJSFunction( ['t'] );
		var zFunc = Parser.parse(zFuncText).toJSFunction( ['x', 'y'] );


		function CustomCurve( scale ) {

			THREE.Curve.call( this );
			this.scale = ( scale === undefined ) ? 1 : scale;

		}

		CustomCurve.prototype = Object.create( THREE.Curve.prototype );
		CustomCurve.prototype.constructor = CustomCurve;

		CustomCurve.prototype.getPoint = function ( t ) {

			t = t * tRange + tMin;
			var tx = xFunc(t);
			var ty = yFunc(t);
			var tz = zFunc(tx, ty);

			return new THREE.Vector3( xCoord(tx), yCoord(ty), zCoord(tz));

		};

		var path = new CustomCurve( 1 );
		var geometry = new THREE.TubeGeometry( path, this.segments, this.radius, this.radialsegements, false );
		this.graph = createParametricMesh(geometry, this.color);
	
		this.graph.visible = this.visible;

	}
	
	getObject() { return this.graph; }

	setVisible(b) {
		this.visible = b;
		this.graph.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.graph.visible = this.visible;
	}
	
}

class PlaneSurface {
	
	constructor(type, location, args) {
		
		if(args === undefined) {
			args = {};
		}
		
		this.color = args.color ? args.color : new THREE.Color('purple');
		if(typeof this.color === 'string' || this.color instanceof String) {
			this.color = new THREE.Color(this.color);
		}
		this.visible = (args.visible !== undefined)? args.visible : true;
		this.type = type;
		this.location = location;
		
		var geometry = new THREE.PlaneGeometry(100, 100);
		this.plane = createTransparentMesh(geometry, this.color);
		this.plane.visible = this.visible;
		
		if(type == 'xy') {
			this.plane.lookAt(new THREE.Vector3(0, 0, 1));
			this.plane.position.z = zCoord(location);
		} else if(type == 'xz') {
			this.plane.lookAt(new THREE.Vector3(0, 1, 0));
			this.plane.position.y = yCoord(location);
		} else if(type == 'yz') {
			this.plane.lookAt(new THREE.Vector3(1, 0, 0));
			this.plane.position.x = xCoord(location);
		}
		
	}
	
	getObject() { return this.plane; }

	setVisible(b) {
		this.visible = b;
		this.plane.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.plane.visible = this.visible;
	}
	
	setLocation(loc) {
	
		this.location = loc;
	
		if(this.type == 'xy') {
			this.plane.position.z = zCoord(loc);
		} else if(this.type == 'xz') {
			this.plane.position.y = yCoord(loc);
		} else if(this.type == 'yz') {
			this.plane.position.x = xCoord(loc);
		}
	}
	
	
}

function Plane (a, b, c, d) {

	var dir = new THREE.Vector3(a, b, c);
	var centroid = new THREE.Vector3(0, 3, 0);
	var plane = new THREE.Plane();
	
	plane.setFromNormalAndCoplanarPoint(dir, centroid).normalize();

	// Create a basic rectangle geometry
	var planeGeometry = new THREE.PlaneGeometry(100, 100);

	// Align the geometry to the plane
	var coplanarPoint = new THREE.Vector3();
	plane.coplanarPoint(coplanarPoint);
	var focalPoint = new THREE.Vector3().copy(coplanarPoint).add(plane.normal);
	planeGeometry.lookAt(focalPoint);
	planeGeometry.translate(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);

	// Create mesh with the geometry
	return createTransparentMesh(planeGeometry, 0x00ffff);

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

function createTransparentMesh(geometry, color) {
	
	var upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
	var lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	var upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
	var lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);	
	var upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
	var lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);
	
    var meshMaterial = new THREE.MeshLambertMaterial({
		color: color, 
		clippingPlanes: [lowerXClip, upperXClip, lowerYClip, upperYClip, lowerZClip, upperZClip], 
		transparent: true,
		side: THREE.DoubleSide,
		opacity: .3
	});

	var mesh2material = new THREE.MeshBasicMaterial({
		color: color,
		clippingPlanes: [lowerXClip, upperXClip, lowerYClip, upperYClip, lowerZClip, upperZClip],
		transparent: true,
		side: THREE.DoubleSide,
		depthTest: false,
		opacity: 0.15
	});
		
	return new THREE.SceneUtils.createMultiMaterialObject(geometry, [meshMaterial, mesh2material]);
}

function createNormalMesh(geometry) {
	
	var upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
	var lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	var upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
	var lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);	
	var upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
	var lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);

    var meshMaterial = new THREE.MeshNormalMaterial({
		clippingPlanes: [lowerXClip, upperXClip, lowerYClip, upperYClip, upperZClip, lowerZClip], 
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.8
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createSolidColorMesh(geometry, color) {
	
	var upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
	var lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	var upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
	var lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);	
	var upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
	var lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);

    var meshMaterial = new THREE.MeshBasicMaterial({
		color: color,
		clippingPlanes: [lowerXClip, upperXClip, lowerYClip, upperYClip, upperZClip, lowerZClip], 
		side: THREE.DoubleSide,
		transparent: false,
		opacity: 1
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createBasicNoClipMesh(geometry, color) {

    var meshMaterial = new THREE.MeshBasicMaterial({
		color: color,
		side: THREE.DoubleSide,
		transparent: false,
		opacity: 1
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createShadedMesh(geometry, color) {
		
	upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
	lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
	lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);	
	upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
	lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);
	
    var meshMaterial = new THREE.MeshPhongMaterial({
		clippingPlanes: [upperZClip, lowerZClip, lowerXClip, upperXClip, lowerYClip, upperYClip], 
		side: THREE.DoubleSide,
		color: color
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createVertexColorMesh(geometry, color) {
	
	upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
	lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
	lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);	
	upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
	lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);
	
    var meshMaterial = new THREE.MeshBasicMaterial({
		clippingPlanes: [upperZClip, lowerZClip, lowerXClip, upperXClip, lowerYClip, upperYClip], 
		side: THREE.DoubleSide,
		color: color,
		vertexColors: THREE.VertexColors
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createBasicMesh(geometry) {
	
	upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
	lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
	lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);	
	upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
	lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);
	
    var meshMaterial = new THREE.MeshBasicMaterial({
		clippingPlanes: [upperZClip, lowerZClip, lowerXClip, upperXClip, lowerYClip, upperYClip]
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createParametricMesh(geometry, color) {

	upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
	upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);
	lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
	upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);
	lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
	
    var meshMaterial = new THREE.MeshBasicMaterial({
		color: color, 
		clippingPlanes: [upperZClip, lowerZClip, lowerXClip, upperXClip, lowerYClip, upperYClip]
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

class TextBox {

	constructor(position, message, args) {
	
		if(args === undefined) {
			args = {};
		}
	
		this.location = position;
		this.visible = args.hasOwnProperty("visible") ? args["visible"] : true;
	
		this.textbox = makeTextSprite(message, args);
		this.textbox.position.set(xCoord(position[0]), yCoord(position[1]), zCoord(position[2]));
		this.textbox.visible = this.visible;
		
	}

	getObject() { return this.textbox; }

	setVisible(b) {
		this.visible = b;
		this.textbox.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.textbox.visible = this.visible;
	}
	
	setLocation(loc) {
	
		this.location = loc;
		this.textbox.position.set(xCoord(position[0]), yCoord(position[1]), zCoord(position[2]));
	
	}

	getLocation() {
		return this.location;
	}

}


// This function was taken from Leon Strokowski's Polyhedra viewing example

function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 4;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
	if(typeof borderColor === 'string' || borderColor instanceof String) {
		borderColor = new THREE.Color(borderColor);
	}		
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 0.8 };
	if(typeof backgroundColor === 'string' || backgroundColor instanceof String) {
		backgroundColor = new THREE.Color(backgroundColor);
	}	

	var textColor = parameters.hasOwnProperty("textColor") ?
		parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
	if(typeof textColor === 'string' || textColor instanceof String) {
		textColor = new THREE.Color(textColor);
	}	

	var canvas = document.createElement('canvas');
	canvas.width = 1000;
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	//canvas.width = textWidth;
	
	// background color - alpha channel: 1.0
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a  + ")";

	// border color - alpha channel: 0.8
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color - alpha channel: 1.0
	context.fillStyle = "rgba(" + textColor.r + "," + textColor.g + ","
								+ textColor.b + "," + textColor.a + ")";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
	var sprite = new THREE.Sprite(spriteMaterial);
	sprite.scale.set(50,10,1);
	return sprite;	
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}

