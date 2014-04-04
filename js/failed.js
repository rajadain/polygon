/*
 * -----------------
 * FAILED ATTEMPTS
 */

/**
 * First solution tries to connect points at random and checks if any intersections are made at each step.
 * If it does find an intersection, it tries to backtrack.
 * Essentially it is a DFS, but I couldn't get it to work.
 */
function solve() {
    debugMsg('Solving now.');

    var finalPoints = new Array();
    var badPoints = new Array();

    // Start with a point
    finalPoints.push(Points.pop());
    debugMsg("First point: " + finalPoints[0]);

    var y = 0;

    // Until all but one points are joined, keep looping
    while (Points.length > 1 && y < 50) {
        // Track the most recent final point
        var top = finalPoints.slice(-1)[0];
        debugMsg("  Top: " + top);

        var x = 0;

        // Choose a candidate point
        while (Points.length > 0 && x < 75) {
            debugMsg("    Points.length: " + Points.length);
            var candidate = Points.pop();
            debugMsg("    candidate: " + candidate);

            // Intersection tracking
            var intersecting = false;
            for (var i = 0; i < (finalPoints.length - 1) && !intersecting; i++) {
                var intersection = new Line(finalPoints[i], finalPoints[i+1], false).intersect(new Line(top, candidate, false));
                debugMsg("      Intersection between Line(" + finalPoints[i] + "," + finalPoints[i+1] +") and Line(" + top + "," + candidate + "): " + intersection);
                intersecting = (intersection != null && (intersection.x != top.x && intersection.y != top.y));
            }
            debugMsg("    intersecting: " + intersecting);

            if (intersecting) {
                // This does intersect. Put the candidate in the bad points list so that we don't choose it the next time
                badPoints.push(candidate);
                debugMsg("      badPoints: " + badPoints);
            } else {
                // This does not intsersect. Add candidate to stack, merge badPoints back to common pool of Points and continue.
                finalPoints.push(candidate)
                debugMsg("      finalPoints: " + finalPoints);
                if (badPoints.length > 1) {
                    Points.push(badPoints.pop());
                    debugMsg("        Moved " + Points.slice(-1)[0] + " from badPoints to Points.");
                }
                top = finalPoints.slice(-1)[0];
                debugMsg("      Top: " + top);
            }
            x++;
        }

        // See if there are any bad points
        if (badPoints.length > 0) {
            // Okay so our top variable was not well chosen. We remove it, add it back to Points, and add badPoints back to the array so that one of the badPoints will be chosen in the next iteration.
            debugMsg("    We have bad points: " + badPoints);
            for (var i = badPoints.length; i >= 0; i--) {
                Points.push(finalPoints.pop());
            };
            debugMsg("    New finalPoints: " + finalPoints);
            Points = Points.concat(badPoints);
            badPoints = new Array();
            debugMsg("    Points: " + Points);
        }

        // No bad points. This seems to have been solved.
        y++;
    }

    // // Now only one point is left. We join it in such a way that it does not intersect with the rest of the shape
    // var candidate = Points.pop();
    // for (var i = finalPoints.length - 2; i >= 0; i--) {
    //     var intersecting = false;
    //     for (var j = finalPoints.length - 2; j > i && !intersecting; j--) {
    //         intersecting = (new Line(finalPoints[j+1], finalPoints[j], false).intersect(new Line(finalPoints[i+1], candidate, false)) == null ||
    //                         new Line(finalPoints[j+1], finalPoints[j], false).intersect(new Line(candidate, finalPoints[i], false)) == null);
    //     };
    //     for (var k = i - 1; k >= 0 && !intersecting; k--) {
    //         intersecting = (new Line(finalPoints[k+1], finalPoints[k], false).intersect(new Line(finalPoints[i+1], candidate, false)) == null ||
    //                         new Line(finalPoints[k+1], finalPoints[k], false).intersect(new Line(candidate, finalPoints[i], false)) == null);
    //     };
    //     if (!intersecting) {
    //         finalPoints = finalPoints.slice(0, i).concat(new Array(candidate), finalPoints.slice(i+1, -1));
    //     }
    // }

    drawSolution(finalPoints, true);
}

