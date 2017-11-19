if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    var canvasW = 800;
    var canvasH = 800;
}else{
    var canvasW = 960;
    var canvasH = 360;
}

var Y_AXIS = 1;
var X_AXIS = 2;

////////// MUSIC VARIABLES ////////////
var mode = <%= d.mode %>;
var valence = <%= d.valence %>;
var energy = <%= d.energy %>;
var landN = <%= t %>; // can be 0,1,2
var musicKey = <%= d.key %>; // from 0 to 11


//////////////////////////////////////

var musicHues = ['yellow', 'yellow', 'orange', 'red', 'red', 'pink', 'pink', 'purple', 'blue', 'blue', 'green', 'green'];
var musicLums = ['light', 'bright', 'bright', 'bright', 'light', 'bright', 'light', 'bright', 'bright', 'light', 'bright', 'light'];

var sunColors = [];
var sunSize;
var sunRange;
var sunPos;

var landColors;

var backgroundColor1;
var backgroundColor2;

/////////////////////////////////////

// Fade in on start
$(document).ready(function() {
    $("body").hide().fadeIn(2000);
});


function setup() {

    // VALENCE -- Background color
    var valenceColor = musicHues[Math.round(map(valence, 0.0, 1.0, 11, 0))];

    // MODE -- day/night
    if (mode == 1) {
        // Major mode --- DAY
        backgroundColor1 = color(randomColor({
            hue: valenceColor,
            luminosity: 'light'
        }));
        backgroundColor2 = color(randomColor({
            luminosity: 'light'
        }));
        // Large yellow sun
        sunColors = randomColor({
            hue: 'yellow',
            count: 2
        });
        sunSize = random(200, 300);
        sunRange = random(20, 50);
    } else if (mode == 0) {
        // Minor mode --- NIGHT
        backgroundColor1 = color(randomColor({
            hue: valenceColor,
            luminosity: 'dark'
        }));
        backgroundColor2 = color(randomColor({
            luminosity: 'dark'
        }));
        // Small monochrome moon
        sunColors = randomColor({
            luminosity: 'light',
            hue: 'monochrome',
            count: 2
        });
        sunSize = random(75, 150);
        sunRange = random(5, 10);
    }

    // KEY --- LAND COLORS
    var currentHue = musicHues[musicKey];
    var currentLum = musicLums[musicKey];

    landColors = randomColor({
        hue: currentHue,
        luminosity: currentLum,
        count: 5,
        format: 'rgba',
        alpha: 0.5
    });

    // LISTENS PER HOUR --- NUMBER OF LANDS
    if (landN == 2)
        landN = 0;
    else if (landN == 0)
        landN = 2;


    // Canvas element
    var canvas = createCanvas(canvasW, canvasH);
    var div = document.createElement("div");
    document.getElementById("canvasDiv").appendChild(div);
    div.style.margin = "auto";
    div.appendChild(document.getElementById("defaultCanvas0"));

    // Background
    setGradient(0, 0, width, height + height / 3, backgroundColor1, backgroundColor2, Y_AXIS);
}

/// Gradient function
function setGradient(x, y, w, h, c1, c2, axis) {
    noFill();
    if (axis == Y_AXIS) { // Top to bottom gradient
        for (var i = y; i <= y + h; i++) {
            var inter = map(i, y, y + h, 0, 1);
            var c = lerpColor(c1, c2, inter);
            stroke(c);
            line(x, i, x + w, i);
        }
    } else if (axis == X_AXIS) { // Left to right gradient
        for (var i = x; i <= x + w; i++) {
            var inter = map(i, x, x + w, 0, 1);
            var c = lerpColor(c1, c2, inter);
            stroke(c);
            line(i, y, i, y + h);
        }
    }
}

function sun() {
    noStroke();
    var sunColor = sunColors[0];
    sunPos = [random(20, width), random(20, (height / 2) - 50)];
    for (i = sunSize; i > 0; i -= sunRange) {
        fill(sunColor);
        sunColor = lerpColor(color(sunColor), color(sunColors[1]), .25);
        ellipse(sunPos[0], sunPos[1], i);
    }
}

function stars() {
    noStroke();
    fill(randomColor({
        luminosity: 'light'
    }));
    for (i = 0; i < width; i += random(10, 100)) {
        for (j = 0; j < height; j += random(10, 200)) {
            ellipse(i, j, random(1, 4));
        }
    }
}

