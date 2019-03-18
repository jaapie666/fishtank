
debug("Starting fish tank");
/*==========================================================================================
    FLAGS FOR DEBUGGING
===========================================================================================*/

//  flag to draw stats window for debugging
    var showStats = false;
    
// label the fish with their layer number
    var showLayer = false;

// draw lines showing the bottom of each layer
    var showLayerBounds = true;
    
//  draw the x- and -y axes on the canvas
    var showAxes = false;
    
// show or hide the fish
    var showFish = true;
    
// show or hide the pebbles
    var showPebbles = true;
    
// show or hide the plants
    var showPlants = true;

// turn off random velocity changes for fish motion
    var randomVelocityChange = true;
//  number between 0 and 1 representing the chance that a fish will change direction randomly
    var velocityChance = 0.25;
    
// turn off random layer changes for fish motion
    var randomLayerChanges = true;
//  number between 0 and 1 representing the chance that a fish will change its layer randomly
    var layerChance = 0.25;
    
//  set the frame rate
    var fr = 30;
    frameRate(fr);

// the default placement of the origin in the top left corner of the canvas can be confusing. To make it a little more intuitive we want the origin in the bottom left corner, so we'll translate by the height of the canvas.
    translate(0,height);

//  now the origin is in the right place, but the y-axis is negative. to make it positive we scale it by -1
    scale(1,-1);
// push the new matrix onto the stack
    pushMatrix();
    
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
                layer.min = new PVector(0, layer.yMin = layerHt*layers.length);
                layer.max = new PVector(width,height);
                layer.scalef = pow(depthScale,i);
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

/*=====================================================================
    FISH FUNCTIONS AND VARIABLES
=====================================================================*/  

/*  FISH OBJECT PROTOTYPE

    var fish = {    layer:  integer containing the fish's layer
                    dim:    vector containing the fish's dimensions 
                            (distance from center of the fish to the edge)
                    pos:    vector containing the fish's x- and y- position coordinates
                    vel:    vector containing the fish's velocity
                    acc:    vector containing the fish's acceleration
                    color:  color variable representing the color of the fish
    };
*/

//  Number of fish in the tank
    var numFish = 5;

//  Vectors containing the min and max values for randomly creating a fish
    var fishMaxDim = new PVector(50,30);
    var fishMinDim = new PVector(10,5);
    var fishMaxSpeed = new PVector(3,3);

//  array to hold the fish objects
    var fishes = [];
    
//  function to draw a fish object
    var drawFish = function(fish) {
        pushMatrix();
        
    //  translate to the fish's position
        translate(fish.pos.x, fish.pos.y);

    //  figure out which direction the fish should be facing based on the direction it's moving horizontally
    //  scaling by -1 on the x axis flips the fish horizontally without changing its dimensions
        var dir;
        if (fish.vel.x <= 0) { dir = -1; }
        else    {   dir = 1;   }
        
        var scaleFactor = layers[fish.layer].scalef;
        
        scale(dir*scaleFactor,scaleFactor);
    
        fill(fish.color);        //  draw the shapes
        stroke(0, 0, 0);
        
    // body
        ellipse(0, 0, fish.dim.x*2, fish.dim.y*2);
    // tail
        var tailWidth = fish.dim.x/2;
        var tailHeight = fish.dim.y;
        triangle(-fish.dim.x, 0,
             0-fish.dim.x-tailWidth, 0-tailHeight,
             0-fish.dim.x-tailWidth, 0+tailHeight);
    // eye
        fill(33, 33, 33);
        ellipse( fish.dim.x/2, 0, min(fish.dim.y,fish.dim.x)/2.5, min(fish.dim.y,fish.dim.y)/2.5);
                if (showLayer) {
                    scale(dir,-1);
                    fill(0, 0, 0);
                    text(fish.layer, 0, 0);
                }
        
    //  reset the canvas to its original configuration
        popMatrix();
    };
    
//  function prototypes for the fish object

