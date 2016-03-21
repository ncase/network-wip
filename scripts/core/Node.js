/////////////////
///// NODES /////
/////////////////

(function(exports){

// RANDO CONSTANTS
var DRAW_RADIUS = 4;
var RADIUS_PER_CONNECTION = 2;
var EDGE_LENGTH = 60;
var HOOKES_CONSTANT = 0.01;
var REPEL_CONSTANT = 400;
var DAMPENING = 0.95;
var GRAVITY = 0.05;

// Create the nodes, yo
exports.nodes = [];
exports.Node = function(config){
	
	var self = this;
	
	// Properties
	self.id = config.id;
	self.type = config.type;
	self.x = config.x;
	self.y = config.y;
	self.vel = { x:0, y:0 };

	// Connections
	self.connections = [];

	// Draw
	self.graphics = nodesSVG.group().attr({
		cursor: "pointer"
	});
	self.color = Network.getNodeArt(self.type).color;
	self.body = self.graphics.circle(0, 0, DRAW_RADIUS).attr({
		fill: self.color
	});
	self.label = self.graphics.text(0, DRAW_RADIUS, self.id).attr({
		"text-anchor": "middle",
		"font-size": 7,
		"font-weight": 100,
		dy: -3,
		fill: self.color,
		fontWeight: 'bold'		
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
	self.springTo = function(other, edgeLength, hookesConstant){

		// How much force
		var dx = self.x - other.x;
		var dy = self.y - other.y;
		var distance = Math.sqrt(dx*dx+dy*dy);
		var displacement = edgeLength - distance;
		var force = hookesConstant * displacement;

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
			self.springTo({x:0, y:0}, 0, 0.002);

			// Hooke's Law on connected
			for(var i=0;i<self.connections.length;i++){

				// The other node
				var c = self.connections[i];
				var other = (c.from==self) ? c.to : c.from;

				// not NOT connected
				notConnected.splice(notConnected.indexOf(other),1);

				// Spring to
				self.springTo(other, EDGE_LENGTH, HOOKES_CONSTANT);			

			}

			// On everyone who's NOT connected...
			for(var i=0;i<notConnected.length;i++){
				var other = notConnected[i];

				// How much force
				var dx = self.x - other.x;
				var dy = self.y - other.y;
				if(dx==0 && dy==0) dx=0.1; // edge case - do NOT overlap totally
				var distanceSquared = dx*dx+dy*dy;
				if(distanceSquared<100) distanceSquared=100; // stop that asymptote
				var force = REPEL_CONSTANT/distanceSquared;

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
		self.x = self.startDragX + dx/Network.matrix.a;
		self.y = self.startDragY + dy/Network.matrix.d;
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

};

exports.Node.getById = function(id){
	for(var i=0;i<nodes.length;i++){
		var node = nodes[i];
		if(node.id==id) return node;
	}
	return null;
};

})(window);