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
	self.type = config.type;

	// Tell the nodes we're connected now.
	self.from.connections.push(self);
	self.to.connections.push(self);

	// Draw
	var f = self.from;
	var t = self.to;
	var art = Network.getEdgeArt(self.type);
	self.graphics = edgesSVG.line().attr({
		stroke: (art.color=="inherit" ? self.from.color : art.color),
		strokeWidth: art.thickness || 1,
		opacity: (art.color=="inherit" ? 0.5 : 1)
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