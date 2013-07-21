////////////////////////////////////////////////////////////////////////////////////////////
var 
default_backgroundColor="#F2F2F2",
default_scale=1,
default_lightDirection_3D=[-0.5,-0.6,-1.0],
default_lightDiffuseColor_3D="#FFFFFF",
default_lightSpecularColor_3D="#FFFFFF",
default_projectionVerticalFieldOfView_3D=45,
default_projectionWidthHeightRatio_3D=1.5,
default_projectionFrontCulling_3D=0.1,
default_projectionBackCulling_3D=1E4,
default_model_display=true,
default_model_color="#EEEEEE",
default_model_materialAmbientColor_3D="#000000",
default_model_materialSpecularColor_3D="#666666",
default_model_materialShininess_3D=25;

function supports_canvas(){return!!document.createElement("canvas").getContext}
function supports_canvas_text(){if(!supports_canvas())return false;return typeof document.createElement("canvas").getContext("2d").fillText=="function"}

function VisualSpecifications(){
    this.backgroundColor=default_backgroundColor;
    this.scale=default_scale;
    this.lightDirection_3D=default_lightDirection_3D;
    this.lightDiffuseColor_3D=default_lightDiffuseColor_3D;
    this.lightSpecularColor_3D=default_lightSpecularColor_3D;
    this.projectionVerticalFieldOfView_3D=default_projectionVerticalFieldOfView_3D;
    this.projectionWidthHeightRatio_3D=default_projectionWidthHeightRatio_3D;
    this.projectionFrontCulling_3D=default_projectionFrontCulling_3D;
    this.projectionBackCulling_3D=default_projectionBackCulling_3D;
    this.model_display=default_model_display;
    this.model_color=default_model_color;
    this.model_materialAmbientColor_3D=default_model_materialAmbientColor_3D;
    this.model_materialSpecularColor_3D=default_model_materialSpecularColor_3D;
    this.model_materialShininess_3D=default_model_materialShininess_3D;
}

VisualSpecifications.prototype.set3DRepresentation=function(a){
}

jQuery(document).ready(function(){
    $(document).mousemove(function(a){
        if(CANVAS_DRAGGING!=null)
            if(CANVAS_DRAGGING.drag){
                CANVAS_DRAGGING.prehandleEvent(a);CANVAS_DRAGGING.drag(a)
            }
    });
    $(document).mouseup(function(a){
        if(CANVAS_DRAGGING!=null){
            if(CANVAS_DRAGGING.mouseup){
                CANVAS_DRAGGING.prehandleEvent(a);
                CANVAS_DRAGGING.mouseup(a)
            }
            CANVAS_DRAGGING=null
        }
    });
    $(document).keydown(function(a){
        SHIFT=a.shiftKey;
        ALT=a.altKey;
        var b=CANVAS_OVER;
        if(CANVAS_DRAGGING!=null)b=CANVAS_DRAGGING;
        if(b!=null)if(b.keydown){
            b.prehandleEvent(a);
            b.keydown(a)
        }
    });
    $(document).keypress(function(a){
        var b=CANVAS_OVER;
        if(CANVAS_DRAGGING!=null)b=CANVAS_DRAGGING;
        if(b!=null)if(b.keypress){
            b.prehandleEvent(a);
            b.keypress(a)
        }
    });
    $(document).keyup(function(a){
        SHIFT=a.shiftKey;
        ALT=a.altKey;
        var b=CANVAS_OVER;
        if(CANVAS_DRAGGING!=null)b=CANVAS_DRAGGING;
        if(b!=null)if(b.keyup){
            b.prehandleEvent(a);
            b.keyup(a)
        }
    })
});
////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
//Canvas
////////////////////////////////////////////////////////////////////////////////////////////
var CANVAS_DRAGGING=null,CANVAS_OVER=null,ALT=false,SHIFT=false;

function Canvas(){
    this.image=this.emptyMessage=this.model=null;
    this.inGesture=false;
    return true
}

//Canvas.prototype.loadModel=function(a){
//    this.model=a.input;
//    this.modelname=a.name;
//    //this.afterLoadModel&&this.afterLoadModel();
//    this.afterLoadModel();
//    this.repaint()
//};

