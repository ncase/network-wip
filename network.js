// RANDO CONSTANTS
var DRAW_RADIUS = 5;
var RADIUS_PER_CONNECTION = 2;
var EDGE_LENGTH = 60;
var HOOKES_CONSTANT = 0.01;
var REPEL_CONSTANT = 400;
var DAMPENING = 0.9;

// ALWAYS DO THIS
Math.TAU = Math.PI*2;

/////////////////
///// MODEL /////
/////////////////

// Create a model + centered container SVG.
var modelSVG = Snap("#model");
var matrix = new Snap.Matrix();
matrix.translate(modelSVG.node.clientWidth/2, modelSVG.node.clientHeight/2);
var containerSVG = modelSVG.group().attr({ transform:matrix });

/////////////////
///// EDGES /////
/////////////////

// Create the connections, yo
var edgesSVG = containerSVG.group();
var edges = [];
function Edge(config){

	var self = this;

	// Properties
	self.from = config.from;
	self.to = config.to;
	self.bidirectional = true;

	// Tell the nodes we're connected now.
	self.from.connections.push(self);
	self.to.connections.push(self);

	// Draw
	var f = self.from;
	var t = self.to;
	self.graphics = edgesSVG.line().attr({
		stroke: "#eee",
		strokeWidth: 3
	});

	// Update drawing
	self.draw = function(){
		var f = self.from;
		var t = self.to;
		self.graphics.attr({
			x1: f.x,
			y1: f.y,
			x2: t.x,
			y2: t.y
		});
	};
	self.draw();

}

/////////////////
///// NODES /////
/////////////////

// Create the nodes, yo
var nodesSVG = containerSVG.group();
var nodes = [];
function getNodeById(id){
	for(var i=0;i<nodes.length;i++){
		var node = nodes[i];
		if(node.id==id) return node;
	}
	return null;
}
function stringToRGB(string){
}
function Node(config){
	
	var self = this;
	
	// Properties
	self.id = config.id;
	self.x = config.x;
	self.y = config.y;
	self.vel = { x:0, y:0 };

	// Connections
	self.connections = [];

	// Draw
	self.graphics = nodesSVG.group().attr({
		cursor: "pointer"
	});
	self.body = self.graphics.circle(0, 0, DRAW_RADIUS).attr({
		fill: "#cc2727"
	});
	self.label = self.graphics.text(0, DRAW_RADIUS, self.id).attr({
		"text-anchor": "middle",
		"font-size": 14,
		dy: -3,
		fill: "#777",
		fontWeight: 'normal'		
	});

	// Draw
	self.draw = function(){

		// Size
		var radius = DRAW_RADIUS + self.connections.length*RADIUS_PER_CONNECTION;
		self.body.attr({ r:radius });
		self.label.attr({ y:-radius });

		// Translation...
		var matrix = new Snap.Matrix();
		matrix.translate(self.x, self.y);
		self.graphics.attr({
			transform: matrix
		});

		// Update connections, too.
		for(var i=0;i<self.connections.length;i++){
			self.connections[i].draw();
		}

	};
	self.draw();

	// Update
	self.springTo = function(other){

		// How much force
		var dx = self.x - other.x;
		var dy = self.y - other.y;
		var distance = Math.sqrt(dx*dx+dy*dy);
		var displacement = EDGE_LENGTH - distance;
		var force = HOOKES_CONSTANT * displacement;

		// In what direction
		var ux = dx/distance;
		var uy = dy/distance;
		self.vel.x += ux*force;
		self.vel.y += uy*force;

	};
	self.update = function(){	

		// PHYSICS ONLY IF NOT DRAGGED
		if(!self.isDragging){

			// Who are NOT connected to me?
			var notConnected = nodes.slice(0,nodes.length); // clones it
			notConnected.splice(notConnected.indexOf(self),1); // NOT SELF

			// Spring to the center
			//self.springTo({x:0, y:0});

			// Hooke's Law on connected
			for(var i=0;i<self.connections.length;i++){

				// The other node
				var c = self.connections[i];
				var other = (c.from==self) ? c.to : c.from;

				// not NOT connected
				notConnected.splice(notConnected.indexOf(other),1);

				// Spring to
				self.springTo(other);			

			}

			// On everyone who's NOT connected...
			for(var i=0;i<notConnected.length;i++){
				var other = notConnected[i];

				// How much force
				var dx = self.x - other.x;
				var dy = self.y - other.y;
				if(dx==0 && dy==0) dx=0.1; // edge case - do NOT overlap totally
				var distanceSquared = dx*dx+dy*dy;
				if(distanceSquared<10) distanceSquared=10; // stop that asymptote
				var force = REPEL_CONSTANT/distanceSquared;

				// If far away enough, forget it
				/*var stopDistanceSquared = 9*EDGE_LENGTH*EDGE_LENGTH;
				var stoppit = (stopDistanceSquared-distanceSquared)/stopDistanceSquared;
				if(stoppit<0) stoppit=0;
				force *= stoppit;*/

				// In what direction
				var distance = Math.sqrt(distanceSquared);
				var ux = dx/distance;
				var uy = dy/distance;
				self.vel.x += ux*force;
				self.vel.y += uy*force;

			}

			// Position
			self.x += self.vel.x;
			self.y += self.vel.y;

			// Borders
			var width = modelSVG.node.clientWidth;
			var height = modelSVG.node.clientHeight;
			if(self.x<-width/2){
				self.x=-width/2;
				if(self.vel.x<0) self.vel.x*=-0.5;
			}
			if(self.x>width/2){
				self.x=width/2;
				if(self.vel.x>0) self.vel.x*=-0.5;
			}
			if(self.y<-height/2){
				self.y=-height/2;
				if(self.vel.y<0) self.vel.y*=-0.5;
			}
			if(self.y>height/2){
				self.y=height/2;
				if(self.vel.y>0) self.vel.y*=-0.5;
			}

			// Velocity dampening
			self.vel.x *= DAMPENING;
			self.vel.y *= DAMPENING;

		}

	};

	// Click
	self.graphics.click(function(){
		//alert(self.id);
	});

	// Draggable
	self.isDragging = false;
	var move = function(dx,dy) {
		self.x = self.startDragX + dx;
		self.y = self.startDragY + dy;
		self.draw();
	}
	var start = function(){
		self.isDragging = true;
		self.startDragX = self.x;
		self.startDragY = self.y;
	};
	var end = function(){
		self.isDragging = false;
	}
	self.graphics.drag(move, start, end);

}

