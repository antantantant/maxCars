var canvas_dragging=null,canvas_over=null,alt=false,shift=false;
var r = "textures/";
var urls = [ r + "px.png", r + "nx.png",
			 r + "pz.png", r + "nz.png",
			 r + "py.png", r + "ny.png" ];
var textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );

var mlib = {
		"Orange metal": new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: textureCube, side: THREE.DoubleSide } ),
		"yes": new THREE.MeshLambertMaterial( { color: 0xffee00, envMap: textureCube, refractionRatio: 0.05, side: THREE.DoubleSide } ),
		"Darkgray shiny":	new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x050505, side: THREE.DoubleSide } ),
		"Gray shiny":		new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0xeeeedd, shininess: 30, side: THREE.DoubleSide } ),
		}	
var carMaterial = mlib["Gray shiny"];

function model(parameter){
    var order = 2;
    var step = 16;
    var body_n = 32;
    var wheel_n = 5;
    var wheel_step = 38;
    var tire_step = 55;
    this.car = {VertexPositionData:[],IndexData:[],NormalData:[]};
    
    var m = car_model(parameter, order, step, wheel_n, wheel_step, tire_step);
    this.car.VertexPositionData = m[0];
    this.wheel_center = m[1];
    this.wheelbase = m[2];
    
    // car body
    this.car.IndexData = carIndex(step, body_n);
    this.car.NormalData = carNormal(this.car.VertexPositionData, this.car.IndexData, step, body_n);
    this.car.IndexData = mirrorindex(this.car.IndexData, this.car.VertexPositionData.length/3);
    this.car.VertexPositionData = mirrorvertex(this.car.VertexPositionData);
    this.car.NormalData = mirrornormal(this.car.NormalData);

    // make black boxes
    var px = (this.car.VertexPositionData[4*(step+1)*(step+1)*3]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3])/2;
    var py = (this.car.VertexPositionData[4*(step+1)*(step+1)*3+1]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3+1])/2;
    var pz = (this.car.VertexPositionData[4*(step+1)*(step+1)*3+2]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3+2])/2;
    var x = Math.abs(this.car.VertexPositionData[4*(step+1)*(step+1)*3]-this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3]);
    var y = 1.0, z = 3;
    this.cube = new THREE.Mesh(new THREE.CubeGeometry(x/1.2,z,y),new THREE.MeshLambertMaterial({color: 0x000000}));
    this.cube.position.x = px; this.cube.position.y = py+0.4; this.cube.position.z = pz;
}

model.prototype.update = function(parameter){
    var order = 2;
    var step = 16;
    var body_n = 32;
    var wheel_n = 5;
    var wheel_step = 38;
    var tire_step = 55;
	var m = car_model(parameter, order, step, wheel_n, wheel_step, tire_step);
	this.car.VertexPositionData = m[0];
	this.car.NormalData = carNormal(this.car.VertexPositionData, this.car.IndexData, step, body_n);
	this.car.VertexPositionData = mirrorvertex(this.car.VertexPositionData);
    this.car.NormalData = mirrornormal(this.car.NormalData);
}

function to_three(model, mat, texture, spec_colr, unsel_colr, reflectivity){
	var geom = new THREE.Geometry();
	geom.verticesNeedUpdate = true;
	geom.elementsNeedUpdate = true;
	geom.morphTargetsNeedUpdate = true;
	geom.uvsNeedUpdate = true;
	geom.normalsNeedUpdate = true;
	geom.colorsNeedUpdate = true;
	geom.tangentsNeedUpdate = true;
	geom.dynamic = true;
	
	for (var i = 0;i<model.VertexPositionData.length/3;i++){
		geom.vertices.push(new THREE.Vector3(model.VertexPositionData[i*3],model.VertexPositionData[i*3+1],model.VertexPositionData[i*3+2]));
	}
	for (i = 0;i<model.IndexData.length/3;i++){
		geom.faces.push(new THREE.Face3(model.IndexData[i*3],model.IndexData[i*3+1],model.IndexData[i*3+2]));
		geom.faces[i].vertexNormals = [new THREE.Vector3(model.NormalData[model.IndexData[i*3]*3],
												   model.NormalData[model.IndexData[i*3]*3+1],
												   model.NormalData[model.IndexData[i*3]*3+2]),
		                                   new THREE.Vector3(model.NormalData[model.IndexData[i*3+1]*3],
		                                		   model.NormalData[model.IndexData[i*3+1]*3+1],
		                                		   model.NormalData[model.IndexData[i*3+1]*3+2]),
		                                   new THREE.Vector3(model.NormalData[model.IndexData[i*3+2]*3],
		                                		   model.NormalData[model.IndexData[i*3+2]*3+1],
		                                		   model.NormalData[model.IndexData[i*3+2]*3+2])];
	}
	geom.computeFaceNormals();
	if (mat==0){
		var material = carMaterial;
	}
	else{ var material = new THREE.MeshLambertMaterial();}
	var mesh = new THREE.Mesh(geom, material);
	return mesh;
}

