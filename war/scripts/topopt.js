function game(main_scene_id,misc_scene_id){
	//define mouse actions
	this.main_scene_id = main_scene_id;
	this.misc_scene_id = misc_scene_id;
	var d = this;
	$("#"+misc_scene_id).click(function(e){if(d.click){d.prehandleEvent(e);d.click(e)}});
	$("#"+misc_scene_id).dblclick(function(e){if(d.dblclick){d.prehandleEvent(e);d.dblclick(e)}});
	$("#"+misc_scene_id).mousedown(function(e){if(d.mousedown){d.prehandleEvent(e);d.mousedown(e);}});
	$("#"+misc_scene_id).mousemove(function(e){if(canvas_dragging==null&&d.mousemove){d.prehandleEvent(e);d.mousemove(e)}});
	$("#"+misc_scene_id).mouseup(function(e){switch(e.which){case 1:if(d.mouseup){d.prehandleEvent(e);d.mouseup(e)}break;
	case 2:if(d.middlemouseup){d.prehandleEvent(e);d.middlemouseup(e)}break;
	case 3:if(d.rightmouseup){d.prehandleEvent(e);d.rightmouseup(e)}break}});
	$("#"+misc_scene_id).mouseover(function(e){canvas_over=d;if(d.mouseover){d.prehandleEvent(e);d.mouseover(e)}});
	$("#"+misc_scene_id).keydown(function(e){if(d.keydown){d.keydown(e)}});
	$("#"+misc_scene_id).keyup(function(e){if(d.keyup){d.keyup(e)}});
	
	this.canvas = document.getElementById(this.main_scene_id);
	this.miscCanvas = document.getElementById(this.misc_scene_id);
    this.context = this.canvas.getContext("2d");
    this.miscContext = this.miscCanvas.getContext("2d");
	this.topology = new topology(20, 10, 1, 3.0, 1.5, 1.0, 0.01);//nelx, nely, volfrac, penal, rmin, E, nu
	this.topology.parent = this;
	this.topology.draw();
}

function topology(nelx, nely, volfrac, penal, rmin, E, nu, scene_id){
	this.nelx = nelx;
	this.nely = nely;
	this.volfrac = volfrac;
	this.penal = penal;
	this.rmin = rmin;
	this.E = E;
	this.nu = nu;
	this.x = [];
	for(ely=0;ely<this.nely;ely++){
		this.x[ely]=[];
		for(elx=0;elx<this.nelx;elx++){
			this.x[ely].push(this.volfrac);
		}
	}
	KE = this.lk();
	this.loc = [];
	this.attachedIDx=-1;
	this.attachedIDy=-1;
	this.forceAttached = false;
	this.pointForceX = 0;
	this.pointForceY = 0;
	this.parent = []; 
}

topology.prototype.update = function(x1,y1,x0,y0){
//	var k;
//	var xLEFT = this.inileft;
//	var xRIGHT = this.inileft+(this.w+this.m)*this.nelx;
//	var yTOP = this.initop;
//	var yBOTTOM = this.initop+(this.l+this.m)*this.nely;
//	if(x1-x0!=0){
//		k = (y1-y0)/(x1-x0);
//		yLEFT = k*(xLEFT-x1)+y1;
//		yRIGHT = k*(xRIGHT-x1)+y1;
//		xTOP = (yTOP-y1)/k+x1;
//		xBOTTOM = (yBOTTOM-y1)/k+x1;
//		if
//	}
//	else{}
	if(pointForce){
		var norm = Math.sqrt((y1-y0)*(y1-y0)+(x1-x0)*(x1-x0))/10; 
		if(x1-x0!=0){
			var ang = Math.atan((y1-y0)/(x1-x0));
			var sign = 0;
			if(x1-x0>0){sign = 1;}else{sign = -1;}
			this.pointForceX = norm*sign*Math.cos(ang);
			this.pointForceY = -norm*sign*Math.sin(ang);
		}
		else{
			this.pointForceX = 0;
			this.pointForceY = -(y1-y0);
		}
	}
};

