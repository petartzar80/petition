let isDrawing = false;
let x = 0;
let y = 0;

const sigCanvas = document.getElementById("sig-canvas");
const context = sigCanvas.getContext("2d");

const rect = sigCanvas.getBoundingClientRect();

sigCanvas.addEventListener("mousedown", e => {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    isDrawing = true;
});

sigCanvas.addEventListener("mousemove", e => {
    if (isDrawing === true) {
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
});

window.addEventListener("mouseup", e => {
    if (isDrawing === true) {
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
        x = 0;
        y = 0;
        isDrawing = false;
    }
});

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = "yellow";
    context.lineWidth = 3;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

const button = $("button");

const signature = document.getElementById("signature");

button.on("click", function() {
    let canvasValue = sigCanvas.toDataURL();
    signature.value = canvasValue;
});
