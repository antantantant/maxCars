// matchbox utility functions

// Calculate vertex normal
function calculateNormal(vset, iset, step, body_n, wheel_step, wheel_n){
//    var normals = [];  //for triangles
    var normalv = [];
    // initialize
//    for (var i = 0; i<vset.length-(wheel_step*wheel_n+1)*2*3; i++){
    for (var i = 0; i<vset.length; i++){
        normalv.push(0.0);
    }

    var ind = 0;
    var tempv = [];
    for (i = 0; i<body_n*step*step*2; i++){
//    for (i = 0; i<iset.length/3; i++){
        ind = [iset[i*3], iset[i*3+1], iset[i*3+2]];
        p0 = [vset[ind[0]*3], vset[ind[0]*3+1], vset[ind[0]*3+2]];
        p1 = [vset[ind[1]*3], vset[ind[1]*3+1], vset[ind[1]*3+2]];
        p2 = [vset[ind[2]*3], vset[ind[2]*3+1], vset[ind[2]*3+2]];
//        normals = normals.concat(normalize(crossproduct(dvec(p1,p0), dvec(p2,p1))));
        tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
        if (!isNaN(tempv[0])){
            normalv[ind[0]*3] += tempv[0];
            normalv[ind[1]*3] += tempv[0];
            normalv[ind[2]*3] += tempv[0];
            normalv[ind[0]*3+1] += tempv[1];
            normalv[ind[1]*3+1] += tempv[1];
            normalv[ind[2]*3+1] += tempv[1];
            normalv[ind[0]*3+2] += tempv[2];
            normalv[ind[1]*3+2] += tempv[2];
            normalv[ind[2]*3+2] += tempv[2];        	
        }

    }

    for (i = 0; i<(vset.length - (wheel_step*wheel_n+1)*2*3)/3; i++){
//    for (i = 0; i<vset.length/3; i++){
        tempv = normalize([normalv[i*3], normalv[i*3+1], normalv[i*3+2]]);
        normalv[i*3] = tempv[0];
        normalv[i*3+1] = tempv[1];
        normalv[i*3+2] = tempv[2];
    }
    
    //adjust normal vect at piece 13 beginning, 15 ending
    ind = (step+1)*(step+1)*12*3;
    for (i=0; i<step+1; i++){
        p2 = [vset[ind+3], vset[ind+4], vset[ind+5]];
        p0 = [vset[ind+(step+1)*3], vset[ind+(step+1)*3+1], vset[ind+(step+1)*3+2]];
        p1 = [vset[ind+(step+1)*3+3], vset[ind+(step+1)*3+4], vset[ind+(step+1)*3+5]];
        tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
        normalv[ind] = tempv[0];
        normalv[ind+1] = tempv[1];
        normalv[ind+2] = tempv[2];
        normalv[ind+3] = tempv[0];
        normalv[ind+4] = tempv[1];
        normalv[ind+5] = tempv[2];
        normalv[ind+(step+1)*3] = tempv[0];
        normalv[ind+(step+1)*3+1] = tempv[1];
        normalv[ind+(step+1)*3+2] = tempv[2];
        normalv[ind+(step+1)*3+3] = tempv[0];
        normalv[ind+(step+1)*3+4] = tempv[1];
        normalv[ind+(step+1)*3+5] = tempv[2];        
    }
    ind = (step+1)*(step+1)*15*3-3;
    normalv[ind] = normalv[ind-3];
    normalv[ind+1] = normalv[ind-2];
    normalv[ind+2] = normalv[ind-1];
//    ind = (step+1)*(step+1)*13*3+(step+1)*(step-1)*3;
//    for (i=0; i<step+1; i++){
//        p0 = [vset[ind], vset[ind+1], vset[ind+2]];
//        p1 = [vset[ind+(step+1)*3], vset[ind+(step+1)*3+1], vset[ind+(step+1)*3+2]];
//        p2 = [vset[ind+3], vset[ind+4], vset[ind+5]];
//        tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
//        normalv[ind] = tempv[0];
//        normalv[ind+1] = tempv[1];
//        normalv[ind+2] = tempv[2];
//        normalv[ind+3] = tempv[0];
//        normalv[ind+4] = tempv[1];
//        normalv[ind+5] = tempv[2];
//        normalv[ind+(step+1)*3] = tempv[0];
//        normalv[ind+(step+1)*3+1] = tempv[1];
//        normalv[ind+(step+1)*3+2] = tempv[2];
//        normalv[ind+(step+1)*3+3] = tempv[0];
//        normalv[ind+(step+1)*3+4] = tempv[1];
//        normalv[ind+(step+1)*3+5] = tempv[2];        
//    }    
    
    
    
    // adjust normal vec at connections..hard coded
//    var connection = [0, 1, 2, 4, 6, 7, 8, 9, 10, 12, 13, 15, 17, 18, 19, 21]; //indicates the connection point in the data
    var connection = [0, 1, 2, 4, 6, 7, 8, 9, 10, 12, 13, 15, 16, 17, 18, 20, 22, 25, 26, 27, 29, 30]; //indicates the connection point in the data
    for (var ncon = 0; ncon < connection.length; ncon++){
        var t = connection[ncon];
        //smooth the conjoint line
        for (i = 0; i<step+1; i++){
            ind = (i + step*(step+1))*3 + t*(step+1)*(step+1)*3;
            tempv = normalize(pvec([normalv[ind],normalv[ind+1],normalv[ind+2]], 
                        [normalv[ind+(step+1)*3],normalv[ind+(step+1)*3+1],normalv[ind+(step+1)*3+2]]));
            normalv[ind] = tempv[0];
            normalv[ind+(step+1)*3] = tempv[0];
            normalv[ind+1] = tempv[1];
            normalv[ind+(step+1)*3+1] = tempv[1];
            normalv[ind+2] = tempv[2];
            normalv[ind+(step+1)*3+2] = tempv[2];
        }
        //smooth the edges of conjoint surfs
        for (i = 0; i<step+1; i++){
            ind = (i + (step-1)*(step+1))*3 + t*(step+1)*(step+1)*3;
            tempv = normalize(pvec([normalv[ind],normalv[ind+1],normalv[ind+2]], 
                        [normalv[ind+(step+1)*3],normalv[ind+(step+1)*3+1],normalv[ind+(step+1)*3+2]]));
            normalv[ind] = tempv[0];
            normalv[ind+1] = tempv[1];
            normalv[ind+2] = tempv[2];
            
            ind = (i + (step+1)*(step+1))*3 + t*(step+1)*(step+1)*3;
            tempv = normalize(pvec([normalv[ind],normalv[ind+1],normalv[ind+2]], 
                        [normalv[ind+(step+1)*3],normalv[ind+(step+1)*3+1],normalv[ind+(step+1)*3+2]]));
            normalv[ind+(step+1)*3] = tempv[0];
            normalv[ind+(step+1)*3+1] = tempv[1];
            normalv[ind+(step+1)*3+2] = tempv[2];            
        }
    }
    
    // adjust normal vec at mirror..hard coded
    var mirror = [0, 1, 2, 3, 4, 5]; //indicates surfs on the mirror
    for (var nmir = 0; nmir < mirror.length; nmir++){
        for (i = 0; i<step+1; i++){
            var ind = (step+1)*3*i + mirror[nmir]*(step+1)*(step+1)*3 + 1; //y coord
            normalv[ind] = 0.0;
        }
        
    }
    
    // adjust normal vec at mirror..hard coded...for bumper
    var mirror = [22, 29];
    for (var nmir = 0; nmir < mirror.length; nmir++){
    	var ind = mirror[nmir]*(step+1)*(step+1)*3 + 1; //y coord
        for (i = 0; i<step+1; i++){
            normalv[ind+i*3] = 0.0;
        }
    }
    
    // include wheels
    var w_index = body_n*(step+1)*(step+1);
    var w_pack = wheel_step*wheel_n+1;
    var ind = 0;
    normalv[w_index*3] = 0;
    normalv[w_index*3+1] = 1;
    normalv[w_index*3+2] = 0;
	for (i = 0; i<wheel_n; i++){
    	
    	//outer-ring 
    	for (var j = 0; j < 11*2-2; j=j+2){
    		ind = (i*wheel_step+w_index+1+j)*3;
    		p0 = [vset[ind], vset[ind+1], vset[ind+2]];
            p1 = [vset[ind+3], vset[ind+4], vset[ind+5]];
            p2 = [vset[ind+6], vset[ind+7], vset[ind+8]];
            tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
            if (!isNaN(tempv[0])){
                normalv[ind] += tempv[0];
                normalv[ind+3] += tempv[0];
                normalv[ind+6] += tempv[0];
                normalv[ind+1] += tempv[1];
                normalv[ind+4] += tempv[1];
                normalv[ind+7] += tempv[1];
                normalv[ind+2] += tempv[2];
                normalv[ind+5] += tempv[2];
                normalv[ind+8] += tempv[2]; 
            }
    		p0 = [vset[ind+3], vset[ind+4], vset[ind+5]];
            p1 = [vset[ind+9], vset[ind+10], vset[ind+11]];
            p2 = [vset[ind+6], vset[ind+7], vset[ind+8]];
            tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
            if (!isNaN(tempv[0])){
                normalv[ind+3] += tempv[0];
                normalv[ind+9] += tempv[0];
                normalv[ind+6] += tempv[0];
                normalv[ind+4] += tempv[1];
                normalv[ind+10] += tempv[1];
                normalv[ind+7] += tempv[1];
                normalv[ind+5] += tempv[2];
                normalv[ind+11] += tempv[2];
                normalv[ind+8] += tempv[2]; 
            }
    	}
    	//bar_front
    	jj = j+2;
    	for (j = jj; j < jj+3*2-2; j=j+2){
    		ind = (i*wheel_step+w_index+1+j)*3;
    		p0 = [vset[ind], vset[ind+1], vset[ind+2]];
            p1 = [vset[ind+3], vset[ind+4], vset[ind+5]];
            p2 = [vset[ind+6], vset[ind+7], vset[ind+8]];
            tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
            if (!isNaN(tempv[0])){
                normalv[ind] += tempv[0];
                normalv[ind+3] += tempv[0];
                normalv[ind+6] += tempv[0];
                normalv[ind+1] += tempv[1];
                normalv[ind+4] += tempv[1];
                normalv[ind+7] += tempv[1];
                normalv[ind+2] += tempv[2];
                normalv[ind+5] += tempv[2];
                normalv[ind+8] += tempv[2]; 
            }
    		p0 = [vset[ind+3], vset[ind+4], vset[ind+5]];
            p1 = [vset[ind+9], vset[ind+10], vset[ind+11]];
            p2 = [vset[ind+6], vset[ind+7], vset[ind+8]];
            tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
            if (!isNaN(tempv[0])){
                normalv[ind+3] += tempv[0];
                normalv[ind+9] += tempv[0];
                normalv[ind+6] += tempv[0];
                normalv[ind+4] += tempv[1];
                normalv[ind+10] += tempv[1];
                normalv[ind+7] += tempv[1];
                normalv[ind+5] += tempv[2];
                normalv[ind+11] += tempv[2];
                normalv[ind+8] += tempv[2]; 
            }
    	}
    	//plate_front
    	jj = j+2;
    	for (j = jj; j < jj+5*2-2; j=j+2){
    		ind = (i*wheel_step+w_index+1+j)*3;
    		p0 = [vset[ind], vset[ind+1], vset[ind+2]];
            p1 = [vset[ind+3], vset[ind+4], vset[ind+5]];
            p2 = [vset[ind+6], vset[ind+7], vset[ind+8]];
            tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
            if (!isNaN(tempv[0])){
                normalv[ind] += tempv[0];
                normalv[ind+3] += tempv[0];
                normalv[ind+6] += tempv[0];
                normalv[ind+1] += tempv[1];
                normalv[ind+4] += tempv[1];
                normalv[ind+7] += tempv[1];
                normalv[ind+2] += tempv[2];
                normalv[ind+5] += tempv[2];
                normalv[ind+8] += tempv[2]; 
            }
    		p0 = [vset[ind+3], vset[ind+4], vset[ind+5]];
            p1 = [vset[ind+9], vset[ind+10], vset[ind+11]];
            p2 = [vset[ind+6], vset[ind+7], vset[ind+8]];
            tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
            if (!isNaN(tempv[0])){
                normalv[ind+3] += tempv[0];
                normalv[ind+9] += tempv[0];
                normalv[ind+6] += tempv[0];
                normalv[ind+4] += tempv[1];
                normalv[ind+10] += tempv[1];
                normalv[ind+7] += tempv[1];
                normalv[ind+5] += tempv[2];
                normalv[ind+11] += tempv[2];
                normalv[ind+8] += tempv[2]; 
            }
    	}
    	
    	//tire
    	jj = j+2;
    	var t_step = 5;
    	for (j = jj; j < jj+11*t_step-t_step; j=j+t_step){
    		for (var p =0; p < t_step-1; p++){
        		ind = (i*wheel_step+p+w_index+1+j)*3;
        		p0 = [vset[ind], vset[ind+1], vset[ind+2]];
                p1 = [vset[ind+3], vset[ind+4], vset[ind+5]];
                p2 = [vset[ind+t_step*3], vset[ind+t_step*3+1], vset[ind+t_step*3+2]];
                tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
                if (!isNaN(tempv[0])){
                    normalv[ind] += tempv[0];
                    normalv[ind+3] += tempv[0];
                    normalv[ind+t_step*3] += tempv[0];
                    normalv[ind+1] += tempv[1];
                    normalv[ind+4] += tempv[1];
                    normalv[ind+t_step*3+1] += tempv[1];
                    normalv[ind+2] += tempv[2];
                    normalv[ind+5] += tempv[2];
                    normalv[ind+t_step*3+2] += tempv[2];     			
                }
        		p0 = [vset[ind+3], vset[ind+4], vset[ind+5]];
        		p1 = [vset[ind+t_step*3+3], vset[ind+t_step*3+4], vset[ind+t_step*3+5]];
                p2 = [vset[ind+t_step*3], vset[ind+t_step*3+1], vset[ind+t_step*3+2]];
                tempv = normalize(crossproduct(dvec(p1,p0), dvec(p2,p1)));
                if (!isNaN(tempv[0])){
                    normalv[ind+3] += tempv[0];
                    normalv[ind+t_step*3+3] += tempv[0];
                    normalv[ind+t_step*3] += tempv[0];
                    normalv[ind+4] += tempv[1];
                    normalv[ind+t_step*3+4] += tempv[0];
                    normalv[ind+t_step*3+1] += tempv[1];
                    normalv[ind+5] += tempv[2];
                    normalv[ind+t_step*3+5] += tempv[0];
                    normalv[ind+t_step*3+2] += tempv[2];     			
                }
    		}
    	}
	}
	//normalize
    for (i = 0; i<w_pack; i++){
          tempv = normalize([normalv[(w_index+i)*3], normalv[(w_index+i)*3+1], normalv[(w_index+i)*3+2]]);
          normalv[(w_index+i)*3] = tempv[0];
          normalv[(w_index+i)*3+1] = tempv[1];
          normalv[(w_index+i)*3+2] = tempv[2];
    }
    
    for (i=w_index*3;i<(w_index+w_pack)*3;i++){
    	normalv[i+w_pack*3] = normalv[i];
    }
    return normalv;
}