//////////////////////////
// CREATING THE NETWORK //
//////////////////////////

var editorDOM = document.getElementById("editor");
function parseEditor(){

	var fulltext = editorDOM.value;
	var rows = fulltext.split("\n");

	// Split & Parse
	var nodes = [];
	for(var i=0;i<rows.length;i++){

		// Parse row
		rows[i] = rows[i].split(/\,\s*/); // comma, maybe a space afterwards
		var row = rows[i];

		// If wrong, just scrape off, like mold on bread
		if(row.length!=2){
			rows.splice(i,1);
			i--;
		}else{

			// Does it have new names? If so, add 'em to the node list.
			if(nodes.indexOf(row[0])<0) nodes.push(row[0]);
			if(nodes.indexOf(row[1])<0) nodes.push(row[1]);

		}
	}

	// Return, yo
	return {
		nodes: nodes,
		edges: rows
	};

}
editorDOM.onblur = function(){
	init();
};

function init(){

	// Clear arrays
	nodesSVG.clear();
	edgesSVG.clear();
	nodes = [];
	edges = [];

	// Parse Editor!
	var config = parseEditor();

	// Create nodes
	for(var i=0; i<config.nodes.length; i++){
		var node = new Node({
			id: config.nodes[i],
			x: Math.random()*50-25,
			y: Math.random()*50-25
		});
		nodes.push(node);
	}

	// Connect nodes
	for(var i=0; i<config.edges.length; i++){
		var e = config.edges[i];
		var edge = new Edge({
			from: getNodeById(e[0]),
			to: getNodeById(e[1])
		});
		edges.push(edge);
	}

}

window.onload = init;


// RANDOM UPDATING
var updateIndex = 0;
function update(){

	// Update all nodes, nerd
	for(var i=0;i<nodes.length;i++){
		var node = nodes[i];
		node.update();
		node.draw();
	}

}

setInterval(update,1000/60);