topology.prototype.draw = function(){
	var ely,elx;
	var left,top;
	this.inileft = 10; this.initop = 10;
	this.w = 20; this.l = 20; this.m = 0;
	for(elx=0;elx<this.nelx;elx++){
		for(ely=0;ely<this.nely;ely++){
			left = (this.w+this.m)*elx+this.inileft;
			top = (this.l+this.m)*ely+this.initop;
			if(this.x[ely][elx]>0.01){this.parent.context.fillStyle="rgba(0,0,0,"+this.x[ely][elx].toString()+")";}
			else{this.parent.context.fillStyle="rgba(255,255,255,1)";}		
			this.parent.context.fillRect(left,top,this.w,this.l);
			this.loc.push([left,top]);
		}
		this.loc.push([left,top+this.l]);
	}
	for(ely=0;ely<this.nely+1;ely++){
		left = (this.w+this.m)*this.nelx+this.inileft;
		top = (this.l+this.m)*ely+this.initop;
		this.loc.push([left,top]);
	}
	this.changedloc = this.loc.slice(0);
};

topology.prototype.updateMesh = function(a){
	for(var i=0;i<this.loc.length;i++){
		this.changedloc[i] = [this.loc[i][0]+this.U[2*i]*a,this.loc[i][1]-this.U[2*i+1]*a];
	}
};

topology.prototype.move = function(){
	var i,elx,ely,x1,x2,x3,x4,y1,y2,y3,y4;
	var running=0;
	function loop(){
		if(running<1){
			requestAnimationFrame(loop);
			g.topology.parent.context.clearRect(0,0,g.topology.parent.canvas.width,g.topology.parent.canvas.height);
			g.topology.updateMesh(0.1);
			for(ely=0;ely<g.topology.nely;ely++){
				for(elx=0;elx<g.topology.nelx;elx++){
					x1 = g.topology.changedloc[elx*(g.topology.nely+1)+ely][0];
					y1 = g.topology.changedloc[elx*(g.topology.nely+1)+ely][1];
					x2 = g.topology.changedloc[elx*(g.topology.nely+1)+ely+1][0];
					y2 = g.topology.changedloc[elx*(g.topology.nely+1)+ely+1][1];
					x3 = g.topology.changedloc[(elx+1)*(g.topology.nely+1)+ely][0];
					y3 = g.topology.changedloc[(elx+1)*(g.topology.nely+1)+ely][1];
					x4 = g.topology.changedloc[(elx+1)*(g.topology.nely+1)+ely+1][0];
					y4 = g.topology.changedloc[(elx+1)*(g.topology.nely+1)+ely+1][1];
					if(g.topology.x[ely][elx]>0.01)
					{g.topology.parent.context.fillStyle="rgba(0,0,0,"+g.topology.x[ely][elx].toString()+")";}
					else{g.topology.parent.context.fillStyle="rgba(255,255,255,1)";}					
					g.topology.parent.context.beginPath();
					g.topology.parent.context.moveTo(x1, y1);
					g.topology.parent.context.lineTo(x2, y2);
					g.topology.parent.context.lineTo(x4, y4);
					g.topology.parent.context.lineTo(x3, y3);
					g.topology.parent.context.closePath();
					g.topology.parent.context.fill();
				}
			}
			running += 0.1;
		}
	}
	loop();
};

topology.prototype.simulate = function(){
	simulated = true;
	this.U = this.FE();
	this.move();
};

topology.prototype.optimize = function(){
	var loop = 0; var change = 1;
	var ely,elx,xold,U,KE,c,n1,n2,dc;
	while(change>0.01){
		loop+=1;
		xold = this.x;
		U = this.FE();
		
		c = 0;
		var Ue = [];
		for(ely=0;ely<this.nely;ely++){
			dc[ely] = [];
			for(elx=0;elx<this.nelx;elx++){
				n1 = (this.nely+1)*elx+ely+1;
				n2 = (this.nely+1)*(elx+1)+ely+1;
				Ue.push(U[2*n1-2]);
				Ue.push(U[2*n1-1]);
				Ue.push(U[2*n2-2]);
				Ue.push(U[2*n2-1]);
				Ue.push(U[2*n2]);
				Ue.push(U[2*n2+1]);
				Ue.push(U[2*n1]);
				Ue.push(U[2*n1+1]);
				var temp = this.quadM(Ue,KE);
				c+= Math.pow(this.x[ely,elx],this.penal)*temp;
				dc[ely].push(-this.penal*Math.pow(this.x[ely,elx],(this.penal-1))*temp);
			}
		}
		dc = this.check(dc);
		this.OC(dc);
	}
};

