# pShape

A lightweight JavaScript library for creating and animating customizable polygonal shapes on an HTML canvas. 

![Looping GIF](https://raw.githubusercontent.com/blkbzt/pShapes/8ff5ab12369617f9acd5e213a19f9c2c0f630ca7/example.gif) 
![Looping GIF](https://raw.githubusercontent.com/blkbzt/pShapes/fe9ed34ddcb5c6f5dcf35bdc07c292f12815cd00/example2.gif)

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