function ini_bezier_index(step, numpiece, w_n, w_step){
    var indexData = [];
    for (var i = 0; i < numpiece; i++){
        for (var latNumber = 0; latNumber < step; latNumber++) {
            for (var longNumber = 0; longNumber < step; longNumber++) {
                var first = (latNumber * (step + 1)) + longNumber + i*(step+1)*(step+1);
                var second = first + step + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);
    
                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }
    }
    
    //include wheels
    var w_index = numpiece*(step+1)*(step+1)+1; //skip the wheel center
    var w_pack = w_step*w_n+1;
    for (var p = 0; p < 2; p++){
        for (var i = 0; i < w_n; i++){
        	//outer-ring 
        	for (var j = 0; j < 11*2-2; j++){
        		indexData.push(w_index+w_pack*p + i*w_step + j);
        		indexData.push(w_index+w_pack*p + i*w_step + (j+1));
        		indexData.push(w_index+w_pack*p + i*w_step + (j+2));
        	}
        	//bar_front
        	jj = j+2;
        	for (j = jj; j < jj+3*2-2; j++){
        		indexData.push(w_index+w_pack*p + i*w_step + j);
        		indexData.push(w_index+w_pack*p + i*w_step + (j+1));
        		indexData.push(w_index+w_pack*p + i*w_step + (j+2));
        	}
        	//plate_front
        	jj = j+2;
        	for (j = jj; j < jj+5*2-2; j++){
        		indexData.push(w_index+w_pack*p + i*w_step + j);
        		indexData.push(w_index+w_pack*p + i*w_step + (j+1));
        		indexData.push(w_index+w_pack*p + i*w_step + (j+2));
        	}
        	//center
        	jj = j+2-5*2+1;
        	for (j = jj; j < jj+5*2-2; j=j+2){
        		indexData.push(w_index+w_pack*p + i*w_step + j);
        		indexData.push(w_index+w_pack*p-1);
        		indexData.push(w_index+w_pack*p + i*w_step + (j+2));
        	}
        	
        	//tire
        	jj = j+1;
        	var t_step = 5;
        	var t_n = 10;
        	for (j = jj; j < jj+t_step*t_n; j=j+t_step){
        		for (var q = 0; q<t_step-1; q++){
            		indexData.push(w_index+w_pack*p + i*w_step + j + q);
            		indexData.push(w_index+w_pack*p + i*w_step + j + q+1);
            		indexData.push(w_index+w_pack*p + i*w_step + j + q+t_step);
            		indexData.push(w_index+w_pack*p + i*w_step + j + q+1);
            		indexData.push(w_index+w_pack*p + i*w_step + j + q+t_step+1);   
            		indexData.push(w_index+w_pack*p + i*w_step + j + q+t_step);            		
        		}
        	}
        }
    }
    return indexData;
}



