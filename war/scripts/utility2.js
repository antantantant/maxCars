var p = 19;

function demo(n){
	this.n = n;
	this.p = p; 
	this.X = [];
	for(var i = 0; i<this.n; i++){
    	this.X[i] = [];
        for(var j = 0; j<this.p; j++){
            this.X[i].push(Math.random());
        }
    }
	demo_scene = new webgl_scene('modelframe',$('#staticframe').width(),$('#staticframe').height(),0,0,this.X,0);
	demo_animate();
}

function create(){
	this.n = 1;
	this.p = p;
	this.X = [];
	this.sv_indices = [];
	this.rho = [];
	this.sv_coef = [];
	this.X_ = [];
	this.target = [];
	this.color = carUnselectedColor;
	this.label = [];
	for(var i = 0; i<this.n; i++){
    	this.X[i] = [];
    	this.X_[i] = [];
        for(var j = 0; j<this.p; j++){
            this.X[i].push(Math.random());
        }
        this.X_[i] = this.X[i].slice(0);
    }
	
	create_scene = new webgl_scene('createframe',$('#createframe').width(),$('#createframe').height(),0,0,this.X,2);
	create_scene.camera.rotation.x=0;
	create_scene.camera.position.x=1;
	create_scene.camera.position.y=-0.4;
	create_scene.camera.position.z=11.5;
	create_scene.renderer.clear();
	create_scene.renderer.render(create_scene.scene,create_scene.camera);
}

create.prototype.update = function(){
//	this.updateTarget(L);
	create_scene.update(this.X[0],0);
	create_scene.renderer.clear();
	create_scene.renderer.render(create_scene.scene,create_scene.camera);
};

create.prototype.store = function(){
	var baseAddress = "store";
	var data = this.toJSON();
	data = "data="+data+"&action=create";
	ajaxStorePost(baseAddress,data,this);
};

create.prototype.toJSON = function(){
	if(!this.modelName){this.modelName = 'model_'+Math.round(Math.random()*1e6);}
	var j = {"p":this.p, "X":this.X, "label":this.label,"color":[this.color]};
	var str = JSON.stringify(j);
	return str;
};

create.prototype.updateTarget = function(label){
	var n = label.name.length;
	var i,j,k,norm;
	for(i=0;i<n;i++){
		norm = [];
		for(j=0;j<label.sv_indices[i].length;j++){
			norm.push(0);
			index = label.sv_indices[i][j]-1;
			for(k=0;k<label.X[i][index].length;k++){
				norm[j]+= (this.X[0][k]-label.X[i][index][k])*(this.X[0][k]-label.X[i][index][k]);
			}
		}
		this.target[i] = label.sv_indices[i][sortWithIndeces(norm).sortIndices[0]]-1;
	}
};
function sortWithIndeces(toSort) {
	  for (var i = 0; i < toSort.length; i++) {
	    toSort[i] = [toSort[i], i];
	  }
	  toSort.sort(function(left, right) {
	    return left[0] < right[0] ? -1 : 1;
	  });
	  toSort.sortIndices = [];
	  for (var j = 0; j < toSort.length; j++) {
	    toSort.sortIndices.push(toSort[j][1]);
	    toSort[j] = toSort[j][0];
	  }
	  return toSort;
}


function label(){
	this.name = [];
	this.X = [];
	this.sv_indices = [];
	this.rho = [];
	this.sv_coef = [];
	var baseAddress = "store";
	data = "action=readlabel";
	ajaxReadLabelPost(baseAddress,data,this,C);
}


function search(methodName, methodPar){
	this.X = [];
	this.G = [];
	this.n = 4;
	this.needn = 4;
	this.ind = [];
	this.currentX = [];
	this.currentY = [];
	this.totaln = 0;
	this.p = p;
	this.iter = 1;
    this.allX = [];
    this.allInd = [];
    this.allY = [];
	this.methodName = methodName;
	this.methodPar = methodPar;
	this.survey = [-1,-1,-1,-1];
	this.track = [];
	this.color = carUnselectedColor;
}

