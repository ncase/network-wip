/////////////////
///// EDGES /////
/////////////////

(function(exports){

// Create the connections, yo
exports.edges = [];
exports.Edge = function(config){

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

};

})(window);