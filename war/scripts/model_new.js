var canvas_dragging=null,canvas_over=null,alt=false,shift=false;

function model(parameter, carMaterial){
    var order = 2;
    var step = 16;
    var body_n = 32;
    var wheel_n = 5;
    var wheel_step = 38;
    var tire_step = 55;
    this.wheel = {VertexPositionData:[],IndexData:[],NormalData:[]},
    this.tire = {VertexPositionData:[],IndexData:[],NormalData:[]}; 
    
    
    var m = carModel(parameter, order, step, wheel_n, wheel_step, tire_step, carMaterial);
    this.car = m[0];
    this.wheel.VertexPositionData = m[1];
    this.tire.VertexPositionData = m[2];
    
    // car body
//    this.car.IndexData = carIndex(step, body_n);
//    this.car.NormalData = carNormal(this.car.VertexPositionData, this.car.IndexData, step, body_n);
//    this.car.IndexData = mirrorindex(this.car.IndexData, this.car.VertexPositionData.length/3);
//    this.car.VertexPositionData = mirrorvertex(this.car.VertexPositionData);
//    this.car.NormalData = mirrornormal(this.car.NormalData);

    // wheels
    this.wheel.IndexData = wheelIndex(wheel_step, wheel_n);
    this.wheel.NormalData = wheelNormal(this.wheel.VertexPositionData, wheel_step, wheel_n);
    this.wheel.IndexData = mirrorindex(this.wheel.IndexData, this.wheel.VertexPositionData.length/3);
    this.wheel.VertexPositionData = mirrorvertex(this.wheel.VertexPositionData);
    this.wheel.NormalData = mirrornormal(this.wheel.NormalData);

    // separate tire from wheel
    this.tire.IndexData = tireIndex(tire_step, wheel_n);
    this.tire.NormalData = tireNormal(this.tire.VertexPositionData, tire_step, wheel_n);
    this.tire.IndexData = mirrorindex(this.tire.IndexData, this.tire.VertexPositionData.length/3);
    this.tire.VertexPositionData = mirrorvertex(this.tire.VertexPositionData);
    this.tire.NormalData = mirrornormal(this.tire.NormalData);
    
    // make black boxes
//    var px = (this.car.VertexPositionData[4*(step+1)*(step+1)*3]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3])/2;
//    var py = (this.car.VertexPositionData[4*(step+1)*(step+1)*3+1]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3+1])/2;
//    var pz = (this.car.VertexPositionData[4*(step+1)*(step+1)*3+2]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3+2])/2;
//    var x = Math.abs(this.car.VertexPositionData[4*(step+1)*(step+1)*3]-this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3]);
//    var y = 1.0, z = 3;
//    this.cube = new THREE.Mesh(new THREE.CubeGeometry(x/1.3,z,y),new THREE.MeshLambertMaterial({color: 0x000000}));
//    this.cube.position.x = px; this.cube.position.y = py+0.4; this.cube.position.z = pz;
}

model.prototype.update = function(parameter){
//    var order = 2;
//    var step = 16;
//    var body_n = 32;
//    var wheel_n = 5;
//    var wheel_step = 38;
//    var tire_step = 55;
//	var m = carModel(parameter, order, step, wheel_n, wheel_step, tire_step);
//	this.car.VertexPositionData = m[0];
//	this.car.NormalData = carNormal(this.car.VertexPositionData, this.car.IndexData, step, body_n);
//	this.car.VertexPositionData = mirrorvertex(this.car.VertexPositionData);
//    this.car.NormalData = mirrornormal(this.car.NormalData);
}

function to_three(model, mat, mlib, texture, spec_colr, unsel_colr, reflectivity){
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
//		var material = new THREE.MeshPhongMaterial();
//		material.specular.setHex(spec_colr);
//		material.envMap = texture;
//		material.combine = THREE.MixOperation;
		var material = mlib["yes"];
	}
	else{ var material = new THREE.MeshLambertMaterial();}
//	material.color.setHex(unsel_colr);
//	material.reflectivity = reflectivity;
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
//	this.renderer.gammaInput = true;
//	this.renderer.gammaOutput = true;
//	this.renderer.physicallyBasedShading = true;
	this.renderer.setSize(scene_width,scene_height);
    this.renderer.shadowMapSoft = true;
	this.renderer.autoClear = false;
	this.container.append(this.renderer.domElement);
	
	this.camera =   
		new THREE.PerspectiveCamera(
			this.view_angle,
			this.aspect,
			this.near,
			this.far);
	car = new THREE.Scene();

