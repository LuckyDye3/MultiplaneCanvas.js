var MultiplaneCanvas = function MultiplaneCanvas(_canvas_ele, fps) {

	var FPS = fps || 24;

	var canvas = _canvas_ele || document.querySelector("canvas");
	var context = canvas.getContext("2d");

	var camera = new Camera(400, 200);
	var scene = new Scene(canvas.width, canvas.height, camera, context);

	canvas.addEventListener("mousemove", function(e) {
		var x = (e.clientX * -1 + (canvas.width/2)) * 0.15;
		var y = (e.clientY * -1 + (canvas.height/2)) * 0.15;
		camera.adjust(x, y);
	})

	window.onscroll = function(e) {
		camera.adjust(0, window.scrollY/5);
	}

	function render() {
		context.clearRect(0, 0, canvas.width, canvas.height)
		scene.render()
	}

	var interval = 1000/FPS;
	var last_tick = performance.now();
	var tick;
	var delta;

	function animate() {
		requestAnimationFrame(animate)

		tick = performance.now();
		delta = tick - last_tick;

		if(delta > interval) {
			scene.setAxis(canvas.width, canvas.height)
			render()

			last_tick = tick - (delta % interval);
		}

	}
	animate()

	return {
		'scene': scene,
		'camera': camera
	};

}

var Scene = function(w, h, camera, context) {

	this.geo = [];
	this.camera = camera;

	this.context = context;
	this.canvas = this.context.canvas;

	this.setAxis = function(w, h) {
		this.axis = new Vector(w/2, h/2, 0)
	}

	this.setAxis(w, h)

	this.render = function() {

		this.camera.update()

		for( var obj of this.geo) {
			if(obj.visible) {

				var x = this.axis.x + obj.position.x + this.camera.position.x * (obj.position.z);
				var y = this.axis.y + obj.position.y + this.camera.position.y * (obj.position.z);

				// alpha
				this.context.globalAlpha = obj.alpha;

				switch (obj.constructor.name) {
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

	this.add = function(geo) {
		this.geo.push(geo)
	}

	this.loadFromJson = function(jsonScene) {
		var objects = jsonScene.objects;
		for( var obj of objects ) {
			var pos = obj.position;
			var imagePlane = new ImagePlane(pos.x, pos.y, pos.z, obj.scale, obj.image, obj.alpha);
			this.add(imagePlane);
		}
	}

}

var ImagePlane = function(x, y, z, scale, img, alpha) {

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

		this.position = {
			x: x - (this.width/2),
			y: y - (this.height/2),
			z: z
		}

		this.visible = true;

	}).bind(this)

}

var Camera = function(x, y) {

	this.position = new Vector(x || 0, y || 0, 0)

	this.nextPosition = new Vector(0, 0, 0)
	this.lastPosition = new Vector(0, 0, 0)

	this.force = new Vector(0, 0, 0);

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
		var nextPos = new Vector(x, y, z)
		this.lastPosition = this.position;
		this.nextPosition = nextPos;
	}

	this.adjust = function(x, y, z) {
		this.force.x = x;
		this.force.y = y;
		this.force.z = z;
	}

}

var Vector = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
