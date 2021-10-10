$(document).ready(function()
{
    var canvas = document.getElementById("map-canvas");
    context = canvas.getContext("2d");
    
    var img = new Image();
    img.onload = function() {
        context.drawImage(img, 0, 0, 1920, 1080, 0, 0, canvas.width, canvas.height);
    };
    img.src = "map/sample.jpg";

    canvas.addEventListener("mousewheel", function(event)
    {
        console.log("scrolled");
        event.preventDefault();
    }, false);

});

function test(){
    console.log("function call")
}