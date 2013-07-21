var canvas_dragging=null,canvas_over=null,alt=false,shift=false;

function model(parameter){
    var order = 2;
    var step = 16;
    var body_n = 32;
    var wheel_n = 5;
    var wheel_step = 38;
    var tire_step = 55;
    this.car = {VertexPositionData:[],IndexData:[],NormalData:[]},
    this.wheel = {VertexPositionData:[],IndexData:[],NormalData:[]},
    this.tire = {VertexPositionData:[],IndexData:[],NormalData:[]}; 
    
    
    var m = carModel(parameter, order, step, wheel_n, wheel_step, tire_step);
    this.car.VertexPositionData = m[0];
    this.wheel.VertexPositionData = m[1];
    this.tire.VertexPositionData = m[2];
    
    // car body
    this.car.IndexData = carIndex(step, body_n);
    this.car.NormalData = carNormal(this.car.VertexPositionData, this.car.IndexData, step, body_n);
    this.car.IndexData = mirrorindex(this.car.IndexData, this.car.VertexPositionData.length/3);
    this.car.VertexPositionData = mirrorvertex(this.car.VertexPositionData);
    this.car.NormalData = mirrornormal(this.car.NormalData);

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
    var px = (this.car.VertexPositionData[4*(step+1)*(step+1)*3]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3])/2;
    var py = (this.car.VertexPositionData[4*(step+1)*(step+1)*3+1]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3+1])/2;
    var pz = (this.car.VertexPositionData[4*(step+1)*(step+1)*3+2]+this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3+2])/2;
    var x = Math.abs(this.car.VertexPositionData[4*(step+1)*(step+1)*3]-this.car.VertexPositionData[(4*(step+1)*(step+1)-(step+1))*3]);
    var y = 1.0, z = 3;
    this.cube = new THREE.Mesh(new THREE.CubeGeometry(x/1.3,z,y),new THREE.MeshLambertMaterial({color: 0x000000}));
    this.cube.position.x = px; this.cube.position.y = py+0.4; this.cube.position.z = pz;
}

model.prototype.update = function(parameter){
    var order = 2;
    var step = 16;
    var body_n = 32;
    var wheel_n = 5;
    var wheel_step = 38;
    var tire_step = 55;
	var m = carModel(parameter, order, step, wheel_n, wheel_step, tire_step);
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
		var material = new THREE.MeshPhongMaterial();
		material.specular.setHex(spec_colr);
		material.envMap = texture;
		material.combine = THREE.MixOperation;
	}
	else{ var material = new THREE.MeshLambertMaterial();}
	material.color.setHex(unsel_colr);
	material.reflectivity = reflectivity;
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
	this.scene = new THREE.Scene();