//function randomModel(a){
//    var b;
//    b.input = [];
//    
//    switch(a){
//        case "car":
//        numVar = 33;
//        for (var i = 0; i<numVar; i++){
//            b.input.push(0.5);
//        }
//        break;
//    }
//    b.name = a;
//    return b;
//}

Canvas.prototype.create=function(a,i,b,c,z){
    this.id=a;
    this.width=b;
    this.height=c;
    this.model=z;
    var d = i;
    var e = Math.floor(d/4.0);
    var f = d - e*4; 
    var l = f*400+5;
    var w = e*250+105;
    if (a[0] == 't'){
    	//document.writeln('<div>');
        !supports_canvas_text()&&$.browser.msie&&$.browser.version>="6"?document.writeln('<div style="border: 1px solid black;" width="'+b+'" height="'+c+'">Please install <a href="http://code.google.com/chrome/chromeframe/">Google Chrome Frame</a>, then restart Internet Explorer.</div>'):document.writeln('<canvas class="MatchboxWebGL" id="'+a+'" width="'+b+'" height="'+c+'" style="position:absolute; left: ' + l.toString() + 'px; top: ' + w.toString() + 'px; z-index: 1; -moz-border-radius: 5px; -webkit-border-radius: 5px"></canvas>');
        //document.writeln('</div>');
    }
    else {
        !supports_canvas_text()&&$.browser.msie&&$.browser.version>="6"?document.writeln('<div style="border: 1px solid black;" width="'+b+'" height="'+c+'">Please install <a href="http://code.google.com/chrome/chromeframe/">Google Chrome Frame</a>, then restart Internet Explorer.</div>'):document.writeln('<canvas class="MatchboxWebGL" id="'+a+'" width="'+b+'" height="'+c+'" style="position:absolute; left: ' + l.toString() + 'px; top: ' + w.toString() + 'px; z-index: 1; -moz-border-radius: 5px; -webkit-border-radius: 5px"></canvas>');
    }
    this.specs=new VisualSpecifications;
    var d=this;
    $("#"+a).bind("touchstart",function(e){
        if(d.touchstart){
            d.prehandleMobileEvent(e);
            d.touchstart(e)}
        else if(d.mousedown){
            d.prehandleMobileEvent(e);
            d.mousedown(e)}
    });
    $("#"+a).bind("touchmove",function(e){
        if(!d.inGesture){
            ALT=e.originalEvent.changedTouches.length==2;
            if(d.touchmove){
                d.prehandleMobileEvent(e);
                d.touchmove(e)
            }
            else if(d.drag){
                d.prehandleMobileEvent(e);
                d.drag(e)
            }
        }
    });
    $("#"+a).bind("touchend",function(e){
        if(d.touchend){
            d.prehandleMobileEvent(e);
            d.touchend(e)
        }
        else if(d.mouseup){
            d.prehandleMobileEvent(e);
            d.mouseup(e)
        }
    });
    $("#"+a).bind("gesturestart",function(e){
        d.inGesture=true;
        if(d.gesturestart){
            d.prehandleEvent(e);
            d.gesturestart(e)
        }
    });
    $("#"+a).bind("gesturechange",function(e){
        if(e.originalEvent.scale==1)d.inGesture=false;
        else if(d.gesturechange){
            d.prehandleEvent(e);
            d.gesturechange(e)
        }
    });
    $("#"+a).bind("gestureend",function(e){
        d.inGesture=false;
        if(d.gestureend){
            d.prehandleEvent(e);
            d.gestureend(e)
        }
    });
    $("#"+a).click(function(e){
        switch(e.which){
            case 1:
            if(d.click){
                d.prehandleEvent(e);
                d.click(e)
            }
            break;
            
            case 2:
            if(d.middleclick){
                d.prehandleEvent(e);
                d.middleclick(e)
            }
            break;
            
            case 3:
            if(d.rightclick){
                d.prehandleEvent(e);
                d.rightclick(e)
            }
            break
        }
    });
    $("#"+a).dblclick(function(e){
        if(d.dblclick){
            d.prehandleEvent(e);
            d.dblclick(e)
        }
    });
    $("#"+a).mousedown(function(e){
        switch(e.which){
        case 1:
        CANVAS_DRAGGING=d;
        if(d.mousedown){
            d.prehandleEvent(e);
            d.mousedown(e)
        }
        break;
        
        case 2:
        if(d.middlemousedown){
            d.prehandleEvent(e);
            d.middlemousedown(e)
        }
        break;
        
        case 3:
        if(d.rightmousedown){
            d.prehandleEvent(e);
            d.rightmousedown(e)
        }break
        }
    });
    $("#"+a).mousemove(function(e){
        if(CANVAS_DRAGGING==null&&d.mousemove){
            d.prehandleEvent(e);
            d.mousemove(e)
        }
    });
    $("#"+a).mouseout(function(e){
        CANVAS_OVER=null;
        if(d.mouseout){
            d.prehandleEvent(e);
            d.mouseout(e)
        }
    });
    $("#"+a).mouseover(function(e){
        CANVAS_OVER=d;
        if(d.mouseover){
            d.prehandleEvent(e);
            d.mouseover(e)
        }
    });
    $("#"+a).mouseup(function(e){
        switch(e.which){
        case 1:
        if(d.mouseup){
            d.prehandleEvent(e);
            d.mouseup(e)
        }
        break;
        
        case 2:
        if(d.middlemouseup){
            d.prehandleEvent(e);
            d.middlemouseup(e)
        }
        break;
        
        case 3:
        if(d.rightmouseup){
            d.prehandleEvent(e);
            d.rightmouseup(e)
        }
        break
        }
    });
    $("#"+a).mousewheel(function(e,f){
        if(d.mousewheel){
            d.prehandleEvent(e);
            d.mousewheel(e,f)
        }
    });
    
    this.subCreate();
};