// intersection of line (pt1, v1) on plane (pt2, v2)
function intersect(pt1, v1, pt2, v2){
    
    if (!v1[0] == 0){
        var a = v2[0]*pt2[0] + v2[1]*pt2[1] + v2[2]*pt2[2];
        var b = v1[1]*pt1[0] - v1[0]*pt1[1];
        var c = v1[2]*pt1[0] - v1[0]*pt1[2];
        var x = (a*v1[0]+b*v2[1]+c*v2[2])/(v2[0]*v1[0]+v2[1]*v1[1]+v2[2]*v1[2]);
        var y = (b*v2[1] - x*v1[1]*v2[1])/(-v1[0]*v2[1]);
        var z = (c*v2[2] - x*v1[2]*v2[2])/(-v1[0]*v2[2]);
        return [x, y, z];
    }
//    else {
//    	if (!v1[1]==0){
            var a = v2[0]*pt2[0] + v2[1]*pt2[1] + v2[2]*pt2[2] - v2[0]*pt1[0];
            var b = v1[2]*pt1[1] - v1[1]*pt1[2];
            var x = pt1[0];
            var y = (a*v1[1] + b*v2[2])/(v2[1]*v1[1]);
            var z = (b*v2[2] - v1[2]*v2[2]*y)/(-v1[1]*v2[2]);
            
            return [x, y, z];	
//    	}
//    	else {
//            var a = v2[0]*pt2[0] + v2[1]*pt2[1] + v2[2]*pt2[2];
//            var b = v1[1]*pt1[0] - v1[0]*pt1[1];
//            var c = v1[2]*pt1[0] - v1[0]*pt1[2];
//            var x = (a*v1[0]+b*v2[1]+c*v2[2])/(v2[0]*v1[0]+v2[2]*v1[2]);
//            var y = pt1[1];
//            var z = (c*v2[2] - x*v1[2]*v2[2])/(-v1[0]*v2[2]);
//            return [x, y, z];
//    	}
//    }
}