search.prototype.initiate = function(){
    for(var i = 0; i<this.n; i++){
    	this.currentX[i] = [];
    	this.ind.push(i);
    	this.currentY.push(0);
        for(var j = 0; j<this.p; j++){
            this.currentX[i].push(Math.random());
        }
    }
////use this for a fixed start
////					0	  1     2     3     4     5		6	  7     8     9    10    11    12    13    14	 15	   16	 17    18    19
//	this.currentX[0]=[];this.currentX[1]=[];this.currentX[2]=[];this.currentX[3]=[];
//	this.currentX[0]=[0.30, 1.00, 1.00, 1.00, 0.00, 0.50, 0.50, 1.00, 0.00, 0.60, 0.80, 0.30, 0.50, 0.50, 0.40, 0.39, 1.00, 0.50, 0.60, 0.60];
//	this.currentX[1]=[1.00, 0.00, 1.00, 0.00, 1.00, 0.50, 0.00, 1.00, 0.00, 0.00, 0.60, 0.56, 0.70, 0.42, 0.49, 0.43, 0.11, 0.64, 1.00, 0.50];
//	this.currentX[2]=[0.95, 0.89, 0.23, 0.12, 0.22, 0.15, 0.04, 0.78, 0.03, 0.50, 1.00, 1.00, 0.64, 0.50, 0.50, 0.67, 0.71, 0.50, 1.00, 1.00];
//	this.currentX[3]=[0.20, 0.50, 0.00, 0.20, 1.00, 1.00, 1.00, 1.00, 0.02, 0.50, 0.30, 0.56, 0.04, 0.42, 0.17, 0.11, 0.17, 0.65, 0.47, 0.38];
    this.X = this.currentX;
    search_scene1 = new webgl_scene('modelframe1',$('#modelframe1').width(),$('#modelframe1').height(),0,0,[this.currentX[0]],1);
	search_scene2 = new webgl_scene('modelframe2',$('#modelframe2').width(),$('#modelframe2').height(),0,0,[this.currentX[1]],1);
	search_scene3 = new webgl_scene('modelframe3',$('#modelframe3').width(),$('#modelframe3').height(),0,0,[this.currentX[2]],1);
	search_scene4 = new webgl_scene('modelframe4',$('#modelframe4').width(),$('#modelframe4').height(),0,0,[this.currentX[3]],1);
	search_scene1.camera.rotation.x=0;
	search_scene1.camera.position.x=1;
	search_scene1.camera.position.y=-0.4;
	search_scene1.camera.position.z=11.5;
	search_scene2.camera.rotation.x=0;
	search_scene2.camera.position.x=1;
	search_scene2.camera.position.y=-0.4;
	search_scene2.camera.position.z=11.5;
	search_scene3.camera.rotation.x=0;
	search_scene3.camera.position.x=1;
	search_scene3.camera.position.y=-0.4;
	search_scene3.camera.position.z=11.5;
	search_scene4.camera.rotation.x=0;
	search_scene4.camera.position.x=1;
	search_scene4.camera.position.y=-0.4;
	search_scene4.camera.position.z=11.5;
	search_animate();
	$("#status a").text("Select up to three preferred designs by double clicking on the scene. Then choose to generate new designs or submit final ones.");
};

search.prototype.updateG=function(){
	var better = [];
	var worse = [];
	var i; var j;
	for (i=0;i<this.currentY.length;i++){
		if (this.currentY[i]==0){worse.push(i);}
		else {better.push(i);}
	}
	for (i=0;i<this.G.length;i++){
		for (j=0;j<this.needn;j++){
			this.G[i].push(0);
		}
	}
	for (i=0;i<this.needn;i++){
		this.G[this.G.length]=[];
		for (j=0;j<this.totaln;j++){
			this.G[this.G.length-1].push(0);
		}
	}
	for (i=0;i<better.length;i++){
		for (j=0;j<worse.length;j++){
			this.G[this.ind[better[i]]][this.ind[worse[j]]]=1;
		}			
	}
}

search.prototype.newpt = function(){
	$("#status a").text("Learning feedback data...");
	this.allX.push(this.X.slice(0));
    this.allInd.push(this.ind.slice(0));
    this.allY.push(this.currentY.slice(0));
    this.totaln = this.X.length;
    this.updateG();
    // index the next round
    this.needn = 0;
    for (var i = 0; i<this.n; i++){
	    if (this.currentY[i]==0){
	    	this.needn+=1;
	    	this.ind[i]=this.needn+this.totaln-1;
	    }
    }
    // train and explore
    var S_ = this;
    var address = "svm";
    var traindata = {"dim":this.p, "num":this.totaln, "dat":this.X, "lab":this.G};
    var traindataString = JSON.stringify(traindata);
    data = "data="+traindataString;
    var request = getRequestObject();
    request.onreadystatechange = 
      function() {
	    if ((request.readyState == 4) && (request.status == 200)) {
	    	$("#status a").text("Searching for new designs... "+S_.needn+" remains.");
		    var svmPar = request.responseText;
		    traindata = {"dim":S_.p, "num":S_.totaln, "svmPar":svmPar, 
			  	  "numIter":S_.iter, "dimone":S_.n, "method_name":S_.methodName, "method_par":S_.methodPar};
		    traindataString = JSON.stringify(traindata);
		    data = "data="+traindataString;
		    address = "search";
		    searchMethod(address, data, S_.needn, S_);
	    }
      };
    request.open("POST", address, true);
    request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
    request.send(data);
}

