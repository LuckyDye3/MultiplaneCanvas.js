## MultiplaneCanvasJS

A lightweight JavaScript library for multi layered HTML5 Canvas Animation.

## Documentation

- [Usage](#Usage)
- [Documentation](#Documentation)
	- [MultiplaneCanvas.Scene](#MultiplaneCanvas.Scene)
    	- [.add()](#.add())
    	- [.loadFromJson()](#.loadFromJson())
	- [MultiplaneCanvas.Camera](#MultiplaneCanvas.Camera)
	- [MultiplaneCanvas.ImagePlane](#MultiplaneCanvas.ImagePlane)
	- [MultiplaneCanvas.Vector](#MultiplaneCanvas.Vector)

### Usage
___

```javascript
var multiplaneCanvas = new MultiplaneCanvas({
	canvas: document.querySelector("canvas"),
	fps: 48,
	reactOnScroll: true,
	reactOnMouse: true
})
```

To add Planes you can use [.add()](#.add()) or [.loadFromJson()](#.loadFromJson()).

* Available Arguments:
    * fps
    * canvas
    * waitForAssets
    * reactOnScroll
    * reactOnMouse

### Objects
___

#### MultiplaneCanvas.Scene

```javascript
new MultiplaneCanvas.Scene(width, height, context, cache);
```

- *__width and height__*\
	Width and height of the canvas.


- *__context__*\
	Canvas context.
    
    
- *__cache__*\
	If the animation should wait for the assets to load.

- __.add(ImagePlane)__\
  Add Planes to the Scene with a *[MultiplaneCanvas.ImagePlane](#MultiplaneCanvas.ImagePlane)*

  ```javascript
  var imagePLane = new MultiplaneCanvas.ImagePlane(130, -20, 10, 100, "./images/plane.png", 1);
  multiplaneCanvas.scene.add(imagePlane);
  ```
  
- __.loadFromJson(jsonObject)__\
  Load a scene from an JsonObject.

  ```javascript
  var multiplaneJsonScene = {
    "camera": {
      x: -200,
      y: 500
    },
    "objects": [
      {
        "scale": 100,
        "image": "./images/plane.png",
        "alpha": 1,
        "position": {
          "x": 130,
          "y": -20,
          "z": 10
        }
      }
    ]
  }
  
  multiplaneCanvas.scene.loadFromJson(multiplaneJsonScene);
  ```
    
#### MultiplaneCanvas.Camera

  ```javascript
  new MultiplaneCanvas.Camera(x, y, z)
  ```

  - *__x, y, z__*:\
  Postition of the camera.
    
#### MultiplaneCanvas.ImagePlane

  ```javascript
  new MultiplaneCanvas.ImagePlane(x, y, z, scale, img, alpha)
  ```

  - *__x, y, z__*:

  	Postition of the Plane.

  - *__scale__*:

  	Plane scale.

  - *__img__*:

  	Image url.

  - *__alpha (0 - 1)__*:

  	Transparency of the Plane.
    
#### MultiplaneCanvas.Vector

```javascript
new MultiplaneCanvas.Vector(x, y, z)
```

A simple Object to store location data.