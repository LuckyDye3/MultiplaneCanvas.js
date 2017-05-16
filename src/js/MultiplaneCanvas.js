"use strict";

function MultiplaneCanvas(args) {

	var args = args || {}

	var FPS = args.fps || 60;
	var canvas = args.canvas || document.querySelector("canvas");
	var context = canvas.getContext("2d");

	this.waitForAssets = args.waitForAssets || true;
	this.scene = new MultiplaneCanvas.Scene(canvas.width, canvas.height, context, this.waitForAssets);
	this.reactOnScroll = args.reactOnScroll || false;
	this.reactOnMouse = args.reactOnMouse || false;

	var scene = this.scene;
	var camera = this.scene.camera;

	var onMouseOver = function(e) {
		if(this.reactOnMouse) {
			var x = -(e.clientX - (canvas.clientWidth/2)) * 0.15;
			var y = -(e.clientY - (canvas.clientHeight/2)) * 0.2;
			camera.adjust(x, y);
		}
	}
	canvas.addEventListener("mousemove", onMouseOver.bind(this))

	var onScroll = function(e) {
		if(this.reactOnScroll) {
			camera.adjust(0, -window.scrollY/2);
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

MultiplaneCanvas.Scene = function(w, h, context, cache) {

	this.camera = new MultiplaneCanvas.Camera();
	this.context = context || {};
	this.canvas = this.context.canvas;
	this.cacheScene = cache || false;
	this.planes = [];

	var axis;
	this.setAxis = function(w, h) {
		axis = new MultiplaneCanvas.Vector(w/2, h/2, 0)
	}
	this.setAxis(w, h)

	var cached = false;

	this.render = function() {
		if(cached || !this.cacheScene) {

			for( var i = 0; i < this.planes.length; i++ ) {
				var obj = this.planes[i];

				this.context.globalAlpha = obj.alpha;

				var x = axis.x + obj.position.x + this.camera.getPosition().x * (obj.position.z);
				var y = axis.y + obj.position.y + this.camera.getPosition().y * (obj.position.z);

				switch (obj.type) {
					case "ImagePlane":
						this.context.drawImage(obj.image, x, y, obj.width, obj.height);
						break;
					default:
						this.context.fillStyle = obj.color;
						this.context.fillRect(x, y, obj.width, obj.height);
				}
			}

			this.camera.update()

		} else {
			this.isCached();
		}
	}

	this.isCached = function() {
		var results = false;
		for( var i = 0; i < this.planes.length; i++ ) {
			var obj = this.planes[i];
			if(!obj.cached) {
				return false;
			}
		}
		cached = true;
		return results;
	}

	this.add = function(obj) {
		this.planes.push(obj)
	}

	this.loadFromJson = function(jsonScene) {
		var objects = jsonScene.objects;
		var camera = jsonScene.camera;
		if(camera) {
			this.camera.setPosition(camera.x, camera.y)
		}
		for( var i = 0; i < objects.length; i++ ) {
			var obj = objects[i];
			var pos = obj.position;
			var imagePlane = new MultiplaneCanvas.ImagePlane(pos.x, pos.y, pos.z, obj.scale, obj.image, obj.alpha);
			this.add(imagePlane);
		}
	}

}

MultiplaneCanvas.ImagePlane = function(x, y, z, scale, img, alpha) {

	this.type = "ImagePlane";

	this.position = new MultiplaneCanvas.Vector(0,0,0);

	this.color = "green";
	this.alpha = alpha || 1;

	this.image = new Image();
	this.image.src = img;

	this.cached = false;

	this.image.onload = (function() {

		z = z / 100;

		this.scale = scale;
		var aspect_ratio = this.image.width / this.image.height;

		this.width = (this.scale * z);
		this.height = (this.scale * z) / aspect_ratio;

		this.position.x = x - (this.width/2);
		this.position.y = y - (this.height/2);
		this.position.z = z;

		this.cached = true;

	}).bind(this)
}

MultiplaneCanvas.Camera = function(x, y, z) {

	var position = new MultiplaneCanvas.Vector(x || 0, y || 0, z || 0)
	var force = new MultiplaneCanvas.Vector(0, 0, 0);

	var nextPosition = new MultiplaneCanvas.Vector(0, 0, 0)
	var lastPosition = new MultiplaneCanvas.Vector(0, 0, 0)

	this.update = function() {

		var distX = nextPosition.x - lastPosition.x;
		var distY = nextPosition.y - lastPosition.y;

		position.x += (distX + force.x) / 24;
		position.y += (distY + force.y) / 24;
	}

	this.move = function(x, y, z) {
		var x = x || 0;
		var y = y || 0;
		var nextPos = new MultiplaneCanvas.Vector(x, y, z)
		lastPosition = position;
		nextPosition = nextPos;
	}

	this.adjust = function(x, y, z) {
		force.x = x;
		force.y = y;
		force.z = z;
	}

	this.getPosition = function() {
		return new MultiplaneCanvas.Vector( position.x, position.y );
	}

	this.setPosition = function(x, y) {
		position.x = x;
		position.y = y;
	}

}

MultiplaneCanvas.Vector = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
