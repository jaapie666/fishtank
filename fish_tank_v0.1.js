/*  
 *      Javascript fish tank simulator
 *      By Jacob Postma 2019
 * 
 * 
 *      TO DO:
 *       - fix bug where fish get stuck in y axis (hysteresis?)
 *       - replace mSec() with built in millis()
 *       - look into using vectors for motion and position
 *       - add layer objects to store lower boundary for each layer
 *       
 *       -add stripes and/or fins to fish
 *       -figure out how to make the fish colors more varied
 *           maybe:
 *               1. average the hues of all the fish already in the array
 *               2. get random(0,255) for new fish color
 *               3. if new fish color is within a range around the average fish color,
 *                   newFishColor = (newFishColor + 128) % 256
 *           - this doesn't seem to work the way i thought it would
 *       - randomize plant colors
 *       - randomize pebble shapes?
 *       - look into perlin noise for textures or water effects
 *       - bubbles
 *       - castle
*/


/*=====================================================================
    DEBUGGING
=====================================================================*/

//  flag to draw stats window for debugging
    var showStats = false;

//  draw boxes around the fish to show their dimensions
    var showFishBoxes = false;
    
// label the fish with their layer number
    var showLayer = false;

/*=====================================================================
    GLOBAL & TIMING 
=====================================================================*/
//  frame rate
    var fr   = 60;
    frameRate(fr);
    
//  function that returns the number of milliseconds since the start of the draw function    
    var mSecs = function() {    return round(1000*frameCount/(fr)); };
    
//  maximum number of layers of depth (plus 1 for layer 0)
    var maxLayers = 4;


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

//  the y value of the top of the bed of pebbles
    var pebbleHeight = 55;
//  height of each layer of pebbles
    var layerHt = pebbleHeight/(maxLayers);

// the number of pebbles per layer
    var numPebbles = 250;


//  draw the pebbles for a single layer
    var makePebbleLayer = function(layer){
    var layerYmax = height - (pebbleHeight - layerHt*layer);
    var layerYmin = height - (pebbleHeight - layerHt*(layer+1));

        for (var i = 0; i < numPebbles; i++ ) 
            {   var p = newPebble();
                p.layer = layer;
                p.x = random(0,width);
                p.y = random(layerYmin,layerYmax);
                
                pebbles.push(p);
            }
};

/*==========================================
      PLANT FUNCTIONS & VARIABLES
==========================================*/

    var numPlants = 50;

    var plants = [];
    var maxPlantH = 374;
    var minPlantH = 150;
    var maxPlantW = 4;
    var minPlantW = 2;
    
    var newPlant = function(num) {
        
        if (num === undefined) { num = 1;}
        
        for (var i = 0; i < num; i++ ) {
            var plant = {};
            plant.ht = random(minPlantH,maxPlantH);
            plant.wd = random(minPlantW,maxPlantW);
            plant.x = random(0,width);
            plant.layer = round(random(0,maxLayers));
            
            plants.push(plant);
        }
    };

    var drawPlant = function(plant) {
        fill(71, 199, 24);
        noStroke();
        
        rect(plant.x,height-plant.layer-plant.ht,plant.wd,plant.ht);
    
    };

/*==========================================
      FISH FUNCTIONS & VARIABLES
  ========================================*/
//  the initial number of fish in the tank
    var numFish = 7;
    
//  movement counter variable
    var t=0;

//  array containing all the fish objects to be drawn
    var fishes =[];
/*
//  testing fish object
    var fish0 = {   x: 187,
                y: 150,
                layer: 0, 
                dx: 0, 
                dy: 0,
                len: 118 , 
                ht: 74, 
                color: color(162, 0, 255)};
//  add fish0 to the array of fishes
    fishes.push (fish0);
*/

//  variables for randomly generating fish
    var maxLen = 120;   //  maximum fish length
    var minLen = 20;    //  minimum fish length
    var maxHt  = 80;    //  maximum fish height
    var minHt  = 20;    //  minimum fish height
    var maxSpeed = 1;   //  maximum fish speed(positive or negative)
    