Canvas.prototype.prehandleEvent=function(a){
    a.preventDefault();
    var b=$("#"+this.id).offset();
    a.p=new Point(a.pageX-b.left,a.pageY-b.top)
};

Canvas.prototype.prehandleMobileEvent=function(a){
    a.pageX=a.originalEvent.changedTouches[0].pageX;
    a.pageY=a.originalEvent.changedTouches[0].pageY;
    a.preventDefault();
    var b=$("#"+this.id).offset();
    a.p=new Point(a.pageX-b.left+window.pageXOffset,a.pageY-b.top+window.pageYOffset)
};


////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
// Canvas3D
////////////////////////////////////////////////////////////////////////////////////////////
function Canvas3D(a,b,c,z){
    a&&this.create(a,b,c,z);
    this.rotationMatrix=mat4.identity([]);
    mat4.rotate(this.rotationMatrix,-Math.PI/2,[1,0,0]);
    this.translationMatrix=mat4.identity([]);
    mat4.translate(this.translationMatrix,[0,0,-15]);
    this.lastPoint=null;
    return true
}

Canvas3D.prototype=new Canvas;

Canvas3D.prototype.afterLoadMolecule=function(){
    var a=this.model.getDimension();
    this.translationMatrix=mat4.translate(mat4.identity([]),[0,0,-Math.max(a.x,a.y)-10]);
    this.setupScene()
};
    
Canvas3D.prototype.setViewDistance=function(a){
    this.translationMatrix=mat4.translate(mat4.identity([]),[0,0,-a])
};

Canvas3D.prototype.repaint=function(){
    this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
    this.gl.modelViewMatrix=mat4.multiply(this.translationMatrix,this.rotationMatrix,[]);
    this.gl.modelBuffer!=null&&this.gl.modelBuffer.render(this.gl,this.specs);};

Canvas3D.prototype.subCreate=function(){
    try{this.gl=document.getElementById(this.id).getContext("experimental-webgl");
        this.gl.viewport(0,0,this.width,this.height);}
    catch(a){}
    if(this.gl){
        this.gl.program=this.gl.createProgram();
        this.gl.shader=new Shader;
        this.gl.shader.init(this.gl);
        this.setupScene();
        }
    else NO_WEBGL_WARNING||alert("WebGL is not installed or enabled.");
};

