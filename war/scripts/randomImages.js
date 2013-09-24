function fragmentShader(){
	this.str = "uniform float time;\n" +
			"uniform vec2 resolution;\n" +
//			"float abs(float x1){float f = x1>0.0? x1:-x1;return f;}\n"+
			"float gaus(float x1, float x2, float a, float b){float f = exp(-pow(x1-a,2.0)-pow(x2-b,2.0));return f;}\n"+
			"float power(float x1, float x2){float f=0.0; if(x1==0.0&&x2==0.0){f=1.0;}else if(x1==0.0&&x2!=0.0){f=1.0;}else{f=pow(x1,x2);}return f;}\n"+
			"float wave(float positionx, float positiony, float time){for(float i=0.0;i<30.0;i++)" +
			"{float f; float t=time/10.0+(i+0.3);positiony+=sin(-t+positionx*9.0)*0.1;" +
			"positionx+=cos(-t+positiony*6.0+cos(t/1.0))*0.15;" +
			"float value=(sin(positiony*10.0)+positionx*5.1);" +
			"float stripColor = 1.0/sqrt(value)*3.0;" +
			"f+= stripColor/50.0;return f;}}\n" +
			"float repeatx(float positionx, float positiony, float par1, float par2){\n" +
			"float f = sin( positionx * par1 * 100.0+10.0 ) + cos( positiony * par2 * 100.0+10.0 );return f;}\n" +
			"float repeaty(float positionx, float positiony, float par1, float par2){\n" +
			"float f = cos( positionx * par1 * 100.0+10.0 ) + sin( positiony * par2 * 100.0+10.0 );return f;}\n" +
			"float noise(float px, float py, float par1, float par2, float par3){\n" +
			"float f=fract(sin(dot(vec2(px,py) ,vec2(par1*100.0,par2*100.0))) * par3*10000.0);return f;}\n" +
			"void main(void){\n" +
			"vec2 position= 2.0 * gl_FragCoord.xy / resolution.xy - 1.0;" +
			"float color1 = 0.0;\n" +
			"float color2 = 0.0;\n" +
			"float color3 = 0.0;\n";
}

fragmentShader.prototype.randomize = function(){
	this.g1 = new DAG();
	this.g1.randomize(10.0*Math.random());
	this.g1.parse();
	this.str += "color1+="+this.g1.str+";\n";
//	this.g2 = new DAG();
//	this.g2.randomize();
//	this.g2.parse();
//	this.str += "color2+="+this.g2.str+";\n";
//	this.g3 = new DAG();
//	this.g3.randomize();
//	this.g3.parse();
//	this.str += "color3+="+this.g3.str+";\n";
	
	var tail = "vec3 color=vec3(color1*0.5,color1*0.3,color1*0.2);color*=color.r+color.g+color.b;gl_FragColor = vec4(color,1.0);}";
//	this.str += "color += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );\n" +
//			"color += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );\n" +
//			"color += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );\n" +
//			"color *= sin( time / 10.0 ) * 0.5;\n" +
	this.str+=tail;
};

fragmentShader.prototype.evolve = function(){
	if(this.g1.par_node.length>0){
		var id = Math.floor(this.g1.par_node.length*Math.random());
//		this.g1.node_set[this.g1.par_node[id][0]].par[this.g1.par_node[id][1]]*=1+(Math.random()>0.5?1:-1)*0.1;
		this.g1.node_set[this.g1.par_node[id][0]].par[this.g1.par_node[id][1]]*=10;
		this.g1.parse();
		this.str += "color1+="+this.g1.str+";\n";
		var tail = "vec3 color=vec3(color1*0.5,color1*0.3,color1*0.2);color*=color.r+color.g+color.b;gl_FragColor = vec4(color,1.0);}";
		this.str+=tail;		
	}
};

function DAG(){
	this.par_list = [1,2,3,11];//"position.x","position.y","time","repeat"*6,"par"
	this.op_list = [["sin",1],["cos",1],["tan",1],["*",2],["/",2],["+",2],["-",2],
	                ["power",2],["exp",1],
	                ["abs",1],["gaus",4],
					["wave",2],["repeatx",2],["repeaty",2],["noise",5]];
//	this.op_list = [["gaus",2]];
	this.var_list = [];
	this.node_set = [];
	this.graph_node_number = this.node_set.length;
	this.connectto = [];
	this.connectfrom = [];
	this.deepconnectto = [];
	this.deepconnectfrom = [];
	this.str = "";
	this.par_node = [];
}

