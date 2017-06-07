"use strict";

let MultiplaneCanvas = (function() {

    class MultiplaneCanvas {

        constructor(args = {}) {

            let canvas = args.canvas || document.querySelector("canvas");
            let context = canvas.getContext("2d");

            this.FPS = args.fps || 30
            this.waitForAssets = args.waitForAssets;
            this.scene = new Scene(canvas.width, canvas.height, context, this.waitForAssets)
            this.reactOnScroll = args.reactOnScroll || false
            this.reactOnMouse = args.reactOnMouse || false
            this.onRender = args.onRender || (function(){})

            let scene = this.scene;
            let camera = this.scene.camera;

            const onMouseOver = (e) => {
                if(this.reactOnMouse) {
                    let x = -(e.clientX - (canvas.clientWidth/2)) * 0.15;
                    let y = -(e.clientY - (canvas.clientHeight/2)) * 0.2;
                    camera.adjust(x, y);
                }
            }
            canvas.addEventListener("mousemove", onMouseOver.bind(this))

            const onScroll = (e) => {
                if(this.reactOnScroll) {
                    camera.adjust(0, -window.scrollY/2);
                }
            }
            window.addEventListener("scroll", onScroll.bind(this))

            let last_tick = performance.now()
            let delta
            let interval = 1000/this.FPS
            let emitEvent = this

            function render(tick) {
                context.clearRect(0, 0, canvas.width, canvas.height)
                scene.render()
                emitEvent.onRender(tick)
            }

            function animate(tick) {
                requestAnimationFrame(animate.bind(this))

                delta = tick - last_tick;
                if(delta > interval) {
                    scene.setAxis(canvas.width, canvas.height)
                    render(tick)
                    last_tick = tick - (delta % interval)
                }
            }
            animate()
        }

		static get Camera() { return Camera }

		static get ImagePlane() { return ImagePlane }

		static get Vector() { return Vector }

    }

    class Scene {
        constructor(w, h, context = {}, cache) {
            this.camera = new Camera();
        	this.context = context;
        	this.canvas = this.context.canvas;
        	this.cacheScene = cache;
        	this.planes = [];

        	this.setAxis(w, h)

        	this.cached = false;
        }

    	render() {
    		if(this.cached || !this.cacheScene) {

    			for( let obj of this.planes ) {

    				this.context.globalAlpha = obj.alpha;

    				let x = this.axis.x + obj.position.x + this.camera.getPosition().x * (obj.position.z);
    				let y = this.axis.y + obj.position.y + this.camera.getPosition().y * (obj.position.z);

    				obj.draw(x, y, this.context)
    			}

    			this.camera.update()

    		} else {
    			this.isCached();
    		}
    	}

    	isCached() {
    		let results = false;
    		for( let obj of this.planes ) {
    			if(!obj.cached) {
    				return false;
    			}
    		}
    		this.cached = true;
    		return results;
    	}

    	add(obj) {
    		this.planes.push(obj)
    	}

    	loadFromJson(jsonScene) {
    		let objects = jsonScene.objects;
    		let camera = jsonScene.camera;
    		if(camera) {
    			this.camera.setPosition(camera.x, camera.y)
    		}
    		for( let obj of objects ) {
    			let pos = obj.position;
    			let imagePlane = new ImagePlane(pos.x, pos.y, pos.z, obj.scale, obj.image, obj.alpha, obj.animation);
    			this.add(imagePlane);
    		}
    	}

        setAxis(w, h) {
            this.axis = new Vector(w/2, h/2, 0)
        }

    }

    class Camera {

        constructor(x, y, z) {
            this.position = new Vector(x || 0, y || 0, z || 0)
        	this.force = new Vector(0, 0, 0);

        	this.nextPosition = new Vector(0, 0, 0)
        	this.lastPosition = new Vector(0, 0, 0)
        }

        update() {

            let distX = this.nextPosition.x - this.lastPosition.x;
            let distY = this.nextPosition.y - this.lastPosition.y;

            this.position.x += (distX + this.force.x) / 24;
            this.position.y += (distY + this.force.y) / 24;
        }

        move(x, y, z) {
            x = x || 0;
            y = y || 0;
            let nextPos = new Vector(x, y, z)
            this.lastPosition = this.position;
            this.nextPosition = nextPos;
        }

        adjust(x, y, z) {
            this.force.x = x;
            this.force.y = y;
            this.force.z = z;
        }

        getPosition() {
            return new Vector( this.position.x, this.position.y );
        }

        setPosition(x, y) {
            this.position.x = x;
            this.position.y = y;
        }
    }

    class ImagePlane {

        constructor(x, y, z, scale, img, alpha = 1, animation) {

            this.animation = animation ? {
                cycle: 0,
                frames: animation.frames,
                width: animation.width
            } : false;

        	this.position = new Vector(x, y, z);
            this.scale = scale;

        	this.color = "green";
        	this.alpha = alpha;

        	this.image = new Image();
        	this.image.src = img;

        	this.image.onload = () => {

                let aspect_ratio = this.image.width / this.image.height;

        		this.width = this.scale * this.position.z;
        		this.height = (this.scale / aspect_ratio) * this.position.z;

        		this.position.x -= (this.width/2);
        		this.position.y -= (this.height/2);

                this.cached = true;
            }

        }

        draw(x, y, ctx) {
            if(!this.animation) {
                ctx.drawImage(this.image, x, y, this.width, this.height);
            } else {
                ctx.drawImage(
                    this.image,
                    this.animation.cycle * this.image.width / this.animation.frames,
                    0,
                    this.image.width / this.animation.frames,
                    this.image.height,
                    x,
                    y,
                    this.width / this.animation.frames,
                    this.height
                )
                this.animate()
            }
        }

        animate() {
            if(this.animation.cycle < this.animation.frames-1) {
                this.animation.cycle++;
            } else {
                this.animation.cycle = 0;
            }
        }

    }

    class Vector {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    return MultiplaneCanvas

})()

module.exports = MultiplaneCanvas;
