class pShape {

    static DEFAULT_TOP_FILL = 'red';
    static DEFAULT_BOTTOM_FILL = 'blue';
    static DEFAULT_SIDE_FILLS = ['green'];
    static FILETYPES = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

    constructor(canvas_id, options = {}) {
        const {
            radius = 240,
            thickness = 60,
            speed_x = 2.00,
            speed_y = 0.25,
            number_of_sides = 14,
            top_fill = pShape.DEFAULT_TOP_FILL,
            bottom_fill = pShape.DEFAULT_BOTTOM_FILL,
            side_fills = pShape.DEFAULT_SIDE_FILLS,
            image_smoothing = true,
            smoothing_quality = 'high',
            camera_direction = { x: 0, y: 0, z: -1 }
        } = options;

        this.canvas = document.getElementById(canvas_id);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = image_smoothing;
        this.ctx.imageSmoothingQuality = smoothing_quality;

        this.radius = radius;
        this.thickness = thickness;
        this.half_thickness = thickness / 2;
        this.speed_x = speed_x;
        this.speed_y = speed_y;
        this.number_of_sides = Math.round(Math.min(100, Math.max(2, number_of_sides)));

        this.top_fill = (this.check_fill_type(top_fill) === 'color') ? pShape.DEFAULT_TOP_FILL : top_fill;
        this.bottom_fill = (this.check_fill_type(bottom_fill) === 'color') ? pShape.DEFAULT_BOTTOM_FILL : bottom_fill;
        this.side_fills = this.check_side_fills(side_fills);

        this.top_face_texture = this.load_image(this.top_fill);
        this.bottom_face_texture = this.load_image(this.bottom_fill);

        this.camera_direction = camera_direction;

        this.resize();

        this.center_x = this.canvas.width / 2;
        this.center_y = this.canvas.height / 2;
        this.aspect_ratio = this.canvas.width / this.canvas.height;

        this.polygon_points = this.generate_polygon_points();
        this.top_face_points = new Array(this.number_of_sides);
        this.bottom_face_points = new Array(this.number_of_sides);

        this.animate();
    }

    check_fill_type(fill) {
        if (!fill || fill.trim() === '') {return 'color'}
        if (typeof fill === 'string') {for (let type of pShape.FILETYPES) {if (fill.endsWith(type)) {return 'image'}}}
        return 'color';
    }

    load_image(src) {
        const fillType = this.check_fill_type(src);
        if (fillType === 'image') {
            const img = new Image();
            img.src = src;
            return img;
        }
        return null;
    }

    check_side_fills(side_fills) {
        if (!side_fills || side_fills.length === 0) {side_fills = new Array(this.number_of_sides).fill(pShape.DEFAULT_SIDE_FILLS[0])}
        if (side_fills.length === 1 && this.check_fill_type(side_fills[0]) === 'image') {
            const image_source = side_fills[0];
            return this.split_image(image_source, this.number_of_sides);
        } else {
            if (side_fills.length < this.number_of_sides) {

                if (side_fills.length > 0) {side_fills.push(...new Array(this.number_of_sides - side_fills.length).fill(side_fills[0]))}
                else {side_fills.push(...new Array(this.number_of_sides - side_fills.length).fill(pShape.DEFAULT_SIDE_FILLS[0]))}
            }
            return side_fills.map(fill => this.load_image(fill) || fill);
        }
    }

    split_image(image_source, numSides) {
        const img = new Image();
        img.src = image_source;

        const sideFills = [];
        img.onload = () => {
            const sliceWidth = img.width / numSides;

            for (let i = 0; i < numSides; i++) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = sliceWidth;
                canvas.height = img.height;

                ctx.drawImage(img, i * sliceWidth, 0, sliceWidth, img.height, 0, 0, sliceWidth, img.height);
                
                const texture = new Image();
                texture.src = canvas.toDataURL();
                sideFills.push(texture);
            }
        };

        return sideFills;
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        const fixed_width = 800;
        const fixed_height = 600;
        
        this.canvas.width = fixed_width;
        this.canvas.height = fixed_height;
    