//  function to check if a fish is about to swim off of the canvas and turn it around
    var checkBounds = function(fish) {
        var xMax = width;
        var xMin = 0;
        var yMax = height;
    
    //  set the minimum y coordinate according to the layer the fish is on
        var yMin = layers[fish.layer].min.y;
        
    //  check to see if the edges of the fish overlap with the layer boundaries    
    //  if it is, make it turn around unless it's already heading away from the boundary
        if ((fish.pos.x + fish.dim.x >= xMax) && (fish.vel.x > 0))
            {   fish.vel.x *= -1; 
                debug("Fish " + fish.num + " hit the right wall"); }
                
        if ((fish.pos.x - fish.dim.x <= xMin) && (fish.vel.x < 0))
            { fish.vel.x *= -1;
                debug("Fish " + fish.num + " hit the left wall"); }
                
        if ((fish.pos.y + fish.dim.y  >= yMax) && (fish.vel.y > 0))
            { fish.vel.y *= -1;
                debug("Fish " + fish.num + " hit the ceiling"); }
                
        if ((fish.pos.y - fish.dim.y  <= yMin) && (fish.vel.y < 0))   
            { fish.vel.y *= -1;
                debug("Fish " + fish.num + " hit the floor"); }
    
    //  if the fish changed its layer, make sure it didn't move to a layer that doesn't exist (e. g. layer -1. if so, put it 2 layers away (essentially making it move one layer in the opposite direction)
        if (fish.layer >= layers.length) 
            { fish.layer -= 2;
                debug("Fish " + fish.num + " hit the front of the tank"); }
        if (fish.layer <= 0) 
            { fish.layer += 2;
                debug("Fish " + fish.num + " hit the back of the tank"); }
                
    };
    
//  moves a fish up or down one layer
    var far = true;
    var near = false;
    
    var changeLayer = function(dir) {
        if (dir === far) {
            if (this.layer === layers.length - 1) 
                { this.layer--; }
            else 
                { this.layer ++;}
            debug("Fish " + this.num + " moved to layer " + this.layer);
            checkBounds(fishes[this.num]);
        }
        
        else if (dir === near) {
            if (this.layer === 0) 
                { this.layer ++;}
            else 
                { this.layer --;}
            debug("Fish " + this.num + " moved to layer " + this.layer);
            checkBounds(fishes[this.num]);

        }
        
        else { debug("Fish" + this.num + " error changing layers"); }
    };
    
//  gives a fish a random velocity
    var randomVel = function() {
        var newVel = new PVector (    
            random(-fishMaxSpeed.x, fishMaxSpeed.x),
            random(-fishMaxSpeed.y, fishMaxSpeed.y)
            );
        this.vel = newVel;
    };
    
//  makes the fish turn around
    var turnAround = function() {
        this.vel.x *= -1;
    };

//  function to create fish objects and add them to the array                
    var newFish = function(num) {
        
        for (var i = 0; i < num; i++) {
        //  create the fish object
            var fish = {};
            
        //  because some of the fish's properties are derived from other properties,
        //  the order that we add them is important
        
        //  the fish's identifier
            fish.num = i;

        //  first give it a random layer
            fish.layer = round(random(0,layers.length-1));

        //  then we give it random dimensions
            fish.dim  =  new PVector(   random(fishMinDim.x,fishMaxDim.x),
                                        random(fishMinDim.y,fishMaxDim.y));
                                        
        //  to prevent problems with boundary checks, we make sure to draw the fish completely 
        //      inside its layer
            fish.pos = new PVector (    random( fish.dim.x, width - fish.dim.x),
                                        random( fish.dim.y + layers[fish.layer].min.y, 
                                                layers[fish.layer].max.y - fish.dim.y));
        //  function to give a new random velocity
            fish.randomVel = randomVel;
            fish.randomVel();
            
        //  set acceleration to 0
            fish.acc = new PVector (0,0);
        
        //  give it a random color
            //fish.color = color(random(0,255), random(0,255), random(0,255));
            colorMode(HSB);
            fish.color = color(random(255), random(128,255), 255);
            
            
        //  add the functions to change layers and velocity
            fish.turnAround = turnAround;
            fish.changeLayer = changeLayer;
        
        //  finally, add it to the array
            fishes.push(fish);
        }
    };
    
//  initialize the fish array
    newFish(numFish);

/*=====================================================================
    PEBBLE FUNCTIONS & VARIABLES
=====================================================================*/
//  array to hold all the pebbles
    var pebbles = [];