topology.prototype.OC = function(dc){
	var l1 = 0; var l2 = 1e5; var move = 0.2;
	var lmid = 0;
	var elx,ely;
	while(l2-l1>1e-4){
		lmid = 0.5*(l2+l1);
		var xnew = [];
		var xnewsum = 0;
		for(ely=0;ely<this.nely;ely++){
			xnew[ely] = [];
			for(elx=0;elx<this.nelx;elx++){
				xnew[ely].push(Math.max(0.001,Math.max(this.x[ely][elx]-move,
						Math.min(this.x[ely][elx]+move,this.x[ely][elx]*Math.sqrt(-dc[ely][elx]/lmid)))));
				xnewsum+=xnew[ely][elx];
			}
		}
		if(xnewsum-this.volfrac*this.nelx*this.nely>0){
			l1 = lmid;}else{l2 = lmid;}
	}
	this.x = xnew;
};

topology.prototype.check = function(dc){
	var dcn,i,j,ely,elx,sum,k,lbk,ubk,lbl,ubl;
	for(ely=0;ely<this.nely;ely++){
		dcn[ely]=[];
		for(elx=0;elx<this.nelx;elx++){
			dcn[ely].push(0);
		}
	}
	for(i=1;i<=this.nelx;i++){
		for(j=1;j<=this.nely;j++){
			sum = 0;
			lbk = Math.max(i-Math.round(this.rmin),1);
			ubk = Math.min(i+Math.round(this.rmin),this.nelx);
			lbl = Math.max(j-Math.round(this.rmin),1);
			ubl = Math.min(j+Math.round(this.rmin),this.nely);
			for(k=lbk;k<=ubk;k++){
				for(l=lbl;l<=ubl;l++){
					fac = this.rmin - Math.sqrt((i-k)*(i-k)+(j-l)*(j-l));
					sum += Math.max(0,fac);
					dcn[j-1][i-1] += Math.max(0,fac)*this.x[l-1][k-1]*dc[l-1][k-1];
				}
			}
			dcn[j-1][i-1] = dcn[j-1][i-1]/(this.x[j-1][i-1]*sum);
		}
	}
	return dc;
};