DAG.prototype.randomize = function(l){
	this.length = l;
	this.output_node = new Node(this,0,0);
	this.output_node.randomize();
	this.node_set.push(this.output_node);
	var active_nodes = [this.output_node];
	var new_active_nodes;
	var i;
	while(true){
		new_active_nodes = [];
		for(i=0;i<active_nodes.length;i++){
			new_active_nodes = new_active_nodes.concat(active_nodes[i].extend());
		}
		if(new_active_nodes.length==0){break;}
		else{active_nodes = $.extend(true,[],new_active_nodes);}
	}
	this.graph_node_number = this.node_set.length;
};

DAG.prototype.parse = function(){
	var count = 0;
	var entrance = [];
	var connectfrom = $.extend(true,[],this.connectfrom);
	var i,j,label,elements_id,elements,temp_val;
	var str_set = new Array(this.graph_node_number);
	var new_entrance, temp_locked, par_count;
	for(i=0;i<connectfrom.length;i++){
		for(j=0;j<this.connectfrom[i].length;j++){
			if(this.connectfrom[i][j]<0){
				connectfrom[i].splice(connectfrom[i].indexOf(this.connectfrom[i][j]),1);
			}
		}
	}
	var locked = [];
	for(i=0;i<this.graph_node_number;i++){
		if(connectfrom[i].length>0){
			locked.push(i);
		}
		else{
			entrance.push(this.node_set[i]);
		}
	}
	
	while(entrance.length>0&&count<this.graph_node_number){
		for(i=0;i<entrance.length;i++){
			par_count = 0;
			label = entrance[i].label;
			elements_id = this.connectfrom[entrance[i].id];
			if(elements_id.length==0){
				var holdon = 1;
			}
			elements = new Array(elements_id.length);
			for(j=0;j<elements.length;j++){
				switch(elements_id[j]){
				case -1:
					elements[j] = "position.x"; break;
				case -2:
					elements[j] = "position.y"; break;
				case -3:
					elements[j] = "time"; break;
				case -11:
					temp_val = this.node_set[entrance[i].id].par[par_count]; par_count++;
					elements[j] = "time * "+temp_val; break;
				default:
					if(elements_id[j]<this.graph_node_number){
						elements[j] = str_set[elements_id[j]];
					}break;
				}
			}
			switch(label){
			case "sin":
				str_set[entrance[i].id] = "sin("+elements[0]+")";break;
			case "cos":
				str_set[entrance[i].id] = "cos("+elements[0]+")";break;
			case "+":
				str_set[entrance[i].id] = "("+elements[0]+")+("+elements[1]+")";break;
			case "-":
				str_set[entrance[i].id] = "("+elements[0]+")-("+elements[1]+")";break;
			case "*":
				str_set[entrance[i].id] = "("+elements[0]+")*("+elements[1]+")";break;
			case "/":
				str_set[entrance[i].id] = "("+elements[0]+")/("+elements[1]+"+0.000000000001)";break;
			case "power":
				str_set[entrance[i].id] = "power("+elements[0]+","+elements[1]+")";break;	
			case "gaus":
				str_set[entrance[i].id] = "gaus("+elements[0]+","+elements[1]+","+elements[2]+","+elements[3]+")";break;	
			case "exp":
				str_set[entrance[i].id] = "exp("+elements[0]+")";break;
			case "log":
				str_set[entrance[i].id] = "log("+elements[0]+")";break;
			case "tan":
				str_set[entrance[i].id] = "tan("+elements[0]+")";break;
			case "abs":
				str_set[entrance[i].id] = "abs("+elements[0]+")";break;
			case "repeatx":
				str_set[entrance[i].id] = "repeatx(position.x,position.y,"+elements[0]+","+elements[1]+")";break;
			case "repeaty":
				str_set[entrance[i].id] = "repeaty(position.x,position.y,"+elements[0]+","+elements[1]+")";break;
			case "wave":
				str_set[entrance[i].id] = "wave("+elements[0]+","+elements[1]+",time)";break;
			case "noise":
				str_set[entrance[i].id] = "noise("+elements[0]+","+elements[1]+","+elements[2]+","+elements[3]+","+elements[4]+")";break;
//			case "repeat_x1":
//				str_set[entrance[i].id] = "sin( position.x * 80.0 ) + cos( position.y * 10.0 )";break;
//			case "repeat_x2":
//				str_set[entrance[i].id] = "sin( position.x * 40.0 ) + cos( position.y * 40.0 )";break;
//			case "repeat_x3":
//				str_set[entrance[i].id] = "sin( position.x * 10.0 ) + cos( position.y * 80.0 )";break;
//			case "repeat_y1":
//				str_set[entrance[i].id] = "sin( position.y * 80.0 ) + cos( position.x * 10.0 )";break;
//			case "repeat_y2":
//				str_set[entrance[i].id] = "sin( position.y * 40.0 ) + cos( position.x * 40.0 )";break;
//			case "repeat_y3":
//				str_set[entrance[i].id] = "sin( position.y * 10.0 ) + cos( position.x * 80.0 )";break;
			}
		}
		
		new_entrance = [];
		temp_locked = $.extend(true,[],locked);
		for(i=0;i<locked.length;i++){
			for(j=0;j<entrance.length;j++){
				if(this.connectfrom[locked[i]].indexOf(entrance[j].id)>-1){
					connectfrom[locked[i]].splice(connectfrom[locked[i]].indexOf(entrance[j].id),1);
				}
			}
			if(connectfrom[locked[i]].length==0){
				new_entrance.push(this.node_set[locked[i]]);
				temp_locked.splice(temp_locked.indexOf(locked[i]),1);
			}
		}
		entrance = $.extend(true,[],new_entrance);
		locked = $.extend(true,[],temp_locked);
		count++;
	}
	this.str = str_set[0];
	if(this.str==undefined){
		var fuck = 1;
	}
};

