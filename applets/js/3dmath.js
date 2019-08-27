
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

var container, scene, camera, renderer, controls, stats, axes;

function init() {

	// SCENE 	
	scene = new THREE.Scene();

	// CAMERA 	
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;	
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	
	perspectivecamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	perspectivecamera.position.set(40,40,10);
	perspectivecamera.up.set(0, 0, 1);  // make sure z-axis is facing up
	scene.add(perspectivecamera);

	orthographiccamera = new THREE.OrthographicCamera(-50, 50, 30, -30, NEAR, FAR);
	orthographiccamera.position.set(40,40,10);
	orthographiccamera.up.set(0, 0, 1);  // make sure z-axis is facing up	
	scene.add(orthographiccamera);
		
	// Set up a light that follows the camera
	var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0,0,1);
	
	perspectivecamera.add(light);
	orthographiccamera.add(light);
	
	scene.add(new THREE.AmbientLight( 0xffffff ));
	
	perspectivecamera.lookAt(scene.position);	
	
	// RENDERER 	
	renderer = new THREE.WebGLRenderer( { antialias:true, alpha: true } );
	
	// Set background color as white
	renderer.setClearColor( 0xffffff ); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	renderer.sortObjects = false;
	renderer.localClippingEnabled = true;
	
	// attach div element to variable to contain the renderer
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	
	// EVENTS 	
	THREEx.WindowResize(renderer, perspectivecamera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
	// CONTROLS 
	perspectivecontrols = new THREE.OrbitControls( perspectivecamera, renderer.domElement );
	orthographiccontrols = new THREE.OrbitControls( orthographiccamera, renderer.domElement );
	
	// STATS 	
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
		
	// GUI

	var window_menu = gui.addFolder('Window Settings');
	window_menu.add(window_param, 'xmin').name('x Min');
	window_menu.add(window_param, 'xmax').name('x Max');
	window_menu.add(window_param, 'xscl').name('x Scale');
	window_menu.add(window_param, 'ymin').name('y Min');
	window_menu.add(window_param, 'ymax').name('y Max');
	window_menu.add(window_param, 'yscl').name('y Scale');
	window_menu.add(window_param, 'zmin').name('z Min');
	window_menu.add(window_param, 'zmax').name('z Max');
	window_menu.add(window_param, 'zscl').name('z Scale');
	window_menu.add(window_param, 'xygrid').name('Show XY Plane');
	window_menu.add(window_param, 'xzgrid').name('Show XZ Plane');
	window_menu.add(window_param, 'yzgrid').name('Show YZ Plane');
	window_menu.add(window_param, 'polargrid').name('Show Polar Plane');
	window_menu.add(window_param, 'labels').name('Show Labels');
	window_menu.add(window_param, 'activecamera', ['Perspective', 'Orthographic']).name('Camera Type');
	window_menu.add(window_param, 'updateWindow').name('Update Window');
	
	viewingWindow.setBounds(window_param.xmin, window_param.xmax, window_param.xscl, 
							window_param.ymin, window_param.ymax, window_param.yscl,
							window_param.zmin, window_param.zmax, window_param.zscl);
	
	axes = new Axes( { labels: window_param.labels, xygrid: window_param.xygrid, xzgrid: window_param.xzgrid, yzgrid: window_param.yzgrid, polargrid: window_param.polargrid} );
	addToScene(scene, axes);
	
	createScene();
}

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
			this.xStep = xStep < 0.1 ? 0.1 : xStep;
			this.xScale = 40 / (xMax - xMin);
			//this.xShift = (Math.abs(xMin) - Math.abs(xMax)) * this.xScale;

			//this.yShift = -2;
			this.yMin = yMin;
			this.yMax = yMax;
			this.yStep = yStep < 0.1 ? 0.1 : yStep;
			this.yScale = 40 / (yMax - yMin);
			//this.yShift = (Math.abs(yMin) - Math.abs(yMax)) * this.yScale;

			//this.zShift = this.zMin - zMin;
			this.zMin = zMin;
			this.zMax = zMax;
			this.zStep = zStep < 0.1 ? 0.1 : zStep;
			this.zScale = 40 / (zMax - zMin);
			//this.zShift = (Math.abs(zMin) - Math.abs(zMax)) * this.zScale;
			
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

var objectlist = [];

class Axes {

	constructor (args) {
		
		if(args === undefined) {
			args = {};
		}

		this.zaxis = (args.zaxis === undefined) ? true : args.zaxis;
		this.xygrid = (args.xygrid === undefined) ? true : args.xygrid;
		this.yzgrid = (args.yzgrid === undefined) ? false : args.yzgrid;
		this.xzgrid = (args.xzgrid === undefined) ? false : args.xzgrid;
		this.polargrid = (args.polargrid === undefined) ? false : args.polargrid;
		this.labels = (args.labels === undefined) ? true : args.labels;
		
		this.xaxiscolor = new THREE.Color('red');
		this.yaxiscolor = new THREE.Color('green');
		this.zaxiscolor = new THREE.Color('blue');
		this.gridcolor = new THREE.Color(0xe0e0e0);

		this.redraw();
			
	}
	