Canvas3D.prototype.setupScene=function(){
    this.gl.clearColor(parseInt(this.specs.backgroundColor.substring(1,3),16)/255,parseInt(this.specs.backgroundColor.substring(3,5),16)/255,parseInt(this.specs.backgroundColor.substring(5,7),16)/255,1);
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.modelBuffer=new Model;
    this.gl.modelBuffer.generate(this.gl,this.id,this.model);
    this.gl.lighting=new Light(this.specs.lightDiffuseColor_3D,this.specs.lightSpecularColor_3D,this.specs.lightDirection_3D);
    this.gl.lighting.lightScene(this.gl);
    this.gl.material=new Material(this.specs.model_materialAmbientColor_3D,this.specs.model_color,this.specs.model_materialSpecularColor_3D,this.specs.model_materialShininess_3D);
    this.gl.material.setup(this.gl);
    this.gl.projectionMatrix=mat4.perspective(this.specs.projectionVerticalFieldOfView_3D, this.specs.projectionWidthHeightRatio_3D,this.specs.projectionFrontCulling_3D,this.specs.projectionBackCulling_3D);
    this.gl.setMatrixUniforms=function(a,b){
        this.uniformMatrix4fv(this.getUniformLocation(this.program,"u_projection_matrix"),false,new Float32Array(a));
        this.uniformMatrix4fv(this.getUniformLocation(this.program,"u_model_view_matrix"),false,new Float32Array(b));
        var c=mat4.transpose(mat4.inverse(b,[]));
        this.uniformMatrix4fv(this.getUniformLocation(this.program,"u_normal_matrix"),false,new Float32Array(c))
    }
};

Canvas3D.prototype.mousedown=function(a){this.lastPoint=a.p};

Canvas3D.prototype.rightmousedown=function(a){this.lastPoint=a.p};

Canvas3D.prototype.drag=function(a){
    if(ALT){
        var b=new Point(a.p.x,a.p.y);
        b.sub(this.lastPoint);
        mat4.translate(this.translationMatrix,[b.x/20,-b.y/20,0]);
    }
    else{
        var c=a.p.x-this.lastPoint.x;
        b=a.p.y-this.lastPoint.y;
        c=mat4.rotate(mat4.identity([]),c*Math.PI/180,[0,1,0]);
        mat4.rotate(c,b*Math.PI/180,[1,0,0]);
        this.rotationMatrix=mat4.multiply(c,this.rotationMatrix);
    }
    this.lastPoint=a.p;
    this.repaint();
};

////////////////////////////////////////////////////////////////////////////////////////////
//ViewerCanvas
////////////////////////////////////////////////////////////////////////////////////////////
function ViewerCanvas3D(a,i,b,c,z){
    a&&this.create(a,i,b,c,z);
    this.repaint();
    return true;
};

ViewerCanvas3D.prototype=new Canvas3D;
////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////
//Shader
////////////////////////////////////////////////////////////////////////////////////////////
function Shader(){}
Shader.prototype.init=function(a){
    var b=this.getShader(a,"vertex-shader");
    if(b==null)b=this.loadDefaultVertexShader(a);
    var c=this.getShader(a,"fragment-shader");
    if(c==null)c=this.loadDefaultFragmentShader(a);
    a.attachShader(a.program,b);
    a.attachShader(a.program,c);
    a.linkProgram(a.program);
    a.getProgramParameter(a.program,a.LINK_STATUS)||alert("Could not initialize shaders!");
    a.useProgram(a.program);
    this.vertexPositionAttribute=a.getAttribLocation(a.program,"a_vertex_position");
    a.enableVertexAttribArray(this.vertexPositionAttribute);
    this.vertexNormalAttribute=a.getAttribLocation(a.program,"a_vertex_normal");
    a.enableVertexAttribArray(this.vertexNormalAttribute)
};

Shader.prototype.getShader=function(a,b){
    var c=document.getElementById(b);
    if(!c)return null;
    for(var d=[],e=c.firstChild;e;){
        e.nodeType==3&&d.push(e.textContent);
        e=e.nextSibling
    }
    
    if(c.type=="x-shader/x-fragment")
        c=a.createShader(a.FRAGMENT_SHADER);
    else if(c.type=="x-shader/x-vertex")
        c=a.createShader(a.VERTEX_SHADER);
    else return null;
    
    a.shaderSource(c,d.join(""));
    a.compileShader(c);

    if(!a.getShaderParameter(c,a.COMPILE_STATUS)){
        alert(a.getShaderInfoLog(c));
        return null
    }
    return c
};