function makeLand(level, landColor) {
    noStroke();
    fill(landColor);
    stroke(landColor);
    strokeWeight(2);
    noLoop();
    //FIND THE REFERENCE Y OF EACH MOUNTAIN:
    var y0 = 6 * height / 7; //first reference y
    var i0 = level / 4; //initial interval

    var cy = []; //initialize the reference y array
    for (var j = 0; j < 4; j++) {
        cy[4 - j] = y0;
        y0 -= i0 / pow(1.2, j);
    }
    //DRAW THE MOUNTAINS/
    var dx = 0;

    for (var j = 1; j < 3; j++) {
        var a = random(-height / 2, height / 2); //random discrepancy between the sin waves
        var b = random(-height / 2, height / 2); //random discrepancy between the sin waves
        var c = random(2, 4); //random amplitude for the second sin wave
        var d = map(energy, 0.0, 1.0, 5, 100); //noise function amplitude
        var e = random(-width / 2, width / 2); //adds a discrepancy between the noise of each mountain
        var f = map(energy, 0.0, 1.0, 0.2, 2.5);

        for (var x = 0; x < width; x++) {
            var y = cy[j]; //y = reference y
            y += 10 * j * sin(2 * dx / j + a); //first sin wave oscillates according to j (the closer the mountain, the bigger the amplitude and smaller the frequency)
            y += c * j * sin(5 * dx / j + b); //second sin wave has a random medium amplitude (affects more the further mountains) and bigger frequenc
            y += d * j * noise(f * dx / j + e); //first noise function adds randomness to the mountains, amplitude depends on a random number and increases with j, frequency decrases with j
            y += 1.7 * j * noise(10 * dx); //second noise function simulates the canopy, it has high frequency and small amplitude depending on j so it is smoother on the further mountains

            line(x, y, x, height);

            dx += 0.02;
        }
    }
}

function makeSky(level) {
    noStroke();
    fill(getRandomColor());
    noLoop();
    var amount = width;
    var frequency = random(1.0) / 50;
    var offset = random(200) + 5;
    var startY = level;
    beginShape();
    vertex(0, startY);
    for (var c = 1; c < amount; c++) {
        var sinoffset = sin(frequency * c);
        var sinX = c * (width / amount);
        var sinY = startY * random(1.5) + (sinoffset * offset);
        bezierVertex(sinX, sinY, sinX, sinY - 1, sinX, sinY);
    }

    vertex(width, height);
    vertex(0, height);
    endShape();
}

function draw() {

    //makeSky(canvasH);

    // NIGHT
    if (mode == 0)
        stars();

    //skyRipples();

    sun();

    // Number of lands depends on how many songs we've listened to in the past hours
    if (landN == 2) {
        makeLand(4 * canvasH / 6, landColors[3]);
    }
    makeLand(canvasH / 2, landColors[0]);
    if (landN >= 1) {
        makeLand(random(1, 2) * canvasH / 6, landColors[1]);
    }

    //makeLand(random(2, 3) * canvasH / 6, landColors[1]);
    // makeLand(random(3, 4) * canvasH / 6, landColors[2]);
    // makeLand(4 * canvasH / 6, landColors[3]);
    // makeLand(5 * canvasH / 6, landColors[4]);

}














// Not used right now!

function getRandomColor() {

    var c = color(random(255), random(255), random(255), random(255));
    return c;

}


function skyRipples() {
    stroke(randomColor({
        format: 'rgba'
    }));
    fill(randomColor({
        format: 'rgba'
    }));
    var ellipseR = random(40, 100);
    for (i = 0; i < width + ellipseR; i += 20) {
        for (j = 0; j < height; j += 20) {
            ellipse(i, j, ellipseR);
        }
    }
}

function makeRibbons() {
    noFill();
    smooth(8);
    noLoop();

    for (var i = 0; i < random(10) + 2; i++) {

        var strokeW = random(5) + 3;

        var amount = 500;
        var frequency = random(1.0) / 15;
        var offset = random(200) + 5;

        var col = getRandomColor();

        strokeWeight(strokeW);
        stroke(col, 180);
        var startY = height / 2;
        beginShape();
        curveVertex(canvasH / 3, startY);
        for (var c = 1; c < amount; c++) {
            var sinoffset = sin(frequency * c);
            var sinX = c * (width / amount);
            var sinY = startY + (sinoffset * offset);
            bezierVertex(sinX, sinY, sinX, sinY - 1, sinX, sinY);
        }
        endShape();

    }
}