//	this.controls = new THREE.TrackballControls( this.camera );
//	this.controls.dynamicDampingFactor = 0.25;
	
	// from three.js webgl - baked illumination
	var r = "textures/";
	var urls = [ r + "px.png", r + "nx.png",
				 r + "pz.png", r + "nz.png",
				 r + "py.png", r + "ny.png" ];
	this.textureCube = THREE.ImageUtils.loadTextureCube( urls );
	// from three.js webgl - baked illumination
	
	var planeGeo = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var planeMat = new THREE.MeshPhongMaterial();
	planeMat.specular.setHex(0x000000);
	planeMat.combine = THREE.MixOperation;
	planeMat.reflectivity = 0.0;
	var plane = new THREE.Mesh(planeGeo, planeMat);
	if (model_purpose > 0){plane.rotation.x = -Math.PI/12*5;}
	plane.position.y = -0.80;
	plane.receiveShadow = true;
	this.carModel = Array(this.model_num);
	this.rawModel = Array(this.model_num);
	
	for (var i=0;i<this.model_num;i++){
		var m = new model(model_parameter[i]);
		var carMesh = to_three(m.car,0,this.textureCube,carSpecColor,carUnselectedColor,0.05);
		var wheelMesh = to_three(m.wheel,0,this.textureCube,carSpecColor,wheelColor,0.00);
		var tireMesh = to_three(m.tire,1,this.textureCube,tireSelectedColor,tireUnselectedColor,0.00);
		var bodyCube = m.cube;
		this.rawModel[i]=m;
		
		carMesh.castShadow = wheelMesh.castShadow = tireMesh.castShadow = bodyCube.castShadow = true;
		wheelMesh.receiveShadow = false; carMesh.receiveShadow = false;
//		tireMesh.doubleSided = true;carMesh.doubleSided = true;bodyCube.doubleSided = false;
		carMesh.selected = false;
		carMesh.id = wheelMesh.id = tireMesh.id = bodyCube.id = i;
		
	    this.carModel[i] = new THREE.Object3D();
	    this.carModel[i].add(carMesh);this.carModel[i].add(wheelMesh);this.carModel[i].add(tireMesh);this.carModel[i].add(bodyCube);
	    
	    if (model_purpose > 0){this.carModel[i].rotation.x = -Math.PI/12*5;this.carModel[i].rotation.z = Math.PI/6*5;}
	    else{this.carModel[i].rotation.z = Math.PI/6*7;}
	}
	
	if (model_purpose == 1){
		var light = new THREE.SpotLight(0xFEEED4,1);
		light.position.set(200,0,200);
		light.castShadow = true;
        light.shadowCameraFov = 5;
        light.shadowDarkness = 0.8;
        light.shadowMapWidth = scene_width;
        light.shadowMapHeight = scene_height;
		var d = this;
		$("#"+scene_id).click(function(e){switch(e.which){case 1:if(d.click){d.prehandleEvent(e);d.click(e)}break;
	            case 2:if(d.middleclick){d.prehandleEvent(e);d.middleclick(e)}break;
	            case 3:if(d.rightclick){d.prehandleEvent(e);d.rightclick(e)}break}});
	    $("#"+scene_id).dblclick(function(e){if(d.dblclick){d.prehandleEvent(e);d.dblclick(e)}});
	    $("#"+scene_id).mousedown(function(e){switch(e.which){case 1:canvas_dragging=d;if(d.mousedown){d.prehandleEvent(e);d.mousedown(e)}break;
	        case 2:if(d.middlemousedown){d.prehandleEvent(e);d.middlemousedown(e)}break;
	        case 3:if(d.rightmousedown){d.prehandleEvent(e);d.rightmousedown(e)}break}});
	    $("#"+scene_id).mousemove(function(e){if(canvas_dragging==null&&d.mousemove){d.prehandleEvent(e);d.mousemove(e)}});
	    $("#"+scene_id).mouseout(function(e){canvas_over=null;if(d.mouseout){d.prehandleEvent(e);d.mouseout(e)}});
	    $("#"+scene_id).mouseover(function(e){canvas_over=d;if(d.mouseover){d.prehandleEvent(e);d.mouseover(e)}});
	    $("#"+scene_id).mouseup(function(e){switch(e.which){case 1:if(d.mouseup){d.prehandleEvent(e);d.mouseup(e)}break;
	        case 2:if(d.middlemouseup){d.prehandleEvent(e);d.middlemouseup(e)}break;
	        case 3:if(d.rightmouseup){d.prehandleEvent(e);d.rightmouseup(e)}break}});
	    $("#"+scene_id).mousewheel(function(e,f){if(d.mousewheel){d.prehandleEvent(e);d.mousewheel(e,f)}});
	}
	else if(model_purpose == 2){
		var light = new THREE.SpotLight(0xFEEED4,1);
		light.position.set(200,0,200);
		light.castShadow = true;
        light.shadowCameraFov = 5;
        light.shadowDarkness = 0.8;
        light.shadowMapWidth = scene_width;
        light.shadowMapHeight = scene_height;
		var d = this;
		$("#"+scene_id).click(function(e){switch(e.which){case 1:if(d.click){d.prehandleEvent(e);d.click(e)}break;
	            case 2:if(d.middleclick){d.prehandleEvent(e);d.middleclick(e)}break;
	            case 3:if(d.rightclick){d.prehandleEvent(e);d.rightclick(e)}break}});
	    $("#"+scene_id).dblclick(function(e){if(d.dblclick){d.prehandleEvent(e);d.dblclick(e)}});
	    $("#"+scene_id).mousedown(function(e){switch(e.which){case 1:canvas_dragging=d;if(d.mousedown){d.prehandleEvent(e);d.mousedown(e)}break;
	        case 2:if(d.middlemousedown){d.prehandleEvent(e);d.middlemousedown(e)}break;
	        case 3:if(d.rightmousedown){d.prehandleEvent(e);d.rightmousedown(e)}break}});
	    $("#"+scene_id).mousemove(function(e){if(canvas_dragging==null&&d.mousemove){d.prehandleEvent(e);d.mousemove(e)}});
	    $("#"+scene_id).mouseout(function(e){canvas_over=null;if(d.mouseout){d.prehandleEvent(e);d.mouseout(e)}});
	    $("#"+scene_id).mouseover(function(e){canvas_over=d;if(d.mouseover){d.prehandleEvent(e);d.mouseover(e)}});
	    $("#"+scene_id).mouseup(function(e){switch(e.which){case 1:if(d.mouseup){d.prehandleEvent(e);d.mouseup(e)}break;
	        case 2:if(d.middlemouseup){d.prehandleEvent(e);d.middlemouseup(e)}break;
	        case 3:if(d.rightmouseup){d.prehandleEvent(e);d.rightmouseup(e)}break}});
	    $("#"+scene_id).mousewheel(function(e,f){if(d.mousewheel){d.prehandleEvent(e);d.mousewheel(e,f)}});
	}
	else{
		// STATS
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '5px';
		this.stats.domElement.style.zIndex = 100;
		this.container[0].appendChild(this.stats.domElement);
		this.stats.domElement.children[ 0 ].children[ 0 ].style.color = "#aaa";
		this.stats.domElement.children[ 0 ].style.background = "transparent";
		this.stats.domElement.children[ 0 ].children[ 1 ].style.display = "none";
		
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
	}
	this.scene.add(light);
	this.scene.add(this.camera);
	this.scene.add(plane);
	this.scene.add(this.carModel[0]);
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