Shader.prototype.loadDefaultVertexShader=function(a){
    var b=[];
    b.push("#ifdef GL_ES\n");
    b.push("precision highp float;\n");
    b.push("#endif\n");
    b.push("struct Light");
    b.push("{");
    b.push("vec3 diffuse_color;");
    b.push("vec3 specular_color;");
    b.push("vec3 direction;");
    b.push("vec3 half_vector;");
    b.push("};");
    b.push("struct Material");
    b.push("{");
    b.push("vec3 ambient_color;");
    b.push("vec3 diffuse_color;");
    b.push("vec3 specular_color;");
    b.push("float shininess;");
    b.push("};");
    b.push("attribute vec3 a_vertex_position;");
    b.push("attribute vec3 a_vertex_normal;");
    b.push("uniform Light u_light;");
    b.push("uniform Material u_material;");
    b.push("uniform mat4 u_model_view_matrix;");
    b.push("uniform mat4 u_projection_matrix;");
    b.push("uniform mat4 u_normal_matrix;");
    b.push("varying vec4 v_diffuse;");
    b.push("varying vec4 v_ambient;");
    b.push("varying vec3 v_normal;");
    b.push("varying vec3 v_light_direction;");
    b.push("void main(void)");
    b.push("{");
    b.push("v_normal = normalize((u_normal_matrix * vec4(a_vertex_normal, 1.0)).xyz);");
    b.push("vec4 diffuse = vec4(u_light.diffuse_color, 1.0);");
    b.push("v_light_direction = u_light.direction;");
    b.push("v_ambient = vec4(u_material.ambient_color, 1.0);");
    b.push("v_diffuse = vec4(u_material.diffuse_color, 1.0) * diffuse;");
    b.push("gl_Position = u_projection_matrix * u_model_view_matrix * vec4(a_vertex_position, 1.0);");
    b.push("}");
    var c=a.createShader(a.VERTEX_SHADER);
    a.shaderSource(c,b.join(""));
    a.compileShader(c);
    if(!a.getShaderParameter(c,a.COMPILE_STATUS)){
        alert(a.getShaderInfoLog(c));
        return null
    }
    return c
};

Shader.prototype.loadDefaultFragmentShader=function(a){
    var b=[];
    b.push("#ifdef GL_ES\n");
    b.push("precision highp float;\n");
    b.push("#endif\n");
    b.push("struct Light");
    b.push("{");
    b.push("vec3 diffuse_color;");
    b.push("vec3 specular_color;");
    b.push("vec3 direction;");
    b.push("vec3 half_vector;");
    b.push("};");
    b.push("struct Material");
    b.push("{");
    b.push("vec3 ambient_color;");
    b.push("vec3 diffuse_color;");
    b.push("vec3 specular_color;");
    b.push("float shininess;");
    b.push("};");
    b.push("uniform Light u_light;");
    b.push("uniform Material u_material;");
    b.push("varying vec4 v_diffuse;");
    b.push("varying vec4 v_ambient;");
    b.push("varying vec3 v_normal;");
    b.push("varying vec3 v_light_direction;");
    b.push("void main(void)");
    b.push("{");
    b.push("float nDotL = max(dot(v_normal, v_light_direction), 0.0);");
    b.push("vec4 color = vec4(v_diffuse.rgb*nDotL, v_diffuse.a);");
    b.push("float nDotHV = max(dot(v_normal, u_light.half_vector), 0.0);");
    b.push("vec4 specular = vec4(u_material.specular_color * u_light.specular_color, 1.0);");
    b.push("color+=vec4(specular.rgb * pow(nDotHV, u_material.shininess), specular.a);");
    b.push("gl_FragColor = color+v_ambient;");
    b.push("}");
    var c=a.createShader(a.FRAGMENT_SHADER);
    a.shaderSource(c,b.join(""));a.compileShader(c);
    if(!a.getShaderParameter(c,a.COMPILE_STATUS)){
        alert(a.getShaderInfoLog(c));
        return null
    }
    return c
};
////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
//Light
////////////////////////////////////////////////////////////////////////////////////////////
function Light(a,b,c){
    this.diffuseRGB=[parseInt(a.substring(1,3),16)/255,parseInt(a.substring(3,5),16)/255,parseInt(a.substring(5,7),16)/255];
    this.specularRGB=[parseInt(b.substring(1,3),16)/255,parseInt(b.substring(3,5),16)/255,parseInt(b.substring(5,7),16)/255];
    this.direction=c
}

