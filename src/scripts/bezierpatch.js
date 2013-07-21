//Bezier patch

//for 9 control points
function draw_bezier_surf(ctrlpt, step, order, BC){
    var vertexPositionData = [];
    var ctrlptset;
    for (var i = 0; i<ctrlpt.length/(order+1)/(order+1); i++){
        ctrlptset = [];
        for (var j = 0; j<(order+1)*(order+1); j++){
            ctrlptset.push(ctrlpt[j + i*(order+1)*(order+1)]);
        }
        vertexPositionData = vertexPositionData.concat(bezier_point(ctrlptset, step, order, BC));
    }
    return vertexPositionData;
}

//calculate interpolate points
function bezier_point(ctrlpt, step, order, BC){
    var pts = [];
    for (var i = 0;i<step+1;i++){
        for (var j = 0;j<step+1;j++){
            pts = pts.concat(bezier_eval(ctrlpt,i,j, order, BC));
        }
    }
    return pts;
}




//goes with bezier_point
function bezier_eval(ctrlpt,m,n, order, BC){
    var p = 0;
    var f;
    var pt = [0.0, 0.0, 0.0];
    
    for (var i = 0;i<order+1;i++){
        for (var j = 0;j<order+1;j++){
            f = BC[i][m] * BC[j][n];
            pt[0] += f*ctrlpt[p][0];
            pt[1] += f*ctrlpt[p][1];
            pt[2] += f*ctrlpt[p][2];
            p += 1;
        }
    }
    return pt;
}



//organize interpolated points
function bezier_line(pts, m, n){
    var ulines = [];
    var vlines = [];
    var pt = [];
    
    for (var i = 0;i<m+1;i++){
        ulines[i] = [];
    }
    for (var j = 0;j<n+1;j++){
        vlines[j] = [];
    }
    var p = 0;
    for (i = 0;i<m+1;i++){
        for (j = 0;j<n+1;j++){
            pt = pts[p];
            ulines[i].push(pt);
            vlines[j].push(pt);
            p += 1;
        }
    }
    return [ulines, vlines];
}   


//initialize
function bezier_ini(){

    init_order_coef(order);
    init_berstein_polys(order, step);
    
}

function init_order_coef(order){
    //for now, assume uorder == vorder
    var CC = [];
    var facs = [];
    facs[0] = 1.0;
    for (var i = 1;i < order+1;i++){
        facs[i] = i * facs[i-1];
    }
    
    for (i = 0;i<order+1;i++){
        CC.push(facs[order]/(facs[i]*facs[order-i]));
    }
    return CC;
}

function init_berstein_polys(order, step, CC){
    //for now, assume uorder == vorder
    var BC = [];
    var t_step = 1.0/step;
    var t;
    var tC;
    for (var i = 0;i < order+1;i++){
        BC[i] = [];
        for (var j = 0;j < step+1;j++){
            t = t_step * j;
            tC = 1.0 - t;
            BC[i][j] = CC[i]*Math.pow(t,i)*Math.pow(tC,(order-i));
        }
    }
    return BC;
}