search.prototype.explore = function(){
	this.totaln = this.X.length;
	this.X = this.X.slice(0,this.totaln-this.needn);
    this.totaln = this.X.length;
    this.needn = this.n;
	for(var i = 0; i<this.n; i++){
    	this.currentX[i] = [];
    	this.currentY[i] = 0;
    	this.ind[i] = this.totaln+i;
        for(var j = 0; j<this.p; j++){
            this.currentX[i].push(Math.random());
        }
        this.X.push(this.currentX[i].slice(0));
    }
	search_scene1.update(this.currentX[0],0);
	search_scene2.update(this.currentX[1],0);
	search_scene3.update(this.currentX[2],0);
	search_scene4.update(this.currentX[3],0);
	search_render();
};

search.prototype.store = function(){
	this.allX.push(this.X.slice(0));
    this.allInd.push(this.ind.slice(0));
    this.allY.push(this.currentY.slice(0));
    this.totaln = this.X.length;
    this.bestInd = [];
    for (var i = 0; i<this.n; i++){
	    if (this.currentY[i]==1){
	    	this.bestInd.push(i);
	    }
    }
    this.updateG();
	var baseAddress = "store";
	var data = this.toJSON();
	data = "data="+data+"&action=store";
	ajaxStorePost(baseAddress,data,this);
};

search.prototype.toJSON = function(){
	if(!this.modelName){this.modelName = 'model_'+Math.round(Math.random()*1e6);}
	var j = {"G":this.G, "allX":this.allX, "allY":this.allY, "allInd":this.allInd,"bestInd":this.bestInd,
			"methodName":this.methodName,"modelName":this.modelName, "survey":this.survey, "track":this.track, "color":[this.color]};
	var str = JSON.stringify(j);
	return str;
}

search.prototype.loadModels = function(){
	for (var i = 0; i<this.ind.length; i++)
	this.currentX[i] = this.X[this.ind[i]];
	search_scene1.update(this.currentX[0],0);
	search_scene2.update(this.currentX[1],0);
	search_scene3.update(this.currentX[2],0);
	search_scene4.update(this.currentX[3],0);
	search_render();
	$("div#cbutton.train a").text("Generate better designs");
	wspinner.hide();
}

search.prototype.surveyset = function(q,a){
	if (this.survey[q] != a){
		this.survey[q] = a;
		$($("div#surveyframe a")[q*2+a+2]).addClass("selected");
		if (a){
			$($("div#surveyframe a")[q*2+a+1]).removeClass("selected");
		}
		else{
			$($("div#surveyframe a")[q*2+a+3]).removeClass("selected");
		}		
	} 
	else{
		this.survey[q] = -1;
		$($("div#surveyframe a")[q*2+a+2]).removeClass("selected");
	}

}

function searchMethod(address, data, nsample, s){
  var request = getRequestObject();
  request.onreadystatechange = 
    function(){
	  if ((request.readyState == 4) && (request.status == 200)) {
		  if (nsample>1) {
			  nsample-=1;
			  if (nsample>1){$("#status a").text("Searching for new designs... "+nsample+" remains");}
			  else {$("#status a").text("Some rendering going on...Please wait");}
			  
			  searchMethod(address, request.responseText, nsample, s);
		  }
		  else {
			  showResponse(request, s);
			  s.iter = s.iter + 1;
		  }
	  }
  	};
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
  request.send(data);
}

function showResponse(request, search) {
	  if ((request.readyState == 4) &&
	      (request.status == 200)) {
		  $("#status a").text("Select preferred designs (1-3) by double clicking on the scene. Then choose to generate new designs or submit final ones.");
		  var rawData = request.responseText;
		  rawData = rawData.slice(5); //cut off the "data=" part
		  var data = eval("(" + rawData + ")").svmPar;
		  search.X = data.X;
		  search.loadModels();
	  }
}