// intersection of line (pt1, v1) and line (pt2, v2)
function intersect_line(pt1, v1, pt2, v2){

//    var a = v1[1]*pt1[0] - v1[0]*pt1[1];
//    var b = v1[2]*pt1[0] - v1[0]*pt1[2];
//    var c = v2[1]*pt2[0] - v2[0]*pt2[1];
//    
//    var x = (a*v2[0] - c*v1[0])/(v1[1]*v2[0] - v1[0]*v2[1]);
//    var y = (-c*v1[0] + v1[0]*v2[1]*x)/(v2[0]*v1[0]);
//    var z = (b - v1[2]*x)/-v1[0];
    if (v1[0]==0){
    	var a  = ((pt1[1]-pt2[1])*v2[2]-(pt1[2]-pt2[2])*v2[1])/(v1[2]*v2[1]-v1[1]*v2[2]);
        var x = pt1[0] + a*v1[0];
        var y = pt1[1] + a*v1[1];
        var z = pt1[2] + a*v1[2];
    }
    else if (v1[2]==0){
    	var a  = ((pt1[0]-pt2[0])*v2[1]-(pt1[1]-pt2[1])*v2[0])/(v1[1]*v2[0]-v1[0]*v2[1]);
        var x = pt1[0] + a*v1[0];
        var y = pt1[1] + a*v1[1];
        var z = pt1[2] + a*v1[2];
    }
    else if (v1[1]==0){
    	var a  = ((pt1[0]-pt2[0])*v2[2]-(pt1[2]-pt2[2])*v2[0])/(v1[2]*v2[0]-v1[0]*v2[2]);
        var x = pt1[0] + a*v1[0];
        var y = pt1[1] + a*v1[1];
        var z = pt1[2] + a*v1[2];
    }
    else {
    	var a  = ((pt1[0]-pt2[0])*v2[1]-(pt1[1]-pt2[1])*v2[0])/(v1[1]*v2[0]-v1[0]*v2[1]);
    	var b  = ((pt1[0]-pt2[0])*v2[2]-(pt1[2]-pt2[2])*v2[0])/(v1[2]*v2[0]-v1[0]*v2[2]);
    	var c  = ((pt1[1]-pt2[1])*v2[2]-(pt1[2]-pt2[2])*v2[1])/(v1[2]*v2[1]-v1[1]*v2[2]);
    	
        if (pt1[0] + a*v1[0]<pt2[0] && pt1[0] + a*v1[0]>pt1[0]){
            var x = pt1[0] + a*v1[0];
            var y = pt1[1] + a*v1[1];
            var z = pt1[2] + a*v1[2];
        }
        else if (pt1[0] + b*v1[0]<pt2[0] && pt1[0] + b*v1[0]>pt1[0]){
            var x = pt1[0] + b*v1[0];
            var y = pt1[1] + b*v1[1];
            var z = pt1[2] + b*v1[2];        	
        }
        else {
            var x = pt1[0] + c*v1[0];
            var y = pt1[1] + c*v1[1];
            var z = pt1[2] + c*v1[2];
        }
    }
	

    
    return [x, y, z];
}

