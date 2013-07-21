package search;

public class Solver {
	double[][] Q;
	double[] G;
	public double[] alpha;
	double eps;
	double[] p;
	int[] alpha_status;
	int alpha0;
	int l;
	
	void update_alpha_status()
	{
		alpha0 = 0;
		for (int i=0;i<alpha.length;i++){
			if(Math.abs(alpha[i])<eps){
				alpha_status[i] = 0;
				alpha0++;
			}
			else alpha_status[i] = 1;
		}
	}
	boolean is_lower_bound(int i) { return alpha_status[i] == 0; }
	boolean is_free(int i) {  return alpha_status[i] == 1; }

	public void Solve(int l_, double[][] Q_, double[] p_, double eps_)
	{	
		System.out.print("==== start solving rankSVM ==== \n");
		this.Q = Q_;
		this.l = l_;
		this.p = (double[])p_.clone();
		this.eps = eps_;
		this.alpha = new double[l];
		this.alpha_status = new int[l];
		this.G = new double[l];
		int count = 0;
		boolean con = true;
		int i; int j;
		int k; int t; int ind; int ind2;
		double[][] Qid;
		double[] aid; double[] oldai; 
		double oldi; double oldj;
		double[] pid;
		double Gnorm; double dinorm; int Gpos;
		int[] set;
		
		if (l == 1){
			alpha[0] = Q[0][0];
		}
		else{
			while (con&&count<1e3){
				System.out.print("*");
					if (count+1>=l){
						i = 0;
						j = count;
					}
					else{
						i = count + 1;
						j = count;
					}

				if(i>=l||j>=l){
					i = (int) Math.floor(l*Math.random());
					j = (int) Math.floor(l*Math.random());
					while (i == j){j = (int) Math.floor(l*Math.random());}
				}

				for (k=0;k<l;k++){
					alpha[k] = 0;
				}

				alpha[i] = -p[i]/Q[i][i];
				update_alpha_status();
				
				for (k=0;k<l;k++){
					G[k] = p[k];
					for (t=0;t<l;t++){
						G[k] += Q[k][t]*alpha[t];
					}
					if (Math.abs(G[k])<eps)G[k]=0;
				}
				int iter = 0;
				
				Gpos = 0;
				for (k=0;k<l;k++){
					if (is_lower_bound(k))
						if (G[k]>-eps)
							Gpos++;
				}
				
				if ((Gpos==l-1) && alpha[i]>eps)
					con = false;
				
				while (con) {
					iter++;
					if (iter>2000){
						count++;break;					
					}
					if (j==-1){
						System.out.print("+");
						double[] di;
						Qid = new double[l-alpha0][l-alpha0];
						aid = new double[l-alpha0];
						pid = new double[l-alpha0];
						oldai = new double[l-alpha0];
						ind = 0;
						for (k=0;k<l;k++){
							if (alpha_status[k]>0){
								aid[ind] = alpha[k];
								oldai[ind] = alpha[k];
								pid[ind] = p[k];
								ind2 = 0;
								for (t=0;t<l;t++){
									if (alpha_status[t]>0){
										Qid[ind][ind2] = Q[k][t];
										ind2++;
									}
								}
								ind++;
							}
						}
						di = solvedi(Qid,aid,pid);
						for (k=0;k<l-alpha0;k++){
							aid[k] = Math.max(aid[k]+di[k], 0);
							di[k] = aid[k]-oldai[k];
						}
						Gnorm = 0;dinorm = 0;
						Gpos = 0;
						for (k=0;k<l;k++){
							ind=0;
							for (t=0;t<l;t++){
								if (alpha_status[t]>0){
									G[k]+=Q[k][t]*di[ind];
									ind++;
								}
							}
							if (Math.abs(G[k])<eps)G[k]=0;
							ind=0;
							if (alpha_status[k]>0){
								Gnorm+=G[k]*G[k];
								dinorm+=di[ind]*di[ind];
								ind++;
							}
							if (G[k]>-1E-3)
								Gpos++;
						}
						ind = 0;
						for (k=0;k<l;k++){
							if (alpha_status[k]>0){
								alpha[k] = aid[ind];
								ind++;
							}
						}
						update_alpha_status();
						set = selectB();
						i = set[0]; j = set[1];
						if ((Gnorm<0.05||dinorm<eps) && Gpos == l){
							con = false;
							System.out.print("==== rankSVM done normaly ====\n");
						}
					}
					else {
						System.out.print(".");
						double di = -(G[i]*Q[i][i]-G[j]*Q[i][j])/(Q[i][i]*Q[j][j]-Q[i][j]*Q[i][j]);
						double dj = -(G[j]*Q[i][i]-G[i]*Q[i][j])/(Q[i][i]*Q[j][j]-Q[i][j]*Q[i][j]);
						oldi = alpha[i]; oldj = alpha[j];
						alpha[i] = Math.max(alpha[i]+di, 0);
						alpha[j] = Math.max(alpha[j]+dj, 0);
						update_alpha_status();
						di = alpha[i]-oldi; dj = alpha[j]-oldj;
						if (Math.abs(di)+Math.abs(dj)<eps){
							count++;
							break;
						}
						for (k=0;k<l;k++){
							G[k]+=Q[k][i]*di+Q[k][j]*dj;
							if (Math.abs(G[k])<eps)G[k]=0;
						}
						set = selectB();
						i = set[0]; j = set[1];
					}
				}
			}
		if (count>=1e2){
			System.out.print("==== problem accured in solving rankSVM ====\n");
		}
		}
	}