function webgl_scene(scene_id,scene_width,scene_height,scene_left,scene_top,model_parameter,model_purpose){
	this.position_down = false;
	this.scene_id = scene_id;
	this.scene_width = scene_width;
	this.scene_height = scene_height;
	this.scene_left = scene_left;
	this.scene_top = scene_top;
	this.model_num = model_parameter.length;
	this.model_parameter = model_parameter;
	this.view_angle = 45;
	this.aspect = scene_width/scene_height;
	this.near = 0.1;
	this.far = 10000;
	
	this.container = $("#"+scene_id);
	this.renderer = new THREE.WebGLRenderer({antialias:true});
	this.renderer.domElement.style = "position:absolute; left:"
		+ scene_left.toString() + "px; top:" + scene_top.toString() + "px";
	this.renderer.shadowMapEnabled = true;
	this.renderer.gammaInput = true;
	this.renderer.gammaOutput = true;
	this.renderer.physicallyBasedShading = true;
	this.renderer.setSize(scene_width,scene_height);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
	this.container.append(this.renderer.domElement);
	
	this.camera =   
		new THREE.PerspectiveCamera(
			this.view_angle,
			this.aspect,
			this.near,
			this.far);
	car = new THREE.Scene();


	var planeGeo = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var planeMat = new THREE.MeshPhongMaterial({color: 0x000000});
	var plane = new THREE.Mesh(planeGeo, planeMat);
//	if (model_purpose > 0){plane.rotation.x = -Math.PI/12*5;}
	plane.position.z = -0.8;
	plane.receiveShadow = true;
	
	m = new model(model_parameter);
	var carMesh = to_three(m.car,0,this.textureCube,carSpecColor,carUnselectedColor,0.05);
	var bodyCube = m.cube;
	this.rawModel=m;
	
	carMesh.castShadow = true;
	bodyCube.castShadow = true;
	carMesh.selected = false;
	
    carModel = new THREE.Object3D();
    carModel.add(carMesh);
    carModel.add(bodyCube);
    
    var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load( '/resource/geometry/Mustang_GT500_Wheel.dae', function ( collada ) {
		var dae = collada.scene;
		dae.scale.x = dae.scale.y = dae.scale.z = 0.0024;
		dae.updateMatrix();
		var fr = dae.clone();
		fr.rotation.z = Math.PI/2;
		fr.position.x = 0.8 + m.wheel_center[0];
		fr.position.y = 0.30;
		fr.position.z = -3.7;
		carModel.add(fr);
		var fl = dae.clone();
		fl.rotation.z = -Math.PI/2;
		fl.position.x = -0.8 + m.wheel_center[0];
		fl.position.y = -0.3;
		fl.position.z = -3.7;
		carModel.add(fl);
		var rr = dae.clone();
		rr.scale.x = rr.scale.y = rr.scale.z = 0.0026;
		rr.rotation.z = Math.PI/2;
		rr.position.x = 1.0 + m.wheelbase+ m.wheel_center[0];
		rr.position.y = 0.1;
		rr.position.z = -4.0;
		carModel.add(rr);
		var rl = dae.clone();
		rl.scale.x = rl.scale.y = rl.scale.z = 0.0026;
		rl.rotation.z = -Math.PI/2;
		rl.position.x = -0.8 + m.wheelbase+ m.wheel_center[0];
		rl.position.y = -0.1;
		rl.position.z = -4.0;
		carModel.add(rl);
	} );
    
    if (model_purpose > 0){
//    	carModel.rotation.x = -Math.PI/12*5;
    	carModel.rotation.z = Math.PI/6*5;
    	}
    else{carModel.rotation.z = Math.PI/6*7;}
	
	if (model_purpose == 1){
		var light = new THREE.SpotLight(0xFEEED4,1);
		light.position.set(200,0,200);
		light.castShadow = true;
        light.shadowCameraFov = 5;
        light.shadowDarkness = 0.8;
        light.shadowMapWidth = scene_width;
        light.shadowMapHeight = scene_height;
        car.add(light);
	}
	else if(model_purpose == 2){
//		var ambient = new THREE.AmbientLight( 0xffffff,0.1 );
//		car.add( ambient );
		
		var light = new THREE.SpotLight(0xFEEED4,0.9);
		light.position.set(-200,100,200);
//		light.castShadow = true;
//        light.shadowCameraFov = 5;
//        light.shadowDarkness = 0.9;
//        light.shadowMapWidth = scene_width;
//        light.shadowMapHeight = scene_height;
        car.add( light );
		
		directionalLight = new THREE.DirectionalLight( 0xeeeeff, 0.6 );
		directionalLight.position.x = 200;
		directionalLight.position.y = 100;
		directionalLight.position.z = 200;
		directionalLight.position.normalize();
//		directionalLight.castShadow = true;
//		directionalLight.shadowDarkness = 0.9;
//		directionalLight.shadowMapWidth = scene_width;
//		directionalLight.shadowMapHeight = scene_height;		
		car.add( directionalLight );
//
//		directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
//		directionalLight.position.x = - 2000;
//		directionalLight.position.y = 100;
//		directionalLight.position.z = - 2000;
//		directionalLight.position.normalize();
//		this.scene.add( directionalLight );

//		pointLight = new THREE.PointLight( 0xffaa00, 0.3 );
//		pointLight.position.x = 0;
//		pointLight.position.y = 1200;
//		pointLight.position.z = 0;
//		car.add( pointLight );   
	}
	else{
		this.camera.position.z = carModel.position.z+14;
		this.camera.position.x = carModel.position.x+7;
		var light = new THREE.SpotLight(0xFEEED4,1);
		light.position.set(-200,0,30);
		light.castShadow = true;
        light.shadowCameraFov = 10;
//        light.shadowCameraVisible = true;
//        light.shadowBias = 0.0001;
        light.shadowDarkness = 0.8;
        light.shadowMapWidth = scene_width;
        light.shadowMapHeight = scene_height;
//		this.scene.fog = new THREE.Fog( 0xffaa55, 1, 20 );
//        THREE.ColorUtils.adjustHSV(this.scene.fog.color, 0.02, -0.15, -0.65 );
        car.add(light);
	}
	
	car.add(this.camera);
	car.add(plane);
	car.add(carModel);
	this.camera.rotation.x=Math.PI/3;
	this.camera.position.x=1;
	this.camera.position.y=-11;
	this.camera.position.z=4.5;

	this.container[0].addEventListener( 'mousedown', onDocumentMouseDown, false );
	//
	window.addEventListener( 'resize', onWindowResize, false );	
}