Light.prototype.lightScene=function(a){
    a.uniform3f(a.getUniformLocation(a.program,"u_light.diffuse_color"),this.diffuseRGB[0],this.diffuseRGB[1],this.diffuseRGB[2]);
    a.uniform3f(a.getUniformLocation(a.program,"u_light.specular_color"),this.specularRGB[0],this.specularRGB[1],this.specularRGB[2]);
    var b=vec3.create(this.direction);
    vec3.normalize(b);vec3.negate(b);
    a.uniform3f(a.getUniformLocation(a.program,"u_light.direction"),b[0],b[1],b[2]);
    var c=[0,0,0];
    b=[c[0]+b[0],c[1]+b[1],c[2]+b[2]];
    c=vec3.length(b);
    if(c==0)b=[0,0,1];
    else vec3.scale(1/c);
    a.uniform3f(a.getUniformLocation(a.program,"u_light.half_vector"),b[0],b[1],b[2])
};
////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
//Material
////////////////////////////////////////////////////////////////////////////////////////////
function Material(a,b,c,d){
    this.ambientColor=a;
    this.diffuseColor=b;
    this.specularColor=c;
    this.shininess=d
}

Material.prototype.setup=function(a){
    this.setTempColors(a,this.ambientColor,this.diffuseColor,this.specularColor,this.shininess)
};

Material.prototype.setTempColors=function(a,b,c,d,e){
    a.uniform3f(a.getUniformLocation(a.program,"u_material.ambient_color"),parseInt(b.substring(1,3),16)/255,parseInt(b.substring(3,5),16)/255,parseInt(b.substring(5,7),16)/255);
    a.uniform3f(a.getUniformLocation(a.program,"u_material.diffuse_color"),parseInt(c.substring(1,3),16)/255,parseInt(c.substring(3,5),16)/255,parseInt(c.substring(5,7),16)/255);
    a.uniform3f(a.getUniformLocation(a.program,"u_material.specular_color"),parseInt(d.substring(1,3),16)/255,parseInt(d.substring(3,5),16)/255,parseInt(d.substring(5,7),16)/255);
    a.uniform1f(a.getUniformLocation(a.program,"u_material.shininess"),e)
};
////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////
//Model
////////////////////////////////////////////////////////////////////////////////////////////
function Model(){}
    Model.prototype.generate=function(a,b,c){
        //a = gl, b = id, c = parameter
//        if (b == 'car'){
	        var order = 2;
	        var step = 8;
	        var body_n = 32;
	        var wheel_n = 5;
	        var wheel_step = 38+55;
            var vertexPositionData = carModel(c, order, step, wheel_n, wheel_step);
            //var indexData = ini_bezier_index(step, vertexPositionData.length/(step+1)/(step+1)/3); //generate index data for buffer
            var indexData = ini_bezier_index(step, body_n, wheel_n, wheel_step); //generate index data for buffer, 20 pieces before mirror plus the wheels
            var normalData = calculateNormal(vertexPositionData, indexData, step, body_n, wheel_step, wheel_n);
            indexData = mirrorindex(indexData, vertexPositionData.length/3);
            vertexPositionData = mirrorvertex(vertexPositionData);
            normalData = mirrornormal(normalData);
//            }
//        else alert("Model not supported");
        
        this.vertexNormalBuffer=a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER,this.vertexNormalBuffer);
        a.bufferData(a.ARRAY_BUFFER,new Float32Array(normalData),a.STATIC_DRAW);
        this.vertexNormalBuffer.itemSize=3;
        this.vertexNormalBuffer.numItems=normalData.length/3;
        this.vertexPositionBuffer=a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER,this.vertexPositionBuffer);
        a.bufferData(a.ARRAY_BUFFER,new Float32Array(vertexPositionData),a.STATIC_DRAW);
        this.vertexPositionBuffer.itemSize=3;
        this.vertexPositionBuffer.numItems=vertexPositionData.length/3;
        this.vertexIndexBuffer=a.createBuffer();
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);
        a.bufferData(a.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexData),a.STREAM_DRAW);
        this.vertexIndexBuffer.itemSize=1;
        this.vertexIndexBuffer.numItems=indexData.length
        }
