// Create a model + centered container SVG.
var modelSVG = Snap("#model");
var matrix = new Snap.Matrix();
matrix.translate(modelSVG.node.clientWidth/2, modelSVG.node.clientHeight/2);
var containerSVG = modelSVG.group().attr({ transform:matrix });

// Edges below nodes
var edgesSVG = containerSVG.group();
var nodesSVG = containerSVG.group();

//////////////////////////
// CREATING THE NETWORK //
//////////////////////////

window.Network = {};

Network.init = function(config){

	// Clear arrays & SVG
	nodesSVG.clear();
	edgesSVG.clear();
	nodes = [];
	edges = [];

	// Stages
	Network.stageIndex = -1;
	Network.stages = config.stages;

	// First stage
	Network.nextStage();

};

Network.nextStage = function(){

	// Get next stage
	if(Network.stageIndex>=Network.stages.length-1) return;
	Network.stageIndex++;
	Network.stage = Network.stages[Network.stageIndex];
	var stage = Network.stage;

	// Random placement
	var _random = function(){
		return Math.random()*10-5;
	};

	// Create new nodes
	var newNodes = [];
	for(var i=0; i<stage.nodes.length; i++){
		var n = stage.nodes[i];
		var node = new Node({
			id: n.id,
			x: n.x || _random(),
			y: n.y || _random()
		});
		newNodes.push(node);
		nodes.push(node);
	}

	// Create new edges
	for(var i=0; i<stage.edges.length; i++){
		var e = stage.edges[i];
		var from = Node.getById(e.from);
		var to = Node.getById(e.to);
		var edge = new Edge({
			from: from,
			to: to
		});
		edges.push(edge);

		// If exactly one of those nodes are new,
		// have it "spring" off the existing node
		if(newNodes.indexOf(from)<0 && newNodes.indexOf(to)>=0){
			to.x = from.x + _random();
			to.y = from.y + _random();
		}else if(newNodes.indexOf(to)<0 && newNodes.indexOf(from)>=0){
			from.x = to.x + _random();
			from.y = to.y + _random();
		}

	}

};

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