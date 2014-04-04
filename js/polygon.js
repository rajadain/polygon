paper.install(window);

// Data stores
var Points = new Array(); var Labels = new Array();

var mytool = new Tool(); // used with paperjs to interact with the mouse.

/**
 * Adjust game state.
 * Set STATE to either INACTIVE, SOLVE or RESET. Default INACTIVE.
 */
var INACTIVE = 1; var SOLVE = 2; var RESET = 3; var STATE = INACTIVE;
function setState(state) {
	var actionButton = document.getElementById('action');
	STATE = state;
	debugMsg("STATE: " + STATE);
	switch (state) {
		case SOLVE:
			actionButton.disabled = false;
			actionButton.className = 'btn btn-primary';
			actionButton.innerHTML = 'Solve';
			actionButton.onclick = solve3;
			break;
		case RESET:
			actionButton.disabled = false;
			actionButton.className = 'btn btn-danger';
			actionButton.innerHTML = 'Reset';
			actionButton.onclick = reset;
			break;
		case INACTIVE:
		default:
			actionButton.disabled = true;
			actionButton.className = 'btn btn-primary';
			actionButton.innerHTML = 'Solve';
			break;
	}
}

/**
 * Debug messaging
 * Logs to console if value of DEBUG is true. By default it is false.
 */
var DEBUG = false;
function debugMsg (message) {
	if (DEBUG) console.log(message);
}

/**
 * Label visibility
 * Sets the visibility of labels
 */
var LABEL_VISIBILITY = false;
function setLabelVisibility (lv) {
	LABEL_VISIBILITY = lv; debugMsg("LABEL_VISIBILITY: " + LABEL_VISIBILITY);
	for (var i = Labels.length - 1; i >= 0; i--) {
		Labels[i].visible = lv; // debugMsg("Labels[i]: " + Labels[i]);
		view.draw();
	};
}

/**
 * Initialization
 * We setup paper in the myCanvas element, and
 * Add a click handler for the canvas in which each click adds a point, and
 * Add toggle handlers for labeling and logging options
 */
window.onload = function() {
	paper.setup('myCanvas');

	mytool.onMouseDown = function (event) {
		// Enable the Solve button the first time
		if (STATE == INACTIVE) setState(SOLVE);

		// Only play the game when state is SOLVE
		if (STATE == SOLVE) {
			// Add point
			Points.push(event.point);

			// Some graphical feedback to user for adding a point
			var thisPointsOutline = new Path.Rectangle(new Point(event.point.x - 1, event.point.y - 1), new Size(2, 2));
			thisPointsOutline.strokeColor = 'blue';
			
			// Label
			var thisPointsLabel = new PointText(event.point.transform(Matrix.getTranslateInstance(0, 20)));
			thisPointsLabel.justification = 'center';
			thisPointsLabel.fillColor = 'black';
			thisPointsLabel.content = "(" + Math.round(event.point.x) + "," + Math.round(event.point.y) + ")";
			thisPointsLabel.visible = LABEL_VISIBILITY; // hidden by default
			Labels.push(thisPointsLabel);
			
			// Debug results
			debugMsg(Points);
			
			// Update view
			view.draw();
		}
	};

	// Toggle Labels
	var labels = document.getElementById('labels');
	labels.onclick = function() {
		if (labels.className == 'btn btn-small') { // Is inactive
			labels.className = 'btn btn-small btn-primary';
			labels.firstChild.className = 'icon-tag icon-white';
			setLabelVisibility(true);
		} else { // Is active
			labels.className = 'btn btn-small';
			labels.firstChild.className = 'icon-tag'
			setLabelVisibility(false);
		}
	};

	// Toggle logging
	var logging = document.getElementById('logging');
	logging.onclick = function() {
		if (logging.className == 'btn btn-small') { // Is inactive
			logging.className = 'btn btn-small btn-primary';
			logging.firstChild.className = 'icon-list-alt icon-white';
			DEBUG = true; debugMsg("DEBUG: " + DEBUG);
		} else { // Is active
			logging.className = 'btn btn-small';
			logging.firstChild.className = 'icon-list-alt';
			debugMsg("DEBUG: false");
			DEBUG = false;
		}
	}
}

/**
 * Third attempt at solving the problem. First two attempts are given in the end.
 * The idea is to compute the centroid of all points.
 * Then we sort them by their polar angle subtended on the centroid.
 * And then like a clock hand centered on the centroid, we sweep from 3 o'clock all around back to 3, connecting any points we encounter
 */
function solve3() {
	debugMsg("Solving now.");

	// Compute centroid
	var cx = 0; var cy = 0;
	for (var i = Points.length - 1; i >= 0; i--) {
		cx += Points[i].x; cy += Points[i].y;
	};
	var centroid = new Point(cx/Points.length, cy/Points.length); debugMsg("centroid: " + centroid);
	
	// Sort by polar angle subtended on the centroid
	// This can be optimized by memoization
	Points.sort(function (a, b) {
		La = Math.atan2((a.y - centroid.y) , (a.x - centroid.x)); // debugMsg("a: " + a + ", La: " + La);
		Lb = Math.atan2((b.y - centroid.y) , (b.x - centroid.x)); // debugMsg("b: " + b + ", Lb: " + Lb);
		return La - Lb;
	});
	
	// Draw the solution. Second parameter indicates this is a true solution, not a bad solution for debugging.
	drawSolution(Points, true);

	// Change state to Reset
	setState(RESET);
}

/**
 * Draws the final solution.
 * First parameter is an array of sorted points. They will be connected consecutively, and the last to the first element.
 * Second parameter indicates it is a true solution or a bad solution.
 */
function drawSolution(sortedPoints, isFinal) {
	debugMsg("Drawing solution now.");

	// Some debugging info
	debugMsg("sortedPoints: " + sortedPoints);
	debugMsg("isFinal: " + isFinal);
	
	// The final path. We add all points to it.
	var path = new Path();
	for (var i = sortedPoints.length - 1; i >= 0; i--) {
		path.add(sortedPoints[i]);
	};
	path.closed = true; // This connects last point to first point
	if (isFinal) { // True solution. Blue. Should persist.
		path.strokeColor = '#e9e9ff';
		path.selected = true;
		view.draw();
	} else { // Bad solution. Red. Will evaporate after a second.
		path.strokeColor = 'red';
		path.selected = false;
		view.draw();
		setTimeout(function() {
			path.visible = false;
			view.draw();
		}, 1000);
	}

	// Some debugging
	debugMsg("path: " + path);
}

/**
 * Reset to beginning.
 * Resets all data structures to blank.
 * Removes all drawn elements from page.
 * Bring action button back to initial state.
 */
function reset() {
	// Just letting the developer know what's happening...
	debugMsg('Resetting now.');
	
	// Make the Points and Labels blank new arrays
	Points = new Array(); Labels = new Array();
	debugMsg(Points);
	
	// Remove everything in the canvas
	project.activeLayer.removeChildren();
	view.draw();

	// Change button back
	setState(INACTIVE);
}