const COLORS = [
    [0, 172, 193],          // susceptible
    [255, 179, 0],          // exposed
    [213, 0, 0],            // infected
    [15, 26, 164],          // removed (negative outcome e.g. death)
    [85, 139, 47],			// removed (positive outcome e.g. vaccinated, and recovery)
];
const statesEnum = {
	SUSCEPTIBLE: 0,
	EXPOSED: 1,
	INFECTIOUS: 2,
	REMOVED_N: 3,
	REMOVED_P: 4,
}

var E_RADIUS = 8;           // particle radius

var entities;
var population;

var hist;
var maxHistDraw;			// the number of time steps to look back on when displaying the population history for the line graph.
var count;

var I_RADIUS = 24;          // radius within which entities can be infected

var TRANSITIONS = [
	[0  , 0.1, 0  , 0    , 1    ],
	[0  , 0  , 1  , 0    , 0    ],
	[0  , 0  , 0  , 0.005, 0.005],
	[0  , 0  , 0  , 0    , 0    ],
	[0  , 0  , 0  , 0    , 0    ],
];

var graphType = 0;          // 0 = line graph, 1 = pie chart, 2 = none
var showRadius = false;     // whether to display infection radius
var paused = false; 		// whether to pause the simulation from calculating


/*
 * Other functions
 */

// Return scenario string
function exportScenario() {
    return LZString.compressToBase64(JSON.stringify({
        e_radius: E_RADIUS,
        i_radius: I_RADIUS,
        i_chance: I_CHANCE,
        transitions: TRANSITIONS,
        population: population
    }));
}

// Import scenario from a scenario string
function importScenario(str) {
    try {
        let custom = JSON.parse(LZString.decompressFromBase64(str));
        document.getElementById('e_r').value = custom.e_radius;
        document.getElementById('i_r').value = custom.i_radius;
        document.getElementById('ds').value = custom.i_chance;
        document.getElementById('de').value = custom.transitions[0];
        document.getElementById('di').value = custom.transitions[1];
        document.getElementById('dr').value = custom.transitions[2];
        document.getElementById('s0').value = custom.population[0];
        document.getElementById('e0').value = custom.population[1];
        document.getElementById('i0').value = custom.population[2];
        document.getElementById('r0').value = custom.population[3];
        reset();
    } catch (err) {}
}

// Draws a line graph of all entities
function lineGraph(squished = false) {
	let startJ = max(0, hist.length - maxHistDraw);
	let drawEnd = 0;
	if(squished)
	{
		drawEnd = maxHistDraw;
	}
	else
	{
		drawEnd = min(hist.length, maxHistDraw);
	}
	
    // Transparent rect behind graph
    fill(0, 127);
    noStroke();
    rect(0, 25, drawEnd, 150);

    // Plot history of each state
    noFill();
    strokeWeight(2);
    for (let i = 0; i < COLORS.length; i++) {
        stroke(COLORS[i]);
        beginShape();
		if(squished)
		{
			for (let j = 0; j < hist.length; j++) {
				let y = map(hist[j][i], 0, count, 175, 25);
				let x = j*maxHistDraw/hist.length;
				vertex(x, y);
			}
		}
		else
		{
			for (let j = startJ; j < hist.length; j++) {
				let y = map(hist[j][i], 0, count, 175, 25);
				vertex(j-startJ, y);
			}
		}
        endShape();
    }
    strokeWeight(1);

    // Draw line at current draw location
    stroke(204);
    line(drawEnd, 25, drawEnd, 175);
}

// Draws a pie chart of all entities
function pieChart() {
    let results = countStates();
    let states = results[0];
    let total = results[1];

    // Draw pie chart
    let radius = 75;
    let lastAngle = 0;
    for (let i = 0; i < states.length; i++) {
        let angle = states[i] / total * TWO_PI;
        if (angle === 0) continue;

        // Arc
        fill(COLORS[i].concat(191));
        noStroke();
        ellipseMode(RADIUS);
        arc(100, 100, radius, radius, lastAngle, lastAngle + angle);
        lastAngle += angle;
    }
}

// Fills map randomly with entities of each state
// Requires an array of SEIR
function randomEntities(states) {
    entities = [];
    for (let i = 0; i < states.length; i++) {
        for (let j = 0; j < states[i]; j++) {
            let x = random(width);
            let y = random(height);
            entities.push(new Entity(x, y, i, random([20, 20, 80])));
        }
    }
}

// Resets map
function reset() {
    // Set entity radius
    let e = parseInt(document.getElementById('e_r').value);
    E_RADIUS = e > 0 ? e : 1;

    // Set infection radius
    let r = parseInt(document.getElementById('i_r').value);
    I_RADIUS = r >= 0 ? r : 0;

    // Set initial population
    let ids = ['s0', 'e0', 'i0', 'r0'];
    population = [];
    for (let i = 0; i < ids.length; i++) {
        let v = parseInt(document.getElementById(ids[i]).value);
        population.push(v >= 0 ? v : 0);
    }
    randomEntities(population);

    // Set transitions
    ids = ['ds', 'de', 'di', 'di', 'dr', 'va'];
	transInds = [[0, 1], [1, 2], [2, 3], [2, 4], [3, 0], [0, 4]];
	let t= createSquareArray(TRANSITIONS.length);
	for (let i = 0; i < ids.length; i++) {
        let v = parseFloat(document.getElementById(ids[i]).value);
		v = constrain(v, 0, 1);
        t[transInds[i][0]][transInds[i][1]] = v;
    }
    TRANSITIONS = t;

    hist = [];
    count = countStates()[1];
}

function changeGraphType()
{
	graphType++;
    if (graphType > 2) graphType = 0;
}


/*
 * Main p5.js functions
 */

function setup() {
    let m = document.getElementById('sketch');
    let canvas = createCanvas(m.offsetWidth, m.offsetHeight);
    canvas.parent(m);
    resizeCanvas(m.offsetWidth, m.offsetHeight, true);
    
    reset();

    maxHistDraw = ceil(width / 4);
}

function draw() {
    background(0);


	// simulation
	if(!paused)
	{
		popCount = countStates();
		if(popCount[0][2] > 0 || popCount[0][1] > 0) // if there are still infected or exposed people
		{
			hist.push(popCount[0]);
		}
		for (let i = 0; i < entities.length; i++) {
			entities[i].act();
		}
	}

	// graphics
	for (let i = 0; i < entities.length; i++) {
        entities[i].draw();
    }
	
    if (graphType === 0) {
        lineGraph(false);
    } else if (graphType === 1) {
        pieChart();
    }
	else if (graphType === 2) {
		lineGraph(true);
	}
}




/*
 * User input
 */

function keyPressed() {
    switch (keyCode) {
        case 32:
            // Spacebar
            showRadius = !showRadius;
            break;
        case 71:
            // G
            changeGraphType()
            break;
        case 77:
            // M
            importScenario(prompt('Input scenario string:'));
            break;
		case 80:
			// P
			paused = !paused; // toggle on and off pause
			if(paused) alert("Paused simulation.");
			break;
        case 82:
            // R
            reset();
            break;
        case 88:
            // X
            copyToClipboard(exportScenario());
            break;
    }
}