// rotate pt1 along line (pt2, v) for a degree
function rotatept(pt1, pt2, v, a){
 var x = pt1[0] - pt2[0];
 var y = pt1[1] - pt2[1];
 var z = pt1[2] - pt2[2];
 var ux = v[0]*x;
 var uy = v[0]*y;
 var uz = v[0]*z;
 var vx = v[1]*x;
 var vy = v[1]*y;
 var vz = v[1]*z;
 var wx = v[2]*x;
 var wy = v[2]*y;
 var wz = v[2]*z;
 var sa = Math.sin(a);
 var ca = Math.cos(a);
 var xx = v[0]*(ux+vy+wz)+(x*(v[1]*v[1]+v[2]*v[2])-v[0]*(vy+wz))*ca+(-wy+vz)*sa + pt2[0];
 var yy = v[1]*(ux+vy+wz)+(y*(v[0]*v[0]+v[2]*v[2])-v[1]*(ux+wz))*ca+(wx-uz)*sa + pt2[1];
 var zz = v[2]*(ux+vy+wz)+(z*(v[0]*v[0]+v[1]*v[1])-v[2]*(ux+vy))*ca+(-vx+uy)*sa + pt2[2];
 return [xx, yy, zz];
}



// flip vertices
function mirrorvertex(vset){
    var l = vset.length/3;
    for (var i = 0; i<l; i++){
        vset.push(vset[i*3]);
        vset.push(-vset[i*3+1]);
        vset.push(vset[i*3+2]);
    }
    return vset;
}
function mirrorindex(ind, n){
    var l = ind.length;
    for(var i = 0; i<l; i++){
        ind.push(ind[i]+n);
    }
    return ind;
}
function mirrornormal(nset){
    var l = nset.length/3;
    for (var i = 0; i<l; i++){
        nset.push(nset[i*3]);
        nset.push(-nset[i*3+1]);
        nset.push(nset[i*3+2]);
    }
    return nset;    
}