function result(){}

result.prototype.listData = function(){
	var str = "";
	for (i = 0; i<this.n; i++){
		str = str.concat("<a onclick='readtest("+i+")'>Test "+i+"</a>\n");
	}
	htmlInsert("datalistframe",str);
}

result.prototype.showTestIter = function(){
	this.allX = eval("(" + this.dataArray.allX + ")");
	this.allY = eval("(" + this.dataArray.allY + ")");
	this.allInd = eval("(" + this.dataArray.allInd + ")");
	this.bestInd = eval("(" + this.dataArray.bestInd + ")");
	this.G = eval("(" + this.dataArray.G + ")");
	this.color = eval("(" + this.dataArray.color + ")");
	
	var str = "<p>model name: "+this.dataArray.modelName+"&nbsp &nbsp &nbsp";
	str = str.concat("#iterations: "+this.allY.length+"&nbsp &nbsp &nbsp &nbsp");
	for(var i=0;i<this.bestInd.length;i++){
		str = str.concat("<a onclick='D.loadModel(" + i +")'> Model "+ i +"</a>");
	}
	htmlInsert("datafactframe",str);
	if (typeof result_scene === 'undefined'){
		result_scene = new webgl_scene('datarenderframe',$('#datarenderframe').width(),$('#datarenderframe').height(),0,0,
				[this.allX[this.allY.length-1][this.allInd[this.allY.length-1][this.bestInd[0]]]],1);
		result_scene.camera.rotation.x=0;
		result_scene.camera.position.x=1;
		result_scene.camera.position.y=-0.4;
		result_scene.camera.position.z=11.5;
	}
	else{
		result_scene.update(this.allX[this.allY.length-1][this.allInd[this.allY.length-1][this.bestInd[0]]],0);
	}
	carUnselectedColor = this.color[0];
	carSelectedColor = carUnselectedColor+1118481;
	var lc = result_scene.scene.children.length;
	result_scene.scene.children[lc-1].children[0].material.color.setHex(carUnselectedColor);
	result_scene.renderer.clear();
	result_scene.renderer.render(result_scene.scene,result_scene.camera);
};

result.prototype.loadModel = function(i){
	result_scene.update(this.allX[this.allY.length-1][this.bestInd[i]],0);
	result_scene.renderer.clear();
	result_scene.renderer.render(result_scene.scene,result_scene.camera);
};

result.prototype.showData = function(iter){
	var data = this.dataArray;
	var dim = data.dim;
	var numIter = data.numIter;
	var xArray = data.datArray;
	var yArray = data.labArray;
	
	var X = xArray[iter];
	var y = yArray[iter];
	var numSpl = y.length;
	var dArray = [];
	for (var j=0; j<numSpl; j++){
		var dObj = new Object();
		dObj.data = [];
		for (var k=0; k<dim; k++){
			dObj.data.push([k, X[j][k]]);
		}
		if (y[j] == 1){
			dObj.color="#000000";
		}
		else if (y[j] == -1){
			dObj.color="#cccccc";
		}
		dArray.push(dObj);
	}
	var dObj = new Object();
	dObj.data = [];
	for (var k=0; k<dim; k++){
		dObj.data.push([k, this.dataArray.target[k]]);
	}
	dObj.color="#FF6666";
	dArray.push(dObj);
	var options = {lines: {show: true}, points: {show: false}, yaxis: {max:1.0}};
	var placeholder = $("#dataplotframe");
	$.plot(placeholder, dArray, options);
};

function readall(d){
	var baseAddress = "store";
	var data = "query=all&action=read";
	ajaxReadPost(baseAddress, data, d);
}

function readtest(i){
	var baseAddress = "store";
	var data = "query="+i+"&action=read";
	D.i = i;
	ajaxReadPost(baseAddress, data, D);	
}

function flatten(X, n, p){
	var Y = [];
	for (var i=0;i<n;i++){
		for(var j=0;j<p;j++){
			Y[i*p+j] = X[i][j];
		}
	}
	return Y;
}

function ajaxStorePost(address, data, search) {
	  var request = getRequestObject();
	  request.onreadystatechange = function(){};
	  request.open("POST", address, true);
	  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	  request.send(data);
	  wspinner.hide();
}

