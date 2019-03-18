    
/*========================================================================================
            LAYER VARIABLES AND FUNCTIONS
    To give the impression of depth, we'll draw each frame in a number of separate layers. Layer 0 is the closest to the screen, with each additional layer being slightly further back. We'll create a "Layer" object to hold information about each layer, and an array to hold all the Layer objects. To fake perspective, we'll declare a particular Y coordinate to be the horizon, representing the line where the floor of the fish tank meets the back wall. We'll also scale the fish (or other objects) down slightly on further layers to make them look further away.
    
    Prototype layer object:
        var layer {

                    min:  a vector representing the minimum x- and y- coordinates of the layer
                    
                    max:   a vector representing the maximum x- and y- coordinates of the layer
                    
                    scalef: an integer representing the scale factor for objects drawn on this layer
        };

Each fish or other moving object will have a "layer" property. When it's time to draw the frame, we'll loop through the layer array backwards, checking to see which objects have a "layer" property that matches the current layer and drawing them. This will draw all the objects on each layer from back to front.

*/

// a function to create a new layer object
var newLayer = function(num) {
        
    for (var i = 0; i < num; i++) {
    //  create a new layer object
        var layer = new Layer();

    //  add the layer to the array
        layers.push(layer);
    }
};
    
var Layer = function() {

    //  offset the minimum y-coordinate according to the new layer's number
    this.min = new PVector(0, this.yMin = layerHt*layers.length);
    this.max = new PVector(width,height);
    
    this.depthScale = 0.9;
    this.scalef = pow(this.depthScale,i);
    
}





// the number of layers
    var numLayers = 4;
// the y coordinate where the bed of pebbles meets the back wall of the tank
    var horizon = 75;
//  the "depth" in pixels of a single layer
    var layerHt = horizon/numLayers;
    
//  the "depth" scale factor (the amount to scale down objects drawn on this layer
//  to make them appear further away
    var depthScale = 0.9;

//  an array to hold all the layer objects
    var layers = [];
// a function to create a new layer object
    var newLayer = function(num) {
            
            for (var i = 0; i < num; i++) {
            //  create a new layer object
                var layer = {};
            //  offset the minimum y-coordinate according to the new layer's number
                this.min = new PVector(0, this.yMin = layerHt*layers.length);
                this.max = new PVector(width,height);
                this.scalef = pow(depthScale,i);
            //  add the layer to the array
                layers.push(layer);
            }
    };


//  initialize the layer array
    newLayer(numLayers);

    var drawLayerBottoms = function() {
        for (var i = 0; i < layers.length; i ++) {
            stroke(0, 0, 255);
            strokeWeight(1);
            fill(0, 0, 255, 255*i/(layers.length));
            rectMode(CORNER);
            line(   layers[i].min.x, 
                    layers[i].min.y, 
                    layers[i].max.x,
                    layers[i].min.y
                    );
                    
            pushMatrix();
            scale(1,-1);
            fill(0, 0, 0);
            text("L"+i,10,-layers[i].min.y);
            popMatrix();
        }
    };