topology.prototype.FE = function(){
	var i,j,ely,elx,n1,n2,edof;
	var fixeddofs = []; var freedofs = [];
	var Kdiag = new Array(2*(this.nelx+1)*(this.nely+1));
	var Kind = new Array(2*(this.nelx+1)*(this.nely+1));
	var Kval = new Array(2*(this.nelx+1)*(this.nely+1));
	var Find = []; var Fval = [];
	var U = new Array(2*(this.nelx+1)*(this.nely+1));
	for(i=0;i<2*(this.nelx+1)*(this.nely+1);i++){
		Kind[i]=[];Kval[i]=[];Kdiag[i]=0;U[i]=0;
	}
	for(ely=0;ely<this.nely;ely++){
		for(elx=0;elx<this.nelx;elx++){
			n1 = (this.nely+1)*elx+ely+1;
			n2 = (this.nely+1)*(elx+1) + ely+1;
			edof = [2*n1-1,2*n1,2*n2-1,2*n2,2*n2+1,2*n2+2,2*n1+1,2*n1+2];
			for(i=0;i<edof.length;i++){
				Kdiag[edof[i]-1] += Math.pow(this.x[ely][elx],this.penal)*this.KE[i][i];
				for(j=0;j<edof.length;j++){
					if(Kind[edof[i]-1].indexOf(edof[j]-1)>-1){
						Kval[edof[i]-1][Kind[edof[i]-1].indexOf(edof[j]-1)]+=Math.pow(this.x[ely][elx],this.penal)*this.KE[i][j];
						if(Kval[edof[i]-1][Kind[edof[i]-1].indexOf(edof[j]-1)]==0){
							Kval[edof[i]-1].splice(Kind[edof[i]-1].indexOf(edof[j]-1),1);
							Kind[edof[i]-1].splice(Kind[edof[i]-1].indexOf(edof[j]-1),1);}
					}
					else{
						Kind[edof[i]-1].push(edof[j]-1);
						Kval[edof[i]-1].push(Math.pow(this.x[ely][elx],this.penal)*this.KE[i][j]);
					}
				}
			}
		}
	}
	Find.push(2*(this.attachedIDx*(this.nely+1)+this.attachedIDy));
	Find.push(2*(this.attachedIDx*(this.nely+1)+this.attachedIDy)+1);
	Fval.push(this.pointForceX);
	Fval.push(this.pointForceY);
//	Find.push(6);Fval.push(1);
//	Find.push(111);Fval.push(-1);
//	Find.push(89);Fval.push(-1);
//	Find.push(67);Fval.push(-1);
//	for(i=0;i<2*(this.nelx+1)*(this.nely+1)-1;i++){
//		if(Math.round(i/2)==i/2&&i<2*(this.nely+1)){
//			fixeddofs.push(i);
//		}
//		else{
//			freedofs.push(i);
//		}
//	}
//	fixeddofs.push(2*(this.nelx+1)*(this.nely+1)-1);
	for(i=0;i<2*(this.nelx+1)*(this.nely+1)-1;i++){
		if((i-2*this.nely)%(2*(this.nely+1))==0||(i-2*this.nely-1)%(2*(this.nely+1))==0){fixeddofs.push(i);}
		else{freedofs.push(i);}
	}
	var FindSolve = [];var FvalSolve = []; 
	var KdiagSolve = new Array(freedofs.length);
	var KindSolve = new Array(freedofs.length);
	var KvalSolve = new Array(freedofs.length);
	for(i=0;i<freedofs.length;i++){
		KindSolve[i]=[];KvalSolve[i]=[];
	}
	var Usolve;
	for(i=0;i<freedofs.length;i++){
		if(Find.indexOf(freedofs[i])>-1){
			FindSolve.push(i);
			FvalSolve.push(Fval[Find.indexOf(freedofs[i])]);
		}
		KdiagSolve[i] = Kdiag[freedofs[i]];
		if(Kind[freedofs[i]].length>0){
			for(j=0;j<Kind[freedofs[i]].length;j++){
				if(freedofs.indexOf(Kind[freedofs[i]][j])>-1){
					KindSolve[i].push(freedofs.indexOf(Kind[freedofs[i]][j]));
					KvalSolve[i].push(Kval[freedofs[i]][j]);
				}
			}			
		}
	}
	s = new linearSolver(KdiagSolve,KindSolve,KvalSolve,FindSolve,FvalSolve);
	Usolve = s.solve();
	for(i=0;i<freedofs.length;i++){
		U[freedofs[i]] = Usolve[i];
	}
	return U;
};

topology.prototype.lk = function(){
	var nu = this.nu;
	var E = this.E;
	var k = [1/2-nu/6,1/8+nu/8,-1/4-nu/12,-1/8+3*nu/8,-1/4+nu/12,-1/8-nu/8,nu/6,1/8-3*nu/8];
	var a = E/(1-nu*nu);
	this.KE = [[a*k[0],a*k[1],a*k[2],a*k[3],a*k[4],a*k[5],a*k[6],a*k[7]],
	          [a*k[1],a*k[0],a*k[7],a*k[6],a*k[5],a*k[4],a*k[3],a*k[2]],
	          [a*k[2],a*k[7],a*k[0],a*k[5],a*k[6],a*k[3],a*k[4],a*k[1]],
	          [a*k[3],a*k[6],a*k[5],a*k[0],a*k[7],a*k[2],a*k[1],a*k[4]],
	          [a*k[4],a*k[5],a*k[6],a*k[7],a*k[0],a*k[1],a*k[2],a*k[3]],
	          [a*k[5],a*k[4],a*k[3],a*k[2],a*k[1],a*k[0],a*k[7],a*k[6]],
	          [a*k[6],a*k[3],a*k[4],a*k[1],a*k[2],a*k[7],a*k[0],a*k[5]],
	          [a*k[7],a*k[2],a*k[1],a*k[4],a*k[3],a*k[6],a*k[5],a*k[0]]];
};