	private double[] solvedi(double[][] A, double[] a, double[] b) {
		// implement conjugate gradient to solve Ax = b
		int t; int k; int count = 0;
		int l0 = l-alpha0;
		double rnorm = 0; double rnorm_; 
		double alpha; double alpha_;
		double[] p = new double[l0];
		double[] r = new double[l0];
		double[] x = new double[l0];
		double[] Ap = new double[l0];
		for(t=0;t<l0;t++){
			p[t] = -b[t];
			r[t] = p[t];
			x[t] = 0;
			rnorm+=r[t]*r[t];
		}
		
		while (count<1e3) {
			count++;
			alpha_ = 0;
			for(t=0;t<l0;t++){
				Ap[t] = 0;
				for(k=0;k<l0;k++){
					Ap[t] += A[t][k]*p[k];
				}
				alpha_ +=p[t]*Ap[t]; 
			}
			alpha = rnorm/alpha_;
			for(t=0;t<l0;t++){
				x[t]+=alpha*p[t];
				r[t]-=alpha*Ap[t];
			}
			rnorm_ = 0;
			for(t=0;t<l0;t++){
				rnorm_+=r[t]*r[t];
			}
			if (rnorm_<1E-6){
				for(t=0;t<l0;t++){
					x[t]-=a[t];
				}
				return x;
			}
			for(t=0;t<l0;t++){
				p[t]=p[t]*rnorm_/rnorm+r[t];
			}
			rnorm = rnorm_;
		}
		System.out.print("^^^ problem in solving linear equations ^^^\n");
		return x;
	}
	
	private int[] selectB(){
		int i = -1;
		int t;
		double Gmax = -1000000;
		double Gmin = 1000000;
		double di; double dj;
		double oldi; double oldj;
		double ai; double aj;
		
		for (t=0;t<l;t++){
			if (alpha[t]>eps){
				if (G[t]>Gmax){
					Gmax = G[t];
					i = t;
				}
			}
		}
		int j = -1;
		double objMin = 1000000;
		double obj;
		for (t=0;t<l;t++){
			if (Math.abs(alpha[t])<eps){
				if (G[t]<Gmin){
					Gmin = G[t];
				}
				if (Gmax - Gmin > eps){
					di = -(G[i]*Q[i][i]-G[t]*Q[i][t])/(Q[i][i]*Q[t][t]-Q[i][t]*Q[i][t]);
					dj = -(G[t]*Q[i][i]-G[i]*Q[i][t])/(Q[i][i]*Q[t][t]-Q[i][t]*Q[i][t]);
					oldi = alpha[i]; oldj = alpha[t];
					ai = Math.max(alpha[i]+di, 0);
					aj = Math.max(alpha[t]+dj, 0);
					if (ai>eps && aj>eps){
						di = ai-oldi; dj = aj-oldj;
						obj = 1.0/2.0*(Q[i][i]*di*di+Q[t][t]*dj*dj+2*Q[i][t]*di*dj)+G[i]*di+G[t]*dj;
						if (obj<=objMin){
							j = t;
							objMin = obj;
						}						
					}
				}
			}
		}
		int[] set = {i,j};
		return set;
	}
}
