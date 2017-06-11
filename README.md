## MultiplaneCanvasJS

A lightweight JavaScript library for multi layered HTML5 Canvas Animation.

This project is licensed under the terms of the MIT license.

## Documentation

- [Usage](#usage)
- [Documentation](#documentation)
	- [MultiplaneCanvas.Scene](#multiplanecanvasscene)
    	- [.add()](#addimageplane)
    	- [.loadFromJson()](#loadfromjsonjsonobject)
	- [MultiplaneCanvas.Camera](#multiplanecanvascamera)
	- [MultiplaneCanvas.ImagePlane](#multiplanecanvasimageplane)
	- [MultiplaneCanvas.Vector](#multiplanecanvasvector)

### Usage
___

Import
```html
<script type="text/javascript" src="./path/to/MultiplaneCanvas.js"></script>
```

Use
```javascript
var multiplaneCanvas = new MultiplaneCanvas({
	canvas: document.querySelector("canvas"),
	fps: 48,
	reactOnScroll: true,
	reactOnMouse: true
})
```

To add Planes you can use [.add()](#addimageplane) or [.loadFromJson()](#loadfromjsonjsonobject).

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

- ##### *width and height*
	Width and height of the canvas.


- ##### *context*
	Canvas context.
    
    
- ##### *cache*
	If the animation should wait for the assets to load.

- ##### .add(ImagePlane)
  Add Planes to the Scene with a *[MultiplaneCanvas.ImagePlane](#MultiplaneCanvas.ImagePlane)*

  ```javascript
  var imagePLane = new MultiplaneCanvas.ImagePlane(130, -20, 10, 100, "./images/plane.png", 1);
  multiplaneCanvas.scene.add(imagePlane);
  ```
  
- ##### .loadFromJson(jsonObject)
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

  - ##### *x, y, z*
  	Postition of the camera.
    
#### MultiplaneCanvas.ImagePlane

  ```javascript
  new MultiplaneCanvas.ImagePlane(x, y, z, scale, img, alpha)
  ```

  - ##### *x, y, z*
  	Postition of the Plane.

  - ##### *scale*
  	Plane scale.

  - ##### *img*
  	Image url.

  - ##### *alpha (0 - 1)*
  	Transparency of the Plane.
    
#### MultiplaneCanvas.Vector

```javascript
new MultiplaneCanvas.Vector(x, y, z)
```

A simple Object to store location data.