topology.prototype.quadM = function(a,B){
	var z = 0;
	var aB = [];
	var i = 0;var j = 0; 
	for(i=0;i<a.length;i++){
		aB.push(0);
		for(j=0;j<a.length;j++){
			aB[i]+=a[j]*B[j][i];
		}
		z+=aB[i]*a[i];
	}
	return z;
};

function linearSolver(Adiag,Aind,Aval,bind,bval){
	this.Adiag = Adiag.slice(0);
	this.Aind = Aind.slice(0);
	this.Aval = Aval.slice(0);
	this.bind = bind.slice(0);
	this.bval = bval.slice(0);
	this.l = Adiag.length;
}

linearSolver.prototype.incompleteCholesky = function(){
	var Ad_ = this.Adiag.slice(0);
	var Ai_ = this.Aind.slice(0);
	var Av_ = this.Aval.slice(0);
	var l = this.l;
	var Ldiag = new Array(this.l);
	var Lind = new Array(this.l);
	var Lval = new Array(this.l);
	var k,i,j,normw,I,minmaxw;
	for(j=0;j<l;j++){
		Lind[j]=[];
		Lval[j]=[];
	}
	for(j=0;j<l;j++){
		Ad_[j] = Math.sqrt(Ad_[j]);
		Ldiag[j] = Ad_[j];
		for(k=0;k<Ai_[j].length;k++){
			kid = Ai_[j][k];
			if(kid<j){
				for(i=j+1;i<l;i++){
					if(Ai_[i].indexOf(kid)>-1){
						if(Ai_[i].indexOf(j)>-1){
							Av_[i][Ai_[i].indexOf(j)]-=Av_[i][Ai_[i].indexOf(kid)]*Av_[j][k];
						}
						else{
							Av_[i].push(-Av_[i][Ai_[i].indexOf(kid)]*Av_[j][k]);
							Ai_[i].push(j);
						}	
					}

				}				
			}

		}
		for(i=j+1;i<l;i++){
			if(Ai_[i].indexOf(j)>-1){
				Av_[i][Ai_[i].indexOf(j)] /= Ad_[j];
				Lval[i].push(Av_[i][Ai_[i].indexOf(j)]);
				Lind[i].push(j);
				Ad_[i] -= Av_[i][Ai_[i].indexOf(j)]*Av_[i][Ai_[i].indexOf(j)];
			}
		}
		
	}
	this.Ldiag = Ldiag;
	this.Lind = Lind;
	this.Lval = Lval;
};

linearSolver.prototype.sparseSolve=function(bind,bval){
	var l = this.l;
	var i,j,t;
	var y = new Array(l);
	var x = y;
	for(i=0;i<l;i++){
		t=0;
		for(j=0;j<this.Lind[i].length;j++){
			t+=this.Lval[i][j]*y[this.Lind[i][j]];
		}
		if(bind.indexOf(i)>-1){
			y[i] = (bval[bind.indexOf(i)]-t)/this.Ldiag[i];
		}else{
			y[i] = -t/this.Ldiag[i];
		}
		
	}
	for(i=l-1;i>=0;i--){
		t=0;
		for(j=l-1;j>i;j--){
			if(this.Lind[j].indexOf(i)>-1){
				t+=this.Lval[j][this.Lind[j].indexOf(i)]*x[j];
			}
		}
		x[i] = (y[i]-t)/this.Ldiag[i];
	}
	return x;
};