//  creates a pebble object
    var newPebble = function(){
   
    
    //  create a pebble object    
        var peb ={};
        
    //  set its initial position to the origin
        peb.x = 0;
        peb.y = 0;
        peb.layer=0;
    
    //  give it random dimensions within a certain range
        peb.w = random(5,12);
        peb.h = random(3,12);
    
    // if all three RGB values are the same, changing the value gives different shades of gray
    // we create a random value between the darkest and lightest acceptable shades and give the
    // pebble a color property with that value for all three colors
        var shade = random(100,200);
        colorMode(RGB);
        peb.color = color(shade, shade, shade);
        
    //  finally, we add the new pebble object to the array
        return peb;
    
};
//  draws a single pebble object
    var drawPebble = function(peb){
        
    stroke(0, 0, 0);
    fill(peb.color);
    ellipse(peb.x,peb.y,peb.w,peb.h);
};

// the number of pebbles per layer
    var numPebbles = 400;

//  draw the pebbles for a single layer
    var makePebbleLayer = function(layer){

    var layerYmin = layers[layer].yMin;
    var layerYmax = layerYmin + layerHt;

        for (var i = 0; i < numPebbles; i++ ) 
            {   var p = newPebble();
                p.layer = layer;
                p.x = random(0,width);
                p.y = random(layerYmin,layerYmax);
                
                pebbles.push(p);
            }
};
// generate the pebbles for each layer
    for ( var i = 0; i < layers.length; i++) {  makePebbleLayer(i); }


    
/*==========================================
      PLANT FUNCTIONS & VARIABLES
==========================================*/

    var numPlants = 18;

    var plants = [];
    var maxPlantH = 374;
    var minPlantH = 150;
    var maxPlantW = 4;
    var minPlantW = 2;
    
    var newPlant = function(num) {
        
        if (num === undefined) { num = 1;}
        
        for (var i = 0; i < num; i++ ) {
            colorMode(HSB);
            var plant = {};
            plant.ht = random(minPlantH,maxPlantH);
            plant.wd = random(minPlantW,maxPlantW);
            plant.x = random(0,width);
            plant.layer = round(random(0,layers.length-1));
            plant.y = random(layers[plant.layer].yMin,layers[plant.layer].yMin + layerHt);
            plant.color = color(64, random(200,255), random(124,226));

            plants.push(plant);
            colorMode(RGB);
        }
    };

    var drawPlant = function(plant) {
        fill(plant.color);
        colorMode(HSB);
        noStroke();
        
        rect(plant.x,plant.y,plant.wd,plant.ht);
        
        colorMode(RGB);
    };

    newPlant(numPlants);

    
/*=====================================================================
    MOTION HANDLING
=====================================================================*/  

//  takes a number between 0 and 1 as an argument and compares it to a random number between 0 and 1. returns true if the randomly generated number is less than or equal to the argument and false if it is higher
    var rollDice = function(chance) {
        var roll = random(0,1);
        
        //  this function will run at least once per frame for every fish, which means that [chance] is the chance *per frame* that something will happen. this is pretty fast, so we divide [chance] by the frame rate. This scales the average chance to [chance] per second
        chance = chance/fr;
        if (roll <= chance) { return true;}
        else { return false; }
    };
    
//  has an equal chance of returning true or false
    var flipCoin = function() {
        var flip = rollDice(0.5);
        return flip;
    };
//  function to update an object's position as it moves   
    var updateVector = function(fish) {
    //  update the fish's position
        fish.pos.add(fish.vel); 

    //  update the fish's velocity
        fish.vel.add(fish.acc);
        
    //  move the fish up or down a layer randomly
    if ( rollDice(layerChance) && randomLayerChanges)
        { fish.changeLayer(flipCoin());}
    
    if ( rollDice(velocityChance) && randomVelocityChange) 
        { fish.randomVel(); debug("Fish " + fish.num +" Changed its velocity" );}
    };
    

/*=====================================================================
    LAYER DRAWING
=====================================================================*/ 


    var bgColor = color(0, 196, 255);
    
//  function to draw an individual layer and all the objects on it
    var drawLayer = function(layer) {
    /*
      The transparency of the background layer can be any value between 0 and 255. If we divide the maximum transparency value by the number of layers and then redraw the background using the result as its alpha (or transparency) value once for each layer, the final background will appear the same as if it had been drawn once at full transparency (the default if no alpha argument is given).
      Any objects drawn in between background layers will have the following translucent backgrounds
     drawn on top of them, giving the appearance of depth
    */
    
    //  the transparency value for each layer
        var alpha = (128/layers.length);
    
    //  draw the translucent background layer
        fill(bgColor,alpha);
        noStroke();
        rect(0,0,width,height);
    
        
        for (var j = 0; j <  pebbles.length; j++) {
            if (pebbles[j].layer === layer) {    drawPebble(pebbles[j]);   }
        }


        for (var j = 0; j < plants.length; j++) {
            
            if (plants[j].layer === layer) {    drawPlant(plants[j]);  }

        }
  
    //  loop through the array of fishes comparing the current layer number to the fish's layer number
    //  if they match, draw the fish
    
        for (var j = 0; j < fishes.length; j++) {
            if (fishes[j].layer ===  layer) {  drawFish(fishes[j]);   }
        }

        
    };

