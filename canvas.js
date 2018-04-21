class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// constants
const DEFAULT_CENTRE_POINT = new Point(5, 5);
const DEFAULT_X_SCALE = 1;
const DEFAULT_Y_SCALE = 1;
const PIXELS_BETWEEN_INTERVALS = 30;
const MINOR_GRIDLINE_WIDTH = 0.2;
const MAJOR_GRIDLINE_WIDTH = 0.7;
const MAJOR_GRIDLINE_INTERVAL = 5;
const AXIS_GRIDLINE_WIDTH = 1.5;
const SCROLL_MULTIPLIER = 2;

// colours
const GREY = "#F0F0F0"
const BLACK = "#000000";
const RED = "#FF0000";
const WHITE = "#FFFFFF";
const GREEN = "#008000";

const BACKGROUND_COLOUR = GREY;

// font
const MAJOR_GRIDLINE_NUMBERS_FONT = "12px Arial";

var canvas;
var ctx2d;
var workspace;

// coordinates inside the canvas that is the centre of the canvas
var centrePosOfCanvas;
// coordinates of the point at the centre of the canvas
var centrePoint = DEFAULT_CENTRE_POINT;
var xScale = DEFAULT_X_SCALE;
var yScale = DEFAULT_Y_SCALE;

function drawNumberLabelsWithBackground(text, x, y, axis, font, background, textColour) {
    ctx2d.font = font;
    ctx2d.fillStyle = background;
    if (axis == "horizontal") {
        ctx2d.textAlign    = "center";
        ctx2d.textBaseline = "top";
        ctx2d.fillRect(x - (ctx2d.measureText(text).width / 2), y, ctx2d.measureText(text).width + 2, parseInt(ctx2d.font) + 2);
    } else {
        ctx2d.textAlign    = "right";
        ctx2d.textBaseline = "middle";
        ctx2d.fillRect(x - ctx2d.measureText(text).width - 1, y - (parseInt(ctx2d.font) / 2), ctx2d.measureText(text).width + 2, parseInt(ctx2d.font) + 2);
    }
    ctx2d.fillStyle = textColour;
    ctx2d.fillText(text, x, y);
}

function resizeCanvas(xTimes, yTimes) {
    xScale *= xTimes;
    yScale *= yTimes;
    drawCanvas();
    canvas.style.cursor = "default";
}

function panCanvas(xMove, yMove) {
    centrePoint.x += xMove * xScale;
    centrePoint.y += yMove * yScale;
    drawCanvas();
}

function setUpCanvas() {
    workspace = $("#workspace")[0];
    canvas    = $("#canvas")[0];

    // Get dimensions of canvas
    canvas.height = workspace.getBoundingClientRect().height;
    canvas.width  = workspace.getBoundingClientRect().width - document.getElementById("tools").offsetWidth;
    centrePosOfCanvas = new Point(canvas.width / 2, canvas.height / 2);

    // Get context of canvas
    ctx2d = canvas.getContext("2d");

    canvas.addEventListener("wheel", function (wheel) {
        if (wheel.deltaY > 0) {
            canvas.style.cursor = "zoom-out";
            resizeCanvas(SCROLL_MULTIPLIER, SCROLL_MULTIPLIER);
        } else {
            canvas.style.cursor = "zoom-in";
            resizeCanvas(1/SCROLL_MULTIPLIER, 1/SCROLL_MULTIPLIER);
        }
    });

    canvas.addEventListener("mousedown", function (mousedown) {
        canvas.style.cursor = "move";
        var lastX = mousedown.x;
        var lastY = mousedown.y;
        var mousemoveListener = function (mousemove) {
            panCanvas((lastX - mousemove.x) * 1/PIXELS_BETWEEN_INTERVALS, (mousemove.y - lastY) * 1/PIXELS_BETWEEN_INTERVALS);
            lastX = mousemove.x;
            lastY = mousemove.y;
        };
        var mouseupListener = function mouseupListener(event) {
            canvas.style.cursor = "default";
            canvas.removeEventListener("mousemove", mousemoveListener);
            canvas.removeEventListener("mouseup", mouseupListener);
        };
        canvas.addEventListener("mousemove", mousemoveListener);
        canvas.addEventListener("mouseup", mouseupListener);
    });

    window.addEventListener("keypress", function (keypress) {
        switch (keypress.key) {
            case 'c':
                centrePoint.x = 0;
                centrePoint.y = 0;
                drawCanvas();
                break;
        }
    })

    drawCanvas();
}

