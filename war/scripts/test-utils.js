function target(){
	this.X = [];
	this.p = 20;
	this.car = [];
	this.box = [];
}

target.prototype.initiate = function(){
    for(var j = 0; j<this.p; j++){
        this.X.push(Math.random());
    }
	this.car.push(new ViewerCanvas3D('tar'+(0), 0, 290, 170, this.X));
	this.box.push(new Box('box'+(0), 0, this.car[0]));
}

function confirm(s){
	var y = 0;
	for (var i = 0; i<s.n; i++){
	    y = y+(s.box[i].label);
	}
	if (y==-s.n+2 && s.numIter>1){
	  htmlInsert("confirmbutton", "<a> Confirm </a>");
	  htmlInsert("cancelbutton", "<a> Cancel </a>");
	  document.getElementById("submitbutton").style.display = 'none';
	  document.getElementById("confirmbutton").style.display = 'block';
	  document.getElementById("cancelbutton").style.display = 'block';
	}
}

function cancel(){
	  document.getElementById("submitbutton").style.display = 'block';
	  document.getElementById("confirmbutton").style.display = 'none';
	  document.getElementById("cancelbutton").style.display = 'none';
}

function jumptouser(s){
//	location.href = 'userinfo.html';
		document.getElementById("submitbutton").style.display = 'block';
		document.getElementById("trainbutton").style.display = 'none';
		document.getElementById("trainingbutton").style.display = 'none';
		document.getElementById("confirmbutton").style.display = 'none';
		document.getElementById("cancelbutton").style.display = 'none';
		document.getElementById("search").style.display = 'none';
		document.getElementById("target").style.display = 'none';
		document.getElementById("toolbox_sync").style.display = 'none';
		document.getElementById("toolbox_reset").style.display = 'none';
		$("div")[7].getAttributeNode('onclick').value="store(s)"
		document.getElementById("username").style.display = 'block';
		document.getElementById("sati").style.display = 'block';
//		$("input")[3].value="";
		s.totaln = s.oldy.length+s.n;
}

function checkthebox(){
	$("input")[0].checked = !$("input")[0].checked;
}

function resetviewpoint(t, s){
	for (i=0;i<s.car.length;i++){
		s.car[i].rotationMatrix = mat4.identity([]);
		s.car[i].translationMatrix = mat4.identity([]);
		s.car[i].lastPoint = null;
		mat4.translate(s.car[i].translationMatrix,[0,0,-15]);
		mat4.rotate(s.car[i].rotationMatrix,-Math.PI/2,[1,0,0]);
		s.car[i].repaint();
	}
	t.car[0].rotationMatrix = mat4.identity([]);
	t.car[0].translationMatrix = mat4.identity([]);
	t.car[0].lastPoint = null;
	mat4.translate(t.car[0].translationMatrix,[0,0,-15]);
	mat4.rotate(t.car[0].rotationMatrix,-Math.PI/2,[1,0,0]);
	t.car[0].repaint();
}