// create a number of randomly generated fish
    var newFish = function (num) {

        
        //  make sure we draw at least one fish if the function is called with no argument
        
        if (num === undefined) { num = 1;}
        
        for (var i = 0; i < num; i++)   {
            
            var fish ={};
            fish.len=random(minLen,maxLen);
            fish.ht=random(minHt,maxHt);
            

            fish.x=random(0,width);
            fish.y=random(0,height-pebbleHeight-fish.ht/2);
            
            fish.layer= round( random(0,maxLayers));
            
            fish.dx = random(-maxSpeed,maxSpeed);
            fish.dy = random(-maxSpeed,maxSpeed);
            fish.startled = false;
            

            colorMode(HSB);
        // generating the hue completely randomly sometimes results in fish that are all similar in color. to try and make the color range more diverse, we'll take the average of all the fish already in the array. Then we loop, generating new random hues until the new hue is outside of a predetermined range around the average hue. I can't tell if it helps or not; it will still generate fish with very similar colors, although possibly fewer than with the simple random method.
        
            var hueSum=0;
            var hueRange = 55;
            for (var i = 0; i< fishes.length; i++) {
                hueSum += hue(fishes[i].color);
            }
            var avgHue = round(hueSum/fishes.length);
            var newFishHue = random(0,255);
            
            while ((newFishHue < (avgHue + hueRange)) && (newFishHue > (avgHue - hueRange)) ) {
                newFishHue = random(0,255);//(newFishHue + 63/*random(128-hueRange,128+hueRange)*/) % 256;   
            }
                fish.color= color(newFishHue, random(200,255), 255);
                colorMode(RGB);
                fishes.push(fish);
            }
    };

// draw a fish object
    var drawFish = function(fish) {


        
    //  save the current canvas state
        pushMatrix();

    //  calculate the location of the fish
        var xn = fish.x;
        var yn = fish.y;
    //  translate the origin to the center of the fish's body (so we can draw everything relative to the fish's center instead of the top left corner)
        translate(xn,yn);
    
    //  figure out which direction the fish should be facing based on the direction it's moving horizontally
    //  scaling by -1 on the x axis flips the fish horizontally without changing its dimensions
        var dir;
        if (fish.dx <= 0) { dir = -1; }
        else    {   dir = 1;   }
    
    //  generate a scaling factor to draw the fish smaller if it's on a deeper layer
        var layerScaleFactor = 10/((5-fish.layer)+10);
        
    //  scale and flip according to the values we generated 
        scale(dir*layerScaleFactor,layerScaleFactor);

        if (showFishBoxes) {    rectMode(CENTER);
                            noStroke();
                            fill(fish.color,178);
                            rect(   0,
                                    0,
                                    fish.len,
                                    fish.ht    );
                            
                            rectMode(CORNER);}
        
 
    
    //  draw the shapes
        stroke(0, 0, 0);
        colorMode(HSB);
        fill(fish.color);
        
    // body
        ellipse(0, 0, fish.len, fish.ht);
    // tail
        var tailWidth = fish.len/4;
        var tailHeight = fish.ht/2;
        triangle(0-fish.len/2, 0,
             0-fish.len/2-tailWidth, 0-tailHeight,
             0-fish.len/2-tailWidth, 0+tailHeight);
    // eye
        fill(33, 33, 33);
        ellipse( fish.len/4, 0, min(fish.ht,fish.len)/5, min(fish.ht,fish.len)/5);
        
    //  set the color mode back to RGB
        colorMode(RGB);    
    //  reset the canvas to its original configuration
        popMatrix();
        

    };
/*=====================================================================
    TAP FUNCTIONS & VARIABLES
=====================================================================*/

// flag set when the glass is tapped
    var tap = false;
    
// time that the fish will calm down
    var tapEnd;
    
// how long the fish will be startled (in milliseconds)
    var tapLength = 300;
    
//  fish speed while startled by the tap
    var tapSpeed = 15;
    
