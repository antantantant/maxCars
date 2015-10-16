// Show the time in the city whose name is given
// by the textfield whose id is "city-1". Use GET.

function search(){
	this.X = [];
	this.y = [];
	this.oldX;
	this.oldy;
	this.n = 8;
	this.totaln = 8;
	this.p = 20;
	this.car = [];
	this.box = [];
}

search.prototype.initiate = function(){
    for(var i = 0; i<this.n; i++){
        for(var j = 0; j<this.p; j++){
            this.X.push(Math.random());
        }
    }
	for (i = 0; i<this.n; i++){
		this.car.push(new ViewerCanvas3D('car'+(i+1), i, 380, 220, this.X.slice(i*this.p,(i+1)*this.p)));
		this.box.push(new Box('box'+(i+1), i, this.car[i]));
	}
	this.oldX = [];
	this.oldy = [];
};

search.prototype.loadModels = function(){
	for (var i = 0; i<this.n; i++){
		//this.car[i] = new ViewerCanvas3D('car'+(i+1), 380, 220, this.X.slice(i*this.p,(i+1)*this.p));
		
		this.car[i].model = this.X.slice(i*this.p,(i+1)*this.p);
		this.car[i].setupScene();
		this.car[i].repaint();
		this.box[i].checked = false;
		this.box[i].label = -1;
		s.box[i].create("rgb(230, 230, 230)");	
		//this.box[i] = new Box('box'+(i+1), this.car[i]);
	}
	//document.writeln('<br><br><br><br><br><br><br><br><br><br><br><br><br><input type="button" value="Do" onclick="showTimeInCity(s)"/>');
};

function showTimeInCity(s) {
  var baseAddress = "show-time-in-city";
  var y = [];
  for (var i = 0; i<s.n; i++){
	  y.push(s.box[i].label);
  }
  var X = s.oldX.concat(s.X);
  y = s.oldy.concat(y);
  s.totaln = y.length;
  //X = flatten(X, s.n, s.p);
  var data = JSONparse(s.totaln, s.p, X, y);
  data = "city="+data;
  //var address = baseAddress + "?city=" + data;
  ajaxResultPost(baseAddress, data, s);
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

function getTable(data) {
	var table = "<table border='1' class='ajaxTable'>\n" +
				getTableBody(data)+
				"</table>";
	return (table);
}

function getTableBody(data){
	  var body = "";
	  body += "<tr><td>" + "X" + "</td>" + "<td>" + data.X.toString() + "</td></tr>\n";
	  body += "<tr><td>" + "oldX" + "</td>" + "<td>" + data.oldX.toString() + "</td></tr>\n";
	  body += "<tr><td>" + "oldy" + "</td>" + "<td>" + data.oldy.toString() + "</td></tr>\n";
	  return(body);
}

function JSONparse(n, p, vx, vy){
	var j = {"dim":p, "num":n, "dat":vx, "lab":vy};
	var s = JSON.stringify(j);
	return s;
}

//temporary matlab i/o
function matlabWrite(s){
	  var baseAddress = "write-to-file";
	  var y = [];
	  for (var i = 0; i<s.n; i++){
		  y.push(s.box[i].label);
	  }
	  var X = s.oldX.concat(s.X);
	  y = s.oldy.concat(y);
	  s.totaln = y.length;
	  //X = flatten(X, s.n, s.p);
	  var data = JSONparse(s.totaln, s.p, X, y);
	  data = "data="+data;
	  //var address = baseAddress + "?city=" + data;
	  ajaxWrite(baseAddress, data);
}

function matlabRead(s){
	  var baseAddress = "read-from-file";
	  ajaxRead(baseAddress, s);
}

search.prototype.createModels = function(){
	for (var i = 0; i<this.n; i++){
		this.car.push(new ViewerCanvas3D('car'+(i+1), i, 380, 220, this.X.slice(i*this.p,(i+1)*this.p)));
		this.box.push(new Box('box'+(i+1), i, this.car[i]));
	}
};
