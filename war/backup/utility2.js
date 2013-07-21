function search(n, method_name, method_par){
	this.X = [];
	this.y = [];
	this.oldX;
	this.oldy;
	this.n = n;
	this.totaln = n;
	this.p = 20;
	this.car = [];
	this.box = [];
	
	//store for data analysis
	this.xTotal = [];
	this.yTotal = [];
	this.numIter = 1;
	
	this.method_name = method_name;
	this.method_par = method_par;
}

search.prototype.initiate = function(){
	
    for(var i = 0; i<this.n; i++){
    	this.X[i] = [];
        for(var j = 0; j<this.p; j++){
            this.X[i].push(Math.random());
        }
    }
	this.car.push(new webgl_scene('modelframe',$('#interactionframe').width(),$('#interactionframe').height(),0,0,this.X));
	this.oldX = [];
	this.oldy = [];
};

search.prototype.loadModels = function(){
	for (var i = 0; i<this.n; i++){
		this.car[i].model = this.X[i];
		this.car[i].setupScene();
		this.car[i].repaint();
		this.box[i].checked = false;
		this.box[i].label = -1;
		s.box[i].create("rgb(250, 250, 250)");	
	}
};

function result(){
	this.dataArray = [];
}

result.prototype.showTestIter = function(){
	var l = this.dataArray.labArray.length;
	var str = "";
	for (var j=0;j<l;j++){
		str = str.concat("<a onclick='d.showData("+j+")'>"+j+"</a>\n");
	}
	htmlInsert("dataiterframe",str);
	
	var w = this.dataArray.satisfied;
	var target = this.dataArray.target;
	if (w==1){
		$("a")[this.i+5].style.setProperty("background-color","#33CC66");
	}
	else {
		$("a")[this.i+5].style.setProperty("background-color","#FF6666");
	}
}

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
}


function newpt(s) {
  var address = "svm";
  var y = [];
  var nsample = 0;
  for (var i = 0; i<s.n; i++){
	  y.push(s.box[i].label);
	  if (y[i]<0){
		  nsample+=1;
	  }
  }
  var X = s.oldX.concat(s.X);
  y = s.oldy.concat(y);
  s.totaln = y.length;
  
 
  var traindata = {"dim":s.p, "num":s.totaln, "dat":X, "lab":y};
  var traindataString = JSON.stringify(traindata);
  data = "data="+traindataString;
  
  
  //send data for svm training
  var request = getRequestObject();
  request.onreadystatechange = 
    function() {
	  if ((request.readyState == 4) && (request.status == 200)) {
		  var svmPar = request.responseText;
		  traindata = {"dim":s.p, "num":s.totaln, "svmPar":svmPar, 
				  "numIter":s.numIter, "dimone":s.n, "method_name":s.method_name, "method_par":s.method_par};
		  traindataString = JSON.stringify(traindata);
		  data = "data="+traindataString;
		  address = "search";
		  searchMethod(address, data, nsample);
	  }
	  else {
		  htmlInsert("trainingbutton", "<a style='z-index: 2'> Searching...</a>");
		  document.getElementById("trainingbutton").style.display = 'block';
		  document.getElementById("trainbutton").style.display = 'none';
	  }
    };
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
  request.send(data);
  
  
  //store data
  s.xTotal.push(X);
  s.yTotal.push(y);
}

function searchMethod(address, data, nsample){
  var request = getRequestObject();
  request.onreadystatechange = 
    function(){
	  if ((request.readyState == 4) && (request.status == 200)) {
		  if (nsample>1) {
			  nsample-=1;
			  searchMethod(address, request.responseText, nsample);
		  }
		  else {
			  showResponse(request, s);
			  s.numIter = s.numIter + 1;
		  }
	  }
	  else {
		  htmlInsert("trainingbutton", "<a style='z-index: 2'> Searching...</a>");
		  document.getElementById("trainingbutton").style.display = 'block';
		  document.getElementById("trainbutton").style.display = 'none';
	  }
  	};
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
  request.send(data);	
}

function store(s) {
	fn = $("input")[1].value;
	ln = $("input")[2].value;
	w = $("input")[3].value;
	
	if (fn&&ln&&w) {
		var baseAddress = "store";
		var y = [];
		for (var i = 0; i<s.n; i++){
		    y.push(s.box[i].label);
		}
		var X = s.oldX.concat(s.X);
		y = s.oldy.concat(y);
		
		s.xTotal.push(X);
		s.yTotal.push(y);
		
		var data = JSONparsefinal(s.numIter, s.p, s.xTotal, s.yTotal, t.X, fn, ln, w, s.method_name, s.method_par);
		data = "data="+data;
		ajaxStorePost(baseAddress, data, s);
		document.getElementById("confirmbutton").style.display = 'none';
		document.getElementById("cancelbutton").style.display = 'none';
		document.getElementById("username").style.display = 'none';
		document.getElementById("sati").style.display = 'none';
		document.getElementById("thank").style.display = 'block';
	}
}


function readall(d){
	var baseAddress = "read";
	var data = "query=all";
	ajaxReadPost(baseAddress, data, d);
}

function readtest(i){
	var baseAddress = "read";
	var data = "query="+i;
	d.i = i;
	ajaxReadPost(baseAddress, data, d);	
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

function JSONparse(numIter, n, ntotal, p, vx, vy, method_name, method_par){
	var j = {"numIter":numIter, "dimone":n, "dim":p, "num":ntotal, "dat":vx, "lab":vy, "method_name":method_name, "method_par":method_par};
	var s = JSON.stringify(j);
	return s;
}

function JSONparsefinal(numIter, p, xTotal, yTotal, target, fn, ln, w, method_name, method_par){
	var j = {"dim":p, "numIter":numIter, "datArray":xTotal, "labArray":yTotal, "firstName":fn, "lastName":ln, "satisfied":w, "target":target, "method_name":method_name, "method_par":method_par};
	var s = JSON.stringify(j);
	return s;
}

search.prototype.createModels = function(){
	for (var i = 0; i<this.n; i++){
		this.car.push(new ViewerCanvas3D('car'+(i+1), i, 290, 170, this.X.slice(i*this.p,(i+1)*this.p)));
		this.box.push(new Box('box'+(i+1), i, this.car[i]));
	}
};
