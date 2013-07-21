var p = 19;
var label_set = ["sporty","luxury","green"];
//var label_set = ["sporty"];
function validate(){
	var address = "store";
	data = "action=validate";
	var request = getRequestObject();
	request.onreadystatechange = function(){};
	request.open("POST", address, true);
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	request.send(data);
}


function test(){
	this.ntest = 15;
	this.time = new Date();
	var address = "store";
	this.name = label_set[Math.floor(Math.random()*label_set.length)];
	$("div#question").append("<a style='font-size:300%;'>"+this.name+"</a><br><p>Please select the more <em>"+this.name+"</em> design from the following two and click CONFIRM. Drag mouse to rotate the designs. There are "+this.ntest+" comparisons remaining.</p>");
	data = "name="+this.name+"&ntest="+(this.ntest-1)+"&action=mturkGetTest";
	if(this.name=="sporty"){
		this.sanityX1 = [0.30, 1.00, 1.00, 1.00, 0.00, 0.50, 0.50, 1.00, 0.60, 0.80, 0.30, 0.50, 0.50, 0.40, 0.39, 1.00, 0.50, 0.60, 0.60];
		this.sanityX2 = [1.00, 0.00, 1.00, 0.00, 1.00, 0.50, 0.00, 1.00, 0.00, 0.60, 0.56, 0.70, 0.42, 0.49, 0.43, 0.11, 0.64, 1.00, 0.50];
	}
	else if(this.name=="luxury"){
		this.sanityX1 = [0.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.55, 1.00, 0.00, 0.00, 0.00, 1.00, 1.00, 1.00, 1.00];
		this.sanityX2 = [0.45, 0.35, 0.30, 0.30, 1.00, 1.00, 0.95, 0.45, 0.65, 0.45, 0.95, 1.00, 0.30, 0.15, 0.00, 0.85, 0.00, 1.00, 0.70];
	}
	else if(this.name=="green"){
		this.sanityX1 = [0.90, 0.00, 0.00, 0.30, 0.80, 0.00, 0.00, 0.00, 0.00, 0.50, 0.55, 0.35, 0.75, 0.05, 0.60, 0.30, 1.00, 0.60, 1.00];
		this.sanityX2 = [0.00, 0.55, 0.60, 0.60, 0.00, 0.00, 0.25, 0.00, 0.45, 1.00, 0.55, 1.00, 0.35, 0.05, 0.40, 1.00, 1.00, 0.85, 0.80];
	}
	this.sanityY = -1;
	getTestPost(address,data,this);
}

test.prototype.show = function(){
	var x1 = this.X[this.current][0];
	var x2 = this.X[this.current][1];
	if(this.current==0){
		test_scene1 = new webgl_scene('displayframe1',$('#displayframe1').width(),$('#displayframe1').height(),0,0,[x1],2);
		test_scene1.camera.rotation.x=0;
		test_scene1.camera.position.x=1;
		test_scene1.camera.position.y=-0.4;
		test_scene1.camera.position.z=11.5;
		test_scene1.renderer.clear();
		test_scene1.renderer.render(test_scene1.scene,test_scene1.camera);
		test_scene2 = new webgl_scene('displayframe2',$('#displayframe2').width(),$('#displayframe2').height(),0,0,[x2],2);
		test_scene2.camera.rotation.x=0;
		test_scene2.camera.position.x=1;
		test_scene2.camera.position.y=-0.4;
		test_scene2.camera.position.z=11.5;
		test_scene2.renderer.clear();
		test_scene2.renderer.render(test_scene2.scene,test_scene2.camera);
	}
	else{
		test_scene1.update(x1,0);
		test_scene1.renderer.clear();
		test_scene1.renderer.render(test_scene1.scene,test_scene1.camera);
		test_scene2.update(x2,0);
		test_scene2.renderer.clear();
		test_scene2.renderer.render(test_scene2.scene,test_scene2.camera);
	}
};

test.prototype.next = function(){
	this.current ++;
	this.show();
};

test.prototype.submit = function(){
	var endtime = new Date();
	this.time = endtime - this.time;
	if(this.y[7]==this.truey[7]){
		// passed sanity check
		var count = 0;
		var trainX = [];
		var trainY = [];
		for(var i=0;i<this.ntest;i++){
			if(this.y[i]==this.truey[i]){count++;}
			if(this.y[i]!=0){
				trainX.push(this.X[i]);
				trainY.push(this.y[i]);
			}
		}
		this.accuracy = count/trainY.length;
		var baseAddress = "store";
		var j = {"p":p, "X":trainX,"name":this.name,"y":trainY,"accuracy":this.accuracy,"time":this.time};
		var data = JSON.stringify(j);
		data = "data="+data+"&action=mturkSubmit";
		testSubmitPost(baseAddress,data,this);
	}
	else{
		this.accuracy = -1;
		var baseAddress = "store";
		var j = {"p":p,"name":this.name,"accuracy":this.accuracy,"time":this.time};
		var data = JSON.stringify(j);
		data = "data="+data+"&action=mturkSubmit";
		testSubmitPost(baseAddress,data,this);
	}
};

function testSubmitPost(address, data, search) {
	  var request = getRequestObject();
	  request.onreadystatechange = function(){};
	  request.open("POST", address, true);
	  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	  request.send(data);
}

function getTestPost(address, data, test) {
	  var request = getRequestObject();
	  request.onreadystatechange = function(){getTest(request, test)};
	  request.open("POST", address, true);
	  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	  request.send(data);
}

function getTest(request, test){
	if ((request.readyState == 4) &&
		    (request.status == 200)) {
			var rawData = request.responseText;
			var result = "";
			var i;
			if(rawData!=""){
				result = eval("(" + rawData + ")");
				test.X = result.X.slice(0,7);
				test.X.push([test.sanityX1,test.sanityX2]);
				test.X = test.X.concat(result.X.slice(7,test.ntest-1));
				test.truey = result.y.slice(0,7);
				test.truey.push(test.sanityY);
				test.truey = test.truey.concat(result.y.slice(7,test.ntest-1));
				test.y = new Array(test.X.length);
				test.current = 0;
			}
			test.show();
			wspinner.hide();
	}
}

function getMTurkCodePost(){
	  var address = "store";
	  var data = "&action=mturkGetCode";
	  var request = getRequestObject();
	  request.onreadystatechange = function(){getMTurkCode(request)};
	  request.open("POST", address, true);
	  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	  request.send(data);
}

function getMTurkCode(request){
	if ((request.readyState == 4) &&
		    (request.status == 200)) {
			var rawData = request.responseText;
			alert("The MTurk code is: "+rawData);
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

