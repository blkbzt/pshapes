class pShape {
    static IMAGE_CACHE = new Map();
    static DEFAULT_TOP_FILL = 'red';
    static DEFAULT_BOTTOM_FILL = 'blue';
    static DEFAULT_SIDE_FILLS = ['green'];
    static FILETYPES = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

    constructor(canvas_id, options = {}) {
        const {
                width = 144,
                height = 144,
                length = 240,
                speed_x = 1.5,
                speed_y = 0.25,
                num_sides = 100,
                top_fill = pShape.DEFAULT_TOP_FILL,
                bottom_fill = pShape.DEFAULT_BOTTOM_FILL,
                side_fill = {},
                image_wrap = true,
                image_smoothing = true,
                smoothing_quality = 'high',
                canvas_width = null,
                canvas_height = null,
                resolution = 1,
                camera_direction = {x: 0, y: 0, z: -1}
        } = options;

        this.canvas = document.getElementById(canvas_id);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = image_smoothing;
        this.ctx.imageSmoothingQuality = smoothing_quality;
        this.resolution = resolution;
        this.width = width * this.resolution;
        this.height = height * this.resolution;
        this.length = length * this.resolution;
        this.half_length = (length / 2) * this.resolution;
        this.num_sides = Math.round(Math.min(100, Math.max(2, num_sides)));
        this.speed_x = speed_x;
        this.speed_y = speed_y;
        this.top_fill = this.check_fill_type(top_fill) === 'color' ? top_fill : pShape.DEFAULT_TOP_FILL;
        this.bottom_fill = this.check_fill_type(bottom_fill) === 'color' ? bottom_fill : pShape.DEFAULT_BOTTOM_FILL;
        this.top_texture = this.check_fill_type(top_fill) === 'image' ? this.load_image_resource(top_fill) : null;
        this.bottom_texture = this.check_fill_type(bottom_fill) === 'image' ? this.load_image_resource(bottom_fill) : null;
        this.image_wrap = image_wrap;
        this.side_fills = this.process_side_fills(side_fill);
        this.camera_direction = camera_direction;

        if (canvas_width === null || canvas_height === null) {
            const styles = window.getComputedStyle(this.canvas);
            this.canvas.width = parseInt(styles.width, 10) * this.resolution;
            this.canvas.height = parseInt(styles.height, 10) * this.resolution;
        } else {
            this.canvas.width = canvas_width * this.resolution;
            this.canvas.height = canvas_height * this.resolution;
        }

        this.resize();
        this.center_x = this.canvas.width / 2;
        this.center_y = this.canvas.height / 2;
        this.aspect_ratio = this.canvas.width / this.canvas.height;
        this.polygon_points = this.generate_polygon_points();
        this.top_face_points = new Array(this.num_sides);
        this.bottom_face_points = new Array(this.num_sides);

        this.polygon_points.forEach((p, i) => {
            this.top_face_points[i] = { x: p.x, y: p.y, z: this.half_length};
            this.bottom_face_points[i] = {x: p.x, y: p.y, z: -this.half_length};
        });

        this.initialize_textures();
    }

    initialize_textures() {
        Promise.all([
                this.top_texture ? this.top_texture : Promise.resolve(null),
                this.bottom_texture ? this.bottom_texture : Promise.resolve(null),
                this.side_fills ? this.side_fills : Promise.resolve(null)
            ])
            .then(([top, bottom, sides]) => {
                this.top_texture = top;
                this.bottom_texture = bottom;
                this.side_fills = sides;
                this.start_time = performance.now() / 1000;
                this.animate();
            })
            .catch(err => {
                console.error("img load error:", err);
                this.start_time = performance.now() / 1000;
                this.animate();
            });
    }

    async load_image_resource(resource) {
        if (resource instanceof Promise) {resource = await resource}
        if (Array.isArray(resource)) {return Promise.all(resource.map(item => this.load_image_resource(item)))}
        if (typeof resource === 'string') {
            if (pShape.IMAGE_CACHE.has(resource)) {return pShape.IMAGE_CACHE.get(resource)}
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = resource;
                img.onload = () => {pShape.IMAGE_CACHE.set(resource, img); resolve(img)};
                img.onerror = () => reject(new Error(`img load error: ${resource}`));
            });
        }
        return resource;
    }

    check_fill_type(fill) {return pShape.FILETYPES.some(type => fill.endsWith(type)) ? 'image' : 'color'}

    process_side_fills(side_fill_list) {
        if (Array.isArray(side_fill_list)) {
            if (
                side_fill_list.length === 1 &&
                this.image_wrap &&
                this.check_fill_type(side_fill_list[0]) === 'image'
            ) {
                return this.split_image(side_fill_list[0], this.num_sides);
            }
            const promises = [];
            for (let i = 0; i < this.num_sides; i++) {
                const fill = side_fill_list[i] || pShape.DEFAULT_SIDE_FILLS[0];
                if (this.check_fill_type(fill) === 'color') {promises.push(Promise.resolve(fill))}
                else {promises.push(this.load_image_resource(fill))}
            }
            return Promise.all(promises);
        } else {
            const promises = [];
            for (let i = 1; i <= this.num_sides; i++) {
                const fill = side_fill_list[i] || pShape.DEFAULT_SIDE_FILLS[0];
                if (this.check_fill_type(fill) === 'color') {promises.push(Promise.resolve(fill))}
                else {promises.push(this.load_image_resource(fill))}
            }
            return Promise.all(promises);
        }
    }    

    split_image(image_source, num_sides) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = image_source;
            img.onload = async () => {
                const side_fills = [];
                const slice_width = img.width / num_sides;
                for (let i = 0; i < num_sides; i++) {
                    const offscreen_canvas = new OffscreenCanvas(slice_width, img.height);
                    const offscreen_ctx = offscreen_canvas.getContext('2d');
                    offscreen_ctx.clearRect(0, 0, slice_width, img.height);
                    offscreen_ctx.drawImage(img, i * slice_width, 0, slice_width, img.height, 0, 0, slice_width, img.height);
                    try {
                        const blob = await offscreen_canvas.convertToBlob();
                        const texture = await this.load_image_resource(URL.createObjectURL(blob));
                        side_fills.push(texture);
                    } catch (err) {
                        console.error(err);
                    }
                }
                resolve(side_fills);
            };
            img.onerror = reject;
        });
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.canvas.width = this.canvas.width;
        this.canvas.height = this.canvas.height;
        this.center_x = this.canvas.width / 2;
        this.center_y = this.canvas.height / 2;
        this.aspect_ratio = this.canvas.width / this.canvas.height;
    }

    generate_polygon_points() {
        if (this.num_sides === 4) {
            return [
                { x: -this.width / 2, y: -this.height / 2, z: 0 },
                { x:  this.width / 2, y: -this.height / 2, z: 0 },
                { x:  this.width / 2, y:  this.height / 2, z: 0 },
                { x: -this.width / 2, y:  this.height / 2, z: 0 }
            ];
        } else {
            const points = [];
            Array.from({ length: this.num_sides }).forEach((_, i) => {
                const theta = (i / this.num_sides) * 2 * Math.PI;
                points.push({x: (this.width / 2) * Math.cos(theta), y: (this.height / 2) * Math.sin(theta), z: 0});
            });
            return points;
        }
    }    

    rotate(point, cos_x, sin_x, cos_y, sin_y) {
        const x_rot = point.x;
        const y_rot = point.y * cos_x - point.z * sin_x;
        const z_rot = point.y * sin_x + point.z * cos_x;

        point.x = x_rot * cos_y + z_rot * sin_y;
        point.y = y_rot;
        point.z = -x_rot * sin_y + z_rot * cos_y;
    }

    project(point) {
        point.x = point.x * this.aspect_ratio + this.center_x;
        point.y = point.y + this.center_y;
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const time = performance.now() / 1000 - this.start_time;

        const angle_x = time * this.speed_x;
        const angle_y = time * this.speed_y;

        const cos_x = Math.cos(angle_x);
        const sin_x = Math.sin(angle_x);
        const cos_y = Math.cos(angle_y);
        const sin_y = Math.sin(angle_y);

        for (let i = 0; i < this.num_sides; i++) {
            const base = this.polygon_points[i];
            const top = this.top_face_points[i];
            const bottom = this.bottom_face_points[i];

            top.x = base.x;
            top.y = base.y;
            top.z = this.half_length;

            bottom.x = base.x;
            bottom.y = base.y;
            bottom.z = -this.half_length;

            this.rotate(top, cos_x, sin_x, cos_y, sin_y);
            this.rotate(bottom, cos_x, sin_x, cos_y, sin_y);
            this.project(top);
            this.project(bottom);
        }

        const normal_z = Math.cos(angle_x) * Math.cos(angle_y);

        const is_top_visible = normal_z > 0;
        const is_bottom_visible = normal_z < 0;

        this.generate_side_faces(this.top_face_points, this.bottom_face_points);
        if (is_top_visible) {this.draw_end_face(this.top_face_points, {texture: this.top_texture, face_color: this.top_fill, z_offset: this.half_length, cos_x, sin_x, cos_y, sin_y})}
        else if (is_bottom_visible) {this.draw_end_face(this.bottom_face_points, {texture: this.bottom_texture, face_color: this.bottom_fill, z_offset: -this.half_length, cos_x, sin_x, cos_y, sin_y})}
    }

    draw_end_face(points, {texture = null, face_color, z_offset = 0, cos_x = 1, sin_x = 0, cos_y = 1, sin_y = 0} = {}) {
        const ctx = this.ctx;
        if (texture && texture.complete && texture.width > 0) {
            const face_points = [{x: -this.width / 2, y: -this.height / 2, z: z_offset}, {x: this.width / 2, y: -this.height / 2, z: z_offset}, {x: this.width / 2, y: this.height / 2, z: z_offset}, {x: -this.width / 2, y: this.height / 2, z: z_offset}];

            face_points.forEach(p => {
                this.rotate(p, cos_x, sin_x, cos_y, sin_y);
                this.project(p);
            });

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.clip();
            ctx.beginPath();
            ctx.moveTo(face_points[0].x, face_points[0].y);
            face_points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fill();

            const img_width = texture.width;
            const img_height = texture.height;

            const delta_x1 = face_points[1].x - face_points[0].x;
            const delta_y1 = face_points[1].y - face_points[0].y;
            const delta_x2 = face_points[3].x - face_points[0].x;
            const delta_y2 = face_points[3].y - face_points[0].y;

            ctx.transform(delta_x1 / img_width, delta_y1 / img_width, delta_x2 / img_height, delta_y2 / img_height, face_points[0].x, face_points[0].y);
            ctx.drawImage(texture, 0, 0);
            ctx.restore();
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fillStyle = face_color;
            ctx.fill();
            ctx.restore();
        }
    }

    generate_side_faces(top_face_points, bottom_face_points) {
        for (let i = 0; i < this.num_sides; i++) {
            const top1 = top_face_points[i];
            const top2 = top_face_points[(i + 1) % this.num_sides];

            const bottom1 = bottom_face_points[i];
            const bottom2 = bottom_face_points[(i + 1) % this.num_sides];

            const v1 = {
                x: top2.x - top1.x,
                y: top2.y - top1.y,
                z: top2.z - top1.z
            };

            const v2 = {
                x: bottom1.x - top1.x,
                y: bottom1.y - top1.y,
                z: bottom1.z - top1.z
            };

            const normal = {
                x: v1.y * v2.z - v1.z * v2.y,
                y: v1.z * v2.x - v1.x * v2.z,
                z: v1.x * v2.y - v1.y * v2.x
            };

            const dot_product = normal.x * this.camera_direction.x + normal.y * this.camera_direction.y + normal.z * this.camera_direction.z;
            const is_visible = dot_product > 0;

            if (is_visible) {
                const side_fill = this.side_fills[i];
                if (side_fill instanceof Image) {this.draw_side_face(top1, top2, bottom1, bottom2, side_fill, null)}
                else {this.draw_side_face(top1, top2, bottom1, bottom2, null, side_fill)}
            }
        }
    }

    draw_side_face(top1, top2, bottom1, bottom2, texture, face_color) {
        const ctx = this.ctx;
        const path = new Path2D();

        path.moveTo(top1.x, top1.y);
        path.lineTo(top2.x, top2.y);
        path.lineTo(bottom2.x, bottom2.y);
        path.lineTo(bottom1.x, bottom1.y);
        path.closePath();

        if (texture instanceof Image && texture.complete && texture.width > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(top1.x, top1.y);
            [top1, top2, bottom2, bottom1].forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.clip();
            ctx.beginPath();
            ctx.fillStyle = face_color;
            ctx.fill();

            const img_width = texture.width;
            const img_height = texture.height;
    
            const delta_x1 = top2.x - top1.x, delta_y1 = top2.y - top1.y;
            const delta_x2 = bottom1.x - top1.x, delta_y2 = bottom1.y - top1.y;
    
            ctx.transform(delta_x1 / img_width, delta_y1 / img_width, delta_x2 / img_height, delta_y2 / img_height, top1.x, top1.y);
            ctx.drawImage(texture, 0, 0);
            ctx.restore();
        } else {
            ctx.fillStyle = face_color;
            ctx.fill(path);
        }
    }
}

function build(canvas_id, options) {return new pShape(canvas_id, options)}
