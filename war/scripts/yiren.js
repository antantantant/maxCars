function ini_fancy(how){
	if (how == "3dmodel"){
		$("div#fancyblock").append('<a href="hello.html">Interactive 3D model design</a>');
//		var car = new ViewerCanvas3D('car',1,160,100,randomX(),"fancyblock",5,25);
//		new Box('box',1,car,"fancyblock",0,20);
//		setInterval(function(){car.rotatestep([0,0,1]);}, 50);
		$("div#fancyblock").append('<div id="3dmodel"></div>');
		car = new webgl_scene('3dmodel',200,120,0,0,[randomX()],1);
		car_animate();
	}
}

function car_animate(){
	car.camera.position.x=2;
	car.camera.position.z=11;
	car.camera.position.y=0;
	car.renderer.clear();
	car.renderer.render(car.scene,car.camera);
	car.stats.hidden = true;
}

function randomX(){
	X = [];
    for(var j = 0; j<20; j++){
        X.push(Math.random());
    }
    return X;
}