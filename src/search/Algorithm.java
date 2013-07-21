package search;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import org.json.*;
import org.apache.commons.math.genetics.*;
import java.util.logging.Logger;

/** Static methods for retrieving information about cities.
 *  <p>
 *  From <a href="http://courses.coreservlets.com/Course-Materials/">the
 *  coreservlets.com tutorials on servlets, JSP, Struts, JSF, Ajax, GWT, 
 *  Spring, Hibernate/JPA, and Java programming</a>.
 */

public class Algorithm {
	private double[][] X;
	private int p;
	private int n;
	private double lambda;
	private double[] w;
//	private double[][] x;
	private double[][] G;
	private int[][] IND;
//	private double[][] R;
//	private int iter;
	private String method;
	private int nsample;
	private double[] mean;
	private double[] std;
	
	private static final Logger log = Logger.getLogger(Algorithm.class.getName());
	
	public static String doSVM(String quest) throws IOException, JSONException{
		Algorithm t = new Algorithm();
		return t.SVMtrain(quest);
	}
	public static String doCal(String quest) throws IOException, JSONException{
		Algorithm t = new Algorithm();
		return t.parse(quest);
	}
	
	public String SVMtrain(String data) throws JSONException {
		  
		  JSONObject js = new JSONObject(data);
		  p = js.getInt("dim");
		  n = js.getInt("num");
		  
		  JSONArray X_temp = js.getJSONArray("dat");
		  JSONArray G_temp = js.getJSONArray("lab");
		  X = JSONM2J(X_temp);
		  G = JSONM2J(G_temp);
		  
		  System.out.print("start learning with ranking SVM... \n");
		  
		  train();
		  
		  JSONObject sj = new JSONObject();
		  sj.put("IND", IND);
		  sj.put("lambda", lambda);
		  sj.put("w", w);
		  sj.put("X", X);
		  sj.put("nsample", 0);
		  sj.put("mean",mean);
		  sj.put("std",std);
		  String s = sj.toString();
		  return(s);
	}
	
	private void train(){
		//rankSVM
		System.out.print("start rankSVM... \n");
		int i; int j;

		double[][] F = calFeature(X);
		int nfeature = F[0].length;
		mean = new double[nfeature];
		std = new double[nfeature];
		lambda = 1.0/nfeature;
		double[][] FBar = featureNormalize(F);
		System.out.print("features done... \n");
		
		int count = 0;
		for (i = 0; i<G.length; i++){
			for (j = 0; j<G.length; j++){
				if (G[i][j]==1){
					count++;
				}
			}
		}
		System.out.print("\n");
		
		IND = new int[count][2];
		if (count==0)return;
		System.out.print("counting pairwise comparisons done... \n");

		double[][] H = new double[count][count];
		double[] minusOne = new double[count];
		
		int cc = 0;
		for (i = 0; i<G.length; i++){
			for (j = 0; j<G.length; j++){
				if (G[i][j]==1){
					IND[cc][0] = i; IND[cc][1] = j;
					cc++;
				}
			}
		}
		for (i = 0; i<count; i++){
			for (j=0; j<count; j++){
				H[i][j] = kernel(FBar[IND[i][0]],FBar[IND[j][0]])+kernel(FBar[IND[i][1]],FBar[IND[j][1]])
				-kernel(FBar[IND[i][0]],FBar[IND[j][1]])-kernel(FBar[IND[i][1]],FBar[IND[j][0]]);
			}
			minusOne[i] = -1;
		}
		System.out.print("hessian done... \n");
		
		Solver s = new Solver();
		s.Solve(count, H, minusOne, 1E-3);
		w = s.alpha;
	}
	
	private double kernel(double[] v1, double[] v2) {
		int l = v1.length;
		double k = 0;
		for (int i = 0;i<l;i++){
			k+= (v1[i]-v2[i])*(v1[i]-v2[i]);
		}
		k*=lambda;
		k = Math.exp(-k);
		return k;
	}
	private double[][] featureNormalize(double[][] phi) {
		int i = phi.length;
		int j = phi[0].length;
		double mean1;
		double std1;
		double[][] normalizedPhi = new double[i][j];
		for (int k = 0;k<j;k++){
			mean1 = 0; std1 = 0;
			for (int l = 0;l<i;l++){
				mean1+= phi[l][k];
			}
			mean1 = mean1/i;
			for (int l = 0;l<i;l++){
				std1+=(phi[l][k]-mean1)*(phi[l][k]-mean1);
			}
			std1 = Math.sqrt(std1/i);
			if (Math.abs(std1)<1e-6){
				std1=1.0;
			}
			for (int l = 0;l<i;l++){
				normalizedPhi[l][k]=(phi[l][k]-mean1)/std1;
			}
			mean[k] = mean1;
			std[k] = std1;
		}
		return normalizedPhi;
	}
	