////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
//Render
////////////////////////////////////////////////////////////////////////////////////////////
Model.prototype.render=function(a,b){
//    var c=mat4.translate(a.modelViewMatrix,[this.x,this.y,this.z],[]);
    var c=mat4.translate(a.modelViewMatrix,[0,0,0],[]);
    a.bindBuffer(a.ARRAY_BUFFER,a.modelBuffer.vertexPositionBuffer);
    a.vertexAttribPointer(a.shader.vertexPositionAttribute,a.modelBuffer.vertexPositionBuffer.itemSize,a.FLOAT,false,0,0);
    a.material.setTempColors(a,b.model_materialAmbientColor_3D,b.model_color,b.model_materialSpecularColor_3D,b.model_materialShininess_3D);
    a.bindBuffer(a.ARRAY_BUFFER,a.modelBuffer.vertexNormalBuffer);
    a.vertexAttribPointer(a.shader.vertexNormalAttribute,a.modelBuffer.vertexNormalBuffer.itemSize,a.FLOAT,false,0,0);
    a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,a.modelBuffer.vertexIndexBuffer);
    a.setMatrixUniforms(a.projectionMatrix,c);
    a.drawElements(a.TRIANGLES,a.modelBuffer.vertexIndexBuffer.numItems,a.UNSIGNED_SHORT,0)
};
////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
//Point
////////////////////////////////////////////////////////////////////////////////////////////
function Point(a,b){
    this.x=a?a:0;
    this.y=b?b:0;
    return true
}

Point.prototype.sub=function(a){
    this.x-=a.x;
    this.y-=a.y
};

Point.prototype.add=function(a){
    this.x+=a.x;
    this.y+=a.y;
};
////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
//Select Box
////////////////////////////////////////////////////////////////////////////////////////////
function Box(a,i,b){
//a = id, b = link to
    this.id = a;
    this.linkto = b;
    var d = i;
    var e = Math.floor(d/4.0);
    var f = d - e*4; 
    this.x = f*400+0;
    this.y = e*250+100;
    this.height = document.getElementById(b.id).height + 10;
    this.width = document.getElementById(b.id).width + 10;
    this.checked = false;
    this.label = -1;
    
    !supports_canvas_text()&&$.browser.msie&&$.browser.version>="6"?document.writeln('<div style="border: 1px solid black;" width="'+this.width+'" height="'+this.height+'">Please install <a href="http://code.google.com/chrome/chromeframe/">Google Chrome Frame</a>, then restart Internet Explorer.</div>'):document.writeln('<canvas class="selectionBox" id="'+a+'" width="'+this.width+'" height="'+this.height+'" style="position:absolute; left: '+this.x.toString()+'px; top: '+this.y.toString()+'px; z-index: 0; -moz-border-radius: 5px; -webkit-border-radius: 5px;"></canvas>');

    try{this.gl=document.getElementById(this.id).getContext("2d");}
    catch(a){}
    if(this.gl){
        b.linkto = this;
        this.create("rgb(230, 230, 230)");
    }
}

Box.prototype.create = function(a){
//a = color
    this.gl.fillStyle = a;
    this.gl.lineWidth = 10;
    this.gl.fillRect(0, 0, 430, 280);
    //b.clearRect(this.pageX+10, this.pageY+10, this.width-20, this.length-20);    
};

Box.prototype.confirm = function(){
	if (!this.checked){
		this.label = -1;
	}
	else {
		this.label = 1;
	}
};

Canvas.prototype.mousewheel=function(a,b){
    mat4.translate(this.translationMatrix,[0,0,b]);
    this.repaint();
};

Canvas.prototype.mouseover=function(){
    this.selectbox('over');
};

Canvas.prototype.mouseout=function(){
    this.selectbox('out');
};

Canvas.prototype.dblclick=function(){
    this.selectbox('check');
    this.linkto.confirm();
};

Canvas.prototype.selectbox = function(a){
    
    b = this.linkto;
    switch (a){
    case "over":
    	if (!b.checked){b.create("rgb(150, 150, 150)");}
    break;
    
    case "out":
    	if (!b.checked){b.create("rgb(230, 230, 230)");}
    break;
    
    case "check":
    	if (!b.checked){b.create("rgb(20, 20, 20)");}
        b.checked = !b.checked;
    break;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////
