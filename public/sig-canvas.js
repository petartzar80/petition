// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;

const sigCanvas = document.getElementById("sigCanvas");
const context = sigCanvas.getContext("2d");

// The x and y offset of the canvas from the edge of the page
const rect = sigCanvas.getBoundingClientRect();

// Add the event listeners for mousedown, mousemove, and mouseup
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
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

// submit button

const button = $("button");
const first = document.getElementById("first");
console.log(first);
const last = document.getElementById("last");
console.log(last);
const signature = document.getElementById("signature");

button.on("click", function() {
    console.log("clicking");
    // console.log("first: ", first.value);
    // console.log("last: ", last.value);
    let canvasValue = sigCanvas.toDataURL();
    signature.value = canvasValue;
    console.log("signature: ", signature.value);
});