//  function to handle a mouse click (tap on the glass)
    mouseClicked = function() {
        tap = true;
        tapEnd = mSecs() + tapLength;
        
        var mx=mouseX;
        var my=mouseY;
    //  loop through the fish array        
        for (var f = 0; f < fishes.length; f++) {
            var fsh = fishes[f];
            
        // get the distance from the fish to the point where the glass was tapped
            var d = dist(fsh.x,fsh.y,mx,my);
            
/*      the new speed in each direction is set to the slope of the line between the fish and the point
    that was clicked and then scaled by tapSpeed. this makes the fish swim directly away from
    the point that was clicked at a speed set by tapSpeed
        */
            var dx = tapSpeed*(fsh.x - mx)/d;
            var dy = tapSpeed*(fsh.y - my)/d;
            
            fsh.dx = dx;
            fsh.dy = dy;
            fsh.startled = true;
        }
        
    };

//  call once each frame to update the positions of the fish
    var updateFish = function() {
    // check if the fish are startled; if they are, see how much time has passed since the tap. if it's been longer than tapLength ms, give the fish a new random velocity vector 

        if (( tap === true) && ( mSecs() >= tapEnd )){
            tap = false;
            
             for (var f = 0; f < fishes.length; f++) {
                var fsh = fishes[f];
                
                fsh.dx = random(-maxSpeed,maxSpeed);
                fsh.dy = random(-maxSpeed,maxSpeed);
                fsh.startled = false;
            }           
        }
    
      for (var i = 0; i < fishes.length; i++) {
          var fish = fishes[i];
        
        
        
        // if the fish is about to swim out of the canvas, make it turn around
            if ((fish.x + fish.len/2 >= width) || (fish.x - fish.len/2 <= 0)) {
                fish.dx *= -1;
            }
            
            if ( (fish.y + fish.ht/2 >= (height - layerHt*(maxLayers-fish.layer)) ) || 
                 (fish.y - fish.ht/2 <= 0) ) {
                    fish.dy *=-1;
            }
    
            fish.x += fish.dx;
            fish.y += fish.dy; 
            
        //  % chance every frame that a fish will move up or down a layer
        //  because the y value at which the fish turns around is determined by the layer it is on,
        //  there was a bug where fish would get "trapped" below their maximum y value if they moved
        //  back a layer while below the new layer's maximum. to prevent that, we only allow the fish
        //  to move up or down a layer if they're above the pebble bed
        
            if (fish.y+fish.ht/2 < height-pebbleHeight) {
                if ( random(0,100) < 0.28 ) {
                    var direction = round(random(0,1)); 
                    
                    if ( direction ) {
                    
                        fish.layer -= 1;
                        if ( fish.layer === -1 ) { fish.layer = 1;}
                    }
                    else { 
                        
                        fish.layer += 1;
                        if ( fish.layer === 5) {    fish.layer = 3;}
                    }
                    

                
                }
            }
            
        //  % chance every second that the fish will change its speed and or direction in the x or y direction
            if (true) {
                if ( random(0,100) < 0.57 ) {
                    var direction = round(random(0,1)); 
                    
                    if ( direction ) {  fish.dx = random(-maxSpeed,maxSpeed);  }
                    }
                
                if ( random(0,100) < 0.57 ) {
                    var direction = round(random(0,1)); 
                    
                    if ( direction ) {  fish.dy = random(-maxSpeed,maxSpeed);  }
                    }
            }
            
        }// end of fish loop
      
    };
    
/*===============================================
    STATS
===============================================*/    
    