webgl_scene.prototype.prehandleEvent=function(a){
    a.preventDefault();
    var b=$("#"+this.scene_id).offset();
    a.x=a.pageX-b.left;
    a.y=a.pageY-b.top;
};

webgl_scene.prototype.mousedown=function(a){
	this.x=a.x,this.y=a.y;
//	if (a.target == this.renderer.domElement) {
//	    var v = new THREE.Vector3((this.x/this.scene_width)*2-1, -(this.y/this.scene_height)*2+1, 0.5);
//	    projector.unprojectVector(v, this.camera);
//	    var ray = new THREE.Ray(this.camera.position, 
//	                            v.subSelf(this.camera.position).normalize());
//	    var allCars =[];
//	    for (var i=0;i<this.carModel.length;i++){
//	    	allCars.push(this.carModel[i].children[0]);
//	    }
//	    var intersects = ray.intersectObjects(allCars);
//	    if (intersects.length > 0) {
//	    	this.current = this.carModel[intersects[0].object.id];
//			this.current.children[0].material.color.setHex(carSelectedColor);
//			this.current.children[1].material.color.setHex(carSelectedColor);
//			this.current.children[2].material.color.setHex(tireSelectedColor);
//			this.renderer.render(this.scene,this.camera);
//	    }
//	    else {
//	    	this.current = [];
//	    }
//	}
//	var id = parseInt(a.target.parentElement.id[10])-1;
	this.current = this.carModel[0];
	this.current.children[0].material.color.setHex(carSelectedColor);
	this.current.children[1].material.color.setHex(wheelColor);
	this.current.children[2].material.color.setHex(tireSelectedColor);
	this.renderer.render(this.scene,this.camera);
};

webgl_scene.prototype.rightmousedown=function(a){
};

