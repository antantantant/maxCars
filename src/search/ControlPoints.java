package search;

public class ControlPoints {
	// get control points from carModel.js
	
	public double[][] getControlPoints(double[] Input) {
	    int order = 2;
		double[] CC = init_order_coef(order);
		double[][] cp = new double[24][3];
	    // parameters for the model
	    double[] ex = {1.0, 0.000001, 0.000001};
	    double[] ey = {0.000001, 1.0, 0.000001};
	    double[] ez = {0.000001, 0.000001, 1.0};
	    double[] origin = {5, 0, 0};
	    double well_scale = 2.0;
	    double r_wheel = 0.60;
	    double wheel_scale = 1.15;
	    double box_r = 10.0;
	    double clearance = 0.7*r_wheel;
	    double box_l = origin[0]-2*r_wheel;
	    double box_u = 2.5*r_wheel;
	    
	    double roof_end_pt_x = 7.0 - origin[0]; //higher limit on @roof_end_pt
	    double bw_end_pt_x = 8.0 - origin[0]; //higher limit on @bw_end_pt
	    double roof_end_pt_z = r_wheel * well_scale + 1.3 - origin[2]; //lower limit on @roof_end_pt   
	    double bw_end_pt_z = r_wheel*well_scale*wheel_scale*1.1+0.1; //lower limit on @bw_end_pt
	    double hood_u_n = 1.0; //to avoid surface intrusion (@nose_mid_pt is on the negative side of center plane)
	    
	    double[] hood_end_pt = {0.0 + 1.5 * Input[0] - origin[0], 0.0 - origin[1], 1.2 + 0.5 * Input[1] - origin[2]};
	    double[] roof_start_pt = {hood_end_pt[0] + 1.0 + 2.0 * Input[2], 0.0, hood_end_pt[2] + 1.0 + 0.5 * Input[3]};
	    
	    double[] tempv = normalize(dvec(roof_start_pt, hood_end_pt));
	    double temp = tempv[0] * (0.75 + 0.2 * Input[4]);
	    double[] fw_vec = {temp, 0.0, Math.sqrt(1.0-temp*temp)};
	    double fw_n = (roof_start_pt[2] - hood_end_pt[2])*0.5/fw_vec[2] +  (roof_start_pt[2] - hood_end_pt[2])*0.5/ fw_vec[2] * Input[5];
	    double[] fw_ctrl_pt = {hood_end_pt[0] + fw_n*fw_vec[0], hood_end_pt[1] + fw_n*fw_vec[1], hood_end_pt[2] + fw_n*fw_vec[2]};
	    
	    double[] roof_vec = normalize(dvec(roof_start_pt, fw_ctrl_pt));
	    temp = Math.min((0.5 + (roof_end_pt_x - roof_start_pt[0])* 0.5)*roof_vec[2]/roof_vec[0]+roof_start_pt[2], roof_end_pt_z+0.1);
	    double[] roof_end_pt = {roof_start_pt[0] + 2.0 + (roof_end_pt_x - roof_start_pt[0]-2.0)* Input[6], 0.0, (roof_end_pt_z+temp)*0.5 + (temp - roof_end_pt_z)*0.5*Input[7]};
	    double rf_n = 0.5; //need a variable here...***
	    double[] roof_ctrl_pt = {roof_start_pt[0] + rf_n*roof_vec[0], roof_start_pt[1] + rf_n*roof_vec[1], roof_start_pt[2] + rf_n*roof_vec[2]};
	    
	    double[] bw_vec = normalize(dvec(roof_end_pt, roof_ctrl_pt));
	    double[] bw_end_pt = {bw_end_pt_x, 0.0, Math.min(roof_end_pt[2]-1, bw_end_pt_z + (roof_end_pt[2]-1 - bw_end_pt_z)* 0.5)};
	    double bw_n = (bw_end_pt[0] - roof_end_pt[0])/5;
	    double[] bw_ctrl_pt = {roof_end_pt[0] + bw_n*bw_vec[0], roof_end_pt[1] + bw_n*bw_vec[1], roof_end_pt[2] + bw_n*bw_vec[2]};
	    
	    
	    //The following block creates the side curve according to the "fw", "roof" and "rw" curves
	    double c1_t = 0.8 + 0.2* 0.5; //scale-copy the profile on xz plane to the side curve
	    double hood_u_pt_x = 0.4; //need a variable here...***
	    double hood_u_pt_z = -0.2* 0.5; //move side curve of component1 on the z axis
	    double[] hood_u_pt = {hood_end_pt[0] + hood_u_pt_x, 1.8+0.2* 0.5, hood_end_pt[2] + hood_u_pt_z};
	    
	    //All ctrl points from fw to bw on v direction w/o rotation
	    double[] fw_v_hash_pt_temp = 
	        {hood_end_pt[0] + (fw_ctrl_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (fw_ctrl_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z};
	    double[] fw_u_pt_temp = 
	        {hood_end_pt[0] + (roof_start_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (roof_start_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z};
	    double[] roof_v_hash_pt_temp = 
	        {hood_end_pt[0] + (roof_ctrl_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (roof_ctrl_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z};
	    double[] roof_pt_temp = 
	        {hood_end_pt[0] + (roof_end_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (roof_end_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z};
	    double[] bw_v_mid_pt_temp = 
	        {hood_end_pt[0] + (bw_ctrl_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (bw_ctrl_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z};
	    double[] bw_pt_temp = 
	        {hood_end_pt[0] + (bw_end_pt[0] - hood_end_pt[0])*c1_t + hood_u_pt_x, hood_u_pt[1], hood_end_pt[2] + (bw_end_pt[2] - hood_end_pt[2])*c1_t + hood_u_pt_z};
	    
	    // rotate along x-axis
	    tempv = rotatept(fw_v_hash_pt_temp, hood_u_pt, ex, 0.3);
	    double[] fw_v_hash_pt = {tempv[0], tempv[1], fw_v_hash_pt_temp[2]};
	    tempv = rotatept(fw_u_pt_temp, hood_u_pt, ex, 0.3);
	    double[] fw_u_pt = {tempv[0], tempv[1], fw_u_pt_temp[2]};
	    tempv = rotatept(roof_v_hash_pt_temp, hood_u_pt, ex, 0.3);
	    double[] roof_v_hash_pt = {tempv[0], tempv[1], roof_v_hash_pt_temp[2]};
	    tempv = rotatept(roof_pt_temp, hood_u_pt, ex, 0.3);
	    double[] roof_pt = {tempv[0], tempv[1], roof_pt_temp[2]};
	    tempv = rotatept(bw_v_mid_pt_temp, hood_u_pt, ex, 0.3);
	    double[] bw_v_mid_pt = {tempv[0], tempv[1], bw_v_mid_pt_temp[2]};
	    tempv = rotatept(bw_pt_temp, hood_u_pt, ex, 0.3);
	    double[] bw_pt = {tempv[0], tempv[1], bw_pt_temp[2]};
	    
	    //All ctrl points on u direction
	    double[] hood_u_mid_pt = {hood_end_pt[0], hood_end_pt[1] + hood_u_n, hood_end_pt[2]};
	    
	    double k = hood_u_mid_pt[1] / hood_u_pt[2];
	    double fw_center_n =  k * fw_v_hash_pt[1];
	    double[] fw_center = {fw_ctrl_pt[0], fw_ctrl_pt[1] + fw_center_n, fw_ctrl_pt[2]};
	    double fw_u_n = k * fw_u_pt[1];
	    double[] fw_u_mid_pt = {roof_start_pt[0], roof_start_pt[1] + fw_u_n, roof_start_pt[2]};
	    double rf_center_n = k * roof_v_hash_pt[1];
	    double[] rf_center = {roof_ctrl_pt[0], roof_ctrl_pt[1] + rf_center_n, roof_ctrl_pt[2]};
	    double rf_u_n = k * roof_pt[1];
	    double[] rf_u_mid_pt = {roof_end_pt[0], roof_end_pt[1] + rf_u_n, roof_end_pt[2]};
	    double bw_center_n = k * bw_v_mid_pt[1];
	    double[] bw_center = {bw_ctrl_pt[0], bw_ctrl_pt[1] + bw_center_n, bw_ctrl_pt[2]};
	    double bw_u_n = k * bw_pt[1];
	    double[] bw_u_mid_pt = {bw_end_pt[0], bw_end_pt[1] + bw_u_n, bw_end_pt[2]};
	    
	    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	    
	    double box_w = 2.1 + 0.6 * 0.5;
	    double[] nose_mid_pt = {-2.0 - origin[0], 0 - origin[1], 0 - origin[2]};
	    double[] hood_start_pt = {nose_mid_pt[0]  + 0.5* Input[8], 0.0, hood_end_pt[2] - 1.0* Input[9]};
	    tempv = normalize(dvec(hood_start_pt, hood_end_pt));
	    temp = tempv[2] * (-0.4 + 1.5 * Input[10]);
	    double[] hood_vec = {-Math.sqrt(1.0-temp*temp), 0.0, temp};
	    double hood_n = (hood_start_pt[0] - hood_end_pt[0])*0.1/ hood_vec[0] +  (hood_start_pt[0] - hood_end_pt[0]) * 0.9 /  hood_vec[0] * Input[11];
	    double[] hood_ctrl_pt = {hood_end_pt[0] + hood_vec[0]*hood_n,hood_end_pt[1],hood_end_pt[2] + hood_vec[2]*hood_n};
	    double[] nose_vec = normalize(dvec(nose_mid_pt, hood_start_pt));
	    temp = -(hood_start_pt[2]-nose_mid_pt[2])/nose_vec[2]*0.5;//need a variable here***
	    double[] nose_ctrl_pt = {hood_start_pt[0] + nose_vec[0]*temp + 0.0001,hood_start_pt[1],hood_start_pt[2] + nose_vec[2]*temp}; // should have cur cont.
	    
	    double[] nose_u_pt = {hood_start_pt[0] + 0.1 + 0.4* Input[12], hood_u_pt[1] - 0.3 - 0.6* Input[13], hood_start_pt[2]};
	    tempv = normalize(dvec(nose_u_pt, hood_u_pt));
	    double[] hood_v_vec = {tempv[0], tempv[1], tempv[2] * (0.0 + 0.8 * Input[14])};
	    hood_v_vec = normalize(hood_v_vec);
	    double hood_v_n = (nose_u_pt[0] - hood_u_pt[0])*0.8/ hood_v_vec[0] +  (nose_u_pt[0] - hood_u_pt[0])*0.2/ hood_v_vec[0]* 0.5;
	    double[] hood_v_pt = {hood_u_pt[0] + hood_v_vec[0]*hood_v_n, hood_u_pt[1] + hood_v_vec[1]*hood_v_n, hood_u_pt[2] +  + hood_v_vec[2]*hood_v_n};
	    nose_u_pt[2] = Math.min(nose_u_pt[2], hood_v_pt[2]);
	    
	    temp = hood_u_mid_pt[1]/(hood_u_mid_pt[0] - nose_mid_pt[0]);
	    temp = temp* 0.5;
	    double[] hood_center = {hood_ctrl_pt[0], temp*(hood_u_mid_pt[0] - hood_ctrl_pt[0]), hood_ctrl_pt[2]};
	    double[] nose_u_hash_pt = {hood_start_pt[0], temp*(hood_u_mid_pt[0] - hood_start_pt[0]), hood_start_pt[2]};
	    double[] nose_center = {nose_ctrl_pt[0], temp*(hood_u_mid_pt[0] - nose_ctrl_pt[0]), nose_ctrl_pt[2]};
	    double[] head_u_hash_pt = {nose_mid_pt[0], temp*(hood_u_mid_pt[0] - nose_mid_pt[0]), nose_mid_pt[2]};
	    double[] head_end_pt = {head_u_hash_pt[0] + 0.1 + 0.2* Input[15], nose_u_pt[1] - (nose_u_pt[1] - head_u_hash_pt[1])/2*Input[16], head_u_hash_pt[2]};
	    
	    double[] nose_v_vec = normalize(dvec(nose_u_pt, hood_v_pt));
	    temp = Math.max(Math.min((-hood_start_pt[0]+nose_ctrl_pt[0])/nose_v_vec[0], (-hood_start_pt[2]+nose_ctrl_pt[2])/nose_v_vec[2]), 0.01);
	    double[] nose_v_hash_pt = {nose_u_pt[0] + nose_v_vec[0]*temp, nose_u_pt[1] + nose_v_vec[1]*temp, nose_u_pt[2] + nose_v_vec[2]*temp};
	        
	    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	   
	    double head_u1_pt_x = head_end_pt[0]+1.0-0.25*well_scale;
	    double head_u1_pt_y = Math.max(box_w - 0.25*well_scale, Math.max(head_end_pt[1]+0.1, hood_u_pt[1]+0.1));
	    double fwheel_x = head_u1_pt_x + well_scale*r_wheel; //wheel coordinates    
	    double fwheel_z = nose_mid_pt[2];
	    double[] head_u1_pt = {head_u1_pt_x, head_u1_pt_y, 0.0};
	    double[] head_u1_vec = normalize(dvec(head_end_pt, head_u_hash_pt));
	    temp = Math.min((head_u1_pt[0]-head_end_pt[0])/head_u1_vec[0], (head_u1_pt[1]-head_end_pt[1])/head_u1_vec[1]);
	    double[] head_u1_mid_pt = {head_end_pt[0]+head_u1_vec[0]*temp*0.5,head_end_pt[1]+head_u1_vec[1]*temp*0.5,head_end_pt[2]+head_u1_vec[2]*temp*0.5}; //need a variable***
	    
	    double[] fw1 = {fwheel_x - r_wheel*well_scale*0.8, box_w, 0.0};//need a variable***
	    double[] fw3 = {fwheel_x + r_wheel*well_scale*0.8, box_w, 0.0};
	    double[] front_well_pt1 = {fwheel_x + r_wheel*well_scale, head_u1_pt[1]*0.2+box_w*0.8, 0.0};
	    temp = (fw1[0] - fw3[0])/(head_u1_pt[0] - front_well_pt1[0]);
	    double[] fw2 = {fwheel_x - well_scale*r_wheel*0.5*temp, fw3[1], r_wheel*well_scale*0.5*Math.sqrt(3)*temp + fwheel_z};
	    double[] mid_pt1 = {fw2[0] - r_wheel*well_scale*0.7*0.5*temp, fw2[1], fw2[2] - r_wheel*well_scale*0.7*0.5/Math.sqrt(3)*temp};
	    double[] mid_pt2 = {fw2[0] + r_wheel*well_scale*2.1*0.5*temp, fw2[1], fw2[2] + r_wheel*well_scale*2.1*0.5/Math.sqrt(3)*temp};
	    
	 
	   
	    double[] well_v_vec = normalize(crossproduct(dvec(hood_u_pt, nose_u_pt), dvec(nose_u_pt, head_end_pt)));
	    double[] well_vec = normalize(dvec(hood_u_pt,hood_u_mid_pt));
	    double[] well_u_mid_pt = {hood_u_pt[0]+well_vec[0]*0.2,hood_u_pt[1]+well_vec[1]*0.2,hood_u_pt[2]-0.06};
	    
	    double[] temppt = {0, well_u_mid_pt[1], 0};
	    double[] well_pt = intersect(well_u_mid_pt, dvec(well_u_mid_pt, hood_u_pt), temppt, ey); //simplified
	    well_pt[2] = Math.max(well_pt[2], 0.5);
	    well_u_mid_pt[1] = Math.min(well_u_mid_pt[1], well_pt[1]);

	    double[] head_center_vec = normalize(dvec(nose_v_hash_pt, nose_center)); //simplied..**
	    double[] tempv3 = {0,0.1,0};
	    double[] tempv4 = {head_center_vec[0], head_center_vec[1], 0};
	    double[] tempv5 = intersect(nose_v_hash_pt, tempv4, pvec(nose_v_hash_pt, tempv3), well_v_vec);
	    double[] tempv6 = intersect(nose_v_hash_pt, dvec(nose_v_hash_pt, mid_pt1), pvec(nose_v_hash_pt, tempv3), well_v_vec);
	    double[] head_center = new double[3];
	    if(tempv5[0]< tempv6[0]	&& tempv5[0]>nose_v_hash_pt[0]){
	    	head_center = tempv5;
	    }
	    else{
	    	head_center = intersect(nose_v_hash_pt, dvec(nose_v_hash_pt, mid_pt1), pvec(nose_v_hash_pt, tempv3), well_v_vec);
	    }
	    head_center[2] = Math.max(head_center[2], 0.1+origin[2]);
	    head_center[1] = Math.min(head_center[1], head_u1_pt[1]);
	    head_center[0] = Math.max(Math.min(head_center[0], mid_pt1[0]),nose_v_hash_pt[0]);
	    
	    double[] tempv7 = {hood_u_pt[0], head_u1_pt[1], hood_u_pt[2]};
	    temp = Math.abs(Math.max(dotproduct(dvec(tempv7, nose_u_pt),well_v_vec), dotproduct(dvec(head_u1_pt, nose_u_pt),well_v_vec)));
	    double[] tempv8 = {0, temp*0.5, 0};
	    double[] head_u2_mid_pt = intersect(nose_u_pt, dvec(nose_u_pt, mid_pt1), pvec(nose_u_pt,tempv8), well_v_vec);
		head_u2_mid_pt[1]+=(Input[17]-0.1)*0.2;
		head_u2_mid_pt[2]+=(Input[18]-0.5)*0.5;
		head_u2_mid_pt[0] = Math.max(head_u2_mid_pt[0], head_center[0]+0.1);
		
	    double[] well_vvv_vec = normalize(dvec(head_u2_mid_pt, head_center));
	    temp = Math.min(Math.min(Math.abs((well_u_mid_pt[0]-head_u2_mid_pt[0])/well_vvv_vec[0]/2.0), Math.abs((head_u2_mid_pt[1]-hood_v_pt[1])/well_vvv_vec[1])), Math.max((well_u_mid_pt[2]-head_u2_mid_pt[2]+0.5)/well_vvv_vec[2], 0.01));
	    double[] well_center = {head_u2_mid_pt[0] + well_vvv_vec[0]*temp, head_u2_mid_pt[1] + well_vvv_vec[1]*temp, head_u2_mid_pt[2] + well_vvv_vec[2]*temp};
	    well_center[2] = Math.max(well_center[2], r_wheel*well_scale*r_wheel*1.2);
	    
	    temp = (well_pt[1]-nose_u_pt[1])/(well_pt[0]-(fwheel_x - well_scale*r_wheel*0.5)); 
	    double[] belt_top_vec = {1, temp*0.3, (well_center[2]-well_u_mid_pt[2])/(well_center[0]-well_u_mid_pt[0])};
	    double[] tempv9 = {fwheel_x - well_scale*r_wheel*0.5, 0.000000001, r_wheel*well_scale*0.5*Math.sqrt(3) + fwheel_z};
	    double[] tempv10 = {1, 0.000000001, -Math.sqrt(3)};
	    double[] well_v_pt = intersect(well_pt, belt_top_vec,tempv9,tempv10 );
	    well_v_pt[0] = Math.min(Math.max(well_v_pt[0], fwheel_x - well_scale*r_wheel*0.5+0.2), well_pt[0]-0.1);
	    well_v_pt[1] = Math.min(Math.max(well_v_pt[1], hood_v_pt[1]+0.3),box_w);
	    well_v_pt[2] = Math.min(Math.max(well_v_pt[2], r_wheel*well_scale*0.5*Math.sqrt(3)),well_center[2]);
	    if (well_v_pt[1] <= well_center[1]){well_center[1]=well_v_pt[1]-0.01;}
	    double[] head_u2_pt = {fwheel_x - well_scale*r_wheel*0.5,//need a variable *** 
	                      well_v_pt[1], 
	                      r_wheel*well_scale*0.5*Math.sqrt(3) + fwheel_z};

	    
	    double[] head_v_pt = {head_u2_pt[0] - r_wheel*well_scale*0.7*0.5, head_u2_pt[1], head_u2_pt[2] - r_wheel*well_scale*0.7*0.5/Math.sqrt(3)};
	    double[] front_well_u1_pt = {head_u2_pt[0] + r_wheel*well_scale*0.7*1.3, head_u2_pt[1]*0.2+box_w*0.8, head_u2_pt[2] + r_wheel*well_scale*0.7*1.3/Math.sqrt(3)};
	    double[] front_well_pt2 = {well_pt[0] - well_v_pt[0] + front_well_pt1[0], front_well_pt1[1] - 0.1* 0.5, front_well_pt1[2]};
	    double[] fwell_vec = normalize(dvec(well_pt, well_u_mid_pt));
	    double belt_cur_n = Math.min(0.1, Math.max(fwell_vec[2],0.01));
	    double[] front_well_u2_pt = {well_pt[0] + fwell_vec[0]*belt_cur_n, well_pt[1] + fwell_vec[1]*belt_cur_n, well_pt[2] + fwell_vec[2]*belt_cur_n};
	    
	    double[] tempv13 = {0.0, 0.05, 0.0};
	    double[] tempv11 = pvec(head_u2_pt,tempv13);
	    double[] tempv12 = {0.00000001, -1.0, 0.00000001};
	    double[] fw_mid2 = intersect(head_u2_pt, dvec(head_u2_pt, head_u2_mid_pt),tempv11,tempv12);
	    fw_mid2[2] = Math.max(Math.min(fw_mid2[2], head_u2_pt[2]),fw2[2]);
	    fw_mid2[0] = Math.max(Math.min(fw_mid2[0],mid_pt2[0]), mid_pt1[0]);
	    double[] tempv14 = {0.0, (box_w*0.15+head_u1_pt[1]*0.85), 0.0};
	    double[] fw_mid1 = intersect(head_u1_pt, dvec(head_u1_pt, head_end_pt),tempv14,tempv12);

	    double[] fw_mid3 = {front_well_pt1[0] - (fw_mid1[0]-head_u1_pt[0]), (fw1[1] - fw_mid1[1])/(fw1[1] - head_u1_pt[1])*(fw3[1]-front_well_pt1[1])+front_well_pt1[1], front_well_pt1[2] + (fw_mid1[2]-head_u1_pt[2])};
	    double[] tempv15 = pvec(head_v_pt,tempv13);
	    double[] mid_pt3 = intersect(head_v_pt, dvec(head_v_pt, head_center), tempv15, crossproduct(dvec(head_u1_pt,head_v_pt), dvec(head_v_pt,head_u2_pt)));
	    mid_pt3[2] = Math.min(mid_pt3[2], head_v_pt[2]);
	    mid_pt3[0] = Math.min(mid_pt3[0], mid_pt1[0]);
	    double[] tempv16 = {0.0, (box_w*0.05+head_u1_pt[1]*0.95), 0.0};
	    double[] mid_pt4 = intersect(well_v_pt, dvec(well_v_pt, well_center),tempv16,tempv12);
	    mid_pt4[0] = Math.max(Math.min(mid_pt4[0], fw3[0]), mid_pt2[0]);
	    mid_pt4[2] = Math.max(Math.min(mid_pt4[2], well_v_pt[2]-0.01), mid_pt2[2]);
	    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	   
	    double[] tempv17 = normalize(dvec(bw_end_pt, bw_ctrl_pt));
	    double wheelbase = 0;
	    if (tempv17[2]<0){
	        wheelbase = Math.min(11.0*r_wheel, ((bw_end_pt[0]*roof_end_pt[2]-bw_end_pt[2]*roof_end_pt[0])-well_scale*wheel_scale*r_wheel*1.1)/(roof_end_pt[2]-bw_end_pt[2])-fwheel_x);
	    }
	    else {
	        wheelbase = 11.0*r_wheel;
	    }

	    double[] rear_well_pt = {head_u1_pt[0]+r_wheel*well_scale+wheelbase, (bw_pt[1]+front_well_pt1[1])*0.5, r_wheel*well_scale*wheel_scale + fwheel_z};
	    double[] rear_well_pt2 = {head_u1_pt[0]+wheelbase, box_w-0.05, 0};
	    double[] rear_pt = {rear_well_pt2[0] + r_wheel*well_scale*wheel_scale*2, head_u1_pt[1], 0};
	    double[] rear_well_u2_mid_pt = {rear_well_pt[0] - r_wheel*well_scale*wheel_scale*0.7, box_w-0.05, rear_well_pt[2]};
	    double[] rear_v_mid_pt = {rear_well_pt[0] + r_wheel*well_scale*wheel_scale*0.7, rear_well_pt[1], rear_well_pt[2]};

	    double[] tempv18 = {belt_top_vec[0], belt_top_vec[1], hood_u_pt[2] - hood_end_pt[2]};
	    	
	    double temp1 = 0;
	    double temp2 = 0;
	    double belt_n = 0;
	    if (tempv18[2] > -1*Math.pow(10,-6)){
	        temp1 = Math.min((bw_pt[0] - hood_u_pt[0])/tempv18[0], (fw_u_pt[2] - hood_u_pt[2])/tempv18[2]);
	        temp2 = (fw_u_pt[0] - hood_u_pt[0])/tempv18[0];
	        belt_n = temp2* 0.5 + (temp1 - temp2)* 0.5*0.5;}
	    else {
	        temp2 = (fw_u_pt[0] - hood_u_pt[0])/tempv18[0];
	        temp1 = Math.min((bw_pt[0] - hood_u_pt[0])/tempv18[0], (rear_well_pt2[2] - hood_u_pt[2])/tempv18[2]);
	        belt_n = Math.min(temp1, temp2)* 0.5*(0.5+0.01);
	    }
	    
	    double[] belt_line_vec = {tempv18[0], (box_w-hood_u_pt[1])/belt_n* 0.5, tempv18[2]};
	    double[] belt_mid_pt = {hood_u_pt[0]+belt_line_vec[0]*belt_n, hood_u_pt[1]+belt_line_vec[1]*belt_n, hood_u_pt[2]+belt_line_vec[2]*belt_n};
	    
	    double[] win_low_pt = {0, 0, 0};
	    double[] win_high_pt = {0, 0, 0};
 
	    win_low_pt[0] = CC[0]*hood_u_pt[0]*Math.pow(1.0/3.0, 0)*Math.pow(2.0/3.0, order) + 
	                    CC[1]*belt_mid_pt[0]*Math.pow(1.0/3.0, 1)*Math.pow(2.0/3.0, order-1) + CC[2]*bw_pt[0]*Math.pow(1.0/3.0, 2)*Math.pow(2.0/3.0, order-2);
	    win_low_pt[1] = CC[0]*hood_u_pt[1]*Math.pow(1.0/3.0, 0)*Math.pow(2.0/3.0, order) + 
	                    CC[1]*belt_mid_pt[1]*Math.pow(1.0/3.0, 1)*Math.pow(2.0/3.0, order-1) + CC[2]*bw_pt[1]*Math.pow(1.0/3.0, 2)*Math.pow(2.0/3.0, order-2);
	    win_low_pt[2] = CC[0]*hood_u_pt[2]*Math.pow(1.0/3.0, 0)*Math.pow(2.0/3.0, order) + 
	                    CC[1]*belt_mid_pt[2]*Math.pow(1.0/3.0, 1)*Math.pow(2.0/3.0, order-1) + CC[2]*bw_pt[2]*Math.pow(1.0/3.0, 2)*Math.pow(2.0/3.0, order-2);
	    win_high_pt[0] = CC[0]*hood_u_pt[0]*Math.pow(2.0/3.0, 0)*Math.pow(1.0/3.0, order) + 
	                    CC[1]*belt_mid_pt[0]*Math.pow(2.0/3.0, 1)*Math.pow(1.0/3.0, order-1) + CC[2]*bw_pt[0]*Math.pow(2.0/3.0, 2)*Math.pow(1.0/3.0, order-2);
	    win_high_pt[1] = CC[0]*hood_u_pt[1]*Math.pow(2.0/3.0, 0)*Math.pow(1.0/3.0, order) + 
	                    CC[1]*belt_mid_pt[1]*Math.pow(2.0/3.0, 1)*Math.pow(1.0/3.0, order-1) + CC[2]*bw_pt[1]*Math.pow(2.0/3.0, 2)*Math.pow(1.0/3.0, order-2);
	    win_high_pt[2] = CC[0]*hood_u_pt[2]*Math.pow(2.0/3.0, 0)*Math.pow(1.0/3.0, order) + 
	                    CC[1]*belt_mid_pt[2]*Math.pow(2.0/3.0, 1)*Math.pow(1.0/3.0, order-1) + CC[2]*bw_pt[2]*Math.pow(2.0/3.0, 2)*Math.pow(1.0/3.0, order-2);
	    
	    double[] temp_vec1 = {0, 0, 0};
	    temp_vec1[0] = bw_pt[0]*(2.0/3.0) - hood_u_pt[0]*(4.0/3.0) + belt_mid_pt[0]*(2.0/3.0); //Tangent at center of side_temp, see notes
	    temp_vec1[1] = bw_pt[1]*(2.0/3.0) - hood_u_pt[1]*(4.0/3.0) + belt_mid_pt[1]*(2.0/3.0);
	    temp_vec1[2] = bw_pt[2]*(2.0/3.0) - hood_u_pt[2]*(4.0/3.0) + belt_mid_pt[2]*(2.0/3.0);
	    double[] temp_vec2 = {0, 0, 0};
	    temp_vec2[0] = bw_pt[0]*(4.0/3.0) - hood_u_pt[0]*(2.0/3.0) - belt_mid_pt[0]*(2.0/3.0);
	    temp_vec2[1] = bw_pt[1]*(4.0/3.0) - hood_u_pt[1]*(2.0/3.0) - belt_mid_pt[1]*(2.0/3.0);
	    temp_vec2[2] = bw_pt[2]*(4.0/3.0) - hood_u_pt[2]*(2.0/3.0) - belt_mid_pt[2]*(2.0/3.0);
	    
	    double[] side_low_v_mid_pt = intersect_line(hood_u_pt, belt_line_vec, win_low_pt, temp_vec1);
	    double[] side_high_v_mid_pt = intersect_line(win_high_pt, temp_vec2, win_low_pt, temp_vec1);
	    double[] rear_well_v_mid_pt = intersect_line(bw_pt, dvec(bw_pt, belt_mid_pt), win_high_pt, temp_vec2);
	    
	    //lower part of the belt
	    double[] tempv19 = normalize(dvec(well_pt, well_v_pt));
	    double belt_n1 = 0;
	    if (tempv19[2] >= -1*Math.pow(10,-6)){
	        temp1 = Math.min((rear_well_pt2[0] - well_pt[0])/(tempv19[0]+0.0000001), (win_low_pt[2] - well_pt[2])/(tempv19[2]+0.0000001));
	        temp2 = (win_low_pt[0] - well_pt[0])/(tempv19[0]+0.0000001);
	        belt_n1 = temp2* 0.5 + (temp1 - temp2)* 0.5;
	        }
	    else {
	        temp2 = (win_low_pt[0] - well_pt[0])/(tempv19[0]+0.0000001);
	        temp1 = Math.min((rear_well_pt2[0] - well_pt[0])/(tempv19[0]+0.0000001), (rear_well_pt2[2] - well_pt[2])/(tempv19[2]+0.0000001));
	        belt_n1 = Math.min(temp1, temp2)* 0.5;
	        }
	    
	    double[] belt_mid_pt1 = {well_pt[0]+tempv19[0]*belt_n, well_pt[1]+tempv19[1]*belt_n1, well_pt[2]+tempv19[2]*belt_n1};

	    double[] side_low_pt = {0, 0, 0};
	    double[] side_high_pt = {0, 0, 0};
	    side_low_pt[0] = CC[0]*well_pt[0]*Math.pow(1.0/3.0, 0)*Math.pow(2.0/3.0, order) + 
	                    CC[1]*belt_mid_pt1[0]*Math.pow(1.0/3.0, 1)*Math.pow(2/3, order-1) + CC[2]*rear_well_pt[0]*Math.pow(1.0/3.0, 2)*Math.pow(2.0/3.0, order-2);
	    side_low_pt[1] = CC[0]*well_pt[1]*Math.pow(1.0/3.0, 0)*Math.pow(2.0/3.0, order) + 
	                    CC[1]*belt_mid_pt1[1]*Math.pow(1.0/3.0, 1)*Math.pow(2.0/3.0, order-1) + CC[2]*rear_well_pt[1]*Math.pow(1.0/3.0, 2)*Math.pow(2.0/3.0, order-2);
	    side_low_pt[2] = CC[0]*well_pt[2]*Math.pow(1.0/3.0, 0)*Math.pow(2.0/3.0, order) + 
	                    CC[1]*belt_mid_pt1[2]*Math.pow(1.0/3.0, 1)*Math.pow(2.0/3.0, order-1) + CC[2]*rear_well_pt[2]*Math.pow(1.0/3.0, 2)*Math.pow(2.0/3.0, order-2);
	    side_high_pt[0] = CC[0]*well_pt[0]*Math.pow(2.0/3.0, 0)*Math.pow(1.0/3.0, order) + 
	                    CC[1]*belt_mid_pt1[0]*Math.pow(2/3, 1)*Math.pow(1.0/3.0, order-1) + CC[2]*rear_well_pt[0]*Math.pow(2.0/3.0, 2)*Math.pow(1.0/3.0, order-2);
	    side_high_pt[1] = CC[0]*well_pt[1]*Math.pow(2.0/3.0, 0)*Math.pow(1.0/3.0, order) + 
	                    CC[1]*belt_mid_pt1[1]*Math.pow(2/3, 1)*Math.pow(1.0/3.0, order-1) + CC[2]*rear_well_pt[1]*Math.pow(2.0/3.0, 2)*Math.pow(1.0/3.0, order-2);
	    side_high_pt[2] = CC[0]*well_pt[2]*Math.pow(2.0/3.0, 0)*Math.pow(1.0/3.0, order) + 
	                    CC[1]*belt_mid_pt1[2]*Math.pow(2.0/3.0, 1)*Math.pow(1.0/3.0, order-1) + CC[2]*rear_well_pt[2]*Math.pow(2.0/3.0, 2)*Math.pow(1.0/3.0, order-2);
	    
	    double[] temp_vec11 = {0, 0, 0};
	    temp_vec11[0] = rear_well_pt[0]*(2.0/3.0) - well_pt[0]*(4.0/3.0) + belt_mid_pt1[0]*(2.0/3.0); //Tangent at center of side_temp, see notes
	    temp_vec11[1] = rear_well_pt[1]*(2.0/3.0) - well_pt[1]*(4.0/3.0) + belt_mid_pt1[1]*(2.0/3.0);
	    temp_vec11[2] = rear_well_pt[2]*(2.0/3.0) - well_pt[2]*(4.0/3.0) + belt_mid_pt1[2]*(2.0/3.0);
	    double[] temp_vec21 = {0, 0, 0};
	    temp_vec21[0] = rear_well_pt[0]*(4.0/3.0) - well_pt[0]*(2.0/3.0) - belt_mid_pt1[0]*(2.0/3.0);
	    temp_vec21[1] = rear_well_pt[1]*(4.0/3.0) - well_pt[1]*(2.0/3.0) - belt_mid_pt1[1]*(2.0/3.0);
	    temp_vec21[2] = rear_well_pt[2]*(4.0/3.0) - well_pt[2]*(2.0/3.0) - belt_mid_pt1[2]*(2.0/3.0);
	    
	    double[] belt_low_v_mid_pt = intersect_line(well_pt, belt_line_vec, side_low_pt, temp_vec11);
	    double[] belt_high_v_mid_pt = intersect_line(side_high_pt, temp_vec21, side_low_pt, temp_vec11);
	    double[] belt_well_v_mid_pt = intersect_line(rear_well_pt, dvec(rear_well_pt, belt_mid_pt1), side_high_pt, temp_vec21);

	    //side window
	    temp = 0.2;
	    double[] side_low_center = {(fw_v_hash_pt[0]-fw_center[0])*temp + fw_v_hash_pt[0], (fw_v_hash_pt[1]-fw_center[1])*temp + fw_v_hash_pt[1], (fw_v_hash_pt[2]-fw_center[2])*temp + fw_v_hash_pt[2]};
	    double[] side_low_u_mid_pt = {(fw_u_pt[0]-fw_u_mid_pt[0])*temp + fw_u_pt[0], (fw_u_pt[1]-fw_u_mid_pt[1])*temp + fw_u_pt[1], (fw_u_pt[2]-fw_u_mid_pt[2])*temp + fw_u_pt[2]};
	    double[] side_high_center = {(roof_v_hash_pt[0]-rf_center[0])*temp + roof_v_hash_pt[0], (roof_v_hash_pt[1]-rf_center[1])*temp + roof_v_hash_pt[1], (roof_v_hash_pt[2]-rf_center[2])*temp + roof_v_hash_pt[2]};
	    double[] side_high_u_mid_pt = {(roof_pt[0]-rf_u_mid_pt[0])*temp + roof_pt[0], (roof_pt[1]-rf_u_mid_pt[1])*temp + roof_pt[1], (roof_pt[2]-rf_u_mid_pt[2])*temp + roof_pt[2]};
	    double[] rear_well_center = {(bw_v_mid_pt[0]-bw_center[0])*temp + bw_v_mid_pt[0], (bw_v_mid_pt[1]-bw_center[1])*temp + bw_v_mid_pt[1], (bw_v_mid_pt[2]-bw_center[2])*temp + bw_v_mid_pt[2]};

	    double[] belt_low_center = {(side_low_v_mid_pt[0]+belt_low_v_mid_pt[0])*0.5, (side_low_v_mid_pt[1]+belt_low_v_mid_pt[1])*0.5, (side_low_v_mid_pt[2]+belt_low_v_mid_pt[2])*0.5};
	    double[] belt_low_u_mid_pt = {(win_low_pt[0]+side_low_pt[0])*0.5, (win_low_pt[1]+side_low_pt[1])*0.5, (win_low_pt[2]+side_low_pt[2])*0.5};
	    double[] belt_high_center = {(side_high_v_mid_pt[0]+belt_high_v_mid_pt[0])*0.5, (side_high_v_mid_pt[1]+belt_high_v_mid_pt[1])*0.5, (side_high_v_mid_pt[2]+belt_high_v_mid_pt[2])*0.5};
	    double[] belt_high_u_mid_pt = {(win_high_pt[0]+side_high_pt[0])*0.5, (win_high_pt[1]+side_high_pt[1])*0.5, (win_high_pt[2]+side_high_pt[2])*0.5};
	    double[] rear_belt_center = {(rear_well_v_mid_pt[0]+belt_well_v_mid_pt[0])*0.5, (rear_well_v_mid_pt[1]+belt_well_v_mid_pt[1])*0.5, (rear_well_v_mid_pt[2]+belt_well_v_mid_pt[2])*0.5};
	    double[] rear_well_u_mid_pt = {(bw_pt[0]+rear_well_pt[0])*0.5, (bw_pt[1]+rear_well_pt[1])*0.5, (bw_pt[2]+rear_well_pt[2])*0.5};
	    
	    double[] tempv20 = dvec(rear_well_pt2, front_well_pt2);
	    double[] rocker_v_mid_pt = {front_well_pt2[0] + tempv20[0]/6.0, front_well_pt2[1] + tempv20[1]/6.0, front_well_pt2[2] + tempv20[2]/6.0};
	    double[] rocker_center_pt = {front_well_pt2[0] + tempv20[0]/3.0, front_well_pt2[1] + tempv20[1]/3.0, front_well_pt2[2] + tempv20[2]/3.0};
	    double[] rocker_end_v_mid_pt = {front_well_pt2[0] + tempv20[0]/2.0, front_well_pt2[1] + tempv20[1]/2.0, front_well_pt2[2] + tempv20[2]/2.0};
	    double[] rocker_end_pt = {front_well_pt2[0] + tempv20[0]/3.0*2.0, front_well_pt2[1] + tempv20[1]/3.0*2.0, front_well_pt2[2] + tempv20[2]/3.0*2.0};
	    double[] rear_well_v2_mid_pt = {front_well_pt2[0] + tempv20[0]/6.0*5.0, front_well_pt2[1] + tempv20[1]/6.0*5.0, front_well_pt2[2] + tempv20[2]/6.0*5.0};
	    
	    temp1 = (belt_low_v_mid_pt[2]-rocker_v_mid_pt[2])/(-belt_low_v_mid_pt[2]+belt_low_center[2]);
	    temp2 = (side_low_pt[2]-rocker_center_pt[2])/(-side_low_pt[2]+belt_low_u_mid_pt[2]);
	    double temp3 = (belt_high_v_mid_pt[2]-rocker_end_v_mid_pt[2])/(-belt_high_v_mid_pt[2]+belt_high_center[2]);
	    double temp4 = (side_high_pt[2]-rocker_end_pt[2])/(-side_high_pt[2]+belt_high_u_mid_pt[2]);
	    double temp5 = (belt_well_v_mid_pt[2]-rear_well_v2_mid_pt[2])/(-belt_well_v_mid_pt[2]+rear_belt_center[2]);
	    
	    temp = Math.max(Math.min(temp1, Math.min(temp2, Math.min(temp3, Math.min(temp4, temp5))))*0.01, 0.01);
	    double[] rocker_center = {(belt_low_v_mid_pt[0] - belt_low_center[0])*temp + belt_low_v_mid_pt[0], (belt_low_v_mid_pt[1] - belt_low_center[1])*temp + belt_low_v_mid_pt[1], (belt_low_v_mid_pt[2] - belt_low_center[2])*temp + belt_low_v_mid_pt[2]};
	    double[] rocker_u_mid_pt = {(side_low_pt[0] - belt_low_u_mid_pt[0])*temp + side_low_pt[0], (side_low_pt[1] - belt_low_u_mid_pt[1])*temp + side_low_pt[1], (side_low_pt[2] - belt_low_u_mid_pt[2])*temp + side_low_pt[2]};
	    double[] rocker_end_center = {(belt_high_v_mid_pt[0] - belt_high_center[0])*temp + belt_high_v_mid_pt[0], (belt_high_v_mid_pt[1] - belt_high_center[1])*temp + belt_high_v_mid_pt[1], (belt_high_v_mid_pt[2] - belt_high_center[2])*temp + belt_high_v_mid_pt[2]};
	    double[] rocker_end_u_mid_pt = {(side_high_pt[0] - belt_high_u_mid_pt[0])*temp + side_high_pt[0], (side_high_pt[1] - belt_high_u_mid_pt[1])*temp + side_high_pt[1], (side_high_pt[2] - belt_high_u_mid_pt[2])*temp + side_high_pt[2]};
	    double[] rear_well_center2 = {(belt_well_v_mid_pt[0] - rear_belt_center[0])*temp + belt_well_v_mid_pt[0], (belt_well_v_mid_pt[1] - rear_belt_center[1])*temp + belt_well_v_mid_pt[1], (belt_well_v_mid_pt[2] - rear_belt_center[2])*temp + belt_well_v_mid_pt[2]};
	    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	    
	    double[] hip_mid_pt = {wheelbase+wheel_scale*r_wheel*well_scale+fwheel_x + 1.0, 0, 0};
	    double[] tempv21 = {0, 0, 0.5+1*0.5};
	    double[] hip_vec = normalize(pvec(dvec(bw_end_pt, bw_ctrl_pt),tempv21));
	    double hip_n = (hip_mid_pt[0]-bw_end_pt[0])/hip_vec[0]*0.6;
	    double[] hip_ctrl_pt = {bw_end_pt[0]+hip_vec[0]*hip_n, bw_end_pt[1]+hip_vec[1]*hip_n, bw_end_pt[2]+hip_vec[2]*hip_n};
	    
	    double[] hip_center = intersect(hip_ctrl_pt, ey, bw_center, ey);
	    hip_center[1]+= 0.3;
	    double rear_n = (rear_pt[1] - hip_mid_pt[1])*0.9;
	    double[] rear_start_pt = {0.0, 0.0, 0.0};
	    rear_start_pt[0] = CC[0]*hip_mid_pt[0]*Math.pow(1.0/2.0, 0)*Math.pow(1.0/2.0, order) + 
	                    CC[1]*hip_mid_pt[0]*Math.pow(1.0/2.0, 1)*Math.pow(1.0/2.0, order-1) + CC[2]*rear_pt[0]*Math.pow(1.0/2.0, 2)*Math.pow(1.0/2.0, order-2);
	    rear_start_pt[1] = CC[0]*hip_mid_pt[1]*Math.pow(1.0/2.0, 0)*Math.pow(1.0/2.0, order) + 
	                    CC[1]*(hip_mid_pt[1]+rear_n)*Math.pow(1.0/2.0, 1)*Math.pow(1.0/2.0, order-1) + CC[2]*rear_pt[1]*Math.pow(1.0/2.0, 2)*Math.pow(1.0/2.0, order-2);
	    rear_start_pt[2] = CC[0]*hip_mid_pt[2]*Math.pow(1.0/2.0, 0)*Math.pow(1.0/2.0, order) + 
	                    CC[1]*hip_mid_pt[2]*Math.pow(1.0/2.0, 1)*Math.pow(1.0/2.0, order-1) + CC[2]*rear_pt[2]*Math.pow(1.0/2.0, 2)*Math.pow(1.0/2.0, order-2);
	    
	    double[] tempv22 = dvec(rear_pt, hip_mid_pt);
	    double[] rear_u1_mid_pt = intersect_line(hip_mid_pt, ey, rear_start_pt, tempv22);
	    rear_u1_mid_pt[1]+=0.3;
	    double[] tempv23 = {hip_mid_pt[0],hip_mid_pt[1]+rear_n,hip_mid_pt[2]};
	    double[] rear_u2_mid_pt = intersect_line(rear_pt, dvec(rear_pt, tempv23), rear_start_pt, tempv22);
	    
	    double[] hip_u_vec = normalize(dvec(bw_pt, bw_v_mid_pt));
	    double[] tempv24 = dvec(bw_pt, bw_v_mid_pt);tempv24[1]-=0.5;
	    double[] tempv25 = {hip_u_vec[0], hip_u_vec[1]+0.000001, hip_u_vec[2]};
	    double[] hip_v_mid_pt = intersect(bw_pt, tempv24, hip_center, tempv25);
	    temp = (rear_u2_mid_pt[0] - rear_well_u_mid_pt[0])/(rear_well_u_mid_pt[0] - rear_belt_center[0])*0.5;
	    double[] rear_center = {rear_well_u_mid_pt[0]+temp*(rear_well_u_mid_pt[0] - rear_belt_center[0]), rear_well_u_mid_pt[1]+temp*(rear_well_u_mid_pt[1] - rear_belt_center[1]), rear_well_u_mid_pt[2]+temp*(rear_well_u_mid_pt[2] - rear_belt_center[2])};
	    
		cp = collect(cp,hood_end_pt,0);
		cp = collect(cp,hood_u_pt,1);
		cp = collect(cp,roof_start_pt,2);
		cp = collect(cp,fw_u_pt,3);
		cp = collect(cp,roof_end_pt,4);
		cp = collect(cp,roof_pt,5);
		cp = collect(cp,bw_end_pt,6);
		cp = collect(cp,bw_pt,7);
		cp = collect(cp,nose_mid_pt,8);
		cp = collect(cp,head_end_pt,9);
		cp = collect(cp,hood_start_pt,10);
		cp = collect(cp,nose_u_pt,11);
		cp = collect(cp,head_u1_pt,12);	
		cp = collect(cp,head_u2_pt,13);	
		cp = collect(cp,well_pt,14);
		cp = collect(cp,bw_ctrl_pt,15);	
		cp = collect(cp,roof_ctrl_pt,16);
		cp = collect(cp,fw_ctrl_pt,17);
		cp = collect(cp,hood_v_pt,18);
		cp = collect(cp,head_u_hash_pt,19);
		cp = collect(cp,head_center,20);
		cp = collect(cp,well_v_pt,21);
		cp = collect(cp,well_center,22);
		cp = collect(cp,head_u2_mid_pt,23);
		
//		cp = collect(cp,hood_end_pt,0);
//		cp = collect(cp,hood_u_mid_pt,1);
//		cp = collect(cp,hood_u_pt,2);
//		cp = collect(cp,fw_ctrl_pt,3);	
//		cp = collect(cp,fw_center,4);
//		cp = collect(cp,fw_v_hash_pt,5);
//		cp = collect(cp,roof_start_pt,6);
//		cp = collect(cp,fw_u_mid_pt,7);	
//		cp = collect(cp,fw_u_pt,8);
//		cp = collect(cp,roof_ctrl_pt,9);
//		cp = collect(cp,rf_center,10);
//		cp = collect(cp,roof_v_hash_pt,11);	
//		cp = collect(cp,roof_end_pt,12);
//		cp = collect(cp,rf_u_mid_pt,12);
//		cp = collect(cp,roof_pt,14);
//		cp = collect(cp,bw_ctrl_pt,15);
//		cp = collect(cp,bw_center,16);
//		cp = collect(cp,bw_v_mid_pt,17);
//		cp = collect(cp,bw_end_pt,18);
//		cp = collect(cp,bw_u_mid_pt,19);	
//		cp = collect(cp,bw_pt,20);
//		cp = collect(cp,hip_ctrl_pt,21);
//		cp = collect(cp,hip_center,22);
//		cp = collect(cp,hip_v_mid_pt,23);	
//		cp = collect(cp,hip_mid_pt,24);
//		cp = collect(cp,rear_u1_mid_pt,25);
//		cp = collect(cp,nose_mid_pt,26);
//		cp = collect(cp,head_u_hash_pt,27);	
//		cp = collect(cp,head_end_pt,28);
//		cp = collect(cp,nose_ctrl_pt,29);
//		cp = collect(cp,nose_center,30);
//		cp = collect(cp,nose_v_hash_pt,31);
//		cp = collect(cp,hood_start_pt,32);
//		cp = collect(cp,nose_u_hash_pt,33);
//		cp = collect(cp,nose_u_pt,34);
//		cp = collect(cp,hood_ctrl_pt,35);	
//		cp = collect(cp,hood_center,36);
//		cp = collect(cp,hood_v_pt,37);
//		cp = collect(cp,head_u1_mid_pt,38);
//		cp = collect(cp,head_u1_pt,39);	
//		cp = collect(cp,head_center,40);
//		cp = collect(cp,head_v_pt,41);
//		cp = collect(cp,head_u2_mid_pt,42);
//		cp = collect(cp,head_u2_pt,43);	
//		cp = collect(cp,well_center,44);
//		cp = collect(cp,well_v_pt,45);
//		cp = collect(cp,well_u_mid_pt,46);
//		cp = collect(cp,well_pt,47);
//		cp = collect(cp,side_low_v_mid_pt,48);
//		cp = collect(cp,belt_low_center,49);
//		cp = collect(cp,belt_low_v_mid_pt,50);
//		cp = collect(cp,win_low_pt,51);	
//		cp = collect(cp,belt_low_u_mid_pt,52);
//		cp = collect(cp,side_low_pt,53);
//		cp = collect(cp,side_high_v_mid_pt,54);
//		cp = collect(cp,belt_high_center,55);	
//		cp = collect(cp,belt_high_v_mid_pt,56);
//		cp = collect(cp,win_high_pt,57);
//		cp = collect(cp,belt_high_u_mid_pt,58);
//		cp = collect(cp,side_high_pt,59);	
//		cp = collect(cp,rear_well_v_mid_pt,60);
//		cp = collect(cp,rear_belt_center,61);
//		cp = collect(cp,belt_well_v_mid_pt,62);
//		cp = collect(cp,rear_well_u_mid_pt,63);
//		cp = collect(cp,rear_well_pt,64);
//		cp = collect(cp,rear_center,65);
//		cp = collect(cp,rear_v_mid_pt,66);	
//		cp = collect(cp,rear_start_pt,67);
//		cp = collect(cp,rear_u2_mid_pt,68);
//		cp = collect(cp,rear_pt,69);
//		cp = collect(cp,side_low_center,70);	
//		cp = collect(cp,side_low_u_mid_pt,71);
//		cp = collect(cp,side_high_center,72);
//		cp = collect(cp,side_high_u_mid_pt,73);
//		cp = collect(cp,rear_well_center,74);
//		cp = collect(cp,rocker_center,75);
//		cp = collect(cp,rocker_v_mid_pt,76);
//		cp = collect(cp,rocker_u_mid_pt,77);	
//		cp = collect(cp,rocker_center_pt,78);
//		cp = collect(cp,rocker_end_center,79);
//		cp = collect(cp,rocker_end_v_mid_pt,80);
//		cp = collect(cp,rocker_end_u_mid_pt,81);	
//		cp = collect(cp,rocker_end_pt,82);
//		cp = collect(cp,rear_well_center2,83);
//		cp = collect(cp,rear_well_v2_mid_pt,84);
//		cp = collect(cp,rear_well_u2_mid_pt,85);	
//		cp = collect(cp,rear_well_pt2,86);
		return cp;
	}
	private double[] intersect_line(double[] pt1, double[] v1, double[] pt2, double[] v2) {
	    double a, b, c;
	    double x, y, z;
		if (v1[0]==0){
	    	a  = ((pt1[1]-pt2[1])*v2[2]-(pt1[2]-pt2[2])*v2[1])/(v1[2]*v2[1]-v1[1]*v2[2]);
	        x = pt1[0] + a*v1[0];
	        y = pt1[1] + a*v1[1];
	        z = pt1[2] + a*v1[2];
	    }
	    else if (v1[2]==0){
	    	a  = ((pt1[0]-pt2[0])*v2[1]-(pt1[1]-pt2[1])*v2[0])/(v1[1]*v2[0]-v1[0]*v2[1]);
	        x = pt1[0] + a*v1[0];
	        y = pt1[1] + a*v1[1];
	        z = pt1[2] + a*v1[2];
	    }
	    else if (v1[1]==0){
	    	a  = ((pt1[0]-pt2[0])*v2[2]-(pt1[2]-pt2[2])*v2[0])/(v1[2]*v2[0]-v1[0]*v2[2]);
	        x = pt1[0] + a*v1[0];
	        y = pt1[1] + a*v1[1];
	        z = pt1[2] + a*v1[2];
	    }
	    else {
	    	a  = ((pt1[0]-pt2[0])*v2[1]-(pt1[1]-pt2[1])*v2[0])/(v1[1]*v2[0]-v1[0]*v2[1]);
	    	b  = ((pt1[0]-pt2[0])*v2[2]-(pt1[2]-pt2[2])*v2[0])/(v1[2]*v2[0]-v1[0]*v2[2]);
	    	c  = ((pt1[1]-pt2[1])*v2[2]-(pt1[2]-pt2[2])*v2[1])/(v1[2]*v2[1]-v1[1]*v2[2]);
	    	
	        if (pt1[0] + a*v1[0]<pt2[0] && pt1[0] + a*v1[0]>pt1[0]){
	            x = pt1[0] + a*v1[0];
	            y = pt1[1] + a*v1[1];
	            z = pt1[2] + a*v1[2];
	        }
	        else if (pt1[0] + b*v1[0]<pt2[0] && pt1[0] + b*v1[0]>pt1[0]){
	            x = pt1[0] + b*v1[0];
	            y = pt1[1] + b*v1[1];
	            z = pt1[2] + b*v1[2];        	
	        }
	        else {
	            x = pt1[0] + c*v1[0];
	            y = pt1[1] + c*v1[1];
	            z = pt1[2] + c*v1[2];
	        }
	    }
		double[] vv = {x, y, z};
	    return vv;
	}
	private double[] init_order_coef(int order) {
	    double[] CC = new double[order+1];
	    double[] facs = new double[order+1];
	    facs[0] = 1.0;
	    for (int i = 1;i < order+1;i++){
	        facs[i] = i * facs[i-1];
	    }
	    for (int i = 0;i<order+1;i++){
	        CC[i] = (facs[order]/(facs[i]*facs[order-i]));
	    }
	    return CC;
	}
	private double[] intersect(double[] pt1, double[] v1,
			double[] pt2, double[] v2) {
		double a;
		double b;
		double c;
		double x;
		double y;
		double z;

	    if (v1[0] != 0){
	        a = v2[0]*pt2[0] + v2[1]*pt2[1] + v2[2]*pt2[2];
	        b = v1[1]*pt1[0] - v1[0]*pt1[1];
	        c = v1[2]*pt1[0] - v1[0]*pt1[2];
	        x = (a*v1[0]+b*v2[1]+c*v2[2])/(v2[0]*v1[0]+v2[1]*v1[1]+v2[2]*v1[2]);
	        y = (b - x*v1[1])/(-v1[0]);
	        z = (c - x*v1[2])/(-v1[0]);
	        double[] v = {x, y, z};
	        return v;
	    }
	    a = v2[0]*pt2[0] + v2[1]*pt2[1] + v2[2]*pt2[2] - v2[0]*pt1[0];
	    b = v1[2]*pt1[1] - v1[1]*pt1[2];
	    x = pt1[0];
	    y = (a*v1[1] + b*v2[2])/(v2[1]*v1[1]);
	    z = (b*v2[2] - v1[2]*v2[2]*y)/(-v1[1]*v2[2]);
	    double[] v = {x, y, z};
	    return v;
	}
	private double[] pvec(double[] v1, double[] v2) {
		double[] v = {v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]};
	    return v;	
	}
	private double dotproduct(double[] v1, double[] v2) {
		double v = 0;
		v+=v1[0]*v2[0];
		v+=v1[1]*v2[1];
		v+=v1[2]*v2[2];
		return v;
	}
	private double[] crossproduct(double[] v1, double[] v2) {
	    double[] v = {v1[1]*v2[2]-v1[2]*v2[1],v2[0]*v1[2]-v1[0]*v2[2],v1[0]*v2[1]-v1[1]*v2[0]};
	    return v;
	}
	private double[] rotatept(double[] pt1, double[] pt2,
			double[] v, double a) {
		 double x = pt1[0] - pt2[0];
		 double y = pt1[1] - pt2[1];
		 double z = pt1[2] - pt2[2];
		 double ux = v[0]*x;
		 double uy = v[0]*y;
		 double uz = v[0]*z;
		 double vx = v[1]*x;
		 double vy = v[1]*y;
		 double vz = v[1]*z;
		 double wx = v[2]*x;
		 double wy = v[2]*y;
		 double wz = v[2]*z;
		 double sa = Math.sin(a);
		 double ca = Math.cos(a);
		 double xx = v[0]*(ux+vy+wz)+(x*(v[1]*v[1]+v[2]*v[2])-v[0]*(vy+wz))*ca+(-wy+vz)*sa + pt2[0];
		 double yy = v[1]*(ux+vy+wz)+(y*(v[0]*v[0]+v[2]*v[2])-v[1]*(ux+wz))*ca+(wx-uz)*sa + pt2[1];
		 double zz = v[2]*(ux+vy+wz)+(z*(v[0]*v[0]+v[1]*v[1])-v[2]*(ux+vy))*ca+(-vx+uy)*sa + pt2[2];
		 double[] pp = {xx, yy, zz};
		 return pp;
	}
	private double[] dvec(double[] v1, double[] v2) {
		double[] dv = {v1[0]-v2[0],v1[1]-v2[1],v1[2]-v2[2]};
		return dv;
	}
	private double[] normalize(double[] v){
		double norm = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
		double[] nv = {v[0]/norm, v[1]/norm, v[2]/norm};
		return nv;
	}
	private double[][] collect(double[][] cp, double[] p, int i){
		for (int j = 0;j<3;j++){
			cp[i][j] = p[j];
		}
		return cp;
	}
}
