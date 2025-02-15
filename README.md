# pShapes.js

A lightweight JavaScript library for creating psuedo 3D polygonal shapes within a 2D HTML canvas.

![reg](https://img.shields.io/badge/Regular-14.76kb-brightgreen)
![min](https://img.shields.io/badge/Minified-7.39kb-brightgreen)

## Usage

To create a new animated polygon shape, instantiate a `pShape` object by passing a canvas element ID and an options object.

```js
new pShape(canvas_id, {
    width: 144,
    height: 144,
    length: 240,
    top_fill: './top.webp',
    bottom_fill: './bottom.webp',
    side_fill: ['./side.webp'],
    image_wrap: true,
    canvas_width: 600,
    canvas_height: 600
    // other options...
});
```

![Looping GIF](https://raw.githubusercontent.com/blkbzt/pShapes/41a5e0dad09a2dd8a4c4ecb0de6995f06fa7a2f2/example-1.gif)
![example](https://raw.githubusercontent.com/blkbzt/pShapes/b289b5c4199a8e9e601103a3eb3c04485bfa85e4/example-2.gif)

## Options

| Option             | Type            | Description                                                                                                                                  | Default                                              |
| ------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -----------------------------------------------------|
| `width`            | Number          | Width of the polygon face.                                                                                                                   | `144`                                                |
| `height`           | Number          | Height of the polygon face.                                                                                                                  | `144`                                                |
| `length`           | Number          | Extrusion length of the shape.                                                                                                               | `240`                                                |
| `num_sides`        | Number          | Number of sides for the polygon (must be between 2 and 100).                                                                                 | `100`                                                |
| `speed_x`          | Number          | Rotation speed around the x-axis.                                                                                                            | `2.0`                                                |
| `speed_y`          | Number          | Rotation speed around the y-axis.                                                                                                            | `0.25`                                               |
| `top_fill`         | String          | Fill color or image URL for the top face.                                                                                                    | `'red'`                                              |
| `bottom_fill`      | String          | Fill color or image URL for the bottom face.                                                                                                 | `'blue'`                                             |
| `side_fill`        | Array or Object | Fill(s) for the sides. See below for accepted formats.                                                                                       | `['green']` or `{1: 'red', 2: './image.png', ...} `  |
| `image_wrap`       | Boolean         | If true and a single image is provided in the `side_fill` array, the image is automatically split evenly across all sides.                   | `true`                                               |
| `image_smoothing`  | Boolean         | Enable or disable image smoothing for textures.                                                                                              | `true`                                               |
| `smoothing_quality`| String          | Quality of image smoothing. Accepts `'high'` or `'low'`.                                                                                     | `'high'`                                             |
| `canvas_width`     | Number or null  | Width of the canvas in pixels. If `null`, the canvas width is determined by its CSS style.                                                   | `null`                                               |
| `canvas_height`    | Number or null  | Height of the canvas in pixels. If `null`, the canvas height is determined by its CSS style.                                                 | `null`                                               |
| `resolution`       | Number          | Resolution scaling factor (useful for high-DPI displays).                                                                                    | `1`                                                  |
| `camera_direction` | Object          | A vector defining the camera direction with properties `x`, `y`, and `z`.                                                                    | `{x: 0, y: 0, z: -1}`                                |
