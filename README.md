# pShape

A lightweight JavaScript library for creating and animating customizable polygonal shapes on an HTML canvas.

## Examples

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
| **number_of_sides**| number   | Number of sides for the polygon (min: `2`, max: `100`).                                        | `6`                   |
| **top_fill**       | string   | Fill color or image for the top face.                                                          | `'red'`               |
| **bottom_fill**    | string   | Fill color or image for the bottom face.                                                       | `'blue'`              |
| **side_fills**     | array    | An array of fill colors or image URLs for each side.                                           | `['yellow']`          |
| **image_smoothing**| boolean  | Enable or disable image smoothing.                                                             | `true`                |
| **smoothing_quality** | string | Quality of image smoothing (`'high'`, `'low'`).                                                | `'high'`              |
| **camera_direction**| object  | Direction of the camera with `x`, `y`, `z` values.                                             | `{x: 0, y: 0, z: -1}` |


## License

```
MIT License

Copyright (c) 2024 Blank

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