	private double[][] calFeature(double[][] X){
		// this is hard coded feature calculation
		int ncp = 24;
		int pfeature = ncp*(ncp-1)/2;
		double[][] features = new double[n][pfeature];
		for (int i = 0; i<n; i++){
			ControlPoints cp = new ControlPoints();
			double[][] controlPoints = cp.getControlPoints(X[i]);
			features[i] = getFeatures(controlPoints, pfeature);
		}
		return features;
	}
	private double[] calOneFeature(double[] x){
		int ncp = 24;
		int pfeature = ncp*(ncp-1)/2;
		ControlPoints cp = new ControlPoints();
		double[][] controlPoints = cp.getControlPoints(x);
		double[] feature = getFeatures(controlPoints, pfeature);
		return feature;
	}
	
	private double[] getFeatures(double[][] controlPoints, int pfeature) {
		int n = controlPoints.length;
		int p = controlPoints[0].length;
		int id;
		double[] features = new double[pfeature];
		for (int i = 0; i<n-1; i++){
			for (int j = i+1; j<n; j++){
				id = (n-1+n-1-(i-1))*i/2 + (j-i) - 1; 
				features[id] = 0;
				for (int k = 0; k<p; k++){
					features[id]+=(controlPoints[i][k]-controlPoints[j][k])*(controlPoints[i][k]-controlPoints[j][k]);
				}
				features[id] = Math.sqrt(features[id]);
			}
		}
		return features;
	}
	
	private String parse(String array) throws JSONException {
		  JSONObject js = new JSONObject(array);
		  p = js.getInt("dim");
		  n = js.getInt("num");
//		  iter = js.getInt("iter");
		  method = js.getString("method_name");
		  
		  JSONObject svmPar = new JSONObject(js.getString("svmPar"));

		  lambda = svmPar.getDouble("lambda");
		  w = JSON2J(svmPar.getJSONArray("w"));
		  X = JSONM2J(svmPar.getJSONArray("X"));
		  IND = JSONMI2J(svmPar.getJSONArray("IND"));
		  nsample = svmPar.getInt("nsample"); 
		  mean = JSON2J(svmPar.getJSONArray("mean"));
		  std = JSON2J(svmPar.getJSONArray("std"));
		  
	  	  System.out.print("\nstart searching with method: "+method+"... \n");
		  String s = null;
		  if (w.length==0){
			  Scatter_null();
			  svmPar.put("X", new JSONArray(X));
			  svmPar.put("nsample", nsample++);
			  js.put("svmPar", svmPar);
			  s = js.toString();
			  s = "data="+s;
		  }
		  else {
			  Scatter();
			  svmPar.put("X", new JSONArray(X));
			  svmPar.put("nsample", nsample++);
//			  if(method.equals("ego")){svmPar.put("R", new JSONArray(R));}
			  js.put("svmPar", svmPar);
			  s = js.toString();
			  s = "data="+s;
		  }
		  return(s);	  
	  }
	
	private void Scatter() throws JSONException{
		// Get new points
		if (method.equals("ego")) {
			List<Double> temp = scatterGA();
			double[] t = new double[p];
			for (int j = 0; j<temp.size(); j++){
				 t[j]= temp.get(j);
			}
			X = arrayadd(t,X);
//			R = updateR(t);
		}
	}

	private void Scatter_null() throws JSONException{
		// Get new points
		double[] t = new double[p];
		for (int j = 0; j<p; j++){
			t[j] = Math.random();
		}
		X = arrayadd(t,X);
	}
	
	// solve EGO using inner GA
	private List<Double> scatterGA(){
		int POP_LIMIT = 50;
		int TOURNAMENT_ARITY = POP_LIMIT;
		int NUM_GENERATIONS = 100;
		double CROSSOVER_RATE = 1;
		double ELITISM_RATE = 0.9;
		double MUTATION_RATE = 0.1;
		double[][] SV = new double[X.length-nsample][]; 
		for (int i=0;i<SV.length;i++) SV[i] = X[i];
		
		CrossoverPolicy crossoverPolicy = new OnePointCrossover<Integer>();
		MutationPolicy mutationPolicy = new RealMutation();
		SelectionPolicy selectionPolicy = new TournamentSelection(TOURNAMENT_ARITY);
		GeneticAlgorithm ga = new GeneticAlgorithm(crossoverPolicy, CROSSOVER_RATE, 
				mutationPolicy, MUTATION_RATE, selectionPolicy, X, SV, w, lambda, mean, std, IND);
		
		Population initial = getInitialPopulation(POP_LIMIT, ELITISM_RATE);
		StoppingCondition stopCond = new FixedGenerationCount(NUM_GENERATIONS);
		System.out.print("GA started running...\n");
		Population finalPopulation = ga.evolve(initial, stopCond);
		RealChromosome bestFinal = (RealChromosome) finalPopulation.getFittestChromosome();
		
		List<Double> solution = bestFinal.getRepresentation();
		System.out.print("GA finished...\n");
		return solution;
	}
	