// vector crossproduct
function crossproduct(v1, v2){
    var v = [];
    v.push(v1[1]*v2[2]-v1[2]*v2[1]);
    v.push(v2[0]*v1[2]-v1[0]*v2[2]);
    v.push(v1[0]*v2[1]-v1[1]*v2[0]);
    return v;
}

// vector dotproduct
function dotproduct(v1, v2){
	var v = 0;
	v+=v1[0]*v2[0];
	v+=v1[1]*v2[1];
	v+=v1[2]*v2[2];
	return v;
}

// Calculate v1 - v2
function dvec(v1, v2){
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

// Calculate v1 + v2
function pvec(v1, v2){
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

// get a value from the canvas
function getv(v){
    return parseFloat(document.getElementById(v).value);
}

// rotate matrix a along y for b angle wrt point c
function rotate_y(a,b,c){
	var l = a.length/3;
	var ang = 0;
	var r = 0;
	var x = 0;
	var z = 0;
	for (var i = 0; i<l; i++){
		x = a[i*3]-c[0];
		z = a[i*3+2]-c[2];
		ang = Math.atan2(z, x);
		ang+=b;
		r = Math.sqrt(x*x+z*z);
		a[i*3] = r*Math.cos(ang)+c[0];
		a[i*3+2] = r*Math.sin(ang)+c[2];
	}
	return a;
}

//Normalize a vector
function normalize(v){
 var l = v.length;
 var t = 0;
 for (var i = 0; i< l; i++){
     t += v[i]*v[i];
 }
 
 t = Math.sqrt(t);
 var vv = [];
 for (var i = 0; i< l; i++){
     vv.push(v[i]/t);
 }
 return vv;
}

//check whether points have NaN
function checkNaN(pts){
	var l = pts.length;
	for (var i = 0; i<l; i++){
		for (var j = 0; j<3; j++){
			if (isNaN(pts[i][j])){window.alert(i.toString()+" "+j.toString());}
		}
	}
}