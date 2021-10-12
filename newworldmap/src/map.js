
const ZOOM_SECTIONS = {
    2:4, 3:8, 4:16, 5:32, 6:64, 7:128, 8:256
    };
const SECTION_COUNT = 4;


$(document).ready(function()
{
    var canvas = document.getElementById("map-canvas");
    canvas.width =  2000;
    canvas.height = 2000;

    sections = {2:{},3:{},4:{},5:{},6:{},7:{},8:{}}
    var offset = {x:0 - (get_canvas_ratio(canvas) - 1)/2, y:0};
    var canvas_ratio = get_canvas_ratio(canvas)
    var mouse_dt = {x:0, y:0}
    var mouse_pos = {x:0, y:0}
    var mouse_down = false;

    var zoom = 2
    
    window.addEventListener("resize", function(event)
    {
        tmp = get_canvas_ratio(canvas);
        delta_r = tmp - canvas_ratio;
        canvas_ratio = tmp;
        canvas_rect = tmp;
        offset = {
            x:offset.x - (delta_r/(2*get_zoom_scale(zoom))),
            y:offset.y
        }
    });

    canvas.addEventListener("mousewheel", function(event)
    {
        zoom_power = get_zoom_scale(zoom)
        zoom_delta = zoom
        zoom += event.deltaY * -0.01;
        zoom = (zoom < 2? 2 : (zoom > 8)?8 : zoom);
        zoom_delta = zoom - zoom_delta;

        console.log(zoom);
        console.log(event.deltaY);

        mouse_offset = {
            x:(mouse_pos.x - 0.5) / (2*zoom_power),
            y:(mouse_pos.y - 0.5) / (2*zoom_power)
        }

        relative_offset = {
            x: (offset.x + mouse_pos.x * (1/ zoom_power)),
            y: (offset.y + mouse_pos.y * (1/ zoom_power))
        }

        if (zoom_delta > 0){
            offset = {
                x: relative_offset.x - 1/(4*zoom_power) - mouse_offset.x,
                y: relative_offset.y - 1/(4*zoom_power) - mouse_offset.y
            };
        }
        else if (zoom_delta < 0){
            offset = {
                x: relative_offset.x - 1/(2*zoom_power) - (2*mouse_offset.x + (relative_offset.x - offset.x)),
                y: relative_offset.y - 1/(2*zoom_power) - (2*mouse_offset.y + (relative_offset.y - offset.y))
            };
        }
;
        event.preventDefault();
    });

    canvas.addEventListener("mousemove", function(event) {
        mouse_dt = mouse_pos;
        mouse_pos = get_mouse_pos(canvas, event);
        mouse_dt.x -= mouse_pos.x;
        mouse_dt.y -= mouse_pos.y;

        if (mouse_down){
            offset.x += mouse_dt.x / get_zoom_scale(zoom);
            offset.y += mouse_dt.y / get_zoom_scale(zoom);
        }

        // console.log("mouse pos", mouse_pos);
        // console.log("section mouse pos", {
        //     x: Math.floor((offset.x + mouse_pos.x*(1/Math.pow(2, zoom-2))) * ZOOM_SECTIONS[zoom]),
        //     y: Math.floor((offset.y + mouse_pos.y*(1/Math.pow(2, zoom-2))) * ZOOM_SECTIONS[zoom])
        // });        
        // console.log("absolute mouse pos", {
        //     x: offset.x + mouse_pos.x*(1/Math.pow(2, zoom-2)),
        //     y: offset.y + mouse_pos.y*(1/Math.pow(2, zoom-2))
        // });
    });

    canvas.addEventListener("mousedown", function(event) {
        mouse_down = true;
    });

    canvas.addEventListener("mouseup", function(event){
        mouse_down = false;
    });

    function render(){
        update_map(canvas, zoom, offset);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});

function clamped_zoom(zoom){
    return Math.floor(zoom);
}

function get_zoom_scale(zoom){
    return Math.pow(2, clamped_zoom(zoom)-2);
}


function get_mouse_pos(canvas, evt){
    var rect = canvas.getBoundingClientRect();

    return {
        x: (evt.clientX - rect.left) / rect.height,
        y: (evt.clientY - rect.top) / rect.height
    };
}

function get_canvas_ratio(canvas){
    var rect = canvas.getBoundingClientRect();
    var ratio = (rect.right - rect.left) / (rect.bottom - rect.top);
    return ratio;

}

function get_url(x, y, zoom){
    url = "https://cdn.newworldfans.com/newworldmap/" + new String(zoom) + "/" + new String(x) + "/" + new String(y) + ".png"
    return url;
}

function draw_section(x, y, zoom, canvas, offset){
    var ratio = canvas.width / canvas.height
    section_width = canvas.width / SECTION_COUNT

    canvas.getContext("2d").strokeRect(
        section_width*(x-offset.x),
        section_width*(y-offset.y), 
        section_width, 
        section_width/ratio);
    canvas.getContext("2d").font = "20px Arial";
    canvas.getContext("2d").fillStyle = "green";
    canvas.getContext("2d").fillText("("+String(x)+", "+String(y)+")", section_width*(x-offset.x) + section_width/4, (section_width*(y-offset.y) + section_width/2)/ratio);
}

function draw_cross(canvas){
    var c = canvas.getContext("2d");
    c.beginPath();
    c.moveTo(canvas.width/2, 0);
    c.lineTo(canvas.width/2, canvas.height);
    c.stroke();
}

function draw_background(canvas){
    var c = canvas.getContext("2d");
    c.fillStyle = "#85918D"
    c.fillRect(0, 0, canvas.width, canvas.height);
}

function clear_canvas(canvas){
    canvas.getContext("2d").clearRect();
}

function draw_offset(offset, zoom, canvas){
    canvas.getContext("2d").strokeRect(
        offset.x * canvas.width,
        offset.y * canvas.height,
        canvas.width / Math.pow(2, zoom-2),
        canvas.height / Math.pow(2, zoom-2)
    );
}

function draw_image(x, y, canvas, img){;
    var ratio = get_canvas_ratio(canvas);
    section_width = canvas.width / SECTION_COUNT

    canvas.getContext("2d").drawImage(
        img, 0, 0, img.width, img.height, 
        section_width*x/ratio,
        section_width*y,
        section_width/ratio, 
        section_width);
}

function clamp_region(region, boundary){
    new_region = {
        lower_x:(region.lower_x < boundary.lower ? boundary.lower : region.lower_x),
        lower_y:(region.lower_y < boundary.lower ? boundary.lower : region.lower_y),
        upper_x:(region.upper_x > boundary.upper ? boundary.upper : region.upper_x),
        upper_y:(region.upper_y > boundary.upper ? boundary.upper : region.upper_y),
    }

    return new_region;
}

const load_image = url => {
    return new Promise(resolve => {
        const img = new Image();
        img.addEventListener("load", resolve(img));   
        img.addEventListener("error", resolve(new Image(256,256)));
        img.src = url;
    });
}

async function images_loaded(region, zoom){
    for (let x = region.lower_x; x < region.upper_x; x++) {
        for (let y = region.lower_y; y < region.upper_y; y++) {
            load_image(get_url(x, y, zoom)).then(img => {
                sections[zoom][[x, y]] = img;
            });
        }
    }
}

function update_map(canvas, zoom, offset){
    var boundary = {lower: 0, upper: ZOOM_SECTIONS[clamped_zoom(zoom)]};
    var region = {
        lower_x:boundary.lower + Math.floor(offset.x * ZOOM_SECTIONS[clamped_zoom(zoom)]),
        lower_y:boundary.lower + Math.floor(offset.y * ZOOM_SECTIONS[clamped_zoom(zoom)]),
        upper_x:boundary.lower + Math.ceil(offset.x * ZOOM_SECTIONS[clamped_zoom(zoom)]) + SECTION_COUNT*get_canvas_ratio(canvas),
        upper_y:boundary.lower + Math.ceil(offset.y * ZOOM_SECTIONS[clamped_zoom(zoom)]) + SECTION_COUNT,
    };

    region = clamp_region(region, boundary);

    draw_background(canvas);
    images_loaded(region, zoom).then(() => {
        for (let x = region.lower_x; x < region.upper_x; x++) {
            for (let y = region.lower_y; y < region.upper_y; y++) {
                if (!sections[clamped_zoom(zoom)][[x,y]]){
                    load_image(get_url(x, y, zoom)).then(img => {
                        sections[clamped_zoom(zoom)][[x, y]] = img;
                        draw_image(x-offset.x*Math.pow(2, zoom), y-offset.y*Math.pow(2, zoom), canvas, img);
                        // draw_offset(offset, zoom, canvas);
                        // draw_section(x, y, zoom, canvas, offset);
                    });
                }
                else{
                    draw_image(x-offset.x*Math.pow(2, zoom), y-offset.y*Math.pow(2, zoom), canvas, sections[zoom][[x, y]]);
                }
            }
        }
    });
}