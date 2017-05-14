"use strict";

function MultiplaneCanvas(args) {

	var args = args || {}

	var FPS = args.fps || 60;
	var canvas = args.canvas || document.querySelector("canvas");
	var context = canvas.getContext("2d");

	this.scene = new MultiplaneCanvas.Scene(canvas.width, canvas.height, context);
	this.reactOnScroll = args.reactOnScroll || false;
	this.reactOnMouse = args.reactOnMouse || false;

	var scene = this.scene;
	var camera = this.scene.camera;

	var onMouseOver = function(e) {
		if(this.reactOnMouse) {
			var x = (e.clientX * -1 + (canvas.width/2)) * 0.15;
			var y = (e.clientY * -1 + (canvas.height/2)) * 0.15;
			camera.adjust(x, y);
		}
	}

	canvas.addEventListener("mousemove", onMouseOver.bind(this))

	var onScroll = function(e) {
		if(this.reactOnScroll) {
			camera.adjust(0, window.scrollY/5);
		}
	}

	window.addEventListener("scroll", onScroll.bind(this))

	function render() {
		context.clearRect(0, 0, canvas.width, canvas.height)
		scene.render()
	}

	var interval = 1000/FPS;
	var last_tick = performance.now();
	var tick;
	var delta;

	function animate(tick) {
		requestAnimationFrame(animate)

		delta = tick - last_tick;
		if(delta > interval) {
			scene.setAxis(canvas.width, canvas.height)
			render()
			last_tick = tick - (delta % interval);
		}
	}
	animate()
}

MultiplaneCanvas.Scene = function(w, h, context) {

	this.camera = new MultiplaneCanvas.Camera();
	this.context = context;
	this.canvas = this.context.canvas;

	var geo = [];

	var axis;
	this.setAxis = function(w, h) {
		axis = new MultiplaneCanvas.Vector(w/2, h/2, 0)
	}
	this.setAxis(w, h)

	this.render = function() {

		this.camera.update()

		for( var obj of geo) {
			if(obj.visible) {

				this.context.globalAlpha = obj.alpha;

				var x = axis.x + obj.position.x + this.camera.position.x * (obj.position.z);
				var y = axis.y + obj.position.y + this.camera.position.y * (obj.position.z);

				switch (obj.type) {
					case "ImagePlane":
						this.context.drawImage(obj.image, x, y, obj.width, obj.height);
						break;
					default:
						this.context.fillStyle = obj.color;
						this.context.fillRect(x, y, obj.width, obj.height);
				}

			}
		}

	}

	this.add = function(obj) {
		geo.push(obj)
	}

	this.loadFromJson = function(jsonScene) {
		var objects = jsonScene.objects;
		var camera = jsonScene.camera;
		if(camera) {
			this.camera.position.x = camera.x;
			this.camera.position.y = camera.y;
		}
		for( var obj of objects ) {
			var pos = obj.position;
			var imagePlane = new MultiplaneCanvas.ImagePlane(pos.x, pos.y, pos.z, obj.scale, obj.image, obj.alpha);
			this.add(imagePlane);
		}
	}

}

MultiplaneCanvas.ImagePlane = function(x, y, z, scale, img, alpha) {

	this.type = "ImagePlane";

	this.visible = false;

	this.color = "green";
	this.alpha = alpha || 1;

	this.image = new Image();
	this.image.src = img;

	this.image.onload = (function() {

		this.scale = scale;
		this.aspect_ratio = this.image.width / this.image.height;

		this.width = (this.scale * z);
		this.height = (this.scale * z) / this.aspect_ratio;

		this.position = new MultiplaneCanvas.Vector(x - (this.width/2), y - (this.height/2), z);

		this.visible = true;

	}).bind(this)
}

MultiplaneCanvas.Camera = function(x, y) {

	this.position = new MultiplaneCanvas.Vector(x || 0, y || 0, 0)

	this.nextPosition = new MultiplaneCanvas.Vector(0, 0, 0)
	this.lastPosition = new MultiplaneCanvas.Vector(0, 0, 0)

	this.force = new MultiplaneCanvas.Vector(0, 0, 0);

	this.updateCylce = 0;
	this.update = function() {

		var distX = this.nextPosition.x - this.lastPosition.x;
		var distY = this.nextPosition.y - this.lastPosition.y;

		this.position.x += (distX + this.force.x) / 24;
		this.position.y += (distY + this.force.y) / 24;

		this.updateCylce++;
	}

	this.move = function(x, y, z) {
		var x = x || 0;
		var y = y || 0;
		var nextPos = new MultiplaneCanvas.Vector(x, y, z)
		this.lastPosition = this.position;
		this.nextPosition = nextPos;
	}

	this.adjust = function(x, y, z) {
		this.force.x = x;
		this.force.y = y;
		this.force.z = z;
	}

}

MultiplaneCanvas.Vector = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
