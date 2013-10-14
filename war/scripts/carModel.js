function carModel(Input, order, step, wheel_n, wheel_step, tire_step, material){
    // parameters for bezier surface
    var CC; //order_coef
    var BC; //berstein_polys
    CC = init_order_coef(order);
    BC = init_berstein_polys(order, step, CC); //generate CC and BC array once for all
    
    
    // parameters for the model
    var ex = [1.0, 0.000001, 0.000001];
    var ey = [0.000001, 1.0, 0.000001];
    var ez = [0.000001, 0.000001, 1.0];
    var origin = [5, 0, 0];
    var well_scale = 2.0;
    var r_wheel = 0.60;
    var wheel_scale = 1.15;
    var box_r = 10.0;
    var clearance = 0.7*r_wheel;
    var box_l = origin[0]-2*r_wheel;
    var box_u = 2.5*r_wheel;
    
    var roof_end_pt_x = 7.0 - origin[0]; //higher limit on @roof_end_pt
    var bw_end_pt_x = 8.0 - origin[0]; //higher limit on @bw_end_pt
    var roof_end_pt_z = r_wheel * well_scale + 1.3 - origin[2]; //lower limit on @roof_end_pt   
    var bw_end_pt_z = r_wheel*well_scale*wheel_scale*1.1+0.1; //lower limit on @bw_end_pt
    var hood_u_n = 1.0; //to avoid surface intrusion (@nose_mid_pt is on the negative side of center plane)
    
    var hood_end_pt = [0.0 + 1.5 * Input[0] - origin[0], 0.0 - origin[1], 1.2 + 0.5 * Input[1] - origin[2]];
    var roof_start_pt = [hood_end_pt[0] + 1.0 + 2.0 * Input[2], 0.0, hood_end_pt[2] + 1.0 + 0.5 * Input[3]];
    
    var temp = normalize(dvec(roof_start_pt, hood_end_pt))[0] * (0.75 + 0.2 * Input[4]);
    var fw_vec = [temp, 0.0, Math.sqrt(1.0-temp*temp)];
    var fw_n = (roof_start_pt[2] - hood_end_pt[2])*0.5/ fw_vec[2] +  (roof_start_pt[2] - hood_end_pt[2])*0.5/ fw_vec[2] * Input[5];
    var fw_ctrl_pt = [hood_end_pt[0] + fw_n*fw_vec[0], hood_end_pt[1] + fw_n*fw_vec[1], hood_end_pt[2] + fw_n*fw_vec[2]];
    
    var roof_vec = normalize(dvec(roof_start_pt, fw_ctrl_pt));
    temp = Math.min((0.5 + (roof_end_pt_x - roof_start_pt[0])* 0.5)*roof_vec[2]/roof_vec[0]+roof_start_pt[2], roof_end_pt_z+0.1);
    var roof_end_pt = [roof_start_pt[0] + 2.0 + (roof_end_pt_x - roof_start_pt[0]-2.0)* Input[6], 0.0, (roof_end_pt_z+temp)*0.5 + (temp - roof_end_pt_z)*0.5*Input[7]];
    var rf_n = 0.5; //need a variable here...***
    var roof_ctrl_pt = [roof_start_pt[0] + rf_n*roof_vec[0], roof_start_pt[1] + rf_n*roof_vec[1], roof_start_pt[2] + rf_n*roof_vec[2]];
    
    var bw_vec = normalize(dvec(roof_end_pt, roof_ctrl_pt));
    var bw_end_pt = [bw_end_pt_x, 0.0, Math.min(roof_end_pt[2]-1, bw_end_pt_z + (roof_end_pt[2]-1 - bw_end_pt_z)* 0.5)];
    var bw_n = (bw_end_pt[0] - roof_end_pt[0])/5;
    var bw_ctrl_pt = [roof_end_pt[0] + bw_n*bw_vec[0], roof_end_pt[1] + bw_n*bw_vec[1], roof_end_pt[2] + bw_n*bw_vec[2]];
    
    
    //The following block creates the side curve according to the "fw", "roof" and "rw" curves
    var c1_t = 0.8 + 0.2* 0.5; //scale-copy the profile on xz plane to the side curve
    //var hood_u_pt_x = (bw_end_pt[0] - hood_end_pt[0])*(1-c1_t); //move side curve of component1 on the x axis
    var hood_u_pt_x = 0.4; //need a variable here...***
    var hood_u_pt_z = -0.2* 0.5; //move side curve of component1 on the z axis
    var hood_u_pt = [hood_end_pt[0] + hood_u_pt_x, 1.8+0.2* 0.5, hood_end_pt[2] + hood_u_pt_z];
    
    //All ctrl points from fw to bw on v direction w/o rotation
    var fw_v_hash_pt = 
        [hood_end_pt[0] + (fw_ctrl_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (fw_ctrl_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z];
    var fw_u_pt = 
        [hood_end_pt[0] + (roof_start_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (roof_start_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z];
    var roof_v_hash_pt = 
        [hood_end_pt[0] + (roof_ctrl_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (roof_ctrl_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z];
    var roof_pt = 
        [hood_end_pt[0] + (roof_end_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (roof_end_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z];
    var bw_v_mid_pt = 
        [hood_end_pt[0] + (bw_ctrl_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (bw_ctrl_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z];
    var bw_pt = 
        [hood_end_pt[0] + (bw_end_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (bw_end_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z];
    
    // rotate along x-axis
//    roof_pt = rotatept(roof_pt, roof_v_hash_pt, dvec(roof_v_hash_pt, fw_u_pt), -0.05);
//    bw_v_mid_pt = rotatept(bw_v_mid_pt, roof_v_hash_pt, dvec(roof_v_hash_pt, fw_u_pt), -0.05);
//    bw_pt = rotatept(bw_pt, roof_v_hash_pt, dvec(roof_v_hash_pt, fw_u_pt), -0.05);
//    bw_pt = rotatept(bw_pt, bw_v_mid_pt, dvec(bw_v_mid_pt, roof_pt), -0.1);
    
    temp = rotatept(fw_v_hash_pt, hood_u_pt, [1,0,0], 0.3);
    fw_v_hash_pt = [temp[0], temp[1], fw_v_hash_pt[2]];
    temp = rotatept(fw_u_pt, hood_u_pt, [1,0,0], 0.3);
    fw_u_pt = [temp[0], temp[1], fw_u_pt[2]];
    temp = rotatept(roof_v_hash_pt, hood_u_pt, [1,0,0], 0.3);
    roof_v_hash_pt = [temp[0], temp[1], roof_v_hash_pt[2]];
    temp = rotatept(roof_pt, hood_u_pt, [1,0,0], 0.3);
    roof_pt = [temp[0], temp[1], roof_pt[2]];
    temp = rotatept(bw_v_mid_pt, hood_u_pt, [1,0,0], 0.3);
    bw_v_mid_pt = [temp[0], temp[1], bw_v_mid_pt[2]];
    temp = rotatept(bw_pt, hood_u_pt, [1,0,0], 0.3);
    bw_pt = [temp[0], temp[1], bw_pt[2]];
    
    // shift
//    roof_pt[1] -= 0.2*Input[32];
//    bw_v_mid_pt[1] -= 0.2*Input[32];
//    bw_pt[1] -= 0.2*Input[32];
    
    
    //All ctrl points on u direction
    var hood_u_mid_pt = [hood_end_pt[0], hood_end_pt[1] + hood_u_n, hood_end_pt[2]];
    
        //To reduce the number of variables, we assume that the mid pts of hood_center, roof and hood_u curves have 
        //the same propotion to their total y length.
    var k = hood_u_mid_pt[1] / hood_u_pt[2];
    var fw_center_n =  k * fw_v_hash_pt[1];
    var fw_center = [fw_ctrl_pt[0], fw_ctrl_pt[1] + fw_center_n, fw_ctrl_pt[2]];
    var fw_u_n = k * fw_u_pt[1];
    var fw_u_mid_pt = [roof_start_pt[0], roof_start_pt[1] + fw_u_n, roof_start_pt[2]];
    var rf_center_n = k * roof_v_hash_pt[1];
    var rf_center = [roof_ctrl_pt[0], roof_ctrl_pt[1] + rf_center_n, roof_ctrl_pt[2]];
    var rf_u_n = k * roof_pt[1];
    var rf_u_mid_pt = [roof_end_pt[0], roof_end_pt[1] + rf_u_n, roof_end_pt[2]];
    var bw_center_n = k * bw_v_mid_pt[1];
    var bw_center = [bw_ctrl_pt[0], bw_ctrl_pt[1] + bw_center_n, bw_ctrl_pt[2]];
    var bw_u_n = k * bw_pt[1];
    var bw_u_mid_pt = [bw_end_pt[0], bw_end_pt[1] + bw_u_n, bw_end_pt[2]];
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    var box_w = 2.1 + 0.6 * 0.5;
    var nose_mid_pt = [-2.0 - origin[0], 0 - origin[1], 0 - origin[2]];
    var hood_start_pt = [nose_mid_pt[0]  + 0.5* Input[8], 0.0, hood_end_pt[2] - 1.0* Input[9]];
    var temp = normalize(dvec(hood_start_pt, hood_end_pt))[2] * (-0.4 + 1.5 * Input[10]);
    var hood_vec = [-Math.sqrt(1.0-temp*temp), 0.0, temp];
    var hood_n = (hood_start_pt[0] - hood_end_pt[0])*0.1/ hood_vec[0] +  (hood_start_pt[0] - hood_end_pt[0]) * 0.9 /  hood_vec[0] * Input[11];
    var hood_ctrl_pt = [hood_end_pt[0] + hood_vec[0]*hood_n,hood_end_pt[1],hood_end_pt[2] + hood_vec[2]*hood_n];
    var nose_vec = normalize(dvec(nose_mid_pt, hood_start_pt));
    temp = -(hood_start_pt[2]-nose_mid_pt[2])/nose_vec[2]*0.5;//need a variable here***
    var nose_ctrl_pt = [hood_start_pt[0] + nose_vec[0]*temp + 0.0001,hood_start_pt[1],hood_start_pt[2] + nose_vec[2]*temp]; // should have cur cont.
    
    var nose_u_pt = [hood_start_pt[0] + 0.1 + 0.4* Input[12], hood_u_pt[1] - 0.3 - 0.6* Input[13], hood_start_pt[2]];
    temp = normalize(dvec(nose_u_pt, hood_u_pt));
    var hood_v_vec = [temp[0], temp[1], temp[2] * (0.0 + 0.8 * Input[14])];
    hood_v_vec = normalize(hood_v_vec);
    var hood_v_n = (nose_u_pt[0] - hood_u_pt[0])*0.8/ hood_v_vec[0] +  (nose_u_pt[0] - hood_u_pt[0])*0.2/ hood_v_vec[0]* 0.5;
    var hood_v_pt = [hood_u_pt[0] + hood_v_vec[0]*hood_v_n, hood_u_pt[1] + hood_v_vec[1]*hood_v_n, hood_u_pt[2] +  + hood_v_vec[2]*hood_v_n];
    nose_u_pt[2] = Math.min(nose_u_pt[2], hood_v_pt[2]);
    
    temp = hood_u_mid_pt[1]/(hood_u_mid_pt[0] - nose_mid_pt[0]);
    temp = temp* 0.5;
    var hood_center = [hood_ctrl_pt[0], temp*(hood_u_mid_pt[0] - hood_ctrl_pt[0]), hood_ctrl_pt[2]];
    var nose_u_hash_pt = [hood_start_pt[0], temp*(hood_u_mid_pt[0] - hood_start_pt[0]), hood_start_pt[2]];
    var nose_center = [nose_ctrl_pt[0], temp*(hood_u_mid_pt[0] - nose_ctrl_pt[0]), nose_ctrl_pt[2]];
    var head_u_hash_pt = [nose_mid_pt[0], temp*(hood_u_mid_pt[0] - nose_mid_pt[0]), nose_mid_pt[2]];
    var head_end_pt = [head_u_hash_pt[0] + 0.1 + 0.2* Input[15], nose_u_pt[1] - (nose_u_pt[1] - head_u_hash_pt[1])/2*Input[16], head_u_hash_pt[2]];
    
    var nose_v_vec = normalize(dvec(nose_u_pt, hood_v_pt));
    temp = Math.max(Math.min((-hood_start_pt[0]+nose_ctrl_pt[0])/nose_v_vec[0], (-hood_start_pt[2]+nose_ctrl_pt[2])/nose_v_vec[2]), 0.01);
    var nose_v_hash_pt = [nose_u_pt[0] + nose_v_vec[0]*temp, nose_u_pt[1] + nose_v_vec[1]*temp, nose_u_pt[2] + nose_v_vec[2]*temp];
        
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
    var head_u1_pt_x = head_end_pt[0]+1.0-0.25*well_scale;
    var head_u1_pt_y = Math.max(box_w - 0.25*well_scale, head_end_pt[1]+0.1, hood_u_pt[1]+0.1);
    var fwheel_x = head_u1_pt_x + well_scale*r_wheel; //wheel coordinates    
    var fwheel_z = nose_mid_pt[2];
    var head_u1_pt = [head_u1_pt_x, head_u1_pt_y, 0.0];
    var head_u1_vec = normalize(dvec(head_end_pt, head_u_hash_pt));
    temp = Math.min((head_u1_pt[0]-head_end_pt[0])/head_u1_vec[0], (head_u1_pt[1]-head_end_pt[1])/head_u1_vec[1]);
    var head_u1_mid_pt = [head_end_pt[0]+head_u1_vec[0]*temp*0.5,head_end_pt[1]+head_u1_vec[1]*temp*0.5,head_end_pt[2]+head_u1_vec[2]*temp*0.5]; //need a variable***
    
    var fw1 = [fwheel_x - r_wheel*well_scale*0.8, box_w, 0.0];//need a variable***
    var fw3 = [fwheel_x + r_wheel*well_scale*0.8, box_w, 0.0];
    var front_well_pt1 = [fwheel_x + r_wheel*well_scale, head_u1_pt[1]*0.2+box_w*0.8, 0.0];
    var k = (fw1[0] - fw3[0])/(head_u1_pt[0] - front_well_pt1[0]);
    var fw2 = [fwheel_x - well_scale*r_wheel*0.5*k, fw3[1], r_wheel*well_scale*0.5*Math.sqrt(3)*k + fwheel_z];
    var mid_pt1 = [fw2[0] - r_wheel*well_scale*0.7*0.5*k, fw2[1], fw2[2] - r_wheel*well_scale*0.7*0.5/Math.sqrt(3)*k];
    var mid_pt2 = [fw2[0] + r_wheel*well_scale*2.1*0.5*k, fw2[1], fw2[2] + r_wheel*well_scale*2.1*0.5/Math.sqrt(3)*k];
    
 
    // smooth head
//    var head_u1_pt = [0.0, 0.0, 0.0];
//    head_u1_pt[0] = CC[0]*head_end_pt[0]*Math.pow(1/2, 0)*Math.pow(1/2, order) + 
//                    CC[1]*head_end_pt[0]*Math.pow(1/2, 1)*Math.pow(1/2, order-1) + 
//                    CC[2]*fw1[0]*Math.pow(1/2, 2)*Math.pow(1/2, order-2);
//    head_u1_pt[1] = CC[0]*head_end_pt[1]*Math.pow(1/2, 0)*Math.pow(1/2, order) + 
//                    CC[1]*head_end_pt[1]*Math.pow(1/2, 1)*Math.pow(1/2, order-1) + 
//                    CC[2]*fw1[1]*Math.pow(1/2, 2)*Math.pow(1/2, order-2);
//    head_u1_pt[2] = CC[0]*head_end_pt[2]*Math.pow(1/2, 0)*Math.pow(1/2, order) + 
//                    CC[1]*head_end_pt[2]*Math.pow(1/2, 1)*Math.pow(1/2, order-1) + 
//                    CC[2]*fw1[2]*Math.pow(1/2, 2)*Math.pow(1/2, order-2);
//    
//    temp_vec = dvec(fw1, head_end_pt);
//    var head_u1_mid_pt = intersect_line(head_u1_pt, ey, rear_start_pt, temp_vec);
//    var rear_u2_mid_pt = intersect_line(rear_pt, dvec(rear_pt, [hip_mid_pt[0],hip_mid_pt[1]+rear_n,hip_mid_pt[2]]), rear_start_pt, temp_vec);
//    
    
    
//    var well_vec = normalize([hood_u_pt[0]-hood_u_mid_pt[0], hood_u_pt[1]-hood_u_mid_pt[1], -0.5]);
    var well_v_vec = normalize(crossproduct(dvec(hood_u_pt, nose_u_pt), dvec(nose_u_pt, head_end_pt)));
//    temp = Math.abs(dotproduct(dvec([hood_u_pt[0], head_u1_pt[1], hood_u_pt[2]], nose_v_hash_pt),well_v_vec));
//    var well_u_mid_pt = intersect(hood_u_pt, well_vec, pvec(head_end_pt, [0, temp*0.5, 0]), well_v_vec);
    var well_vec = normalize(dvec(hood_u_pt,hood_u_mid_pt));
    var well_u_mid_pt = [hood_u_pt[0]+well_vec[0]*0.2,hood_u_pt[1]+well_vec[1]*0.2,hood_u_pt[2]-0.06];

    var well_pt = intersect(well_u_mid_pt, dvec(well_u_mid_pt,hood_u_pt), [0, well_u_mid_pt[1]+0.1, 0], [0.000001, 1, 0.000001]); //simplified
    well_pt[2] = Math.max(well_pt[2], 0.5);
    well_u_mid_pt[1] = Math.min(well_u_mid_pt[1], well_pt[1]);

    var head_center_vec = normalize(dvec(nose_v_hash_pt, nose_center)); //simplied..**
    temp_vec = intersect(nose_v_hash_pt, [head_center_vec[0], head_center_vec[1], 0], pvec(nose_v_hash_pt, [0, 0.1, 0]), well_v_vec);
    if(temp_vec[0]<intersect(nose_v_hash_pt, dvec(nose_v_hash_pt, mid_pt1), pvec(nose_v_hash_pt, [0, 0.1, 0]), well_v_vec)[0]
    	&& temp_vec[0]>nose_v_hash_pt[0]){
    	var head_center = temp_vec;
    }
    else{
    	var head_center = intersect(nose_v_hash_pt, dvec(nose_v_hash_pt, mid_pt1), pvec(nose_v_hash_pt, [0, 0.1, 0]), well_v_vec);
    }
    head_center[2] = Math.max(head_center[2], 0.1+origin[2]);
    head_center[1] = Math.min(head_center[1], head_u1_pt[1]);
    head_center[0] = Math.max(Math.min(head_center[0], mid_pt1[0]),nose_v_hash_pt[0]);
    
    temp = Math.abs(Math.max(dotproduct(dvec([hood_u_pt[0], head_u1_pt[1], hood_u_pt[2]], nose_u_pt),well_v_vec), dotproduct(dvec(head_u1_pt, nose_u_pt),well_v_vec)));
    var head_u2_mid_pt = intersect(nose_u_pt, dvec(nose_u_pt, mid_pt1), pvec(nose_u_pt,[0, temp*0.5, 0]), well_v_vec);
	head_u2_mid_pt[1]+=(Input[17]-0.1)*0.2;
	head_u2_mid_pt[2]+=(Input[18]-0.5)*0.5;
	head_u2_mid_pt[0] = Math.max(head_u2_mid_pt[0], head_center[0]+0.1);
	
    var well_vvv_vec = normalize(dvec(head_u2_mid_pt, head_center));
    temp = Math.min(Math.abs((well_u_mid_pt[0]-head_u2_mid_pt[0])/well_vvv_vec[0]/2.0), Math.abs((head_u2_mid_pt[1]-hood_v_pt[1])/well_vvv_vec[1]), Math.max((well_u_mid_pt[2]-head_u2_mid_pt[2]+0.5)/well_vvv_vec[2], 0.01));
    var well_center = [head_u2_mid_pt[0] + well_vvv_vec[0]*temp, head_u2_mid_pt[1] + well_vvv_vec[1]*temp, head_u2_mid_pt[2] + well_vvv_vec[2]*temp];
    well_center[2] = Math.max(well_center[2], r_wheel*well_scale*r_wheel*1.2);
    
    temp = (well_pt[1]-nose_u_pt[1])/(well_pt[0]-(fwheel_x - well_scale*r_wheel*0.5)); 
    var belt_top_vec = [1, temp*0.3, (well_center[2]-well_u_mid_pt[2])/(well_center[0]-well_u_mid_pt[0])];
    var well_v_pt = intersect(well_pt, belt_top_vec,
    						  [fwheel_x - well_scale*r_wheel*0.5, 0, r_wheel*well_scale*0.5*Math.sqrt(3) + fwheel_z], [1, 0.000000001, -Math.sqrt(3)]);
    well_v_pt[0] = Math.min(Math.max(well_v_pt[0], fwheel_x - well_scale*r_wheel*0.5+0.2), well_pt[0]-0.1);
    well_v_pt[1] = Math.min(Math.max(well_v_pt[1], hood_v_pt[1]+0.3),box_w);
    well_v_pt[2] = Math.min(Math.max(well_v_pt[2], r_wheel*well_scale*0.5*Math.sqrt(3)),well_center[2]);
    if (well_v_pt[1] <= well_center[1]){well_center[1]=well_v_pt[1]-0.01;}
    
//    temp = (well_pt[0]-head_u2_pt[0])/well_vv_vec[0];
//    var well_v_pt = [head_u2_pt[0] + well_vv_vec[0]*temp*0.5, head_u2_pt[1] + well_vv_vec[1]*temp*0.5, head_u2_pt[2] + well_vv_vec[2]*temp*0.5];

//    var head_u2_pt = [((fwheel_x - well_scale*r_wheel*0.5)+nose_u_pt[0])*0.5,//need a variable *** 
//                      well_v_pt[1], 
//                      (r_wheel*well_scale*0.5*Math.sqrt(3) + fwheel_z + nose_u_pt[2])*0.5];
    var head_u2_pt = [fwheel_x - well_scale*r_wheel*0.5,//need a variable *** 
                      well_v_pt[1], 
                      r_wheel*well_scale*0.5*Math.sqrt(3) + fwheel_z];

    
    var head_v_pt = [head_u2_pt[0] - r_wheel*well_scale*0.7*0.5, head_u2_pt[1], head_u2_pt[2] - r_wheel*well_scale*0.7*0.5/Math.sqrt(3)];
//    var head_v_pt = [head_u2_pt[0] + (head_u2_pt[0]-well_v_pt[0])*Input[32], head_u2_pt[1] + (head_u2_pt[1]-well_v_pt[1])*Input[32], head_u2_pt[2] + (head_u2_pt[2]-well_v_pt[2])*Input[32]];
//    

//    head_v_pt = intersect(head_u2_pt, dvec(head_u2_pt, well_v_pt),
//    							head_center, crossproduct(dvec(head_center, nose_v_hash_pt), dvec(head_center, mid_pt1)));
//    head_v_pt[0] = Math.min(Math.max(head_v_pt[0], head_center[0]), mid_pt1[0]);
//    head_v_pt[2] = Math.max(Math.min(head_v_pt[2], head_center[2]), fw1[2]);
    
    
//    var front_well_pt1 = [fwheel_x + r_wheel*well_scale, head_u1_pt[1]*0.2+box_w*0.8, 0.0];
    var front_well_u1_pt = [head_u2_pt[0] + r_wheel*well_scale*0.7*1.3, head_u2_pt[1]*0.2+box_w*0.8, head_u2_pt[2] + r_wheel*well_scale*0.7*1.3/Math.sqrt(3)];
    var front_well_pt2 = [well_pt[0] - well_v_pt[0] + front_well_pt1[0], front_well_pt1[1] - 0.1* 0.5, front_well_pt1[2]];
    var fwell_vec = normalize(dvec(well_pt, well_u_mid_pt));
    var belt_cur_n = Math.min(0.1, Math.max(fwell_vec[2],0.01));
    var front_well_u2_pt = [well_pt[0] + fwell_vec[0]*belt_cur_n, well_pt[1] + fwell_vec[1]*belt_cur_n, well_pt[2] + fwell_vec[2]*belt_cur_n];
    
//    var fw1 = [fwheel_x - r_wheel*well_scale*0.8, box_w, 0.0];//need a variable***
//    var fw3 = [fwheel_x + r_wheel*well_scale*0.8, box_w, 0.0];
//    var k = (fw1[0] - fw3[0])/(head_u1_pt[0] - front_well_pt1[0]);
////    var fw2 = [fw1[0] + (head_u2_pt[0] - head_u1_pt[0])*k, fw1[1], fw1[2] + (head_u2_pt[2] - head_u1_pt[2])*k];
//    var fw2 = [fwheel_x - well_scale*r_wheel*0.5*k, fw3[1], r_wheel*well_scale*0.5*Math.sqrt(3)*k + fwheel_z];
////    var mid_pt1 = [fw1[0] + (head_v_pt[0] - head_u1_pt[0])*k, fw1[1], fw1[2] + (head_v_pt[2] - head_u1_pt[2])*k];
//    var mid_pt1 = [fw2[0] - r_wheel*well_scale*0.7*0.5*k, fw2[1], fw2[2] - r_wheel*well_scale*0.7*0.5/Math.sqrt(3)*k];
//    
////    var mid_pt2 = [fw1[0] + (front_well_u1_pt[0] - head_u1_pt[0])*k, fw1[1], fw1[2] + (front_well_u1_pt[2] - head_u1_pt[2])*k];
//    var mid_pt2 = [fw2[0] + r_wheel*well_scale*2.1*0.5*k, fw2[1], fw2[2] + r_wheel*well_scale*2.1*0.5/Math.sqrt(3)*k];
//    
    var fw_mid2 = intersect(head_u2_pt, dvec(head_u2_pt, head_u2_mid_pt), pvec(head_u2_pt,[0.0, 0.05, 0.0]), [0.00000001, -1.0, 0.00000001]);
    fw_mid2[2] = Math.max(Math.min(fw_mid2[2], head_u2_pt[2]),fw2[2]);
    fw_mid2[0] = Math.max(Math.min(fw_mid2[0],mid_pt2[0]), mid_pt1[0]);
//    var fw_mid1 = intersect(head_u1_pt, dvec(fw1, head_u1_pt), [0.0, (box_w*0.85+head_u1_pt[1]*0.15), 0.0], [0.00000001, -1.0, 0.00000001]);
    var fw_mid1 = intersect(head_u1_pt, dvec(head_u1_pt, head_end_pt), [0.0, (box_w*0.15+head_u1_pt[1]*0.85), 0.0], [0.00000001, -1.0, 0.00000001]);

    var fw_mid3 = [front_well_pt1[0] - (fw_mid1[0]-head_u1_pt[0]), (fw1[1] - fw_mid1[1])/(fw1[1] - head_u1_pt[1])*(fw3[1]-front_well_pt1[1])+front_well_pt1[1], front_well_pt1[2] + (fw_mid1[2]-head_u1_pt[2])];
//    var k = (fw_mid1[0] - fw_mid3[0])/(head_u1_pt[0] - front_well_pt1[0]);
//    var mid_pt3 = [fw_mid1[0] + (head_v_pt[0] - head_u1_pt[0])*k, fw_mid1[1], fw_mid1[2] + (head_v_pt[2] - head_u1_pt[2])*k];
    var mid_pt3 = intersect(head_v_pt, dvec(head_v_pt, head_center), pvec(head_v_pt,[0.0, 0.05, 0.0]), crossproduct(dvec(head_u1_pt,head_v_pt), dvec(head_v_pt,head_u2_pt)));
    mid_pt3[2] = Math.min(mid_pt3[2], head_v_pt[2]);
    mid_pt3[0] = Math.min(mid_pt3[0], mid_pt1[0]);
    
//    var mid_pt4 = [fw_mid1[0] + (front_well_u1_pt[0] - head_u1_pt[0])*k, (mid_pt3[1]-head_v_pt[1])/(mid_pt1[1]-head_v_pt[1])*(mid_pt2[1]-front_well_u1_pt[1])+front_well_u1_pt[1], fw_mid1[2] + (front_well_u1_pt[2] - head_u1_pt[2])*k];
    var mid_pt4 = intersect(well_v_pt, dvec(well_v_pt, well_center), [0.0, (box_w*0.05+head_u1_pt[1]*0.95), 0.0], [0.00000001, -1.0, 0.00000001]);
    mid_pt4[0] = Math.max(Math.min(mid_pt4[0], fw3[0]), mid_pt2[0]);
    mid_pt4[2] = Math.max(Math.min(mid_pt4[2], well_v_pt[2]-0.01), mid_pt2[2]);
//    var front_well_center = [front_well_u2_pt[0]*(1-temp) + front_well_u1_pt[0]*temp, 
//                            front_well_u2_pt[1]*(1-temp) + front_well_u1_pt[1]*temp, front_well_u2_pt[2]*(1-temp) + front_well_u1_pt[2]*temp,];
//    var front_well_v_pt = [front_well_pt2[0]*(1-temp) + temp*front_well_pt1[0], front_well_pt2[1]-0.2, front_well_pt2[2]];//need a variable***
//    var front_well_center = [(front_well_u1_pt[0] - mid_pt4[0])*0.5+front_well_u1_pt[0], (front_well_u1_pt[1] - mid_pt4[1])*0.5+front_well_u1_pt[1], (front_well_u1_pt[2] - mid_pt4[2])*0.5+front_well_u1_pt[2]];
//    var front_well_v_pt = [(front_well_pt1[0] - fw_mid3[0])*0.2+front_well_pt1[0], (front_well_pt1[1] - fw_mid3[1])*0.2+front_well_pt1[1], (front_well_pt1[2] - fw_mid3[2])*0.2+front_well_pt1[2]];

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
    var temp_vec = normalize(dvec(bw_end_pt, bw_ctrl_pt));
    if (temp_vec[2]<0){
        var wheelbase = Math.min(11.0*r_wheel, ((bw_end_pt[0]*roof_end_pt[2]-bw_end_pt[2]*roof_end_pt[0])-well_scale*wheel_scale*r_wheel*1.1)/(roof_end_pt[2]-bw_end_pt[2])-fwheel_x);
    }
    else {
        var wheelbase = 11.0*r_wheel;
    }

    var rear_well_pt = [head_u1_pt[0]+r_wheel*well_scale+wheelbase, (bw_pt[1]+front_well_pt1[1])*0.5, r_wheel*well_scale*wheel_scale + fwheel_z];
//    var rear_well_pt2 = [head_u1_pt[0]+wheelbase, front_well_pt1[1], 0];
    var rear_well_pt2 = [head_u1_pt[0]+wheelbase, box_w-0.05, 0];
    var rear_pt = [rear_well_pt2[0] + r_wheel*well_scale*wheel_scale*2, head_u1_pt[1], 0];
//    var rear_well_u2_mid_pt = [rear_well_pt[0] - r_wheel*well_scale*wheel_scale*0.7, rear_well_pt[1], rear_well_pt[2]];
    var rear_well_u2_mid_pt = [rear_well_pt[0] - r_wheel*well_scale*wheel_scale*0.7, box_w-0.05, rear_well_pt[2]];
    var rear_v_mid_pt = [rear_well_pt[0] + r_wheel*well_scale*wheel_scale*0.7, rear_well_pt[1], rear_well_pt[2]];
    
    
    //higher part of the belt
//    temp_vec = normalize([hood_u_pt[0]-hood_v_pt[0], hood_u_pt[1]-hood_v_pt[1], hood_u_pt[2] - hood_end_pt[2]]);
    temp_vec = [belt_top_vec[0], belt_top_vec[1], hood_u_pt[2] - hood_end_pt[2]];
    	
    if (temp_vec[2] > -1*Math.pow(10,-6)){
        temp1 = Math.min((bw_pt[0] - hood_u_pt[0])/temp_vec[0], (fw_u_pt[2] - hood_u_pt[2])/temp_vec[2]);
        temp2 = (fw_u_pt[0] - hood_u_pt[0])/temp_vec[0];
        var belt_n = temp2* 0.5 + (temp1 - temp2)* 0.5*0.5;}
    else {
        temp2 = (fw_u_pt[0] - hood_u_pt[0])/temp_vec[0];
        temp1 = Math.min((bw_pt[0] - hood_u_pt[0])/temp_vec[0], (rear_well_pt2[2] - hood_u_pt[2])/temp_vec[2]);
        var belt_n = Math.min(temp1, temp2)* 0.5*(0.5+0.01);}
    
    var belt_line_vec = [temp_vec[0], (box_w-hood_u_pt[1])/belt_n* 0.5, temp_vec[2]];
    var belt_mid_pt = [hood_u_pt[0]+belt_line_vec[0]*belt_n, hood_u_pt[1]+belt_line_vec[1]*belt_n, hood_u_pt[2]+belt_line_vec[2]*belt_n];
    
    var win_low_pt = [0, 0, 0];
    var win_high_pt = [0, 0, 0];
    win_low_pt[0] = CC[0]*hood_u_pt[0]*Math.pow(1/3, 0)*Math.pow(2/3, order) + 
                    CC[1]*belt_mid_pt[0]*Math.pow(1/3, 1)*Math.pow(2/3, order-1) + CC[2]*bw_pt[0]*Math.pow(1/3, 2)*Math.pow(2/3, order-2);
    win_low_pt[1] = CC[0]*hood_u_pt[1]*Math.pow(1/3, 0)*Math.pow(2/3, order) + 
                    CC[1]*belt_mid_pt[1]*Math.pow(1/3, 1)*Math.pow(2/3, order-1) + CC[2]*bw_pt[1]*Math.pow(1/3, 2)*Math.pow(2/3, order-2);
    win_low_pt[2] = CC[0]*hood_u_pt[2]*Math.pow(1/3, 0)*Math.pow(2/3, order) + 
                    CC[1]*belt_mid_pt[2]*Math.pow(1/3, 1)*Math.pow(2/3, order-1) + CC[2]*bw_pt[2]*Math.pow(1/3, 2)*Math.pow(2/3, order-2);
    win_high_pt[0] = CC[0]*hood_u_pt[0]*Math.pow(2/3, 0)*Math.pow(1/3, order) + 
                    CC[1]*belt_mid_pt[0]*Math.pow(2/3, 1)*Math.pow(1/3, order-1) + CC[2]*bw_pt[0]*Math.pow(2/3, 2)*Math.pow(1/3, order-2);
    win_high_pt[1] = CC[0]*hood_u_pt[1]*Math.pow(2/3, 0)*Math.pow(1/3, order) + 
                    CC[1]*belt_mid_pt[1]*Math.pow(2/3, 1)*Math.pow(1/3, order-1) + CC[2]*bw_pt[1]*Math.pow(2/3, 2)*Math.pow(1/3, order-2);
    win_high_pt[2] = CC[0]*hood_u_pt[2]*Math.pow(2/3, 0)*Math.pow(1/3, order) + 
                    CC[1]*belt_mid_pt[2]*Math.pow(2/3, 1)*Math.pow(1/3, order-1) + CC[2]*bw_pt[2]*Math.pow(2/3, 2)*Math.pow(1/3, order-2);
    
    var temp_vec1 = [0, 0, 0];
    temp_vec1[0] = bw_pt[0]*(2.0/3.0) - hood_u_pt[0]*(4.0/3.0) + belt_mid_pt[0]*(2.0/3.0); //Tangent at center of side_temp, see notes
    temp_vec1[1] = bw_pt[1]*(2.0/3.0) - hood_u_pt[1]*(4.0/3.0) + belt_mid_pt[1]*(2.0/3.0);
    temp_vec1[2] = bw_pt[2]*(2.0/3.0) - hood_u_pt[2]*(4.0/3.0) + belt_mid_pt[2]*(2.0/3.0);
    var temp_vec2 = [0, 0, 0];
    temp_vec2[0] = bw_pt[0]*(4.0/3.0) - hood_u_pt[0]*(2.0/3.0) - belt_mid_pt[0]*(2.0/3.0);
    temp_vec2[1] = bw_pt[1]*(4.0/3.0) - hood_u_pt[1]*(2.0/3.0) - belt_mid_pt[1]*(2.0/3.0);
    temp_vec2[2] = bw_pt[2]*(4.0/3.0) - hood_u_pt[2]*(2.0/3.0) - belt_mid_pt[2]*(2.0/3.0);
    
    var side_low_v_mid_pt = intersect_line(hood_u_pt, belt_line_vec, win_low_pt, temp_vec1);
    var side_high_v_mid_pt = intersect_line(win_high_pt, temp_vec2, win_low_pt, temp_vec1);
    var rear_well_v_mid_pt = intersect_line(bw_pt, dvec(bw_pt, belt_mid_pt), win_high_pt, temp_vec2);
    
    //lower part of the belt
    temp_vec = normalize(dvec(well_pt, well_v_pt));
    
    if (temp_vec[2] >= -1*Math.pow(10,-6)){
        temp1 = Math.min((rear_well_pt2[0] - well_pt[0])/(temp_vec[0]+0.0000001), (win_low_pt[2] - well_pt[2])/(temp_vec[2]+0.0000001));
        temp2 = (win_low_pt[0] - well_pt[0])/(temp_vec[0]+0.0000001);
//        var belt_n = temp2* 0.5 + (temp1 - temp2)* 0.5*Input[30];
        var belt_n = temp2* 0.5 + (temp1 - temp2)* 0.5;
        }
    else {
        temp2 = (win_low_pt[0] - well_pt[0])/(temp_vec[0]+0.0000001);
        temp1 = Math.min((rear_well_pt2[0] - well_pt[0])/(temp_vec[0]+0.0000001), (rear_well_pt2[2] - well_pt[2])/(temp_vec[2]+0.0000001));
//        var belt_n = Math.min(temp1, temp2)* 0.5*Input[30];
        var belt_n = Math.min(temp1, temp2)* 0.5;
        }
    
//    var belt_line_vec = [temp_vec[0], (box_w-well_pt[1])/belt_n* Input[31], temp_vec[2]];
//    var belt_mid_pt = [well_pt[0]+belt_line_vec[0]*belt_n, well_pt[1]+belt_line_vec[1]*belt_n, well_pt[2]+belt_line_vec[2]*belt_n];
    var belt_mid_pt = [well_pt[0]+temp_vec[0]*belt_n, well_pt[1]+temp_vec[1]*belt_n, well_pt[2]+temp_vec[2]*belt_n];

    var side_low_pt = [0, 0, 0];
    var side_high_pt = [0, 0, 0];
    side_low_pt[0] = CC[0]*well_pt[0]*Math.pow(1/3, 0)*Math.pow(2/3, order) + 
                    CC[1]*belt_mid_pt[0]*Math.pow(1/3, 1)*Math.pow(2/3, order-1) + CC[2]*rear_well_pt[0]*Math.pow(1/3, 2)*Math.pow(2/3, order-2);
    side_low_pt[1] = CC[0]*well_pt[1]*Math.pow(1/3, 0)*Math.pow(2/3, order) + 
                    CC[1]*belt_mid_pt[1]*Math.pow(1/3, 1)*Math.pow(2/3, order-1) + CC[2]*rear_well_pt[1]*Math.pow(1/3, 2)*Math.pow(2/3, order-2);
    side_low_pt[2] = CC[0]*well_pt[2]*Math.pow(1/3, 0)*Math.pow(2/3, order) + 
                    CC[1]*belt_mid_pt[2]*Math.pow(1/3, 1)*Math.pow(2/3, order-1) + CC[2]*rear_well_pt[2]*Math.pow(1/3, 2)*Math.pow(2/3, order-2);
    side_high_pt[0] = CC[0]*well_pt[0]*Math.pow(2/3, 0)*Math.pow(1/3, order) + 
                    CC[1]*belt_mid_pt[0]*Math.pow(2/3, 1)*Math.pow(1/3, order-1) + CC[2]*rear_well_pt[0]*Math.pow(2/3, 2)*Math.pow(1/3, order-2);
    side_high_pt[1] = CC[0]*well_pt[1]*Math.pow(2/3, 0)*Math.pow(1/3, order) + 
                    CC[1]*belt_mid_pt[1]*Math.pow(2/3, 1)*Math.pow(1/3, order-1) + CC[2]*rear_well_pt[1]*Math.pow(2/3, 2)*Math.pow(1/3, order-2);
    side_high_pt[2] = CC[0]*well_pt[2]*Math.pow(2/3, 0)*Math.pow(1/3, order) + 
                    CC[1]*belt_mid_pt[2]*Math.pow(2/3, 1)*Math.pow(1/3, order-1) + CC[2]*rear_well_pt[2]*Math.pow(2/3, 2)*Math.pow(1/3, order-2);
    
    var temp_vec1 = [0, 0, 0];
    temp_vec1[0] = rear_well_pt[0]*(2.0/3.0) - well_pt[0]*(4.0/3.0) + belt_mid_pt[0]*(2.0/3.0); //Tangent at center of side_temp, see notes
    temp_vec1[1] = rear_well_pt[1]*(2.0/3.0) - well_pt[1]*(4.0/3.0) + belt_mid_pt[1]*(2.0/3.0);
    temp_vec1[2] = rear_well_pt[2]*(2.0/3.0) - well_pt[2]*(4.0/3.0) + belt_mid_pt[2]*(2.0/3.0);
    var temp_vec2 = [0, 0, 0];
    temp_vec2[0] = rear_well_pt[0]*(4.0/3.0) - well_pt[0]*(2.0/3.0) - belt_mid_pt[0]*(2.0/3.0);
    temp_vec2[1] = rear_well_pt[1]*(4.0/3.0) - well_pt[1]*(2.0/3.0) - belt_mid_pt[1]*(2.0/3.0);
    temp_vec2[2] = rear_well_pt[2]*(4.0/3.0) - well_pt[2]*(2.0/3.0) - belt_mid_pt[2]*(2.0/3.0);
    
    var belt_low_v_mid_pt = intersect_line(well_pt, belt_line_vec, side_low_pt, temp_vec1);
    var belt_high_v_mid_pt = intersect_line(side_high_pt, temp_vec2, side_low_pt, temp_vec1);
    var belt_well_v_mid_pt = intersect_line(rear_well_pt, dvec(rear_well_pt, belt_mid_pt), side_high_pt, temp_vec2);

    //side window
    //lower limit for well center plane
//    var side_low_center = [(fw_v_hash_pt[0]-fw_center[0])*0.05 + fw_v_hash_pt[0], (fw_v_hash_pt[1]-fw_center[1])*0.05 + fw_v_hash_pt[1], (fw_v_hash_pt[2]-fw_center[2])*0.05 + fw_v_hash_pt[2]];
//    var side_low_u_mid_pt = [(fw_u_pt[0]-fw_u_mid_pt[0])*0.05 + fw_u_pt[0], (fw_u_pt[1]-fw_u_mid_pt[1])*0.05 + fw_u_pt[1], (fw_u_pt[2]-fw_u_mid_pt[2])*0.05 + fw_u_pt[2]];
//    var side_high_center = [(roof_v_hash_pt[0]-rf_center[0])*0.05 + roof_v_hash_pt[0], (roof_v_hash_pt[1]-rf_center[1])*0.05 + roof_v_hash_pt[1], (roof_v_hash_pt[2]-rf_center[2])*0.05 + roof_v_hash_pt[2]];
//    var side_high_u_mid_pt = [(roof_pt[0]-rf_u_mid_pt[0])*0.05 + roof_pt[0], (roof_pt[1]-rf_u_mid_pt[1])*0.05 + roof_pt[1], (roof_pt[2]-rf_u_mid_pt[2])*0.05 + roof_pt[2]];
//    var rear_well_center = [(bw_v_mid_pt[0]-bw_center[0])*0.05 + bw_v_mid_pt[0], (bw_v_mid_pt[1]-bw_center[1])*0.05 + bw_v_mid_pt[1], (bw_v_mid_pt[2]-bw_center[2])*0.05 + bw_v_mid_pt[2]];
    temp = 0.2;
    var side_low_center = [(fw_v_hash_pt[0]-fw_center[0])*temp + fw_v_hash_pt[0], (fw_v_hash_pt[1]-fw_center[1])*temp + fw_v_hash_pt[1], (fw_v_hash_pt[2]-fw_center[2])*temp + fw_v_hash_pt[2]];
    var side_low_u_mid_pt = [(fw_u_pt[0]-fw_u_mid_pt[0])*temp + fw_u_pt[0], (fw_u_pt[1]-fw_u_mid_pt[1])*temp + fw_u_pt[1], (fw_u_pt[2]-fw_u_mid_pt[2])*temp + fw_u_pt[2]];
    var side_high_center = [(roof_v_hash_pt[0]-rf_center[0])*temp + roof_v_hash_pt[0], (roof_v_hash_pt[1]-rf_center[1])*temp + roof_v_hash_pt[1], (roof_v_hash_pt[2]-rf_center[2])*temp + roof_v_hash_pt[2]];
    var side_high_u_mid_pt = [(roof_pt[0]-rf_u_mid_pt[0])*temp + roof_pt[0], (roof_pt[1]-rf_u_mid_pt[1])*temp + roof_pt[1], (roof_pt[2]-rf_u_mid_pt[2])*temp + roof_pt[2]];
    var rear_well_center = [(bw_v_mid_pt[0]-bw_center[0])*temp + bw_v_mid_pt[0], (bw_v_mid_pt[1]-bw_center[1])*temp + bw_v_mid_pt[1], (bw_v_mid_pt[2]-bw_center[2])*temp + bw_v_mid_pt[2]];

    //belt line
    //lower limit for well center plane 
//    temp1 = (win_low_pt[1] - well_u_mid_pt[1])/
//            Math.sqrt((win_low_pt[1] - well_u_mid_pt[1])*(win_low_pt[1] - well_u_mid_pt[1])+(win_low_pt[0] - well_u_mid_pt[0])*(win_low_pt[0] - well_u_mid_pt[0]));
//    temp2 = (win_high_pt[1] - well_u_mid_pt[1])/
//            Math.sqrt((win_high_pt[1] - well_u_mid_pt[1])*(win_high_pt[1] - well_u_mid_pt[1])+(win_high_pt[0] - well_u_mid_pt[0])*(win_high_pt[0] - well_u_mid_pt[0]));
//    temp3 = (bw_pt[1] - well_u_mid_pt[1])/
//            Math.sqrt((bw_pt[1] - well_u_mid_pt[1])*(bw_pt[1] - well_u_mid_pt[1])+(bw_pt[0] - well_u_mid_pt[0])*(bw_pt[0] - well_u_mid_pt[0]));
            
    //upper limit for well center plane
//    var temp4 = (rear_well_pt[1] - well_u_mid_pt[1])/Math.sqrt(Math.pow((rear_well_pt[1] - well_u_mid_pt[1]),2)+Math.pow((rear_well_pt[0] - well_u_mid_pt[0]),2));
//    var temp5 = (side_high_pt[1] - well_u_mid_pt[1])/Math.sqrt(Math.pow((side_high_pt[1] - well_u_mid_pt[1]),2)+Math.pow((side_high_pt[0] - well_u_mid_pt[0]),2));
//    var temp6 = (side_low_pt[1] - well_u_mid_pt[1])/Math.sqrt(Math.pow((side_low_pt[1] - well_u_mid_pt[1]),2)+Math.pow((side_low_pt[0] - well_u_mid_pt[0]),2));
//    temp = (Math.min(Math.max(temp1, temp2, temp3), Math.min(temp4, temp5, temp6)) + Math.min(temp4, temp5, temp6))*0.5;
//    
//    var belt_v_vec = [temp, -Math.sqrt(1-temp*temp), 0.000001];
//    
//    temp = 1.0;
//    var temp_vec = intersect(belt_low_v_mid_pt, [-(side_low_v_mid_pt[0]-belt_low_v_mid_pt[0])/(side_low_v_mid_pt[1]-belt_low_v_mid_pt[1]), -1,
//                                     -(side_low_v_mid_pt[2]-belt_low_v_mid_pt[2])/temp/(side_low_v_mid_pt[1]-belt_low_v_mid_pt[1])], 
//                                    well_u_mid_pt, belt_v_vec);
//    temp1 = Math.min(Math.max((temp_vec[1]-well_u_mid_pt[1])/(well_u_mid_pt[1]-well_center[1]),0.05), 
//    		Math.max((well_u_mid_pt[2]-belt_low_v_mid_pt[2])/(-well_u_mid_pt[2]+well_center[2]), 0.05), 
//    		Math.max((side_low_v_mid_pt[2]-well_u_mid_pt[2])/(well_u_mid_pt[2]-well_center[2]), 0.05));
//    var belt_low_center = pvec(well_u_mid_pt, [(well_u_mid_pt[0]-well_center[0])*temp1, (well_u_mid_pt[1]-well_center[1])*temp1, (well_u_mid_pt[2]-well_center[2])*temp1]);
//    var belt_low_u_mid_pt = intersect(side_low_pt, [-(win_low_pt[0]-side_low_pt[0])/(win_low_pt[1]-side_low_pt[1]), -1,
//                                     -(win_low_pt[2]-side_low_pt[2])/temp/(win_low_pt[1]-side_low_pt[1])], well_u_mid_pt, belt_v_vec);
//    var belt_high_center = intersect(belt_high_v_mid_pt, [-(side_high_v_mid_pt[0]-belt_high_v_mid_pt[0])/(side_high_v_mid_pt[1]-belt_high_v_mid_pt[1]), -1,
//                                     -(side_high_v_mid_pt[2]-belt_high_v_mid_pt[2])/temp/(side_high_v_mid_pt[1]-belt_high_v_mid_pt[1])],
//                                     well_u_mid_pt, belt_v_vec);
//    var belt_high_u_mid_pt = intersect(side_high_pt, [-(win_high_pt[0]-side_high_pt[0])/(win_high_pt[1]-side_high_pt[1]), -1,
//                                     -(win_high_pt[2]-side_high_pt[2])/temp/(win_high_pt[1]-side_high_pt[1])], well_u_mid_pt, belt_v_vec);
//    var rear_belt_center = intersect(belt_well_v_mid_pt, [-(rear_well_v_mid_pt[0]-belt_well_v_mid_pt[0])/(rear_well_v_mid_pt[1]-belt_well_v_mid_pt[1]), -1, 
//                                    -(rear_well_v_mid_pt[2]-belt_well_v_mid_pt[2])/temp/(rear_well_v_mid_pt[1]-belt_well_v_mid_pt[1])], 
//                                    well_u_mid_pt, belt_v_vec);
//    var rear_well_u_mid_pt = intersect(rear_well_pt, normalize([(bw_pt[0]-rear_well_pt[0]), (bw_pt[1]-rear_well_pt[1])*0.8, 
//                                                      (bw_pt[2]-rear_well_pt[2])]), well_u_mid_pt, belt_v_vec);

      var belt_low_center = [(side_low_v_mid_pt[0]+belt_low_v_mid_pt[0])*0.5, (side_low_v_mid_pt[1]+belt_low_v_mid_pt[1])*0.5, (side_low_v_mid_pt[2]+belt_low_v_mid_pt[2])*0.5];
      var belt_low_u_mid_pt = [(win_low_pt[0]+side_low_pt[0])*0.5, (win_low_pt[1]+side_low_pt[1])*0.5, (win_low_pt[2]+side_low_pt[2])*0.5];
      var belt_high_center = [(side_high_v_mid_pt[0]+belt_high_v_mid_pt[0])*0.5, (side_high_v_mid_pt[1]+belt_high_v_mid_pt[1])*0.5, (side_high_v_mid_pt[2]+belt_high_v_mid_pt[2])*0.5];
      var belt_high_u_mid_pt = [(win_high_pt[0]+side_high_pt[0])*0.5, (win_high_pt[1]+side_high_pt[1])*0.5, (win_high_pt[2]+side_high_pt[2])*0.5];
      var rear_belt_center = [(rear_well_v_mid_pt[0]+belt_well_v_mid_pt[0])*0.5, (rear_well_v_mid_pt[1]+belt_well_v_mid_pt[1])*0.5, (rear_well_v_mid_pt[2]+belt_well_v_mid_pt[2])*0.5];
      var rear_well_u_mid_pt = [(bw_pt[0]+rear_well_pt[0])*0.5, (bw_pt[1]+rear_well_pt[1])*0.5, (bw_pt[2]+rear_well_pt[2])*0.5];
      
//    var belt_u_vec2 = [dvec(front_well_u2_pt, rear_well_u2_mid_pt)[2], 0.000001, -1*dvec(front_well_u2_pt, rear_well_u2_mid_pt)[0]];
//    temp = ((front_well_u2_pt[0] - well_pt[0]) - (rear_well_u2_mid_pt[0] - rear_well_pt[0]))/6;
//    var rocker_center = intersect(belt_low_v_mid_pt, [(front_well_u2_pt[0] - well_pt[0]) -temp, -0.2, 1.0], rear_well_u2_mid_pt, belt_u_vec2);
//    var rocker_u_mid_pt = intersect(side_low_pt, [(front_well_u2_pt[0] - well_pt[0]) -temp*2, -0.2, 1.0], rear_well_u2_mid_pt, belt_u_vec2);
//    rocker_center[1] = (rocker_u_mid_pt[1] - front_well_u2_pt[1])/(rocker_u_mid_pt[0] - front_well_u2_pt[0])*(rocker_center[0]-front_well_u2_pt[0])+front_well_u2_pt[1];
//    rocker_center[2] = (rocker_u_mid_pt[2] - front_well_u2_pt[2])/(rocker_u_mid_pt[0] - front_well_u2_pt[0])*(rocker_center[0]-front_well_u2_pt[0])+front_well_u2_pt[2];
//    var rocker_end_center = intersect(belt_high_v_mid_pt, [(front_well_u2_pt[0] - well_pt[0]) -temp*3, -0.2, 1.0], rear_well_u2_mid_pt, belt_u_vec2);
//    var rocker_end_u_mid_pt = intersect(side_high_pt, [(front_well_u2_pt[0] - well_pt[0]) -temp*4, -0.2, 1.0], rear_well_u2_mid_pt, belt_u_vec2);
//    var rear_well_center2 = intersect(rear_well_v_mid_pt, [(front_well_u2_pt[0] - well_pt[0]) -temp*5, -0.2, 1.0], rear_well_u2_mid_pt, belt_u_vec2);
    
    temp_vec = dvec(rear_well_pt2, front_well_pt2);
    var rocker_v_mid_pt = [front_well_pt2[0] + temp_vec[0]/6, front_well_pt2[1] + temp_vec[1]/6, front_well_pt2[2] + temp_vec[2]/6];
    var rocker_center_pt = [front_well_pt2[0] + temp_vec[0]/3, front_well_pt2[1] + temp_vec[1]/3, front_well_pt2[2] + temp_vec[2]/3];
    var rocker_end_v_mid_pt = [front_well_pt2[0] + temp_vec[0]/2, front_well_pt2[1] + temp_vec[1]/2, front_well_pt2[2] + temp_vec[2]/2];
    var rocker_end_pt = [front_well_pt2[0] + temp_vec[0]/3*2, front_well_pt2[1] + temp_vec[1]/3*2, front_well_pt2[2] + temp_vec[2]/3*2];
    var rear_well_v2_mid_pt = [front_well_pt2[0] + temp_vec[0]/6*5, front_well_pt2[1] + temp_vec[1]/6*5, front_well_pt2[2] + temp_vec[2]/6*5];
    
    temp1 = (belt_low_v_mid_pt[2]-rocker_v_mid_pt[2])/(-belt_low_v_mid_pt[2]+belt_low_center[2]);
    temp2 = (side_low_pt[2]-rocker_center_pt[2])/(-side_low_pt[2]+belt_low_u_mid_pt[2]);
    temp3 = (belt_high_v_mid_pt[2]-rocker_end_v_mid_pt[2])/(-belt_high_v_mid_pt[2]+belt_high_center[2]);
    temp4 = (side_high_pt[2]-rocker_end_pt[2])/(-side_high_pt[2]+belt_high_u_mid_pt[2]);
    temp5 = (belt_well_v_mid_pt[2]-rear_well_v2_mid_pt[2])/(-belt_well_v_mid_pt[2]+rear_belt_center[2]);
    
    temp = Math.max(Math.min(temp1, temp2, temp3, temp4, temp5)*0.01, 0.01);
    var rocker_center = [(belt_low_v_mid_pt[0] - belt_low_center[0])*temp + belt_low_v_mid_pt[0], (belt_low_v_mid_pt[1] - belt_low_center[1])*temp + belt_low_v_mid_pt[1], (belt_low_v_mid_pt[2] - belt_low_center[2])*temp + belt_low_v_mid_pt[2]];
    var rocker_u_mid_pt = [(side_low_pt[0] - belt_low_u_mid_pt[0])*temp + side_low_pt[0], (side_low_pt[1] - belt_low_u_mid_pt[1])*temp + side_low_pt[1], (side_low_pt[2] - belt_low_u_mid_pt[2])*temp + side_low_pt[2]];
    var rocker_end_center = [(belt_high_v_mid_pt[0] - belt_high_center[0])*temp + belt_high_v_mid_pt[0], (belt_high_v_mid_pt[1] - belt_high_center[1])*temp + belt_high_v_mid_pt[1], (belt_high_v_mid_pt[2] - belt_high_center[2])*temp + belt_high_v_mid_pt[2]];
    var rocker_end_u_mid_pt = [(side_high_pt[0] - belt_high_u_mid_pt[0])*temp + side_high_pt[0], (side_high_pt[1] - belt_high_u_mid_pt[1])*temp + side_high_pt[1], (side_high_pt[2] - belt_high_u_mid_pt[2])*temp + side_high_pt[2]];
    var rear_well_center2 = [(belt_well_v_mid_pt[0] - rear_belt_center[0])*temp + belt_well_v_mid_pt[0], (belt_well_v_mid_pt[1] - rear_belt_center[1])*temp + belt_well_v_mid_pt[1], (belt_well_v_mid_pt[2] - rear_belt_center[2])*temp + belt_well_v_mid_pt[2]];
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    var hip_mid_pt = [wheelbase+wheel_scale*r_wheel*well_scale+fwheel_x + 1.0, 0, 0];
    var hip_vec = normalize(pvec(dvec(bw_end_pt, bw_ctrl_pt),[0, 0, 0.5+1*0.5]));
//    if (hip_vec[2] < 0){
//        var hip_n = Math.min((hip_mid_pt[0]-bw_end_pt[0])/hip_vec[0], (rear_well_pt[2]-bw_end_pt[2])/hip_vec[2])*0.5;
//    }
//    else{
//        var hip_n = (hip_mid_pt[0]-bw_end_pt[0])/hip_vec[0]*0.5;
//    }
    hip_n = (hip_mid_pt[0]-bw_end_pt[0])/hip_vec[0]*0.6;
    var hip_ctrl_pt = [bw_end_pt[0]+hip_vec[0]*hip_n, bw_end_pt[1]+hip_vec[1]*hip_n, bw_end_pt[2]+hip_vec[2]*hip_n];
    
    var hip_center = intersect(hip_ctrl_pt, ey, bw_center, [0.000001, 1, 0.000001]);
    hip_center[1]+= 0.3;
    
    var rear_n = (rear_pt[1] - hip_mid_pt[1])*0.9;
    var rear_start_pt = [0.0, 0.0, 0.0];
    rear_start_pt[0] = CC[0]*hip_mid_pt[0]*Math.pow(1/2, 0)*Math.pow(1/2, order) + 
                    CC[1]*hip_mid_pt[0]*Math.pow(1/2, 1)*Math.pow(1/2, order-1) + CC[2]*rear_pt[0]*Math.pow(1/2, 2)*Math.pow(1/2, order-2);
    rear_start_pt[1] = CC[0]*hip_mid_pt[1]*Math.pow(1/2, 0)*Math.pow(1/2, order) + 
                    CC[1]*(hip_mid_pt[1]+rear_n)*Math.pow(1/2, 1)*Math.pow(1/2, order-1) + CC[2]*rear_pt[1]*Math.pow(1/2, 2)*Math.pow(1/2, order-2);
    rear_start_pt[2] = CC[0]*hip_mid_pt[2]*Math.pow(1/2, 0)*Math.pow(1/2, order) + 
                    CC[1]*hip_mid_pt[2]*Math.pow(1/2, 1)*Math.pow(1/2, order-1) + CC[2]*rear_pt[2]*Math.pow(1/2, 2)*Math.pow(1/2, order-2);
    
    temp_vec = dvec(rear_pt, hip_mid_pt);
    var rear_u1_mid_pt = intersect_line(hip_mid_pt, ey, rear_start_pt, temp_vec);
    rear_u1_mid_pt[1]+=0.3;
    var rear_u2_mid_pt = intersect_line(rear_pt, dvec(rear_pt, [hip_mid_pt[0],hip_mid_pt[1]+rear_n,hip_mid_pt[2]]), rear_start_pt, temp_vec);
    
    var hip_u_vec = normalize(dvec(bw_pt, bw_v_mid_pt));
    temp_vec = dvec(bw_pt, bw_v_mid_pt);temp_vec[1]-=0.5;
    var hip_v_mid_pt = intersect(bw_pt, temp_vec, hip_center, [hip_u_vec[0], hip_u_vec[1]+0.000001, hip_u_vec[2]]);
    //var rear_center = intersect(rear_well_u_mid_pt, dvec(rear_well_u_mid_pt, rear_belt_center), hip_v_mid_pt, [hip_v_mid_pt[1] - rear_v_mid_pt[1], -hip_v_mid_pt[0] + rear_v_mid_pt[0], 0.0000001]);
    temp = (rear_u2_mid_pt[0] - rear_well_u_mid_pt[0])/(rear_well_u_mid_pt[0] - rear_belt_center[0])*0.5;
    var rear_center = [rear_well_u_mid_pt[0]+temp*(rear_well_u_mid_pt[0] - rear_belt_center[0]), rear_well_u_mid_pt[1]+temp*(rear_well_u_mid_pt[1] - rear_belt_center[1]), rear_well_u_mid_pt[2]+temp*(rear_well_u_mid_pt[2] - rear_belt_center[2])];
    
    var rwheel_x = (rear_pt[0] + rear_well_pt2[0])*0.5;
    var rwheel_z = (rear_pt[2] + rear_well_pt2[2])*0.5;
    var rw3 = [rwheel_x - r_wheel*well_scale*wheel_scale*0.8, box_w, 0.0];
    var rw1 = [rwheel_x + r_wheel*well_scale*wheel_scale*0.8, box_w, 0.0];
    k = (rw3[0] - rw1[0])/(rear_well_pt2[0] - rear_pt[0]);
    var rw2 = [rw3[0] + (rear_well_pt[0] - rear_well_pt2[0])*k, rw3[1], rw3[2] + (rear_well_pt[2] - rear_well_pt2[2])*k];
    var rmid_pt2 = [rw3[0] + (rear_well_u2_mid_pt[0] - rear_well_pt2[0])*k, rw3[1], rw3[2] + (rear_well_u2_mid_pt[2] - rear_well_pt2[2])*k];
    var rmid_pt1 = [rw3[0] + (rear_v_mid_pt[0] - rear_well_pt2[0])*k, rw3[1], rw3[2] + (rear_v_mid_pt[2] - rear_well_pt2[2])*k];
    var rw_mid2 = intersect(rear_well_pt, dvec(rear_well_pt,rw2), [0.0000001, box_w*0.1+Math.max(rear_well_pt[1], rear_pt[1])*0.9, 0.0000001], [0.000001, -1.0, 0.000001]);
    var rw_mid1 = intersect(rear_pt, dvec(rear_pt, rear_u2_mid_pt), [0.0000001, box_w*0.1+Math.max(rear_well_pt[1], rear_pt[1])*0.9, 0.0000001], [0.000001, -1.0, 0.000001]);
//    var rw_mid3 = [rear_well_pt2[0] - dvec(rw_mid1, rear_pt)[0], rear_well_pt2[1] + dvec(rw_mid1, rear_pt)[1], rear_well_pt2[2] + dvec(rw_mid1, rear_pt)[2]];
    
    var rw_mid3 = rear_well_pt2;
    	
//    var k = (rw_mid3[0] - rw_mid1[0])/(rear_well_pt2[0] - rear_pt[0]);
//    var rmid_pt4 = [rw_mid3[0] + (rear_well_u2_mid_pt[0] - rear_well_pt2[0])*k, rw_mid3[1], rw_mid3[2] + (rear_well_u2_mid_pt[2] - rear_well_pt2[2])*k];
    var rmid_pt4 = rear_well_u2_mid_pt;
//    var rmid_pt3 = [rw_mid3[0] + (rear_v_mid_pt[0] - rear_well_pt2[0])*k, rw_mid3[1], rw_mid3[2] + (rear_v_mid_pt[2] - rear_well_pt2[2])*k];
//    var rmid_pt3 = intersect(rear_v_mid_pt, dvec(rear_v_mid_pt, rear_center), [0.0000001, box_w*0.1+Math.max(rear_well_pt[1], rear_pt[1])*0.9, 0.0000001], [0.000001, -1.0, 0.000001]);
//    var rmid_pt3 = intersect(rear_v_mid_pt, dvec(rmid_pt1, rear_v_mid_pt), [0.0000001, box_w*0.1+Math.max(rear_well_pt[1], rear_pt[1])*0.9, 0.0000001], [0.000001, -1.0, 0.000001]);
    var rmid_pt3 = rear_v_mid_pt;
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Add bumper
//    temp_vec = normalize(dvec(nose_mid_pt, nose_ctrl_pt));
//    var bump_pt1 = [nose_mid_pt[0] + temp_vec0.1, nose_mid_pt[1], nose_mid_pt[2] - 0.1];
//    var bump_pt2 = [head_u_hash_pt[0] + 0.1, head_u_hash_pt[1], head_u_hash_pt[2] - 0.1];
//    var bump_pt3 = [head_end_pt[0] + 0.1, head_end_pt[1], head_end_pt[2] - 0.2];
//    var bump_pt4 = [head_u1_mid_pt[0] + 0.1, head_u1_mid_pt[1], head_u1_mid_pt[2] - 0.1];
//    var bump_pt5 = [head_u1_pt[0] + 0.1, head_u1_pt[1], head_u1_pt[2] - 0.1];    
//    var bump_pt6 = [fw_mid1[0], fw_mid1[1], fw_mid1[2] - 0.1];   
//    var bump_pt7 = [fw1[0], fw1[1], fw1[2] - 0.1];
    temp_vec = [nose_mid_pt[0], nose_mid_pt[1], nose_mid_pt[2] - 0.01];
    var bump_pt1 = intersect(nose_mid_pt, dvec(nose_mid_pt, nose_ctrl_pt), temp_vec, [0.00000001, 0.00000001, 1]);
    var bump_pt2 = intersect(head_u_hash_pt, dvec(head_u_hash_pt, nose_center), temp_vec, [0.00000001, 0.00000001, 1]);
    var bump_pt3 = intersect(head_end_pt, dvec(head_end_pt, nose_v_hash_pt), temp_vec, [0.00000001, 0.00000001, 1]);
    var bump_pt4 = intersect(head_u1_mid_pt, dvec(head_u1_mid_pt, head_center), temp_vec, [0.00000001, 0.00000001, 1]);
    var bump_pt5 = intersect(head_u1_pt, dvec(head_u1_pt, head_v_pt), temp_vec, [0.00000001, 0.00000001, 1]);
    var bump_pt6 = intersect(fw_mid1, dvec(fw_mid1, mid_pt3), temp_vec, [0.00000001, 0.00000001, 1]);
    var bump_pt7 = intersect(fw1, dvec(fw1, mid_pt1), temp_vec, [0.00000001, 0.00000001, 1]);
    
    var bump_pt8 = [nose_mid_pt[0], nose_mid_pt[1], nose_mid_pt[2] - 0.2];
    var bump_pt9 = [head_u_hash_pt[0], head_u_hash_pt[1], head_u_hash_pt[2] - 0.2];
    var bump_pt10 = [head_end_pt[0], head_end_pt[1], head_end_pt[2] - 0.35];
    var bump_pt11 = [head_u1_mid_pt[0], head_u1_mid_pt[1], head_u1_mid_pt[2] - 0.4];
    var bump_pt12 = [head_u1_pt[0], head_u1_pt[1], head_u1_pt[2] - 0.4];    
    var bump_pt13 = [fw_mid1[0], fw_mid1[1], fw_mid1[2] - 0.4];   
    var bump_pt14 = [fw1[0], fw1[1], fw1[2] - 0.4];     
    
    //side
    k = 0.1/(rw3[0]-fw3[0]);
    
    var side_pt1 = [fw3[0], fw3[1], fw3[2]-0.15];	
    var side_pt2 = [rocker_v_mid_pt[0], fw3[1], fw3[2]-0.15+k*(rocker_v_mid_pt[0]-fw3[0])];
    var side_pt3 = [rocker_center_pt[0], fw3[1], fw3[2]-0.15+k*(rocker_center_pt[0]-fw3[0])];
    var side_pt4 = [rocker_end_v_mid_pt[0], fw3[1], fw3[2]-0.15+k*(rocker_end_v_mid_pt[0]-fw3[0])];
    var side_pt5 = [rocker_end_pt[0], fw3[1], fw3[2]-0.15+k*(rocker_end_pt[0]-fw3[0])];
    var side_pt6 = [rear_well_v2_mid_pt[0], fw3[1], fw3[2]-0.15+k*(rear_well_v2_mid_pt[0]-fw3[0])];
    var side_pt7 = [rear_well_pt2[0], fw3[1], fw3[2]-0.15+k*(rear_well_pt2[0]-fw3[0])];
    var side_pt8 = [rw_mid3[0], fw3[1], fw3[2]-0.15+k*(rw_mid3[0]-fw3[0])];   
    var side_pt9 = [rw3[0], fw3[1], fw3[2]-0.15+k*(rw3[0]-fw3[0])];
    	
    temp = 0.4;
    var side_pt10 = [fw3[0], fw3[1]-0.2, fw3[2]-temp];	
    var side_pt11 = [rocker_v_mid_pt[0], fw3[1]-0.2, fw3[2]-temp+k*(rocker_v_mid_pt[0]-fw3[0])];
    var side_pt12 = [rocker_center_pt[0], fw3[1]-0.2, fw3[2]-temp+k*(rocker_center_pt[0]-fw3[0])];
    var side_pt13 = [rocker_end_v_mid_pt[0], fw3[1]-0.2, fw3[2]-temp+k*(rocker_end_v_mid_pt[0]-fw3[0])];
    var side_pt14 = [rocker_end_pt[0], fw3[1]-0.2, fw3[2]-temp+k*(rocker_end_pt[0]-fw3[0])];
    var side_pt15 = [rear_well_v2_mid_pt[0], fw3[1]-0.2, fw3[2]-temp+k*(rear_well_v2_mid_pt[0]-fw3[0])];
    var side_pt16 = [rear_well_pt2[0], fw3[1]-0.2, fw3[2]-temp+k*(rear_well_pt2[0]-fw3[0])];
    var side_pt17 = [rw_mid3[0], fw3[1]-0.2, fw3[2]-temp+k*(rw_mid3[0]-fw3[0])];   
    var side_pt18 = [rw3[0], fw3[1]-0.2, fw3[2]-temp+k*(rw3[0]-fw3[0])];
    
    // rear
    temp_vec = [hip_mid_pt[0], hip_mid_pt[1], hip_mid_pt[2] - 0.05];
    var back_pt1 = temp_vec;
    var back_pt2 = intersect(rear_u1_mid_pt, dvec(rear_u1_mid_pt, hip_center), temp_vec, [0.00000001, 0.00000001, 1]);
    var back_pt3 = intersect(rear_start_pt, dvec(rear_start_pt, hip_v_mid_pt), temp_vec, [0.00000001, 0.00000001, 1]);
    var back_pt4 = intersect(rear_u2_mid_pt, dvec(rear_u2_mid_pt, rear_center), temp_vec, [0.00000001, 0.00000001, 1]);
    var back_pt5 = intersect(rear_pt, dvec(rear_pt, rear_v_mid_pt), temp_vec, [0.00000001, 0.00000001, 1]);
    var back_pt6 = intersect(rw_mid1, dvec(rw_mid1, rmid_pt3), temp_vec, [0.00000001, 0.00000001, 1]);
    var back_pt7 = intersect(rw1, dvec(rw1, rmid_pt1), temp_vec, [0.00000001, 0.00000001, 1]);
    
    var back_pt8 = [hip_mid_pt[0], hip_mid_pt[1], hip_mid_pt[2] - 0.3];
    var back_pt9 = [rear_u1_mid_pt[0], rear_u1_mid_pt[1], rear_u1_mid_pt[2] - 0.3];
    var back_pt10 = [rear_start_pt[0], rear_start_pt[1], rear_start_pt[2] - 0.3];
    var back_pt11 = [rear_u2_mid_pt[0], rear_u2_mid_pt[1], rear_u2_mid_pt[2] - 0.3];
    var back_pt12 = [rear_pt[0], rear_pt[1], rear_pt[2] - 0.3];    
    var back_pt13 = [rear_pt[0], rear_pt[1], rear_pt[2] - 0.3];   
    var back_pt14 = [rw1[0], rw1[1], rw1[2] - 0.3];     
    

	
    //Draw bezier surface
    var ctrlpt = [];
    
    // 1
    ctrlpt.push(hood_end_pt); ctrlpt.push(hood_u_mid_pt); ctrlpt.push(hood_u_pt);
    ctrlpt.push(fw_ctrl_pt); ctrlpt.push(fw_center); ctrlpt.push(fw_v_hash_pt);
    ctrlpt.push(roof_start_pt); ctrlpt.push(fw_u_mid_pt); ctrlpt.push(fw_u_pt);
    
    // 2
    ctrlpt.push(roof_start_pt); ctrlpt.push(fw_u_mid_pt); ctrlpt.push(fw_u_pt);  
    ctrlpt.push(roof_ctrl_pt); ctrlpt.push(rf_center); ctrlpt.push(roof_v_hash_pt);
    ctrlpt.push(roof_end_pt); ctrlpt.push(rf_u_mid_pt); ctrlpt.push(roof_pt);
    
    // 3
    ctrlpt.push(roof_end_pt); ctrlpt.push(rf_u_mid_pt); ctrlpt.push(roof_pt);
    ctrlpt.push(bw_ctrl_pt); ctrlpt.push(bw_center); ctrlpt.push(bw_v_mid_pt);  
    ctrlpt.push(bw_end_pt); ctrlpt.push(bw_u_mid_pt); ctrlpt.push(bw_pt);
    
    // 4
    ctrlpt.push(bw_end_pt, bw_u_mid_pt, bw_pt, hip_ctrl_pt, hip_center, hip_v_mid_pt, hip_mid_pt, rear_u1_mid_pt, rear_start_pt);
    
    // 5
    ctrlpt.push(nose_mid_pt); ctrlpt.push(head_u_hash_pt); ctrlpt.push(head_end_pt);
    ctrlpt.push(nose_ctrl_pt); ctrlpt.push(nose_center); ctrlpt.push(nose_v_hash_pt);
    ctrlpt.push(hood_start_pt); ctrlpt.push(nose_u_hash_pt); ctrlpt.push(nose_u_pt);
    
    // 6
    ctrlpt.push(hood_start_pt); ctrlpt.push(nose_u_hash_pt); ctrlpt.push(nose_u_pt);
    ctrlpt.push(hood_ctrl_pt); ctrlpt.push(hood_center); ctrlpt.push(hood_v_pt);
    ctrlpt.push(hood_end_pt); ctrlpt.push(hood_u_mid_pt); ctrlpt.push(hood_u_pt);
    
    // 7
    ctrlpt.push(head_end_pt); ctrlpt.push(head_u1_mid_pt); ctrlpt.push(head_u1_pt);
    ctrlpt.push(nose_v_hash_pt); ctrlpt.push(head_center); ctrlpt.push(head_v_pt);
    ctrlpt.push(nose_u_pt); ctrlpt.push(head_u2_mid_pt); ctrlpt.push(head_u2_pt);
    
    // 8
    ctrlpt.push(nose_u_pt); ctrlpt.push(head_u2_mid_pt); ctrlpt.push(head_u2_pt);
    ctrlpt.push(hood_v_pt); ctrlpt.push(well_center); ctrlpt.push(well_v_pt);
    ctrlpt.push(hood_u_pt); ctrlpt.push(well_u_mid_pt); ctrlpt.push(well_pt);
    
    // 9
    ctrlpt.push(hood_u_pt, well_u_mid_pt, well_pt, side_low_v_mid_pt, belt_low_center, belt_low_v_mid_pt, win_low_pt, belt_low_u_mid_pt, side_low_pt);
    
    // 10
    ctrlpt.push(win_low_pt, belt_low_u_mid_pt, side_low_pt, side_high_v_mid_pt, belt_high_center, belt_high_v_mid_pt, win_high_pt, belt_high_u_mid_pt, side_high_pt);
    
    // 11
    ctrlpt.push(win_high_pt, belt_high_u_mid_pt, side_high_pt, rear_well_v_mid_pt, rear_belt_center, belt_well_v_mid_pt, bw_pt, rear_well_u_mid_pt, rear_well_pt);

    // 12
    ctrlpt.push(bw_pt, rear_well_u_mid_pt, rear_well_pt, hip_v_mid_pt, rear_center, rear_v_mid_pt, rear_start_pt, rear_u2_mid_pt, rear_pt);

    // 13
    ctrlpt.push(hood_u_pt, hood_u_pt, hood_u_pt, fw_v_hash_pt, side_low_center, side_low_v_mid_pt, fw_u_pt, side_low_u_mid_pt, win_low_pt);
    
    // 14
    ctrlpt.push(fw_u_pt, side_low_u_mid_pt, win_low_pt, roof_v_hash_pt, side_high_center, side_high_v_mid_pt, roof_pt, side_high_u_mid_pt, win_high_pt);
    
    // 15
    ctrlpt.push(roof_pt, side_high_u_mid_pt, win_high_pt, bw_v_mid_pt, rear_well_center, rear_well_v_mid_pt, bw_pt, bw_pt, bw_pt);
    
    // 16
    ctrlpt.push(head_u1_pt, fw_mid1, fw1);
    ctrlpt.push(head_v_pt, mid_pt3, mid_pt1);
    ctrlpt.push(head_u2_pt, fw_mid2, fw2);
    
    // 17
    ctrlpt.push(head_u2_pt, fw_mid2, fw2);
    ctrlpt.push(well_v_pt, mid_pt4, mid_pt2);
    ctrlpt.push(well_pt, front_well_u2_pt, fw3);
    
    // 18
    ctrlpt.push(well_pt, front_well_u2_pt, fw3, belt_low_v_mid_pt, rocker_center, rocker_v_mid_pt, side_low_pt, rocker_u_mid_pt, rocker_center_pt);
    
    // 19
    ctrlpt.push(side_low_pt, rocker_u_mid_pt, rocker_center_pt, belt_high_v_mid_pt, rocker_end_center, rocker_end_v_mid_pt, side_high_pt, rocker_end_u_mid_pt, rocker_end_pt);
    
    // 20
    ctrlpt.push(side_high_pt, rocker_end_u_mid_pt, rocker_end_pt, belt_well_v_mid_pt, rear_well_center2, rear_well_v2_mid_pt, rear_well_pt, rear_well_u2_mid_pt, rear_well_pt2);
    
    // 21
    ctrlpt.push(rear_well_pt2, rw_mid3, rw3, rear_well_u2_mid_pt, rmid_pt4, rmid_pt2, rear_well_pt, rw_mid2, rw2);
    
    // 22
    ctrlpt.push(rear_well_pt, rw_mid2, rw2, rear_v_mid_pt, rmid_pt3, rmid_pt1, rear_pt, rw_mid1, rw1);

    // 23
    ctrlpt.push(nose_mid_pt, bump_pt1, bump_pt8, head_u_hash_pt, bump_pt2, bump_pt9, head_end_pt, bump_pt3, bump_pt10);
    
    // 24
    ctrlpt.push(head_end_pt, bump_pt3, bump_pt10, head_u1_mid_pt, bump_pt4, bump_pt10, head_u1_pt, bump_pt5, bump_pt12);
    
    // 25
    ctrlpt.push(head_u1_pt, bump_pt5, bump_pt12, fw_mid1, bump_pt6, bump_pt13, fw1, bump_pt7, bump_pt14);
    
    // 26
    ctrlpt.push(fw3, side_pt1, side_pt10, rocker_v_mid_pt, side_pt2, side_pt11, rocker_center_pt, side_pt3, side_pt12);
    
    // 27
    ctrlpt.push(rocker_center_pt, side_pt3, side_pt12, rocker_end_v_mid_pt, side_pt4, side_pt13, rocker_end_pt, side_pt5, side_pt14);
    
    // 28
    ctrlpt.push(rocker_end_pt, side_pt5, side_pt14, rear_well_v2_mid_pt, side_pt6, side_pt15, rear_well_pt2, side_pt7, side_pt16);
    
    // 29
    ctrlpt.push(rear_well_pt2, side_pt7, side_pt16, rw_mid3, side_pt8, side_pt17, rw3, side_pt9, side_pt18);
    
    // 30
    ctrlpt.push(back_pt8, back_pt1, hip_mid_pt, back_pt9, back_pt2, rear_u1_mid_pt, back_pt10, back_pt3, rear_start_pt);
    
    // 31
    ctrlpt.push(back_pt10, back_pt3, rear_start_pt,  back_pt11, back_pt4, rear_u2_mid_pt, back_pt12, back_pt5, rear_pt);
    
    // 32
    ctrlpt.push(back_pt12, back_pt5, rear_pt, back_pt13, back_pt6, rw_mid1, back_pt14, back_pt7, rw1);
    
//    vertexPositionData = draw_bezier_surf(ctrlpt, step, order, BC);
   
    checkNaN([hood_end_pt,hood_u_mid_pt,hood_u_pt,fw_ctrl_pt,fw_center,fw_v_hash_pt,roof_start_pt,fw_u_mid_pt,fw_u_pt
    		,roof_ctrl_pt,rf_center,roof_v_hash_pt,roof_end_pt,rf_u_mid_pt,roof_pt,bw_ctrl_pt,bw_center,bw_v_mid_pt
    		,bw_end_pt,bw_u_mid_pt,bw_pt,hip_ctrl_pt,hip_center,hip_v_mid_pt,hip_mid_pt,rear_u1_mid_pt,rear_start_pt
    		,nose_mid_pt,head_u_hash_pt,head_end_pt,nose_ctrl_pt,nose_center,nose_v_hash_pt,hood_start_pt,nose_u_hash_pt,nose_u_pt
    		,hood_ctrl_pt,hood_center,hood_v_pt,head_u1_mid_pt,head_u1_pt,head_center,head_v_pt,head_u2_mid_pt,head_u2_pt
    		,well_center,well_v_pt,well_u_mid_pt,well_pt,side_low_v_mid_pt,belt_low_center,belt_low_v_mid_pt,win_low_pt,belt_low_u_mid_pt
    		,side_low_pt,side_high_v_mid_pt,belt_high_center,belt_high_v_mid_pt,win_high_pt,belt_high_u_mid_pt,side_high_pt,rear_well_v_mid_pt,rear_belt_center
    		,belt_well_v_mid_pt,rear_well_u_mid_pt,rear_well_pt,rear_center,rear_v_mid_pt,rear_u2_mid_pt,rear_pt,side_low_u_mid_pt,side_high_center
    		,side_high_u_mid_pt,rear_well_center,fw_mid1,fw1,mid_pt3,mid_pt1,fw_mid2,fw2,mid_pt4
    		,mid_pt2,front_well_u2_pt,fw3,rocker_center,rocker_v_mid_pt,rocker_u_mid_pt,rocker_center_pt,rocker_end_center,rocker_end_v_mid_pt
    		,rocker_end_u_mid_pt,rocker_end_pt,rear_well_center2,rear_well_v2_mid_pt,rear_well_u2_mid_pt,rear_well_pt2,rw_mid3,rw3,rmid_pt4
    		,rmid_pt2,rw_mid2,rw2,rmid_pt3,rmid_pt1,rw_mid1,rw1,bump_pt1,bump_pt8
    		,bump_pt2,bump_pt9,bump_pt3,bump_pt10,bump_pt4,bump_pt5,bump_pt12,bump_pt6,bump_pt13
    		,bump_pt7,bump_pt14,side_pt1,side_pt10,side_pt2,side_pt11,side_pt3,side_pt12,side_pt4
    		,side_pt13,side_pt5,side_pt14,side_pt6,side_pt15,side_pt7,side_pt16,side_pt8,side_pt17
    		,side_pt9,side_pt18,back_pt8,back_pt1,back_pt9,back_pt2,back_pt10,back_pt3,back_pt11
    		,back_pt4,back_pt12,back_pt5,back_pt13,back_pt6,back_pt14,back_pt7]);
    
    var degree = 2;
    var knots = [0,0,0,1,1,1];
    var carSurfaces = new THREE.Object3D();
    for(var nsControlPoints = [];nsControlPoints.length < 3; nsControlPoints.push(new Array(3)));
    
    for (var i=0;i<32;i++){
    	for (var j=0;j<3;j++){
    		for (var k=0;k<3;k++){
    			nsControlPoints[j][k] = 
    				new THREE.Vector4(ctrlpt[i*9+j*3+k][0],ctrlpt[i*9+j*3+k][1],ctrlpt[i*9+j*3+k][2]);
    		}
    	}
    	var nurbsSurface = new THREE.NURBSSurface(degree,degree,knots,knots,nsControlPoints);
    	getSurfacePoint = function(u, v) {
			return nurbsSurface.getPoint(u, v);
		};
    	var geometry = new THREE.ParametricGeometry(getSurfacePoint, 20, 20);
    	var object = new THREE.Mesh( geometry, material );
    	object.geometry.dynamic = true
    	object.geometry.__dirtyVertices = true;
    	object.geometry.__dirtyNormals = true;

    	object.flipSided = true;
    	object.doubleSided = true;
    	for(var j = 0; j<object.geometry.faces.length; j++) {
    		object.geometry.faces[j].normal.x = -1*object.geometry.faces[j].normal.x;
    		object.geometry.faces[j].normal.y = -1*object.geometry.faces[j].normal.y;
    		object.geometry.faces[j].normal.z = -1*object.geometry.faces[j].normal.z;
    	}
    	carSurfaces.add(object);
    }
    
    
	///////////////////////////////////////////////////////////////////////////////////////////////
    // Add wheels
	var wheel_pts = [];
	var wheel_center = [fwheel_x, box_w-0.1, origin[2]];
	wheel_pts = wheel_pts.concat(wheel_center);
	
	// parameters for bar_front
	var ang_a = Math.PI*2/wheel_n;
	var ang_l = ang_a*0.1;
	var ang_s = ang_a*0.25;
	var r_bar = r_wheel;
	var ang_p_b = -Math.PI*0.1; 
	
	// parameters for plate_front
	var ang_p_po = -Math.PI*0.1;
	var ang_p_pi = Math.PI*0.0;
	var r_plate = r_wheel*0.3;
	var r_plate_i = r_wheel*0.1;
	
	// parameter for outer_ring
	var r_outr = r_wheel*1.15;
	var ang_outr = -Math.PI*0.1;
	
	// draw
	var ang = 0;
	var ang_now = 0;
	temp = [];
	
	// outer_ring
	for (var j = 0; j<11; j++){
		ang_now = ang-ang_a*0.5+ang_a*0.1*j;
		temp = temp.concat([wheel_center[0]+r_outr*Math.cos(ang_now),
		             wheel_center[1]-r_outr*Math.tan(ang_outr),
		             wheel_center[2]+r_outr*Math.sin(ang_now)]);
		temp = temp.concat([wheel_center[0]+r_bar*Math.cos(ang_now),
		             wheel_center[1]-r_bar*Math.tan(ang_p_b),
		             wheel_center[2]+r_bar*Math.sin(ang_now)]);
	}
	
	// bar_front
	for (j = 0; j<3; j++){
		ang_now = ang-ang_l+ang_l*j;
		temp = temp.concat([wheel_center[0]+r_bar*Math.cos(ang_now),
		             wheel_center[1]-r_bar*Math.tan(ang_p_b),
		             wheel_center[2]+r_bar*Math.sin(ang_now)]);
		ang_now = ang-ang_s+ang_s*j;
		temp = temp.concat([wheel_center[0]+r_plate*Math.cos(ang_now),
		             wheel_center[1]-r_plate*Math.tan(ang_p_b),
		             wheel_center[2]+r_plate*Math.sin(ang_now)]);
	}
	
	// plate_front
	for (j = 0; j<5; j++){
		ang_now = ang-ang_a*0.5+ang_a*0.25*j;
		temp = temp.concat([wheel_center[0]+r_plate*Math.cos(ang_now),
		             wheel_center[1]-r_plate*Math.tan(ang_p_po),
		             wheel_center[2]+r_plate*Math.sin(ang_now)]);
		temp = temp.concat([wheel_center[0]+r_plate_i*Math.cos(ang_now),
		             wheel_center[1]-r_plate_i*Math.tan(ang_p_po),
		             wheel_center[2]+r_plate_i*Math.sin(ang_now)]);
	}
	// rotate temp
	wheel_pts = wheel_pts.concat(temp);
	for (var j = 0; j<wheel_n-1; j++){
		temp = rotate_y(temp, ang_a, wheel_center);
		wheel_pts = wheel_pts.concat(temp);
	}
	//move back to get the rear wheels
	for (var i = 0; i<wheel_step*wheel_n+1; i++){
		wheel_pts = wheel_pts.concat([wheel_pts[i*3] + wheelbase, wheel_pts[i*3+1], wheel_pts[i*3+2]]);
	}
	///////////////////////////////////////////////////////////////////////////////////////////////


	///////////////////////////////////////////////////////////////////////////////////////////////
	// tire
	var tire_pts = [];
	var t_n = 10;
	var r_wheel = 0.60;
	var t_r1 = r_wheel*1.18;
	var t_r2 = r_wheel*1.35;
	var t_r3 = r_wheel*1.40;
	var t_r4 = r_wheel*1.40;
	var t_r5 = r_wheel*0.2;
	var t_a1 = -Math.PI*0.1;
	var t_a2 = -Math.PI*0.06;
	var t_a3 = Math.PI*0.001;
	var t_a4 = Math.PI*0.1;
	var t_a5 = Math.PI*0.35;
	
	var ang = 0;
	var ang_now = 0;
	temp = [];
	for (j = 0; j<t_n+1; j++){
		ang_now = ang - ang_a*0.5+ang_a/t_n*j;
		temp = temp.concat([wheel_center[0]+t_r1*Math.cos(ang_now),
		                    wheel_center[1]-t_r1*Math.tan(t_a1),
		                    wheel_center[2]+t_r1*Math.sin(ang_now)]);
		temp = temp.concat([wheel_center[0]+t_r2*Math.cos(ang_now),
		                    wheel_center[1]-t_r2*Math.tan(t_a2),
		                    wheel_center[2]+t_r2*Math.sin(ang_now)]);
		temp = temp.concat([wheel_center[0]+t_r3*Math.cos(ang_now),
		                    wheel_center[1]-t_r3*Math.tan(t_a3),
		                    wheel_center[2]+t_r3*Math.sin(ang_now)]);
		temp = temp.concat([wheel_center[0]+t_r4*Math.cos(ang_now),
		                    wheel_center[1]-t_r4*Math.tan(t_a4),
		                    wheel_center[2]+t_r4*Math.sin(ang_now)]);
		temp = temp.concat([wheel_center[0]+t_r5*Math.cos(ang_now),
		                    wheel_center[1]-t_r5*Math.tan(t_a5),
		                    wheel_center[2]+t_r5*Math.sin(ang_now)]);
	}

	// rotate temp
	tire_pts = tire_pts.concat(temp);
	for (var j = 0; j<wheel_n-1; j++){
		temp = rotate_y(temp, ang_a, wheel_center);
		tire_pts = tire_pts.concat(temp);
	}
	
	//move back to get the rear wheels
	for (var i = 0; i<tire_step*wheel_n; i++){
		tire_pts = tire_pts.concat([tire_pts[i*3] + wheelbase, tire_pts[i*3+1], tire_pts[i*3+2]]);
	}
	///////////////////////////////////////////////////////////////////////////////////////////////
	
    return [carSurfaces, wheel_pts, tire_pts];
}