var WavyLayer = function(){
    this.xScale= 0.01;
    this.yScale= 0.05;
    this.t = 0;
    this.tstep = 0.01;
    this.color = bgColor;//color(0, 196, 242);

};

WavyLayer.prototype.draw = function() {
    angleMode="radians";
    noiseDetail(1,1.5);
    
    for(var x=0; x < width; x++) {
        var noiseVal = noise( x * this.xScale + this.t, sin(x*this.yScale));
        stroke(this.color,noiseVal*32);
        line(x, 0, x, height);
    }
    this.t += this.tstep;

};
var waves = new WavyLayer();

/*=====================================================================
    DEBUGGING FUNCTIONS
=====================================================================*/  
//  draw the axes on the screen
    var axes = function() {
    stroke(0, 0, 0);
    strokeWeight(1);
//  x-axis
    line(0,0,width,0);
//  y-axis
    line(0,0,0,height);
//  origin
    stroke(0, 13, 255);
    strokeWeight(5);
    point(0,0);
};

//  print stats for debugging
    var stats = function(x,y) {
        pushMatrix();
        translate(x,y);
        scale(1,-1);
        var txtSize= 25;
        var margin = 5;
        var black = color(0, 0, 0);
        
        var listFishDims = function(fish) {
            var fishStr;
                fishStr = "  F" + i + ": (" + fish.dim.x.toFixed(0) + "," + fish.dim.y.toFixed(0) + ")";
                   return fishStr;
            
        };

        
        y *= -1;
        var statStrings = [
            "Layers: " + layers.length,
            "fish: " + fishes.length,
            '\n'
            ];
    //  Show info about each fish's velocity and location
        statStrings.push("Fish #       Velocity\t\t\tPosition");
        for (var i = 0; i < fishes.length; i++) {
                var fishStr = "Fish " + i + ':\t' + "[" + fishes[i].dim.x.toFixed(0)+ "," + fishes[i].dim.y.toFixed(0) + "] L" + fishes[i].layer + "\t<" + round(fishes[i].vel.x) + "," + round(fishes[i].vel.y) + "> " + "\t(" + round((fishes[i].pos.x)) + "," + round((fishes[i].pos.y)) + ")";
                
                
                statStrings.push(fishStr);
        }
        for (var i = 0; i < layers.length; i ++) {
            var layerStr = "Layer " + i + " yMin: " + layers[i].yMin;
            statStrings.push(layerStr);
        }
        var wd = 0;
        for (var i = 0; i < statStrings.length; i ++) {
            
            var txtlen = textWidth(statStrings[i]);
            
            if ( txtlen > wd)   { wd = txtlen;  }
        }
        
        rectMode(CORNER);        
        fill(186, 186, 186,200);
        rect(0,0,wd+ 2*margin, txtSize*statStrings.length/2+margin);
        
        
        for ( var i = 0; i < statStrings.length; i++) {
            fill(0, 0, 0);
            text(statStrings[i],0+margin,0+(txtSize/2)*(i+1));
        }
    popMatrix();
    };
var paused = false;

mouseClicked = function() {
    if (paused) { paused = false; loop();debug("Unpaused");}
    else {paused = true; noLoop(); debug("Paused");}
};
draw = function() {
    background(0, 4, 71);
    if (showAxes) { axes(); }
    if (showLayerBounds) {  drawLayerBottoms(); }
//  put a rectangle behind the pebbles to hide any "holes" left over from the random placement
    fill(0, 0, 0);
    rect(0,0,width,horizon);    
//  loop through the layer array backwards so that the layers are drawn from furthest to closest
    for (var i = layers.length -1; i > -1; i--){
        drawLayer(i);
        waves.draw();
    }
    
    for (var i = fishes.length-1; i >=0;  i --) {
//            drawFish(fishes[i]);
            updateVector(fishes[i]);
            checkBounds(fishes[i]);
    }

    if(showStats) {stats(10,380);}
};