	setParameters(args) {

		this.zaxis = (args.zaxis === undefined) ? this.zaxis : args.zaxis;
		this.xygrid = (args.xygrid === undefined) ? this.xygrid : args.xygrid;
		this.yzgrid = (args.yzgrid === undefined) ? this.yzgrid : args.yzgrid;
		this.xzgrid = (args.xzgrid === undefined) ? this.xzgrid : args.xzgrid;
		this.polargrid = (args.polargrid === undefined) ? this.polargrid : args.polargrid;
		this.labels = (args.labels === undefined) ? this.labels : args.labels;

	}
	
	redraw() {
		
		this.axes = new THREE.Object3D();
	
		var origin = sCoord(0, 0, 0);
		var gridmaterial_noclip = new THREE.LineBasicMaterial( { color: this.gridcolor, linewidth: 1 });
		var gridmaterial = new THREE.LineBasicMaterial( { color: this.gridcolor, linewidth: 1, clippingPlanes: getClippingPlanes() });
		var gridgeometry = new THREE.Geometry();
	
		var xWidth = viewingWindow.xRange / viewingWindow.xStep;
		var yWidth = viewingWindow.yRange / viewingWindow.yStep;
		
		// Draw Axes
		
		this.axes.add(this.buildAxis(origin, sCoord(viewingWindow.xMax, 0, 0), this.xaxiscolor, false)); // +X
		this.axes.add(this.buildAxis(origin, sCoord(viewingWindow.xMin, 0, 0), this.xaxiscolor, true));  // -X
		this.axes.add(this.buildAxisCone(this.xaxiscolor, xCoord(viewingWindow.xMax), yCoord(0), zCoord(0), "x")); // x-axis cone
		if(this.labels) {
			var xlabel = this.makeTextSprite('x');
			xlabel.position.set(xCoord(viewingWindow.xMax)+1, yCoord(0), zCoord(0));
			this.axes.add(xlabel);
		}
		
		this.axes.add(this.buildAxis(origin, sCoord(0, viewingWindow.yMax, 0), this.yaxiscolor, false));   // +Y
		this.axes.add(this.buildAxis(origin, sCoord(0, viewingWindow.yMin, 0), this.yaxiscolor, true));    // -Y
		this.axes.add(this.buildAxisCone(this.yaxiscolor, xCoord(0), yCoord(viewingWindow.yMax), zCoord(0), "y")); // y-axis cone
		if(this.labels) {
			var ylabel = this.makeTextSprite('y');
			ylabel.position.set(xCoord(0), yCoord(viewingWindow.yMax)+1, zCoord(0));
			this.axes.add(ylabel);
		}
		
		if(this.zaxis) {
			this.axes.add(this.buildAxis(origin, sCoord(0, 0, viewingWindow.zMax), this.zaxiscolor, false));  // +Z
			this.axes.add(this.buildAxis(origin, sCoord(0, 0, viewingWindow.zMin), this.zaxiscolor, true));   // -Z
			this.axes.add(this.buildAxisCone(this.zaxiscolor,  xCoord(0), yCoord(0), zCoord(viewingWindow.zMax), "z")); // z-axis cone
			if(this.labels) {
				var zlabel = this.makeTextSprite('z');
				zlabel.position.set(xCoord(0), yCoord(0), zCoord(viewingWindow.zMax)+1);
				this.axes.add(zlabel);
			}
		}
    
		// Draw the x-y gridlines
	
		for(var i = viewingWindow.xMin; i <= viewingWindow.xMax; i += viewingWindow.xStep) {
			if(Math.abs(i) > 0.0001) { // Don't draw a gridline at zero, this covers the axis
				if(this.xygrid) {
					gridgeometry = new THREE.Geometry();
					gridgeometry.vertices.push(sCoord(i, viewingWindow.yMin, 0));
					gridgeometry.vertices.push(sCoord(i, viewingWindow.yMax, 0));
					this.axes.add(new THREE.Line(gridgeometry, gridmaterial_noclip));
				}
				if(this.labels) {
					var label = this.makeTextSprite(i);
					label.position.set(xCoord(i), yCoord(0), zCoord(0));
					this.axes.add(label);
				}
			}
		}
	
		for(var i = viewingWindow.yMin; i <= viewingWindow.yMax; i += viewingWindow.yStep) {
			if(Math.abs(i) > 0.0001) {
				if(this.xygrid) {
					gridgeometry = new THREE.Geometry();
					gridgeometry.vertices.push(sCoord(viewingWindow.xMin, i, 0));
					gridgeometry.vertices.push(sCoord(viewingWindow.xMax, i, 0));
					this.axes.add(new THREE.Line(gridgeometry, gridmaterial_noclip));
				}
			}
		}
	
		// x-z Gridlines
	
		for(var i = viewingWindow.zMin; i <= viewingWindow.zMax; i += viewingWindow.zStep) {
			if(Math.abs(i) > 0.0001) { // Don't draw a gridline at zero, this covers the axis
				if(this.xzgrid) {
					gridgeometry = new THREE.Geometry();
					gridgeometry.vertices.push(sCoord(viewingWindow.xMin, 0, i));
					gridgeometry.vertices.push(sCoord(viewingWindow.xMax, 0, i));
					this.axes.add(new THREE.Line(gridgeometry, gridmaterial_noclip));
				}
				if(this.labels) {
					var label = this.makeTextSprite(i);
					label.position.set(xCoord(0), yCoord(0), zCoord(i));
					this.axes.add(label);
				}
			}
		}
	
		for(var i = viewingWindow.xMin; i <= viewingWindow.xMax; i += viewingWindow.xStep) {
			if(Math.abs(i) > 0.0001) {
				if(this.xzgrid) {
					gridgeometry = new THREE.Geometry();
					gridgeometry.vertices.push(sCoord(i, 0, viewingWindow.zMin));
					gridgeometry.vertices.push(sCoord(i, 0, viewingWindow.zMax));
					this.axes.add(new THREE.Line(gridgeometry, gridmaterial_noclip));
				}
			}
		}
	
		// y-z Gridlines
	
		for(var i = viewingWindow.yMin; i <= viewingWindow.yMax; i += viewingWindow.yStep) {
			if(Math.abs(i) > 0.0001) {
				if(this.yzgrid) {
					gridgeometry = new THREE.Geometry();
					gridgeometry.vertices.push(sCoord(0, i, viewingWindow.zMin));
					gridgeometry.vertices.push(sCoord(0, i, viewingWindow.zMax));
					this.axes.add(new THREE.Line(gridgeometry, gridmaterial_noclip));
				}
				if(this.labels) {
					var label = this.makeTextSprite(i);
					label.position.set(xCoord(0), yCoord(i), zCoord(0));
					this.axes.add(label);
				}
			}
		}
	
		for(var i = viewingWindow.zMin; i <= viewingWindow.zMax; i += viewingWindow.zStep) {
			if(Math.abs(i) > 0.0001) { // Don't draw a gridline at zero, this covers the axis
				if(this.yzgrid) {
					gridgeometry = new THREE.Geometry();
					gridgeometry.vertices.push(sCoord(0, viewingWindow.yMin, i));
					gridgeometry.vertices.push(sCoord(0, viewingWindow.yMax, i));
					this.axes.add(new THREE.Line(gridgeometry, gridmaterial_noclip));
				}
			}
		}
	
		// Draw a Polar Grid in the x-y plane
		if(this.polargrid) {
		
			var nCircles = Math.max(Math.abs(viewingWindow.xMin), Math.abs(viewingWindow.xMax), Math.abs(viewingWindow.yMin), Math.abs(viewingWindow.yMax)) / viewingWindow.xStep; 
		
			// Draw the circles
			
			for(var i = 1; i <= nCircles; i += viewingWindow.xStep) {
				var curve = new THREE.EllipseCurve(
					0,  0,            // ax, aY
					xCoord(i),  yCoord(i),            // xRadius, yRadius
					0,  2 * Math.PI,  // aStartAngle, aEndAngle
					false,            // aClockwise
					0                 // aRotation
				);

				var points = curve.getPoints( 50 );
				var geometry = new THREE.BufferGeometry().setFromPoints( points );

				// Create the final object to add to the scene
				var ellipse = new THREE.Line( geometry, gridmaterial );
				this.axes.add(ellipse);
			}
		
			// Draw the lines for each 15 degree increment of theta
		
			var x_15 = nCircles * xCoord(Math.sqrt(2 + Math.sqrt(3)) / 2);
			var x_30 = nCircles * xCoord(Math.sqrt(3) / 2);
			var x_45 = nCircles * xCoord(1 / Math.sqrt(2));
			var x_60 = nCircles * xCoord(1/2);
			var x_75 = nCircles * xCoord((Math.sqrt(6) - Math.sqrt(2)) / 4);
		
			var y_15 = nCircles * yCoord(Math.sqrt(2 - Math.sqrt(3)) / 2);
			var y_30 = nCircles * yCoord(1/2);
			var y_45 = nCircles * yCoord(1 / Math.sqrt(2));
			var y_60 = nCircles * yCoord(Math.sqrt(3)/2);
			var y_75 = nCircles * yCoord((Math.sqrt(6) + Math.sqrt(2)) / 4);
		
			gridgeometry = new THREE.Geometry();
		
			gridgeometry.vertices.push(new THREE.Vector3(-x_15, -y_15, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_15, y_15, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_30, -y_30, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_30, y_30, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_45, -y_45, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_45, y_45, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
				
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_60, -y_60, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_60, y_60, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_75, -y_75, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_75, y_75, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_45, y_45, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_45, -y_45, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_30, y_30, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_30, -y_30, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_60, y_60, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_60, -y_60, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_15, y_15, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_15, -y_15, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
			gridgeometry = new THREE.Geometry();
			gridgeometry.vertices.push(new THREE.Vector3(-x_75, y_75, 0));
			gridgeometry.vertices.push(new THREE.Vector3(x_75, -y_75, 0));
			this.axes.add(new THREE.Line(gridgeometry, gridmaterial));
		
		}

		
	}
	
	getObject() {
		return this.axes;
	}
	
	buildAxis(src, dst, color, dashed) { 

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

	buildAxisCone(color, posX, posY, posZ, axis) {
	
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
	
	makeTextSprite(message, opts) {
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

		var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
		var sprite = new THREE.Sprite(spriteMaterial);
		sprite.scale.set(1.5, 1.5, 1.0);
		return sprite;
	}
	
}


class Point {

	constructor (coords, args) {
		
		if(coords === undefined) {
			console.warn('The coordinates of where to create the point must be specified');
			return;
		}		
		
		if(args === undefined) {
			args = {};
		}
				
		this.coords = coords;
		this.radius = args.radius ? args.radius : 0.2;
		this.color = args.color ? initColor(args.color) : 'black';
		this.visible = (args.visible !== undefined) ? args.visible : true;
	
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
	X() { return this.coords[0]; }
	Y() { return this.coords[1]; }
	Z() { return this.coords[2]; }
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
	
	redraw() {
		this.moveTo(this.coords);
	}

	
}

class Path {

	constructor (points, args) {
		
		if(points === undefined) {
			console.warn('The points for the path must be specified.');
			return;
		}		
		
		if(args === undefined) {
			args = {};
		}
				
		this.points = points;
		this.type = args.type ? args.type : 'linear';
		this.color = args.color ? initColor(args.color) : 'black';
		this.visible = (args.visible !== undefined) ? args.visible : true;
	
		var geometry = new THREE.Geometry();
		for(var i = 0; i < this.points.length; i++) {
			geometry.vertices.push(sCoordV(this.points[i]));
		}
		
		var material = new THREE.LineBasicMaterial( { color: this.color } );
		this.path = new THREE.Line(geometry, material);
		
		this.path.visible = this.visible;
			
	}	

	getObject() {
		return this.path;
	}

	getVisible() { return this.visible; }
	
	setVisible(b) {
		this.visible = b;
		this.sphere.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.sphere.visible = this.visible;
	}
	
	redraw() {
		// TOOD: write up re-draw code
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
			this.color = args.color ? initColor(args.color) : this.color;
			this.visible = (args.visible == undefined) ? this.visible : args.visible;
		}	
	
		var geometry = new THREE.SphereGeometry(xCoord(this.radius), 32, 32);
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

class Lathe {

	constructor (xfunc, yfunc, tmin, tmax, axis, args) {
		
		if(args === undefined) {
			args = {};
		}
		
		this.angle = args.angle ? args.angle : 0.0001;
		this.dt = args.dt ? args.dt : 0.25;
		this.color = args.color ? initColor(args.color) : this.color;
		this.visible = (args.visible !== undefined) ? args.visible : true;
		this.connect = args.connect ? args.connect : 'none';
	
		this.xfunc = xfunc;
		this.yfunc = yfunc;
		this.tmin = tmin;
		this.tmax = tmax;
		this.axis = axis;
	
		this.drawLathe()
		
		this.lathe.visible = this.visible;
			
	}
	
	drawLathe() {		
	
		this.points = [];
		
		// Set up first point to contact axis, this makes the object look solid
		if(this.connect == 'x') {
			if(this.axis == 'x') {
				this.points.push(new THREE.Vector2(xCoord(0), yCoord(this.tmin)));
			} else if(this.axis == 'y') {
				this.points.push(new THREE.Vector2(xCoord(this.tmin), yCoord(0)));
			}
		} else if(this.connect == 'y') {
			if(this.axis == 'x') {
				this.points.push(new THREE.Vector2(xCoord(0), yCoord(this.tmin)));
			} else if(this.axis == 'y') {
				this.points.push(new THREE.Vector2(xCoord(this.tmin), yCoord(0)));
			}
		}
		
		for(var t = this.tmin; t <= this.tmax; t += this.dt ) {
			var x = math.eval(this.xfunc, { t: t });
			var y = math.eval(this.yfunc, { t: t });
			if(this.axis == 'x') {
				this.points.push(new THREE.Vector2(xCoord(y), yCoord(x)));
			} else if(this.axis == 'y') {
				this.points.push(new THREE.Vector2(xCoord(x), yCoord(y)));
			}
		}
		
		var x = math.eval(this.xfunc, { t: this.tmax });
		var y = math.eval(this.yfunc, { t: this.tmax });
		if(this.axis == 'x') {
			this.points.push(new THREE.Vector2(xCoord(y), yCoord(x)));
		} else if(this.axis == 'y') {
			this.points.push(new THREE.Vector2(xCoord(x), yCoord(y)));
		}
		
		if(this.connect == 'x') {
			if(this.axis == 'x') {
				this.points.push(new THREE.Vector2(xCoord(0), yCoord(this.tmax)));
			} else if(this.axis == 'y') {
				this.points.push(new THREE.Vector2(xCoord(this.tmax), yCoord(0)));
			}
		} else if(this.connect == 'y') {
			if(this.axis == 'x') {
				this.points.push(new THREE.Vector2(xCoord(math.eval(this.yfunc, { t: this.tmax })), yCoord(0)));
			} else if(this.axis == 'y') {
				this.points.push(new THREE.Vector2(xCoord(0), yCoord(math.eval(this.yfunc, { t: this.tmax }))));
			}
		}
		
		// inputs: point list, number of segments, start angle, rotation angle
		if(this.axis == 'x') {
			var geometry = new THREE.LatheGeometry( this.points, 48, Math.PI / 2, this.angle );
			this.lathe = createDepthMesh(geometry, 0xff0000);
			this.lathe.applyMatrix( new THREE.Matrix4().makeRotationZ( -Math.PI / 2));
		} else if(this.axis == 'y') {
			var geometry = new THREE.LatheGeometry( this.points, 48, Math.PI / 2, this.angle );
			this.lathe = createDepthMesh(geometry, 0xff0000);
		}

	}
	
	getObject() { return this.lathe; }

	getVisible() { return this.visible; }
	
	setVisible(b) {
		this.visible = b;
		this.lathe.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.lathe.visible = this.visible;
	}
	
	setFunction(scene, xfunc, yfunc, tmin, tmax, dt) {
		scene.remove(this.lathe);
		this.xfunc = xfunc;
		this.yfunc = yfunc;
		this.tmin = tmin;
		this.tmax = tmax;
		this.dt = dt;
		this.drawLathe();
		scene.add(this.lathe);
	}
	
	setAxisOfRotation(scene, axis) {
		scene.remove(this.lathe);
		this.axis = axis;
		this.drawLathe();
		scene.add(this.lathe);
	}
	
	setConnect(scene, connect) {
		scene.remove(this.lathe);
		this.connect = connect;
		this.drawLathe();
		scene.add(this.lathe);
	}
	
	setAngle(scene, angle) {
		scene.remove(this.lathe);
		this.angle = angle;
		this.drawLathe();
		scene.add(this.lathe);
		
	}
	
	redraw() {
		this.drawLathe();
	}
	
}

class Vector {
	
	constructor (args) {

		if(args === undefined) {
			args = {};
		}

		this.start = args.start ? args.start : [0, 0, 0];
		this.end = args.end ? args.end : [1, 1, 1];	
		var from = sCoord(this.start[0], this.start[1], this.start[2]);
		var to = sCoord(this.end[0], this.end[1], this.end[2]);
		this.direction = to.clone().sub(from);
		this.length = args.length ? args.length : this.direction.length();
			
		this.color = args.color ? initColor(args.Color) : new THREE.Color('red');
		this.visible = (args.visible !== undefined) ? args.visible : true;
			
		this.headLengh = args.headLength ? args.headLength : 1;
		this.headWidth = args.headWidth ? args.headWidth : 0.5;
				
		this.vector = new THREE.ArrowHelper(this.direction.normalize(), from, this.length, this.color, this.headLength, this.headWidth );
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
		
		var from = sCoord(this.start[0], this.start[1], this.start[2]);
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
		
		this.vector.position.x = xCoord(coords[0]);
		this.vector.position.y = yCoord(coords[1]);
		this.vector.position.z = zCoord(coords[2]);

	}

	redraw() {
		this.setEndPoint(this.end);
		this.setStartPoint(this.start);
	}
	
}

class Line {
	
	constructor(args) {
		
		if(args === undefined) {
			args = {};
		}
		
		this.color = args.color ? initColor(args.color) : new THREE.Color('black');
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
		
		this.color = args.color ? initColor(args.color) : new THREE.Color('green');
		this.position = args.position ? args.position : [0, 0, 0];
		this.width = args.width ? args.width : 1;       // x dimension
		this.height = args.height ? args.height : 1;    // y dimension
		this.depth = args.depth ? args.depth : 1;       // z dimension
		this.visible = (args.visible == undefined) ? true : args.visible;
		
		var geometry = new THREE.BoxGeometry(xCoord(this.width), yCoord(this.height), zCoord(this.depth), 1, 1, 1);
		
		this.box = createTransparentMesh(geometry, this.color);
		this.box.translateX(xCoord(this.position[0]) + xCoord(this.width) / 2);
		this.box.translateY(yCoord(this.position[1]) + yCoord(this.height) / 2);
		this.box.translateZ(zCoord(this.position[2]) + zCoord(this.depth) / 2);

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
	
	setDepth(depth) {
	}
	
	setDimensions (length, height, depth) {
		setWidth(length);
		setHeight(height);
		setDepth(depth);
	}
	
	setPosition(coords) {
		
	}

}

/***********************************************************
**
** Creates a Quadrilateral in space using any 4 coordinates.
** It is assumed that the coordinates are making a convex
** figure.
**
** Usage:
**   q = new Quadrilateral(p1, p2, p3, p4, args)
**
**     where p1, p2, p3, p4 are 4 coordinates in space of
**        the form: p = [x, y, z]
**
**   args:
**     - color: eg 'green', '#00ff00', 0x00ff00
**     - visible: true/false
**
************************************************************/ 

class Quadrilateral {
	
	constructor(p1, p2, p3, p4, args) {
		
		if(args === undefined) {
			args = {};
		}
		
		this.color = args.color ? initColor(args.color) : new THREE.Color('green');
		this.visible = (args.visible == undefined) ? true : args.visible;
		
		var geometry = new THREE.Geometry();
		geometry.vertices = [ sCoordV(p1), sCoordV(p2), sCoordV(p3), sCoordV(p4) ];
		geometry.faces = [ new THREE.Face3(2, 0, 1), new THREE.Face3(3, 0, 2) ];
	
		this.quad = createTransparentMesh(geometry, this.color);

		this.quad.visible = this.visible;
		
	}
	
	getObject() {
		return this.quad;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.quad.visible = this.visible;
	}

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
		this.color = args.color ? initColor(args.color) : new THREE.Color('red');
			
		this.wireframevisible = (args.wireframevisible !== undefined) ? args.wireframevisible : false;
		this.wireframecolor = args.wireframecolor ? initColor(args.wireframecolor) : new THREE.Color('black');
		
		this.func = f;	
			
		this.skin = args.skin ? args.skin : 'transparent';	
		
		this.slices = args.slices ? args.slices : 60;
		this.stacks = args.stacks ? args.stacks : 60;
			
		this.visible = (args.visible !== undefined) ? args.visible : true;
		
		this.dx = args.dx ? args.dx : 1;
		this.dy = args.dy ? args.dy : this.dx;
		
    	var geometry = createSurfaceGeometry(this.func, this.slices, this.stacks); 
		
		if(this.skin == 'transparent') {
			this.surface = createTransparentMesh(geometry, this.color); 	
		} else if(this.skin == 'normal') {
			this.surface = createNormalMesh(geometry);
		} else if(this.skin == 'shaded') {
			this.surface = createShadedMesh(geometry, this.color);
		} else if(this.skin == 'phong') {
			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			this.surface = createPhongMesh(geometry, this.color);
		} else if(this.skin == 'solid') {
			this.surface = createSolidColorMesh(geometry, this.color);
		} else if(this.skin == 'rainbow') {
			this.surface = createRainbowMesh(geometry);
		} else if(this.skin == 'depth') {
			this.surface = createDepthMesh(geometry);
		}
		
		this.wireframe = createWireFrame(f, this.wireframecolor, this.dx, this.dy);
		this.wireframe.visible = this.wireframevisible;
		this.surface.add(this.wireframe);
		//this.surface.children
		
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
	
	setGridType(gridtype) {
		this.gridtype = gridtype;
	}
	
	redraw() {
		var geometry = createSurfaceGeometry(this.func, this.slices, this.stacks);
		
		if(this.skin == 'transparent') {
			this.surface = createTransparentMesh(geometry, this.color); 	
		} else if(this.skin == 'normal') {
			this.surface = createNormalMesh(geometry);
		} else if(this.skin == 'shaded') {
			this.surface = createShadedMesh(geometry, this.color);
		} else if(this.skin == 'phong') {
			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			this.surface = createPhongMesh(geometry, this.color);
		} else if(this.skin == 'solid') {
			this.surface = createSolidColorMesh(geometry, this.color);
		}
		
		this.wireframe = createWireFrame(this.func, this.wireframecolor, this.dx, this.dy);
		this.wireframe.visible = this.wireframevisible;
		this.surface.add(this.wireframe);
		//this.surface.children
		
		this.surface.visible = this.visible;
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
			
		this.color = args.color ? initColor(args.color) : new THREE.Color('black');
		this.visible = (args.visible !== undefined) ? args.visible : true;
		this.segments = args.segments ? args.segments : 200;
		this.radius = args.radius ? args.radius : 0.1;
		this.radialsegments = args.radialsegments ? args.radialsegments : 8;
		this.density = args.density ? args.density : 0.1;
		
		this.xFuncText = xFuncText;
		this.yFuncText = yFuncText;
		this.zFuncText = zFuncText;
		this.tMin = tMin;
		this.tMax = tMax;
	
		this.redraw();

	}
	
	redraw() {
		
		this.graph = new THREE.Object3D();
		
		var tRange = this.tMax - this.tMin;
		var tScl = tRange / this.density;
		
		var xFunc = Parser.parse(this.xFuncText).toJSFunction( ['t'] );
		var yFunc = Parser.parse(this.yFuncText).toJSFunction( ['t'] );
		var zFunc = Parser.parse(this.zFuncText).toJSFunction( ['t'] );
		
		var geometry = new THREE.Geometry();
		for(var t = this.tMin; t <= this.tMax; t += this.density) {
			geometry.vertices.push(sCoord(xFunc(t), yFunc(t), zFunc(t)));

		}
	
		var material = new THREE.LineBasicMaterial( { color: this.color, clippingPlanes: getClippingPlanes() });

		this.graph.add(new THREE.Line(geometry, material));
		
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
			
		this.color = args.color ? initColor(args.color) : new THREE.Color('black');
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
	
	redraw() {
		
	}
	
}

class PathProjection {

	constructor(xFuncText, yFuncText, zFuncText, tMin, tMax, tStep, args) {
	
		if(args === undefined) {
			args = {};
		}
			
		this.color = args.color ? initColor(args.color) : new THREE.Color('black');
		this.visible = (args.visible !== undefined) ? args.visible : true;
		
		this.xFuncText = xFuncText;
		this.yFuncText = yFuncText;
		this.zFuncText = zFuncText;
		this.tMin = tMin;
		this.tMax = tMax;
	
		var xFunc = Parser.parse(xFuncText).toJSFunction( ['t'] );
		var yFunc = Parser.parse(yFuncText).toJSFunction( ['t'] );
		var zFunc = Parser.parse(zFuncText).toJSFunction( ['x', 'y'] );

		this.path = new THREE.Object3D();

		for(var t = tMin; t < tMax; t += tStep) {
		
			var x0 = xFunc(t);
			var y0 = yFunc(t);
			var z0 = zFunc(x0, y0);
			
			var x1 = xFunc(t + tStep);
			var y1 = yFunc(t + tStep);
			var z1 = zFunc(x1, y1);
			
			var quad = new Quadrilateral(
							[x0, y0,  0], [x1, y1, 0], 
							[x1, y1, z1], [x0, y0, z0],
							{ color: this.color, visible: this.visible } );
			
			this.path.add(quad.getObject());
			
		}

	}
	
	getObject() { return this.path; }

	setVisible(b) {
		for(var i = 0; i < this.path.children.length; i++) {
			this.path.children[i].visible = b;
		}
		this.visible = b;
	}
	
	toggleVisible() {
		this.visible = !this.visible;
		this.setVisible(this.visible);
	}
	
}

class PlaneSurface {
	
	constructor(type, location, args) {
		
		if(args === undefined) {
			args = {};
		}
		
		this.color = args.color ? initColor(args.color) : new THREE.Color('purple');
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
	
    var meshMaterial = new THREE.MeshLambertMaterial({
		color: color, 
		clippingPlanes: getClippingPlanes(), 
		transparent: true,
		side: THREE.DoubleSide,
		opacity: .3
	});

	var mesh2material = new THREE.MeshBasicMaterial({
		color: color,
		clippingPlanes: getClippingPlanes(),
		transparent: true,
		side: THREE.DoubleSide,
		depthTest: false,
		opacity: 0.15
	});
		
	return new THREE.SceneUtils.createMultiMaterialObject(geometry, [meshMaterial, mesh2material]);
}

function createNormalMesh(geometry) {

    var meshMaterial = new THREE.MeshNormalMaterial({
		clippingPlanes: getClippingPlanes(), 
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.8
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createSolidColorMesh(geometry, color) {

    var meshMaterial = new THREE.MeshBasicMaterial({
		color: color,
		clippingPlanes: getClippingPlanes(), 
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

function createShadedMesh(geometry, color, gridtype) {
	
    var meshMaterial = new THREE.MeshPhongMaterial({
		clippingPlanes: getClippingPlanes(), 
		side: THREE.DoubleSide,
		specular: 0x555555,
		transparent: true,
		opacity: 0.6,
		color: color
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createRainbowMesh(geometry) {
	
	///////////////////////////////////////////////
	// calculate vertex colors based on Z values //
	///////////////////////////////////////////////
	geometry.computeBoundingBox();
	//var zMin = geometry.boundingBox.min.z;
	//var zMax = geometry.boundingBox.max.z;
	var zMin = viewingWindow.zMin * viewingWindow.zScale + viewingWindow.zShift;
	var zMax = viewingWindow.zMax * viewingWindow.zScale + viewingWindow.zShift;
	var zRange = zMax - zMin;
	var color, point, face, numberOfSides, vertexIndex;
	// faces are indexed using characters
	var faceIndices = [ 'a', 'b', 'c', 'd' ];
	// first, assign colors to vertices as desired
	for ( var i = 0; i < geometry.vertices.length; i++ ) 
	{
		point = geometry.vertices[ i ];
		color = new THREE.Color( 0x00ff00 );
		color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
		//color.setRGB(0, 0.75 * (point.z - zMin)/zRange, 0);
		geometry.colors[i] = color; // use this array for convenience
	}
	// copy the colors as necessary to the face's vertexColors array.
	for ( var i = 0; i < geometry.faces.length; i++ ) 
	{
		face = geometry.faces[ i ];
		numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
		for( var j = 0; j < numberOfSides; j++ ) 
		{
			vertexIndex = face[ faceIndices[ j ] ];
			face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
		}
	}
	///////////////////////
	// end vertex colors //
	///////////////////////
	
	var rainbowMaterial = new THREE.MeshBasicMaterial({
		vertexColors: THREE.VertexColors,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.75,
		clippingPlanes: getClippingPlanes()
	});
	
	graphMesh = new THREE.Mesh( geometry, rainbowMaterial );

	return graphMesh;
	
}

function createDepthMesh(geometry) {
	
	///////////////////////////////////////////////
	// calculate vertex colors based on Z values //
	///////////////////////////////////////////////
	geometry.computeBoundingBox();
	//var zMin = geometry.boundingBox.min.z;
	//var zMax = geometry.boundingBox.max.z;
	var zMin = viewingWindow.zMin * viewingWindow.zScale + viewingWindow.zShift;
	var zMax = viewingWindow.zMax * viewingWindow.zScale + viewingWindow.zShift;
	var zRange = zMax - zMin;
	var color, point, face, numberOfSides, vertexIndex;
	// faces are indexed using characters
	var faceIndices = [ 'a', 'b', 'c', 'd' ];
	// first, assign colors to vertices as desired
	for ( var i = 0; i < geometry.vertices.length; i++ ) 
	{
		point = geometry.vertices[ i ];
		color = new THREE.Color( 0x00ff00 );
		//color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
		color.setRGB(0, 0.75 * (point.z - zMin)/zRange, 0);
		geometry.colors[i] = color; // use this array for convenience
	}
	// copy the colors as necessary to the face's vertexColors array.
	for ( var i = 0; i < geometry.faces.length; i++ ) 
	{
		face = geometry.faces[ i ];
		numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
		for( var j = 0; j < numberOfSides; j++ ) 
		{
			vertexIndex = face[ faceIndices[ j ] ];
			face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
		}
	}
	///////////////////////
	// end vertex colors //
	///////////////////////
	
	var rainbowMaterial = new THREE.MeshBasicMaterial({
		vertexColors: THREE.VertexColors,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.75,
		clippingPlanes: getClippingPlanes(),
	});
	
	var mesh2material = new THREE.MeshBasicMaterial({
		color: new THREE.Color('black'),
		clippingPlanes: getClippingPlanes(),
		side: THREE.DoubleSide,
		wireframe: true
	});
		
	return new THREE.SceneUtils.createMultiMaterialObject(geometry, [rainbowMaterial, mesh2material]);
	
	//graphMesh = new THREE.Mesh( geometry, rainbowMaterial );

	//return graphMesh;
	
}

function createPhongMesh(geometry, color) {
	
    var meshMaterial = new THREE.MeshPhongMaterial({
		clippingPlanes: getClippingPlanes(), 
		side: THREE.DoubleSide,
		color: color,
		specular: 0x080808,
		//vertexColors: THREE.VertexColors,
		transparent: true,
		opacity: 0.75,
		//polygonOffset: true,  
		//polygonOffsetUnits: 1,
		//polygonOffsetFactor: 1
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createBasicMesh(geometry) {
	
    var meshMaterial = new THREE.MeshBasicMaterial({
		clippingPlanes: getClippingPlanes()
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function createParametricMesh(geometry, color) {
	
    var meshMaterial = new THREE.MeshBasicMaterial({
		color: color, 
		clippingPlanes: getClippingPlanes()
	});
		
	return new THREE.Mesh(geometry, meshMaterial);
}

function getClippingPlanes() {
	
	if(viewingWindow.xMin == 0) {
		var upperXClip = new THREE.Plane(new THREE.Vector3( -1, 0, 0), xCoord(viewingWindow.xMax));
		var lowerXClip = new THREE.Plane(new THREE.Vector3(  1, 0, 0), xCoord(viewingWindow.xMin));
	} else {
		var upperXClip = new THREE.Plane( sCoord(-viewingWindow.xMax, 0, 0), 1);
		var lowerXClip = new THREE.Plane( sCoord(-viewingWindow.xMin, 0, 0), 1);
	}
	
	if(viewingWindow.yMin == 0) {
		var upperYClip = new THREE.Plane(new THREE.Vector3( 0, -1, 0), yCoord(viewingWindow.yMax));
		var lowerYClip = new THREE.Plane(new THREE.Vector3( 0,  1, 0), yCoord(viewingWindow.yMin));
	} else {
		var upperYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMax, 0), 1);
		var lowerYClip = new THREE.Plane( sCoord(0, -viewingWindow.yMin, 0), 1);
	}
	
	if(viewingWindow.zMin == 0) {
		var upperZClip = new THREE.Plane(new THREE.Vector3( 0, 0, -1), zCoord(viewingWindow.zMax));
		var lowerZClip = new THREE.Plane(new THREE.Vector3( 0, 0,  1), zCoord(viewingWindow.zMin));
	} else {
		var upperZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMax), 1);
		var lowerZClip = new THREE.Plane( sCoord(0, 0, -viewingWindow.zMin), 1);
	}
	 
	return [lowerZClip, upperZClip, lowerXClip, upperXClip, lowerYClip, upperYClip];
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

/***********************************************************
**
** Adds a 3D object to a scene. This is just a helper
** function so that you don't have to remember to call
** .getObject() every time you add an object.
**
** Warns the user that the scene has to be specified first
** in order for an object to be added to the scene.
**
************************************************************/ 

function addToScene(scene, obj) {
	if(scene instanceof THREE.Scene) {
		scene.add(obj.getObject());
		objectlist.push(obj);
	} else {
		console.warn('Two parameters expected for addToScene. First must be "scene"!');
	}
}

/***********************************************************
**
** Initializes a color object, allowing the user to 
** specify the color either by a string: '#00FF00', by a 
** number: 0x00ff00, by the name of a color: 'green', or
** by a pre-defined THREE.Color object. If none of these
** fit, a default color of black is assigned.
**
************************************************************/

function initColor(color) {
	if(typeof color === 'string') {
		color = new THREE.Color(color);
	} else if(typeof color === 'number') {
		color = new THREE.Color(color);
	} else if(!(color instanceof THREE.Color)) {
		color = new THREE.Color(0x000000);
	} 
	return color;
}

