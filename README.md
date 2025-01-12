# pShape

A lightweight JavaScript library for creating psuedo 3D polygonal shapes within an HTML canvas. 

![Looping GIF](https://raw.githubusercontent.com/blkbzt/pShapes/41a5e0dad09a2dd8a4c4ecb0de6995f06fa7a2f2/example-1.gif)
![Looping GIF](https://raw.githubusercontent.com/blkbzt/pShapes/b289b5c4199a8e9e601103a3eb3c04485bfa85e4/example-2.gif)

<sub>(examples not representative of true frame rate)</sub>

## Usage

To create a new animated polygon shape, instantiate a `pShape` object by passing a canvas element ID and an options object.

```js
new pShape(('myCanvas', {
    radius: 80,
    thickness: 20,
    number_of_sides: 14,
    speed_x: 2,
    speed_y: 0.25,
    top_fill: './coin-a.png',
    bottom_fill: './coin-b.png',
    side_fills: ['silver']
};
```

| Option             | Type     | Description                                                                                   | Default               |
|--------------------|----------|-----------------------------------------------------------------------------------------------|-----------------------|
| **canvas_id**      | string   | The ID of the `<canvas>` element (required).                                                  | -                     |
| **radius**         | number   | The radius of the polygon.                                                                     | `60`                  |
| **thickness**      | number   | The thickness of the shape’s extrusion.                                                        | `14`                  |
| **speed_x**        | number   | Horizontal movement speed.                                                                     | `2.00`                |
| **speed_y**        | number   | Vertical movement speed.                                                                       | `0.75`                |
| **number_of_sides**| number   | Number of sides for the polygon (`2 ≤ x ≤ 100`).                                        | `6`                   |
| **top_fill**       | string   | Fill color or image for the top face.                                                          | `'red'`               |
| **bottom_fill**    | string   | Fill color or image for the bottom face.                                                       | `'blue'`              |
| **side_fills**     | array    | An array of fill colors or image URLs for each side.                                           | `['yellow']`          |
| **image_smoothing**| boolean  | Enable or disable image smoothing.                                                             | `true`                |
| **smoothing_quality** | string | Quality of image smoothing (`'high'`, `'low'`).                                                | `'high'`              |
| **camera_direction**| object  | Direction of the camera with `x`, `y`, `z` values.                                             | `{x: 0, y: 0, z: -1}` |