function Node(g,id,l){
	this.parent = g;
	this.level = l;
	this.id = id;
	this.label;
	this.n_connection;
	this.par = [];
	g.connectto.push([]);
	g.connectfrom.push([]);
	g.deepconnectto.push([]);
	g.deepconnectfrom.push([]);
}

Node.prototype.randomize = function(){
	var label_id = Math.floor(Math.random()*this.parent.op_list.length);
	this.label = this.parent.op_list[label_id][0];
	if (this.label==undefined){
		var holdon = 1;
	}
	this.n_connection = this.parent.op_list[label_id][1];
};

Node.prototype.extend = function(){
	var g = this.parent;
	var i,j,id, temp_node, temp_list;
	var p = Math.min(this.level/g.length,1);
	var node_set = [];
	for(i=0;i<this.n_connection;i++){
		if(Math.random()<p){
			// use input parameter
			id = Math.floor(Math.random()*g.par_list.length);
			g.connectfrom[this.id].push(-g.par_list[id]);
			g.deepconnectfrom[this.id].push(-g.par_list[id]);
			if(g.par_list[id]==11){
				this.par.push(Math.random());
				g.par_node.push([this.id,this.par.length-1]);
			}
		}
		else{
			// create new nodes or connect from existing nodes (same or lower level)
			temp_list = [];
			for(j=1;j<g.node_set.length;j++){
				if(g.deepconnectto[j].indexOf(this.id)==-1&&g.deepconnectfrom[j].indexOf(this.id)==-1
						&&j!=this.id&&g.node_set[j].level>=this.level){
					temp_list.push(j);
				}
			}
			if(Math.random()<0.5||temp_list.length==0){
				temp_node = new Node(g,g.node_set.length,this.level+1);
				temp_node.randomize();
				g.node_set.push(temp_node);
				g.connectfrom[this.id].push(temp_node.id);
				g.connectto[temp_node.id].push(this.id);
				g.deepconnectfrom[this.id].push(temp_node.id);
				g.deepconnectto[temp_node.id].push(this.id);
				g.deepconnectto[temp_node.id] = g.deepconnectto[temp_node.id].concat(g.deepconnectto[this.id]);
				g.deepconnectfrom[this.id] = g.deepconnectfrom[this.id].uniquify();
				g.deepconnectto[temp_node.id] = g.deepconnectto[temp_node.id].uniquify();
				for(j=0;j<g.deepconnectto[this.id].length;j++){
					g.deepconnectto[g.deepconnectto[this.id][j]].push(temp_node.id);
					g.deepconnectfrom[temp_node.id].push(g.deepconnectto[this.id][j]);
				}
				node_set.push(temp_node);
			}
			else{
				id = Math.floor(Math.random()*temp_list.length);
				g.connectfrom[this.id].push(temp_list[id]);
				g.deepconnectfrom[this.id].push(temp_list[id]);
				g.deepconnectfrom[this.id] = g.deepconnectfrom[this.id].concat(g.deepconnectfrom[temp_list[id]]);
				g.connectto[temp_list[id]].push(this.id);
				g.deepconnectto[temp_list[id]].push(this.id);
				g.deepconnectto[temp_list[id]] = g.deepconnectto[temp_list[id]].concat(g.deepconnectto[this.id]);
				g.deepconnectfrom[this.id] = g.deepconnectfrom[this.id].uniquify();
				g.deepconnectto[temp_list[id]] = g.deepconnectto[temp_list[id]].uniquify();
				for(j=0;j<g.deepconnectto[this.id].length;j++){
					g.deepconnectto[g.deepconnectto[this.id][j]].push(temp_list[id]);
					g.deepconnectfrom[temp_list[id]].push(g.deepconnectto[this.id][j]);
					g.deepconnectto[g.deepconnectto[this.id][j]] = g.deepconnectto[g.deepconnectto[this.id][j]].uniquify();
					g.deepconnectfrom[temp_list[id]] = g.deepconnectfrom[temp_list[id]].uniquify();
				}
			}
		}
	}
	return node_set;
};