webgl_scene.prototype.mouseup=function(a){
	if(this.current!=""){
		if (!this.current.selected){
			this.current.children[0].material.color.setHex(carUnselectedColor);
			this.current.children[1].material.color.setHex(wheelColor);
			this.current.children[2].material.color.setHex(tireUnselectedColor);
			this.renderer.render(this.scene,this.camera);
		}
	}
}

webgl_scene.prototype.drag=function(a){
	if (!$("sync_model").attr("checked")){
	    if(this.current!=""){
        	this.current.rotation.z+=(a.x-this.x)*Math.PI/480;
        	this.renderer.render(this.scene,this.camera);
	    }
	    this.x=a.x,this.y=a.y;
	}
};

webgl_scene.prototype.mousewheel=function(a,b){
};

webgl_scene.prototype.dblclick=function(a){
//	if (a.target == this.renderer.domElement) {
//	    var v = new THREE.Vector3((this.x/this.scene_width)*2-1, -(this.y/this.scene_height)*2+1, 0.5);
//	    projector.unprojectVector(v, this.camera);
//	    var ray = new THREE.Ray(this.camera.position, 
//	                            v.subSelf(this.camera.position).normalize());
//	    var intersects = ray.intersectObjects(this.carMesh);
//	    if (intersects.length > 0) {
//	    	this.current = intersects[0].object;
//	    	this.current.selected = !this.current.selected;
//	    	if (this.current.selected){
//	    		this.current.material.color.setHex(highlightColor);
//	    		S.currentY[this.current.id]=1;
//	    	}
//	    	else {
//	    		this.current.material.color.setHex(unselectedColor);
//	    		S.currentY[this.current.id]=0;
//	    	}
//			this.renderer.render(this.scene,this.camera);
//	    	
//	    }
//	    else {
//	    	this.current = [];
//	    }
//	}	
}

webgl_scene.prototype.keydown=function(a){
	if (a.keyCode==38){
		if(this.position_down){
			camera_init(this.camera.position.z,this.camera.position.y,this.camera.rotation.x,
					this.camera.position.z-5,this.camera.position.y+10,this.camera.rotation.x-0.5,this);
			tween_animate();
			this.position_down=false;
		}
	}
	else if(a.keyCode==40){
		if(!this.position_down){
			camera_init(this.camera.position.z,this.camera.position.y,this.camera.rotation.x,
					this.camera.position.z+5,this.camera.position.y-10,this.camera.rotation.x+0.5,this);
			tween_animate();
			this.position_down=true;
		}
	}
	
}

jQuery(document).ready(function(){
    $(document).mousemove(function(a){
        if(canvas_dragging!=null)
            if(canvas_dragging.drag){
            	canvas_dragging.prehandleEvent(a);canvas_dragging.drag(a)
            }
    });
    $(document).mouseup(function(a){
        if(canvas_dragging!=null){
            if(canvas_dragging.mouseup){
            	canvas_dragging.prehandleEvent(a);
            	canvas_dragging.mouseup(a)
            }
            canvas_dragging=null
        }
    });
    $(document).keydown(function(a){
        id=a.which;
        var b=canvas_over;
        if(canvas_dragging!=null)b=canvas_dragging;
        if(b!=null)if(b.keydown){
            b.prehandleEvent(a);
            b.keydown(a)
        }
    });
    $(document).keypress(function(a){
        var b=canvas_over;
        if(canvas_dragging!=null)b=canvas_dragging;
        if(b!=null)if(b.keypress){
            b.prehandleEvent(a);
            b.keypress(a)
        }
    });
    $(document).keyup(function(a){
        shift=a.shiftKey;
        alt=a.altKey;
        var b=canvas_over;
        if(canvas_dragging!=null)b=canvas_dragging;
        if(b!=null)if(b.keyup){
            b.prehandleEvent(a);
            b.keyup(a)
        }
    })
});

var projector = new THREE.Projector();
var wheelColor = 0xAAAAAA;
var carSelectedColor = 0xffffff;
var carUnselectedColor = 0xeeeeee;
var carSpecColor = 0xffffff;
var tireSelectedColor = 0x555555;
var tireUnselectedColor = 0x111111;