	private Population getInitialPopulation(int POP_LIMIT, double ELITISM_RATE) {
		List<Chromosome> chromosomes = initializeChromosomes(POP_LIMIT);
		Population pop = new ElitisticListPopulation(chromosomes, POP_LIMIT, ELITISM_RATE);
		return pop;
	}

	private List<Chromosome> initializeChromosomes(int POP_LIMIT) {
		List<Chromosome> chromosomes = new ArrayList<Chromosome>(POP_LIMIT);
		for (int i = 0; i<POP_LIMIT; i++){
			List<Double> representation = RealChromosome.randomRealRepresentation(p);
			chromosomes.add(new RealChromosome(representation, calculateFitness(list2prim(representation))));
		}
		return chromosomes;
	}

	private double calculateFitness(double[] c) {
		double f = decisionf(c);
		double fitness = merit(1.0,1.0,f,0);
		return fitness;
	}
	
	private double merit(double w1, double w2, double f, double s) {
		double fitness = w1*f+w2*s;
		return fitness;
	}
	
	private double[] list2prim(List<Double> l) {
		double[] x = new double[l.size()];
		for (int i = 0; i<x.length; i++) {
			x[i] = l.get(i);
		}
		return x;
	}

	private double[][] arrayadd(double[] src, double[][] dst) {
		if (dst!=null){
			double[][] out = new double[1+dst.length][dst[0].length];
			for (int i = 0; i<dst.length; i++) {
				out[i] = dst[i];
			}
			out[dst.length] = src;
			return out;
		}
		else {
			double[][] out = new double[1][src.length];
			out[0] = src;
			return out;
		}
	}

	private double decisionf(double[] x){
		double f = 0;
		int l = w.length;
		double[] feature = calOneFeature(x);
		for (int i = 0; i<l; i++){
			feature[i]= (feature[i]-mean[i])/std[i];
		}
		double[] goodfeature; double[] badfeature;
		for (int i = 0; i<w.length;i++){
			goodfeature = calOneFeature(X[IND[i][0]]);
			badfeature = calOneFeature(X[IND[i][1]]);
			for (int j = 0; j<l; j++){
				goodfeature[j]= (goodfeature[j]-mean[j])/std[j];
				badfeature[j]= (badfeature[j]-mean[j])/std[j];
			}
			f+= w[i]*(kernel(goodfeature,feature)-kernel(badfeature,feature));
		}
		return f;
	}
	
	private double[] JSON2J(JSONArray a){
		double[] b = new double[a.length()];
		for (int i=0;i<a.length();i++){
			try {
				b[i] = a.getDouble(i);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		return b;
	}
	private double[][] JSONM2J(JSONArray a){
		int pp = 0;
		try {
			pp = a.getJSONArray(0).length();
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		double[][] b = new double[a.length()][pp];

		for (int i=0;i<a.length();i++){
			for (int j=0;j<pp;j++){
				try {
					b[i][j] = a.getJSONArray(i).getDouble(j);
				} catch (JSONException e) {
					e.printStackTrace();
				}				
			}
		}
		return b;
	}
	private int[][] JSONMI2J(JSONArray a){
		int pp = 0;
		try {
			pp = a.getJSONArray(0).length();
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		int[][] b = new int[a.length()][pp];

		for (int i=0;i<a.length();i++){
			for (int j=0;j<pp;j++){
				try {
					b[i][j] = a.getJSONArray(i).getInt(j);
				} catch (JSONException e) {
					e.printStackTrace();
				}				
			}
		}
		return b;
	}
	public static void quicksort(double[] main, int[] index) {
	    quicksort(main, index, 0, index.length - 1);
	}
	public static void quicksort(double[] a, int[] index, int left, int right) {
	    if (right <= left) return;
	    int i = partition(a, index, left, right);
	    quicksort(a, index, left, i-1);
	    quicksort(a, index, i+1, right);
	}
	// partition a[left] to a[right], assumes left < right
	private static int partition(double[] a, int[] index, 
	int left, int right) {
	    int i = left - 1;
	    int j = right;
	    while (true) {
	        while (less(a[++i], a[right]))      // find item on left to swap
	            ;                               // a[right] acts as sentinel
	        while (less(a[right], a[--j]))      // find item on right to swap
	            if (j == left) break;           // don't go out-of-bounds
	        if (i >= j) break;                  // check if pointers cross
	        exch(a, index, i, j);               // swap two elements into place
	    }
	    exch(a, index, i, right);               // swap with partition element
	    return i;
	}
	// is x < y ?
	private static boolean less(double x, double y) {
	    return (x < y);
	}
	// exchange a[i] and a[j]
	private static void exch(double[] a, int[] index, int i, int j) {
	    double swap = a[i];
	    a[i] = a[j];
	    a[j] = swap;
	    int b = index[i];
	    index[i] = index[j];
	    index[j] = b;
	}
	
	private Algorithm() {} // Uninstantiatable class
}