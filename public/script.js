//type hidden. At the petition page we have 3 inputs fields
//when we do submit
//we need a middleware we put the name atribute, look express notes. We have to rapp into a post
(function () {
    let painting = false;
    let x = 0;
    let y = 0;

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var dataURL = $("#hiddenInput");

    canvas.addEventListener("mousedown", (e) => {
        painting = true;
        x = e.offsetX;
        y = e.offsetY;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (painting === true) {
            drawLine(ctx, x, y, e.offsetX, e.offsetY);
            x = e.offsetX;
            y = e.offsetY;
            dataURL.val(canvas.get(0).toDataURL("image/png", 1.0));
        }
    });

    window.addEventListener("mouseup", (e) => {
        if (painting === true) {
            drawLine(ctx, x, y, e.offsetX, e.offsetY);
            x = 0;
            y = 0;
            painting = false;
        }
    });

    function drawLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
})();