/**
 * Second solution was based on the idea that if we connect the nearest points together then there will be no intersections.
 * It tries to start from one point, then calculate nearest point and go from there.
 * If it encounters an intersection, it empties the path built so far and starts with the next point.
 * It hopes that it can find one starting point from which this can be solved greedily moving to closest point.
 * It worked for a LOT of cases, but I was able to come up with some for which it failed.
 */
function solve2() {
    var start = 0; debugMsg("start: " + start);
    while (start < Points.length) {
        var finalPoints = [];
        var startPoints = Points.slice(0);
        finalPoints.push(startPoints[start]); debugMsg("finalPoints: " + finalPoints);
        startPoints.splice(start, 1); debugMsg("startPoints: " + startPoints);
        while (startPoints.length > 0 && start < Points.length) {
            var top = finalPoints.slice(-1)[0]; debugMsg("  top: " + top);
            var minDistance = Number.MAX_VALUE; debugMsg("  Initial minDistance: " + minDistance);
            var next = 0; debugMsg("  Initial next: " + next);
            for (var i = 0; i < startPoints.length; i++) {
                var thisDistance = top.getDistance(startPoints[i], false);
                if (minDistance > thisDistance) {
                    minDistance = thisDistance; debugMsg("    New minDistance: " + minDistance);
                    next = i; debugMsg("    New next: " + next);
                }
            }
            var candidate = startPoints[next];
            var intersecting = false;
            for (var i = 0; i < (finalPoints.length - 1) && !intersecting; i++) {
                var intersection = new Line(finalPoints[i], finalPoints[i+1], false).intersect(new Line(top, candidate, false));
                debugMsg("    Intersection between (" + finalPoints[i] + "," + finalPoints[i+1] + ") and (" + top + "," + candidate + "): " + intersection);
                intersecting = (intersection != null && (intersection.x != top.x || intersection.y != top.y) )
            }
            debugMsg("  intersecting: " + intersecting);
            if (intersecting) {
                start++;
                startPoints = Points.slice(0);
                finalPoints = [];
                finalPoints.push(startPoints[start]); //debugMsg("finalPoints: " + finalPoints);
                startPoints.splice(start, 1); //debugMsg("startPoints: " + startPoints);
                debugMsg("  Intersection detected. Starting from " + startPoints[start]);
            } else {
                finalPoints.push(startPoints.splice(next, 1)[0]); debugMsg("finalPoints: " + finalPoints);
            }
        }
        // Check intersection of last point and first point
        var first = finalPoints[0]; var last = finalPoints.slice(-1)[0];
        var intersecting = false;
        for (var i = 0; i < (finalPoints.length - 1) && !intersecting; i++) {
            var intersection = new Line(finalPoints[i], finalPoints[i+1], false).intersect(new Line(first, last, false));
            debugMsg("    Intersection between (" + finalPoints[i] + "," + finalPoints[i+1] + ") and (" + first + "," + last + "): " + intersection);
            intersecting = (intersection != null && (intersection.x != first.x || intersection.y != first.y) && (intersection.x != last.x || intersection.y != last.y) )
        }
        debugMsg("intersecting: " + intersecting);
        if (!intersecting) break;
        else {
            drawSolution(finalPoints, false);
            start++;
        }
    }
    if (finalPoints.length > 0) {
        drawSolution(finalPoints, true);
    } else {
        debugMsg("Could not find solution :(");
    }
}

/**
 * Function to check if lines formed between four points intersect.
 * Essentially using vector cross product.
 * Obsolete since I discovered Line.intersect method in paperjs.
 */
function isIntersecting(lp1, lp2, mp1, mp2) {
    var s1x = lp2.x - lp1.x;     var s1y = lp2.y - lp1.y;
    var s2x = mp2.x - mp1.x;     var s2y = mp2.y - mp1.y;

    var s = (-s1y * (lp1.x - mp1.x) + s1x * (lp1.y - mp1.y)) / (-s2x * s1y + s1x * s2y);
    var t = ( s2x * (lp1.y - mp1.y) - s2y * (lp1.x - mp1.x)) / (-s2x * s1y + s1x * s2y);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}