//  print stats for debugging
    var stats = function(x,y) {
        
        var txtSize= 25;
        var margin = 5;
        var black = color(0, 0, 0);
        

 
        
        var hueSum=0;
        for (var i = 0; i< fishes.length; i++) {
            hueSum += hue(fishes[i].color);
        }
        var avgColor = round(hueSum/fishes.length);
        
        var statStrings = [
                "Number of fish: " + fishes.length, //  [0] number of fish
                "t=" + round(mSecs()/1000) + "." + (mSecs() % 1000),          "Pebbles: " + pebbles.length,
                "Plants: " + plants.length
            ];
        
        for (var i = 0; i < fishes.length; i++) {
                var fishStr = "Fish" + i + ':' + " L" + fishes[i].layer + " <" + round(100*fishes[i].dx) + "," + round(100*fishes[i].dy) + "> " + " (" + round((fishes[i].x)) + "," + round((fishes[i].y)) + ")";
                
                
                statStrings.push(fishStr);
                
        }
        var wd = 0;
        for (var i = 0; i < statStrings.length; i ++) {
            
            var txtlen = textWidth(statStrings[i]);
            
            if ( txtlen > wd)   { wd = txtlen;  }
        }
        
        fill(186, 186, 186,200);
        rect(x,y,wd+ 2*margin, txtSize*statStrings.length/2+margin);
        
        
        for ( var i = 0; i < statStrings.length; i++) {
            fill(0, 0, 0);
            text(statStrings[i],x+margin,y+(txtSize/2)*(i+1));
        }
    };
    

/*===============================================
    Layer handling functions
===============================================*/

//  background (water) color
    var bgColor = color(0, 196, 255);
    
//  function to draw an individual layer and all the objects on it
    var drawLayer = function(layer) {
    /*
      The transparency of the background layer can be any value between 0 and 255. If we divide the maximum transparency value by the number of layers and then redraw the background using the result as its alpha (or transparency) value once for each layer, the final background will appear the same as if it had been drawn once at full transparency (the default if no alpha argument is given).
      Any objects drawn in between background layers will have the following translucent backgrounds
     drawn on top of them, giving the appearance of depth
    */
    
    //  the transparency value for each layer
        var alpha = (255/maxLayers);
    
    //  draw the translucent background layer
        fill(bgColor,alpha);
        noStroke();
        rect(0,0,width,height);
    
    
        for (var j = 0; j < plants.length; j++) {
            
            if (plants[j].layer === layer) {
                drawPlant(plants[j]);   
            }
            if (showLayer) { fill(0,0,0); text(plants[j].layer, plants[j].x, plants[j].y); }

        }
    
    //  loop through the array of fishes comparing the current layer number to the fish's layer number
    //  if they match, draw the fish
    
        for (var j = 0; j < fishes.length; j++) {
            
            
            if (fishes[j].layer === layer) {    
                    

                    drawFish(fishes[j]);   
                    
            }
            if (showLayer) { text(fishes[j].layer, fishes[j].x, fishes[j].y); }

        }
        
        for (var j = 0; j < pebbles.length; j++) {
            
            if (pebbles[j].layer === layer) {    drawPebble(pebbles[j]);   }
        }
        
    };

/*===============================================
    object initialization and draw() function
===============================================*/
// generate the pebbles for each layer
    for ( var i = 0; i < maxLayers; i++) {  makePebbleLayer(i); }

    newPlant(numPlants);
//  Create the fish objects and put them in the array
    newFish(numFish);

draw = function() {

//  draw a white background to clear the screen from the last frame, otherwise the fish 
//  leave "trails" as they move
    colorMode(RGB);
    background(255, 255, 255);
    
//  put a rectangle behind the pebbles to hide any "holes" left over from the random placement
    fill(255, 0, 0);
    rect(0,height-pebbleHeight+5,width,height);

// loop through all the layers and draw each one in order from 0 to [maxLayers]
    for (var l = 0; l < maxLayers+1; l++)   {  drawLayer(l);  drawPlant(plants[0]); }

//  update the fish positions    
    updateFish();

// print the stat window if it's turned on
if (showStats) { stats(12,17); }

};


/*         


strokeWeight(5);
stroke(255, 0, 0);
point(0,0);
var drawGrid = function() {
    for (var i = -(width/2); i < (width/2); i += width/10) {
        strokeWeight(1);
        stroke(0, 0, 0);
        line(i,height/2,i,-height/2);
    }

for (var i = -(height/2); i < (height/2); i += height/10) {
    strokeWeight(1);
    stroke(0, 0, 0);
    line(width/2,i,-width/2,i);
}
};

//drawGrid();

*/



