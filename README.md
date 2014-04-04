#   Polygon

An expercise graphical processing in JavaScript using [PaperJS](http://paperjs.org).

I did this little project for an interview a couple of years ago. The task was to make an interface that allowed the user to click anywhere on the screen to make points, and have a "Solve" button that would then join all the points to make a [simple polygon](http://en.wikipedia.org/wiki/Simple_polygon).

### Playing with it
When you first start, you see a blank screen with a disabled *Solve* button, and two option buttons in the top right corner. Click around the screen to register points. Click *Solve* to create a simple polygon using the points. Click *Reset* to reset the screen.

Clicking *Labels* toggles coordinates on each point. Clicking *Logging* toggles logging, which can be seen in the browser console.

##  Algorithm

My initial approaches to the problem can be found in `js/failed.js`, and the final successful one in `js/polygon.js`. I describe them briefly here:

### Attempt 1: Random Depth First Search (Exponential) (Failed)
We start at a random point, and connect it to another random point, and we keep going until we make a connection which intersects an existing connection. In that case we abandon it, backtrack, and try another random connection. I knew before I began that this wouldn't work, and even if it did it would be terribly inefficient. But it got me thinking in the right direction, about efficiency and geometry and other things, so in that sense I think it was a useful effort.

### Attempt 2: Greedily Join Nearest Neighbor (Linear) (Failed)
My second approach was greedy, and quite sound on the surface. After all, looking at any vertex on a [regular](http://en.wikipedia.org/wiki/Regular_polygon) or even [convex](http://en.wikipedia.org/wiki/Convex_polygon) polygon, it is obvious that it only connects to nearest neighbors. Unfortunately, it doesn't work for concave polygons. Imagine a small circle inside a large circle. The points in the larger circle are closer to each other than those on the smaller circle, and vice-versa. However, in order for it to be a simple polygon, the connections must alternate between the larger and smaller circles. This could not be solved using the greedy approach.

### Attempt 3: Radial Sweep (Linear) (Succeeded)
My final attempt needed some inspiration, and after crawling the internet I finall found some. Unfortunately it was too long ago for me to link it, but if I ever find it I shall. Essentially, the idea is to first find the centroid of all the points. Then, we begin a radial sweep from the centroid, doing a full circle. We start with the first point we encounter, and join it to the next and the next, until we get to the last, which is joined back with the first one. This takes care of cases which invalidated the second attempt.

<hr />

### Choosing PaperJS
I had never done graphic work in JavaScript before, so was completely open to ideas. I tried out [ProcessingJS](http://processingjs.org), [PaperJS](http://paperjs.org), and [RaphaëlJS](http://raphaeljs.com). All three are brilliant projects. I started with ProcessingJS becuase I had done some work with [Processing](http://www.processing.org) at [Drexel](http://cci.drexel.edu/academics/graduate-programs/ms-in-software-engineering.aspx), and thought it might be easy to pick up, but it wasn't at the time. Raphaël seemed great too, and I think I got a little further in it than Processing, but in the end Paper had better metaphors for dealing with points and lines so I went with that.