//	this.controls = new THREE.TrackballControls( this.camera );
//	this.controls.dynamicDampingFactor = 0.25;
	
	// from three.js webgl - baked illumination
	var r = "/textures/";
	var urls = [ r + "px.png", r + "nx.png",
				 r + "pz.png", r + "nz.png",
				 r + "py.png", r + "ny.png" ];
//	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
//	reflectionCube.format = THREE.RGBFormat;
//
//	var refractionCube = new THREE.Texture( reflectionCube.image, new THREE.CubeRefractionMapping() );
//	refractionCube.format = THREE.RGBFormat;
	var textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );

	// common materials
	var mlib = {
	"Orange metal": new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: textureCube, side: THREE.DoubleSide } ),
//	"Darkgray shiny":	new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x050505 } ),
//	"Gray shiny":		new THREE.MeshPhongMaterial( { color: 0x050505, shininess: 20 } ),
	
	"yes": new THREE.MeshLambertMaterial( { color: 0xffee00, ambient: 0x996600, envMap: textureCube, refractionRatio: 0.95, side: THREE.DoubleSide } )
	}	
	
	var carMaterial = mlib["Orange metal"];
	
	var planeGeo = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var planeMat = new THREE.MeshPhongMaterial();
	planeMat.reflectivity = 0.0;
	var plane = new THREE.Mesh(planeGeo, planeMat);
	if (model_purpose > 0){plane.rotation.x = -Math.PI/12*5;}
	plane.position.y = -0.80;
	plane.receiveShadow = true;
//	this.carModel = Array(this.model_num);
//	this.rawModel = Array(this.model_num);
	

	var m = new model(model_parameter,carMaterial);
	var carMesh = m.car;
//		var wheelMesh = to_three(m.wheel,0,mlib,this.textureCube,carSpecColor,wheelColor,0.00);
//		var tireMesh = to_three(m.tire,1,mlib,this.textureCube,tireSelectedColor,tireUnselectedColor,0.00);
//		var bodyCube = m.cube;
//		this.rawModel[i]=m;
	
	carMesh.castShadow = true;
//		wheelMesh.castShadow = true;
//		tireMesh.castShadow = true;
//		bodyCube.castShadow = true;
	carMesh.receiveShadow = false;
//		wheelMesh.receiveShadow = false;
//		carMesh.doubleSided = true;
//		tireMesh.doubleSided = true;
//		bodyCube.doubleSided = false;
	carMesh.selected = false;
	carMesh.id = i;
//		wheelMesh.id = tireMesh.id = i;
//		bodyCube.id = i;
	
	carModel = new THREE.Object3D();
//	    this.carModel[i].add(carMesh);
//	    this.carModel[i].add(wheelMesh);
//	    this.carModel[i].add(tireMesh);
//	    this.carModel[i].add(bodyCube);
    carModel.add( carMesh );
	
    if (model_purpose > 0){carModel.rotation.x = -Math.PI/12*5;carModel.rotation.z = Math.PI/6*5;}
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
		var ambient = new THREE.AmbientLight( 0xffffff );
		car.add( ambient );
		
		var light = new THREE.SpotLight(0xFEEED4,0.1);
		light.position.set(200,10,200);
		light.castShadow = true;
        light.shadowCameraFov = 5;
        light.shadowDarkness = 1.0;
        light.shadowMapWidth = scene_width;
        light.shadowMapHeight = scene_height;
        car.add( light );

//		directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
//		directionalLight.position.x = 200;
//		directionalLight.position.y = 1000;
//		directionalLight.position.z = 200;
//		directionalLight.position.normalize();
//		directionalLight.castShadow = true;
//		this.scene.add( directionalLight );
//
//		directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
//		directionalLight.position.x = - 2000;
//		directionalLight.position.y = 100;
//		directionalLight.position.z = - 2000;
//		directionalLight.position.normalize();
//		this.scene.add( directionalLight );

		pointLight = new THREE.PointLight( 0xffaa00, 0.4 );
		pointLight.position.x = 0;
		pointLight.position.y = 12000;
		pointLight.position.z = 0;
		car.add( pointLight );        
	}
	else{
		// STATS
		this.camera.position.z = this.carModel[0].position.z+14;this.camera.position.x = this.carModel[0].position.x+7;
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
	this.camera.rotation.x=0;
	this.camera.position.x=1;
	this.camera.position.y=-0.4;
	this.camera.position.z=11.5;

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	//
	window.addEventListener( 'resize', onWindowResize, false );	
}

webgl_scene.prototype.update=function(model_parameter,i){
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
	
	this.rawModel[i].update(model_parameter);
	var geom = this.carModel[i].children[0].geometry;
	var model = this.rawModel[i].car;
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
var carSpecColor = 0xffffff;
var tireSelectedColor = 0x555555;
var tireUnselectedColor = 0x111111;