linearSolver.prototype.solve = function(){
//	var t, k; var count = 0;
//	var l = this.l;
//	var rnorm = 0; var rnorm_ = 0; 
//	var alpha, alpha_;
//	var p = new Array(l);
//	var r = new Array(l);
//	var z = new Array(l);
//	var x;
//	var Ap = new Array(l);
	this.incompleteCholesky();
	var x = this.sparseSolve(this.bind,this.bval);
//	for(t=0;t<l;t++){
//		x[t] = 0;
//		r[t] = this.b[t];
//	}
//	z = this.sparseSolve(r);
//	p = z;
//	
//	while(count<1e2){
//		count++;
//		alpha_ = 0;
//		for(t=0;t<l;t++){
//			Ap[t] = 0;
//			rnorm+=r[t]*z[t];
//			for(k=0;k<l;k++){
//				Ap[t] += this.A[t][k]*p[k];
//			}
//			alpha_ +=p[t]*Ap[t];
//		}
//		alpha = rnorm/alpha_;
//		for(t=0;t<l;t++){
//			x[t]+=alpha*p[t];
//			r[t]-=alpha*Ap[t];
//		}
//		rnorm_ = 0;
//		for(t=0;t<l;t++){
//			rnorm_+=r[t]*z[t];
//		}
//		if (rnorm_<1e-3){
//			for(t=0;t<l;t++){
//				x[t]-=a[t];
//			}
//			return x;
//		}
//		z = this.sparseSolve(r);
//		for(t=0;t<l;t++){
//			p[t]=p[t]*rnorm_/rnorm+z[t];
//		}
//		rnorm = rnorm_;
//	}
	return x;
};

game.prototype.prehandleEvent=function(a){
    a.preventDefault();
    var b=$("#"+this.main_scene_id).offset();
    a.x=a.pageX-b.left;
    a.y=a.pageY-b.top;
};

game.prototype.click=function(a){
	if(!simulated&&!dragging){
		var x = a.x - this.topology.inileft;
		var y = a.y - this.topology.initop;
		var elx = Math.floor(x/(this.topology.w+this.topology.m));
		var ely = Math.floor(y/(this.topology.l+this.topology.m));
		var left = (this.topology.w+this.topology.m)*elx+this.topology.inileft;
		var top = (this.topology.l+this.topology.m)*ely+this.topology.initop;
		if(this.topology.x[ely][elx]==0.01){
			this.context.fillStyle="rgba(0,0,0,1.0)";
			this.context.fillRect(left,top,this.topology.w,this.topology.l);
			this.topology.x[ely][elx]=1;
		}
		else{
			this.context.fillStyle="rgba(255,255,255,1.0)";
			this.context.fillRect(left,top,this.topology.w,this.topology.l);
			this.topology.x[ely][elx]=0.01;		
		}		
	}
};

game.prototype.mousedown=function(a){
	MOUSEDOWN = true;
	if(CTRL&&!simulated){
		if(pointForce&&this.forceAttached){
			this.x=a.x,this.y=a.y;
		}
	}
};