Array.prototype.uniquify = function() {
	var o = {}, i, l = this.length, r = [];
	for(i=0; i<l;i+=1) o[this[i]] = this[i];
	for(i in o) r.push(o[i]);    
	return r;
};

	
	
//	this.graph_node_number = Math.round(Math.floor()*this.maximum_node_number);
//	var open_slot = new Array(this.graph_node_number);
//	this.label = new Array(this.graph_node_number);
//	var i,count,total_open_slot = 0.,label_ind,par,par_ind,par_pos,var_open_slot_ind=[],feasible_slot_ind;
//	for(i=0;i<this.graph_node_number;i++){
//		label_ind = Math.floor(Math.random()*this.op_list.length);
//		this.label[i] = this.op_list[label_ind][0];
//		open_slot[i] = this.op_list[label[i]][1];
//		if(this.var_op_list.indexOf(label_ind)>-1){
//			var_open_slot_ind.push(i);
//		}
//		total_open_slot += open_slot[i];
//	};
//	this.connectto = new Array(this.graph_node_number+this.par_list.length);
//	this.connectfrom = new Array(this.graph_node_number);
//	for(i=0;i<this.connectto.length;i++){
//		this.connectto[i] = [];
//	}
//	for(i=0;i<this.connectfrom.length;i++){
//		this.connectfrom[i] = [];
//	}
//	
//	// assign inputs to function nodes
//	var max_input_slot = total_open_slot - (this.graph_node_number - 1);
//	count = 0;
//	feasible_slot_ind = [];
//	for(i=0;i<open_slot.length;i++){feasible_slot_ind[i].push(i);}
//	while(count<max_input_slot){
//		par_ind = Math.floor(Math.random()*this.par_list.length);
//		par = this.par_list[par_ind];
//		if(par<this.par_list.length){
//			par_pos = Math.floor(Math.random()*feasible_slot_ind.length);
//			open_slot[feasible_slot_ind[par_pos]]--;
//			if(open_slot[feasible_slot_ind[par_pos]]==0){
//				feasible_slot_ind.splice(par_pos,1);
//			}			
//			this.connectto[this.graph_node_number+par_ind].push(feasible_slot_ind[par_pos]);
//			this.connectfrom[feasible_slot_ind[par_pos]].push(this.graph_node_number+par_ind);
//			count++;
//		}
//		else{
//			if(this.var_open_slot_ind.length>1){
//				par_pos = Math.floor(Math.random()*this.var_open_slot_ind.length);
//				if(feasible_slot_ind.indexOf(var_open_slot_ind[par_pos])>-1){
//					open_slot[var_open_slot_ind[par_pos]]--;
//					if(open_slot[feasible_slot_ind[par_pos]]==0){
//						feasible_slot_ind.splice(feasible_slot_ind.indexOf(var_open_slot_ind[par_pos]),1);
//					}	
//					this.connectto[this.connectto.length-1].push(var_open_slot_ind[par_pos]);
//					this.connectfrom[var_open_slot_ind[par_pos]].push(this.connectto.length-1);
//					count++;
//				}
//			}
//		}
//	}
//	
//	// link the rest of the graph
//	var node_list = [];
//	var feasible_node_list = [];
//	for(i=0;i<graph_node_number.length;i++){node_list[i].push(i);}
//	var link_ind =  [feasible_slot_ind[Math.floor(Math.random()*feasible_slot_ind.length)]];
//	this.output_id = link_ind[0];
//	var temp_node_list;
//	var ind;
//	var next_link_ind;
//	while(node_list.length>0){
//		next_link_ind = [];
//		for(i=0;i<link_ind.length;i++){
//			temp_node_list = node_list.slice(0);
//			temp_node_list.splice(temp_node_list.indexOf(link_ind[i]),1);
//			while(open_slot[link_ind(i)]>0&&temp_node_list.length()>0){
//				ind = Math.floor(Math.random()*temp_node_list.length);
//				this.connectto[temp_node_list[ind]].push(link_ind[i]);
//				this.connectfrom[link_ind[i]].push(temp_node_list[ind]);
//				next_link_ind.push(link_ind[i]);
//				temp_nod_list.splice(ind,1);
//				open_slot[link_ind(i)]--;
//			}
//		}
//		// find unique next_link_ind - link_ind
//		next_link_ind = next_link_ind.unique();
//		for(i=0;i<link_ind.length;i++){
//			if(next_link_ind.indexOf(link_ind[i])>-1){
//				next_link_ind.splice(next_link_ind.indexOf(link_ind[i]),1);
//			}
//			node_list.splice(node_list.indexOf(link_ind[i]),1);
//		}
//		link_ind = next_link_ind.slice(0);
//	}
//	this.entrance = link_ind;