function ajaxReadLabelPost(address, data, label, create) {
	  var request = getRequestObject();
	  request.onreadystatechange = function(){parseLabel(request, data, label, create)};
	  request.open("POST", address, true);
	  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	  request.send(data);
}

function ajaxReadPost(address, data, result) {
  var request = getRequestObject();
  request.onreadystatechange = function(){parseData(request, data, result)};
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
  request.send(data);
}

function parseData(request, data, result) {
  if ((request.readyState == 4) &&
      (request.status == 200)) {
	  var rawData = request.responseText;
	  if (data.slice(0,9) == "query=all"){result.n = parseInt(rawData);result.listData();}
	  else{result.dataArray=eval("(" + rawData + ")");
		  result.showTestIter();}
  }
}

function parseLabel(request, data, label, create) {
	if ((request.readyState == 4) &&
	    (request.status == 200)) {
		var rawData = request.responseText;
		var result = "";
		var i;
	if(rawData!=""){
		result = eval("(" + rawData + ")");
		label.name = result.name;
		for(i=0;i<result.name.length;i++){
			var X = eval("("+result.X[i]+")");
			label.X.push(X);
			var sv_indices = eval("("+result.sv_indices[i]+")");
			label.sv_indices.push(sv_indices);
			var rho = eval("("+result.rho[i]+")");
			label.rho.push(rho);
			var sv_coef = eval("("+result.sv_coef[i]+")");
			label.sv_coef.push(sv_coef);
		}
	}
	create.updateTarget(label);
	
	var options = {
			 max: 1,
			 min: 0,
			 step: 0.05,
			 value: 0,
 			 slide : function(e, ui) {
 				var id = parseInt(this.id.slice(11,this.id.length));
 				for(var i=0;i<p;i++){
 					C.X[0][i] = C.X_[0][i]*(1-ui.value) + L.X[id][C.target[id]][i]*ui.value;
 				}
 				create.update();
 			 },
 			 change : function(e, ui) {
 			 }
	};
	for(i=0;i<label.name.length;i++){
		$("div#expslider").append("<div id=labelslider"+i+"></div><br>");
		$("div#labelslider"+i).slider(options);
	}
	}
	wspinner.hide();
}

function htmlInsert(id, htmlData) {
  document.getElementById(id).innerHTML = htmlData;
}

// Return escaped value of textfield that has given id.
// The builtin "escape" function converts < to &lt;, etc.
function getValue(id) {
  return(escape(document.getElementById(id).value));
}

function showNewModel(request, search){
if ((request.readyState == 4) &&
	      (request.status == 200)) {
		  var rawData = request.responseText;
		  var data = eval("(" + rawData + ")");
		  search.X = data.X;
		  search.loadModels();
  }
}

function getRequestObject() {
	  if (window.XMLHttpRequest) {
	    return(new XMLHttpRequest());
	  } else if (window.ActiveXObject) { 
	    return(new ActiveXObject("Microsoft.XMLHTTP"));
	  } else {
	    return(null); 
	  }
}

///////////////////////////////////////////////////////////////////////////////////////////
function search_animate(){
//	requestAnimationFrame(search_animate);
	search_render();
}
function search_render(){
	search_scene1.renderer.clear();
	search_scene1.renderer.render(search_scene1.scene,search_scene1.camera);
	search_scene2.renderer.clear();
	search_scene2.renderer.render(search_scene2.scene,search_scene2.camera);
	search_scene3.renderer.clear();
	search_scene3.renderer.render(search_scene3.scene,search_scene3.camera);
	search_scene4.renderer.clear();
	search_scene4.renderer.render(search_scene4.scene,search_scene4.camera);
}
function demo_animate(){
	requestAnimationFrame(demo_animate);
	demo_render();
	demo_scene.stats.update();
}
function demo_render(){
	var r = 10;
	var p = demo_scene.carModel[0].position;
	var s = [Math.sin(new Date()/10000)*-0.0001,0,Math.sin(new Date()/10000)*-0.0001];
	demo_scene.camera.rotation.z+=s[2];
	demo_scene.camera.position.x=p.x+1.0*r*Math.sin(demo_scene.camera.rotation.z)+7;
	demo_scene.camera.position.y=p.y+1.0*r*Math.sin(demo_scene.camera.rotation.z);
	demo_scene.renderer.clear();
	demo_scene.renderer.render(demo_scene.scene,demo_scene.camera);
}