        this.center_x = this.canvas.width / 2;
        this.center_y = this.canvas.height / 2;
        this.aspect_ratio = this.canvas.width / this.canvas.height;
    }

    generate_polygon_points() {
        const points = [];
        for (let i = 0; i < this.number_of_sides; i++) {
            const theta = (i / this.number_of_sides) * 2 * Math.PI;
            points.push({ x: this.radius * Math.cos(theta), y: this.radius * Math.sin(theta), z: 0 });
        }
        return points;
    }

    rotate(point, cos_x, sin_x, cos_y, sin_y) {
        let x_rot = point.x;
        let y_rot = point.y * cos_x - point.z * sin_x;
        let z_rot = point.y * sin_x + point.z * cos_x;

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
    
        const time = performance.now() / 1000;
        const angle_x = time * this.speed_x;
        const angle_y = time * this.speed_y;
    
        const cos_x = Math.cos(angle_x);
        const sin_x = Math.sin(angle_x);
        const cos_y = Math.cos(angle_y);
        const sin_y = Math.sin(angle_y);
    
        for (let i = 0; i < this.number_of_sides; i++) {
            const p = this.polygon_points[i];
            this.top_face_points[i] = { ...p, z: this.half_thickness };
            this.bottom_face_points[i] = { ...p, z: -this.half_thickness };
        }
    
        this.top_face_points.forEach(p => this.rotate(p, cos_x, sin_x, cos_y, sin_y));
        this.bottom_face_points.forEach(p => this.rotate(p, cos_x, sin_x, cos_y, sin_y));
    
        this.top_face_points.forEach(p => this.project(p));
        this.bottom_face_points.forEach(p => this.project(p));
    
        const normal_z = Math.cos(angle_x) * Math.cos(angle_y);
        const is_top_visible = normal_z > 0;
        const is_bottom_visible = normal_z < 0;
    
        this.draw_side_faces(this.top_face_points, this.bottom_face_points);
    
        if (is_bottom_visible) {
            this.draw_end_face(this.bottom_face_points, this.bottom_fill);
            if (this.bottom_face_texture) {this.draw_end_face_texture(this.bottom_face_points, this.bottom_face_texture, -this.half_thickness, cos_x, sin_x, cos_y, sin_y)}
        }
    
        if (is_top_visible) {
            this.draw_end_face(this.top_face_points, this.top_fill);
            if (this.top_face_texture) {this.draw_end_face_texture(this.top_face_points, this.top_face_texture, this.half_thickness, cos_x, sin_x, cos_y, sin_y)}
        }
    }

    draw_end_face(points, face_color) {
        const ctx = this.ctx;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        points.forEach(p => { ctx.lineTo(p.x, p.y); });

        ctx.closePath();
        ctx.fillStyle = face_color;
        ctx.fill();

        ctx.restore();
    }

    draw_end_face_texture(points, texture, z_offset, cos_x, sin_x, cos_y, sin_y) {
        const square_points = [
            { x: -this.radius, y: -this.radius, z: z_offset },
            { x: this.radius, y: -this.radius, z: z_offset },
            { x: this.radius, y: this.radius, z: z_offset },
            { x: -this.radius, y: this.radius, z: z_offset }
        ];
    
        square_points.forEach(p => this.rotate(p, cos_x, sin_x, cos_y, sin_y));
        square_points.forEach(p => this.project(p));
    
        const ctx = this.ctx;
        ctx.save();
    
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.clip();
    
        ctx.beginPath();
        ctx.moveTo(square_points[0].x, square_points[0].y);
        square_points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
    
        if (texture.complete && texture.width > 0) {
            const img_width = texture.width;
            const img_height = texture.height;
    
            const delta_x1 = square_points[1].x - square_points[0].x, delta_y1 = square_points[1].y - square_points[0].y;
            const delta_x2 = square_points[3].x - square_points[0].x, delta_y2 = square_points[3].y - square_points[0].y;
    
            ctx.transform(
                delta_x1 / img_width, delta_y1 / img_width,
                delta_x2 / img_height, delta_y2 / img_height,
                square_points[0].x, square_points[0].y
            );
    
            ctx.drawImage(texture, 0, 0);
        }
    
        ctx.restore();
    }

    draw_side_faces(top_face_points, bottom_face_points) {
        for (let i = 0; i < this.number_of_sides; i++) {
            const top1 = top_face_points[i];
            const top2 = top_face_points[(i + 1) % this.number_of_sides];
            const bottom1 = bottom_face_points[i];
            const bottom2 = bottom_face_points[(i + 1) % this.number_of_sides];

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

            const normal_length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);

            normal.x /= normal_length;
            normal.y /= normal_length;
            normal.z /= normal_length;

            const dot_product = normal.x * this.camera_direction.x + normal.y * this.camera_direction.y + normal.z * this.camera_direction.z;
            const is_visible = dot_product > 0;

            if (is_visible) {
                const side_fill = this.side_fills[i];
                if (side_fill instanceof Image) { this.draw_side_face_texture(top1, top2, bottom1, bottom2, side_fill, null); }
                else { this.draw_side_face_texture(top1, top2, bottom1, bottom2, null, side_fill); }
            }
        }
    }

    draw_side_face_texture(top1, top2, bottom1, bottom2, texture, face_color) {
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

            [top1, top2, bottom2, bottom1].forEach(p => { ctx.lineTo(p.x, p.y); });

            ctx.closePath();
            ctx.clip();

            ctx.fillStyle = face_color;
            ctx.fill();

            const img_width = texture.width;
            const img_height = texture.height;

            const delta_x1 = top2.x - top1.x, delta_y1 = top2.y - top1.y;
            const delta_x2 = bottom1.x - top1.x, delta_y2 = bottom1.y - top1.y;

            ctx.transform(
                delta_x1 / img_width, delta_y1 / img_width,
                delta_x2 / img_height, delta_y2 / img_height,
                top1.x, top1.y
            );

            ctx.drawImage(texture, 0, 0);
            ctx.restore();
        } else {
            ctx.fillStyle = face_color;
            ctx.fill(path);
        }
    }
}

function create_shape(canvas_id, options) { return new pShape(canvas_id, options)}
