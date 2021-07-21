//type hidden. At the petition page we have 3 inputs fields
//when we do submit
//we need a middleware we put the name atribute, look express notes. We have to rapp into a post
(function () {
    console.log("documents works");

    let position = { x: 0, y: 0 };
    let offsetX = canavasOffset.left;
    let offsetY = canavasOffset.top;
    let canavasOffset = $("canavas").offset();

    var canvas = $("#canvas");
    var ctx = document.getElementById("canvas").getContext("2d");
    var dataURL = document.getElementById("hiddenInput");

    function setting(place) {
        position.x = parseInt(place.clientX - offsetX);
        position.y = parseInt(position.clientY - offsetY);
    }

    //mousemove, mousedown
    canavas.on("mousedown", setting);
    canavas.on("mousemove", function (argument) {
        if (argument.button !== 1) {
            return;
        }

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.moveTo(position.x, position.y);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        canvasID.val(canvas.get(0).toDataURL("image/png", 1.0));
    });
})();
