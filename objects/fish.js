
/*=====================================================================================*/                          
//  Fish constructor, prototypes, and other variables
/*=====================================================================================*/


//  Number of fish in the tank
    var numFish = 5;




var Fish = function() {

    //  Vectors containing the min and max values for randomly creating a fish
        this.maxDim   = new PVector(50,30); 
        this.minDim   = new PVector(10,5);
        this.maxSpeed = new PVector(3,3);

    //  the fish's identifier
        this.num = num;


    //  first give it a random layer
        this.layer = round(random(0,layers.length-1));

    //  then we give it random dimensions
        this.dim  =  new PVector(   random(this.maxDim.x, this.maxDim.x),
                                    random(this.maxDim.y, this.maxDim.y));
                                    
    //  to prevent problems with boundary checks, we make sure to draw the fish completely 
    //      inside its layer
        this.pos = new PVector (    random( this.dim.x,
                                            width - this.dim.x),
                                    random( this.dim.y + layers[this.layer].min.y, 
                                            layers[this.layer].max.y - this.dim.y)
                                            );
    //  give it a random velocity
        this.vel = Fish.randomVel();
        
    //  set acceleration to 0
        this.acc = new PVector (0,0);

    //  give it a random color
        //this.color = color(random(0,255), random(0,255), random(0,255));
        colorMode(HSB);
        this.color = color(random(255), random(128,255), 255);
        
    }


//  makes the fish turn around
Fish.prototype.turnAround = function() {
    this.vel.x *= -1;
};

//  function to check if a fish is about to swim off of the canvas and turn it around
Fish.prototype.checkBounds = function() {
    var xMax = width;
    var xMin = 0;
    var yMax = height;


//  set the minimum y coordinate according to the layer the fish is on
    var yMin = layers[this.layer].min.y;
    
//  check to see if the edges of the fish overlap with the layer boundaries    
//  if it is, make it turn around unless it's already heading away from the boundary
    if ((this.pos.x + this.dim.x >= xMax) && (this.vel.x > 0))
        {   this.vel.x *= -1; 
            debug("Fish " + this.num + " hit the right wall"); }
            
    if ((this.pos.x - this.dim.x <= xMin) && (this.vel.x < 0))
        { this.vel.x *= -1;
            debug("Fish " + this.num + " hit the left wall"); }
            
    if ((this.pos.y + this.dim.y  >= yMax) && (this.vel.y > 0))
        { this.vel.y *= -1;
            debug("Fish " + this.num + " hit the ceiling"); }
            
    if ((this.pos.y - this.dim.y  <= yMin) && (this.vel.y < 0))   
        { this.vel.y *= -1;
            debug("Fish " + this.num + " hit the floor"); }

//  if the fish changed its layer, make sure it didn't move to a layer that doesn't exist (e. g. layer -1. if so, put it 2 layers away (essentially making it move one layer in the opposite direction)
    if (this.layer >= layers.length) 
        { this.layer -= 2;
            debug("Fish " + this.num + " hit the front of the tank"); }
    if (this.layer <= 0) 
        { this.layer += 2;
            debug("Fish " + this.num + " hit the back of the tank"); }
            
};

//  moves a fish up or down one layer
    var far = true;
    var near = false;
Fish.prototype.changeLayer = function(dir) {
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
Fish.prototype.randomVel = function() {
    var newVel = new PVector (    
        random(-this.maxSpeed.x, this.maxSpeed.x),
        random(-this.maxSpeed.y, this.maxSpeed.y)
        );
    return newVel;
};
    
//  function to draw a fish object
Fish.prototype.draw = function() {
    pushMatrix();
    
    //  translate to the fish's position
    translate(this.pos.x, this.pos.y);

    //  figure out which direction the fish should be facing based on the direction it's moving horizontally
    //  scaling by -1 on the x axis flips the fish horizontally without changing its    dimensions
    var dir;

    if (this.vel.x <= 0) { dir = -1; }
    else    {   dir = 1;   }
    
    var scaleFactor = layers[this.layer].scalef;
    
    scale(dir*scaleFactor,scaleFactor);

    fill(this.color);        //  draw the shapes
    stroke(0, 0, 0);
    
// body
    ellipse(0, 0, this.dim.x*2, this.dim.y*2);
// tail
    var tailWidth = this.dim.x/2;
    var tailHeight = this.dim.y;
    triangle(-this.dim.x, 0,
             -this.dim.x-tailWidth, -tailHeight,
             -this.dim.x-tailWidth, +tailHeight);
// eye
    fill(33, 33, 33);
    ellipse( this.dim.x/2, 0, min(this.dim.y,this.dim.x)/2.5, min(this.dim.y,this.dim.y)/2.5);
            if (showLayer) {
                scale(dir,-1);
                fill(0, 0, 0);
                text(this.layer, 0, 0);
            }
    
//  reset the canvas to its original configuration
    popMatrix();
};


//  array to hold the fish objects
    var fishes = [];

//  function to create fish objects and add them to the array                
    var newFish = function(num) {
        
        for (var i = 0; i < num; i++) {
        //  create the fish object
            var fish = new Fish();
        
        //  add it to the array
            fishes.push(fish);
        }
    };
    
//  initialize the fish array
    newFish(numFish);