game.prototype.mousemove=function(a){
	if(!simulated){
		if(pointForce){
			if(CTRL&&!MOUSEDOWN){
				var m = 5;
				if(a.x>this.topology.inileft-m&&
				a.x<this.topology.inileft+(this.topology.w+this.topology.m)*this.topology.nelx+m&&
				a.y>this.topology.initop-m&&
				a.y<this.topology.initop+(this.topology.l+this.topology.m)*this.topology.nely+m){
					var dx = a.x - this.topology.inileft;
					var dy = a.y - this.topology.initop;
					var IDx = Math.round(dx/this.topology.w);
					var IDy = Math.round(dy/this.topology.l);
					this.topology.forceAttached = true;
					if(IDx!=this.topology.attachedIDx||IDy!=this.topology.attachedIDy){
						var x = this.topology.attachedIDx*(this.topology.w+this.topology.m)+this.topology.inileft;
						var y = this.topology.attachedIDy*(this.topology.l+this.topology.m)+this.topology.initop;
						this.miscContext.clearRect(x-5,y-5,10,10);
						this.topology.attachedIDx = IDx;this.topology.attachedIDy = IDy;
						x = IDx*(this.topology.w+this.topology.m)+this.topology.inileft;
						y = IDy*(this.topology.l+this.topology.m)+this.topology.initop;
						this.miscContext.fillStyle = "#FF1C0A";
						this.miscContext.beginPath();
						this.miscContext.arc(x, y, 5, 0, Math.PI*2, true); 
						this.miscContext.closePath();
						this.miscContext.fill();
					}
				}
				else{this.topology.forceAttached = false;}
			}
			else if(CTRL&&MOUSEDOWN&&this.topology.forceAttached){
				dragging = true;
				var x = this.topology.attachedIDx*(this.topology.w+this.topology.m)+this.topology.inileft;
				var y = this.topology.attachedIDy*(this.topology.l+this.topology.m)+this.topology.initop;
				if(this.tempx&&this.tempy){
					this.miscContext.clearRect(0,0,this.miscCanvas.width,this.miscCanvas.height);
				}
				this.miscContext.fillStyle = "#FF1C0A";
				this.miscContext.beginPath();
				this.miscContext.arc(x, y, 5, 0, Math.PI*2, true); 
				this.miscContext.closePath();
				this.miscContext.fill();
				this.miscContext.strokeStyle = "#FF1C0A";
				this.miscContext.beginPath();
				this.miscContext.moveTo(x,y);
				this.miscContext.lineTo(a.x,a.y);
				this.miscContext.stroke();
				this.tempx = a.x; this.tempy = a.y;
			}
		}
	}
};
game.prototype.mouseup=function(a){
	MOUSEDOWN = false;
	if(CTRL&&!simulated&&(a.x-this.x)*(a.y-this.y)!=0){
		simulated = true;
		var x = this.topology.attachedIDx*(this.topology.w+this.topology.m)+this.topology.inileft;
		var y = this.topology.attachedIDy*(this.topology.l+this.topology.m)+this.topology.initop;
		this.miscContext.fillStyle = "#FF1C0A";
		this.miscContext.beginPath();
		this.miscContext.arc(x, y, 5, 0, Math.PI*2, true); 
		this.miscContext.closePath();
		this.miscContext.fill();
		this.topology.update(a.x,a.y,x,y);
		this.topology.simulate();
	}
};
game.prototype.dblclick=function(a){
	if(simulated){
		simulated = false, CTRL = false, MOUSEDOWN = false, dragging = false;
		this.miscContext.clearRect(0,0,this.miscCanvas.width,this.miscCanvas.height);
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.topology.draw();
		this.topology.attachedIDx=-1;
		this.topology.attachedIDy=-1;
		this.topology.forceAttached = false;
		this.topology.pointForceX = 0;
		this.topology.pointForceY = 0;
	}
};
game.prototype.keydown=function(a){
	if(a.keyCode==17){CTRL=true;}};
game.prototype.keyup=function(a){
	if(a.keyCode==17&&!simulated){
		CTRL=false;
		var x = this.topology.attachedIDx*(this.topology.w+this.topology.m)+this.topology.inileft;
		var y = this.topology.attachedIDy*(this.topology.l+this.topology.m)+this.topology.initop;
		this.miscContext.clearRect(x-5,y-5,10,10);
	}
};

//topology.prototype.mouseover=function(a){
//	var x = a.x - this.inileft;
//	var y = a.y - this.initop;
//	var elx = Math.floor(x/(this.w+this.m));
//	var ely = Math.floor(y/(this.l+this.m));
//	var left = (this.w+this.m)*elx+this.inileft;
//	var top = (this.l+this.m)*ely+this.initop;
//	this.context.fillStyle="rgba(0,0,0,0.3)";
//	this.context.fillRect(left,top,this.w,this.l);
//};

var canvas_dragging=null,canvas_over=null;
var simulated = false, CTRL = false, MOUSEDOWN = false, pointForce = true, dragging = false;

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