function drawCanvas() {

    // Point where the gridlines should be drawn from
    wholeCentrePoint         = new Point();
    wholeCentrePoint.x       = (Math.floor(centrePoint.x / xScale) * xScale);
    wholeCentrePoint.y       = (Math.floor(centrePoint.y / yScale) * yScale);
    wholeCentrePosOfCanvas   = new Point();
    wholeCentrePosOfCanvas.x = centrePosOfCanvas.x + ((wholeCentrePoint.x - centrePoint.x) / xScale) * PIXELS_BETWEEN_INTERVALS;
    wholeCentrePosOfCanvas.y = centrePosOfCanvas.y - ((wholeCentrePoint.y - centrePoint.y) / yScale) * PIXELS_BETWEEN_INTERVALS;
    originPosOfCanvas        = new Point();
    originPosOfCanvas.x      = wholeCentrePosOfCanvas.x - (wholeCentrePoint.x / xScale) * PIXELS_BETWEEN_INTERVALS;
    originPosOfCanvas.y      = wholeCentrePosOfCanvas.y + (wholeCentrePoint.y / yScale) * PIXELS_BETWEEN_INTERVALS;

    // Fill background of canvas
    ctx2d.fillStyle = BACKGROUND_COLOUR;
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);

    // Rectangles at the four corner of the canvas
    ctx2d.fillStyle = RED;
    ctx2d.fillRect(0, 0, 5, 5);
    ctx2d.fillRect(canvas.width - 5, 0, 5, 5);
    ctx2d.fillRect(0, canvas.height - 5, 5, 5);
    ctx2d.fillRect(canvas.width - 5, canvas.height - 5, 5, 5);

    // Set up gridlines
    ctx2d.strokeStyle = BLACK;

    // Vertical gridlines right of centre
    for (var x = wholeCentrePosOfCanvas.x; x < canvas.width; x += PIXELS_BETWEEN_INTERVALS) {
        if (Math.floor((originPosOfCanvas.x - x) / PIXELS_BETWEEN_INTERVALS) % MAJOR_GRIDLINE_INTERVAL == 0) {
            ctx2d.lineWidth = MAJOR_GRIDLINE_WIDTH;
        } else {
            ctx2d.lineWidth = MINOR_GRIDLINE_WIDTH;
        }
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, canvas.height);
        ctx2d.stroke();
    }

    // Vertical gridlines left of centre
    for (var x = wholeCentrePosOfCanvas.x - PIXELS_BETWEEN_INTERVALS; x > 0; x -= PIXELS_BETWEEN_INTERVALS) {
        if (Math.floor((originPosOfCanvas.x - x) / PIXELS_BETWEEN_INTERVALS) % MAJOR_GRIDLINE_INTERVAL == 0) {
            ctx2d.lineWidth = MAJOR_GRIDLINE_WIDTH;
        } else {
            ctx2d.lineWidth = MINOR_GRIDLINE_WIDTH;
        }
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, canvas.height);
        ctx2d.stroke();
    }

    // Horizontal gridlines below centre
    for (var y = wholeCentrePosOfCanvas.y; y < canvas.height; y += PIXELS_BETWEEN_INTERVALS) {
        if (Math.floor((originPosOfCanvas.y - y) / PIXELS_BETWEEN_INTERVALS) % MAJOR_GRIDLINE_INTERVAL == 0) {
            ctx2d.lineWidth = MAJOR_GRIDLINE_WIDTH;
        } else {
            ctx2d.lineWidth = MINOR_GRIDLINE_WIDTH;
        }
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(canvas.width, y);
        ctx2d.stroke();
    }

    // Horizontal gridlines above centre
    for (var y = wholeCentrePosOfCanvas.y - PIXELS_BETWEEN_INTERVALS; y > 0; y -= PIXELS_BETWEEN_INTERVALS) {
        if (Math.floor((originPosOfCanvas.y - y) / PIXELS_BETWEEN_INTERVALS) % MAJOR_GRIDLINE_INTERVAL == 0) {
            ctx2d.lineWidth = MAJOR_GRIDLINE_WIDTH;
        } else {
            ctx2d.lineWidth = MINOR_GRIDLINE_WIDTH;
        }
        ctx2d.beginPath(); centrePosOfCanvas.x - centrePoint.x * PIXELS_BETWEEN_INTERVALS
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(canvas.width, y);
        ctx2d.stroke();
    }

    // Darker vertical axis lines
    ctx2d.lineWidth = AXIS_GRIDLINE_WIDTH;
    ctx2d.beginPath();
    ctx2d.moveTo(originPosOfCanvas.x, 0);
    ctx2d.lineTo(originPosOfCanvas.x, canvas.width);
    ctx2d.stroke();

    // Darker horizontal axis lines
    ctx2d.lineWidth = AXIS_GRIDLINE_WIDTH;
    ctx2d.beginPath();
    ctx2d.moveTo(0, originPosOfCanvas.y);
    ctx2d.lineTo(canvas.width, originPosOfCanvas.y);
    ctx2d.stroke();

    // Draw numbers on horizontal axis
    for (var x = originPosOfCanvas.x + Math.floor((0 - originPosOfCanvas.x) / PIXELS_BETWEEN_INTERVALS / MAJOR_GRIDLINE_INTERVAL) * PIXELS_BETWEEN_INTERVALS * MAJOR_GRIDLINE_INTERVAL; x < canvas.width; x += MAJOR_GRIDLINE_INTERVAL * PIXELS_BETWEEN_INTERVALS) {
        if ((x - originPosOfCanvas.x) / PIXELS_BETWEEN_INTERVALS * xScale != 0) {
            drawNumberLabelsWithBackground(((x - originPosOfCanvas.x) / PIXELS_BETWEEN_INTERVALS * xScale), x, originPosOfCanvas.y + 5, "horizontal", MAJOR_GRIDLINE_NUMBERS_FONT, BACKGROUND_COLOUR, BLACK);
        }
    }

    // Draw numbers on vertical axis
    for (var y = originPosOfCanvas.y + Math.floor((0 - originPosOfCanvas.y) / PIXELS_BETWEEN_INTERVALS / MAJOR_GRIDLINE_INTERVAL) * PIXELS_BETWEEN_INTERVALS * MAJOR_GRIDLINE_INTERVAL; y < canvas.height; y += MAJOR_GRIDLINE_INTERVAL * PIXELS_BETWEEN_INTERVALS) {
        if ((originPosOfCanvas.y - y) / PIXELS_BETWEEN_INTERVALS * yScale != 0) {
            drawNumberLabelsWithBackground(((originPosOfCanvas.y - y) / PIXELS_BETWEEN_INTERVALS * yScale), originPosOfCanvas.x - 5, y, "vertical", MAJOR_GRIDLINE_NUMBERS_FONT, BACKGROUND_COLOUR, BLACK);
        }
    }

    // Draw circle in the centre of the canvas
    ctx2d.fillStyle = RED;
    ctx2d.beginPath();
    ctx2d.arc(centrePosOfCanvas.x, centrePosOfCanvas.y, 3, 0, 2 * Math.PI);
    ctx2d.fill();

    // Draw circle in closest whole point in centre of canvas
    ctx2d.fillStyle = GREEN;
    ctx2d.beginPath();
    ctx2d.arc(wholeCentrePosOfCanvas.x, wholeCentrePosOfCanvas.y, 3, 0, 2 * Math.PI);
    ctx2d.fill();
}