webgl_scene.prototype.update=function(model_parameter){
//	this.scene.remove(this.scene.__objects[1]);
//	var m = new model(model_parameter);
//	var carMesh = to_three(m.car,0,this.textureCube,carSpecColor,carUnselectedColor,0.05);
//	var wheelMesh = to_three(m.wheel,0,this.textureCube,carSpecColor,wheelColor,0.00);
//	var tireMesh = to_three(m.tire,1,this.textureCube,tireSelectedColor,tireUnselectedColor,0.00);
//	var bodyCube = m.cube;
//	carMesh.castShadow = wheelMesh.castShadow = tireMesh.castShadow = bodyCube.castShadow = true;
//	wheelMesh.receiveShadow = true;
//	tireMesh.doubleSided = true;carMesh.doubleSided = true;bodyCube.doubleSided = false;
//	carMesh.selected = false;
//	carMesh.id = wheelMesh.id = tireMesh.id = bodyCube.id = 0;
//    this.carModel=[];
//    this.carModel.push(new THREE.Object3D());
//    this.carModel[0].add(carMesh);this.carModel[0].add(wheelMesh);this.carModel[0].add(tireMesh);this.carModel[0].add(bodyCube);
//    this.carModel[0].rotation.x = -Math.PI/12*5; this.carModel[0].rotation.z = Math.PI/6*5;
//	this.scene.add(this.carModel[0]);
	
	this.rawModel.update(model_parameter);
	var geom = carModel.children[0].geometry;
	var model = this.rawModel.car;
	for (var i = 0;i<model.VertexPositionData.length/3;i++){
		geom.vertices[i].set(model.VertexPositionData[i*3],model.VertexPositionData[i*3+1],model.VertexPositionData[i*3+2]);
	}
	for (i = 0;i<model.IndexData.length/3;i++){
		geom.faces[i].vertexNormals[0].set(model.NormalData[model.IndexData[i*3]*3],
												   model.NormalData[model.IndexData[i*3]*3+1],
												   model.NormalData[model.IndexData[i*3]*3+2]);
		geom.faces[i].vertexNormals[1].set(model.NormalData[model.IndexData[i*3+1]*3],
		                                		   model.NormalData[model.IndexData[i*3+1]*3+1],
		                                		   model.NormalData[model.IndexData[i*3+1]*3+2]);
		geom.faces[i].vertexNormals[2].set(model.NormalData[model.IndexData[i*3+2]*3],
		                                		   model.NormalData[model.IndexData[i*3+2]*3+1],
		                                		   model.NormalData[model.IndexData[i*3+2]*3+2]);
	}
	geom.computeFaceNormals();
	
	geom.verticesNeedUpdate = true;
	geom.elementsNeedUpdate = true;
	geom.morphTargetsNeedUpdate = true;
	geom.uvsNeedUpdate = true;
	geom.normalsNeedUpdate = true;
	geom.colorsNeedUpdate = true;
	geom.tangentsNeedUpdate = true;
	geom.dynamic = true;
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function onDocumentMouseDown( event ) {

	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseXOnMouseDown = event.clientX - windowHalfX;
	targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;

	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}

function onDocumentMouseUp( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

var projector = new THREE.Projector();
var wheelColor = 0xAAAAAA;
var carSelectedColor = 0xffffff;
var carUnselectedColor = 0xeeeeee;
var carSpecColor = 0xeeeeee;
var tireSelectedColor = 0x555555;
var tireUnselectedColor = 0x111111;