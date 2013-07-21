package dao;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.apache.commons.lang.ArrayUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.Query;
import java.util.Date;

import java.util.Arrays;
import java.util.logging.Logger;
import libsvm.*;
import search.ControlPoints;
import search.Solver;


@SuppressWarnings("serial")
public class StoreServlet extends HttpServlet {
	private String G;
	private String allX;
	private String allY;
	private String allInd;
	private String bestInd;
	private String methodName;
	private String modelName;
	private String survey;
	private String track;
	private String color;
	private String X;
	
	private String label;
	private String[] labelArray;
	
	private double[] mean;
	private double[] std;
	
	static{
		ObjectifyService.register(Test.class);
		ObjectifyService.register(Design.class);
		ObjectifyService.register(Label.class);
		ObjectifyService.register(Performance.class);
	}
	
	private static final Logger log = Logger.getLogger(StoreServlet.class.getName());
	private void store(HttpServletRequest request,HttpServletResponse response)throws ServletException,IOException {

		Objectify ofy = ObjectifyService.begin(); 
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		String data = request.getParameter("data");
		try {
			parseDataStore(data);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		Test t = new Test(G,allX,allY,allInd,bestInd,methodName,modelName,survey,track,color);
		ofy.put(t);
		assert t.id != null;
	}
	
	private void create(HttpServletRequest request,HttpServletResponse response)throws ServletException,IOException, JSONException {
		Objectify ofy = ObjectifyService.begin(); 
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		String data = request.getParameter("data");
		try {
			parseDataCreate(data);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		Design d = new Design(X,label,color);
		ofy.put(d);
		assert d.id != null;
		
		if(labelArray != null){
			JSONObject js = new JSONObject(data);
			JSONArray x_ = js.getJSONArray("X");
			double[][] x__ = JSONM2J(x_);
			double[] x = x__[0];
			for(int i=0;i<labelArray.length;i++){
				Label l = ofy.query(Label.class).filter("name",labelArray[i]).get();
				if (l != null){
					l = updateLabel(x,l);
					ofy.put(l);					
				}
				else{
					Label newl = new Label(labelArray[i],X,"[1]","[0]","[1]","","","","");
					ofy.put(newl);
				}
			}
		}
	}
	
	private void readlabel(HttpServletRequest request,HttpServletResponse response)throws ServletException,IOException, JSONException {
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		PrintWriter out = response.getWriter();
		Objectify ofy = ObjectifyService.begin();
		Query<Label> q = ofy.query(Label.class);
		if(q.count()>0){
			String[] label_ = new String[q.count()];
			String[] sv_indices_ = new String[q.count()];
			String[] rho_ = new String[q.count()];
			String[] sv_coef_ = new String[q.count()];
			String[] points_ = new String[q.count()];
			int count = 0;
			for(Label l:q){
				label_[count] = l.name; 
				sv_indices_[count] = l.sv_indices;
				rho_[count] = l.rho;
				sv_coef_[count] = l.sv_coef;
				points_[count] = l.X;
				count++;
			}
			JSONObject sj = new JSONObject();
			sj.put("name", label_);
			sj.put("sv_indices", sv_indices_);
			sj.put("rho", rho_);
			sj.put("sv_coef", sv_coef_);
			sj.put("X", points_);
			out.print(sj);	
		}
		else{out.print("");}
	}
	
	private void read(HttpServletRequest request,HttpServletResponse response)
	throws ServletException, IOException {
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		PrintWriter out = response.getWriter();
		String query = request.getParameter("query");

		// Read data from Datastore
		Objectify ofy = ObjectifyService.begin();
		Query<Test> q = ofy.query(Test.class);
		int n = q.count();
		if (query.equals("all")){
			out.print(n+"");
		}
		else{
			int i = Integer.parseInt(query);
//			QueryResultIterator<Test> iterator = q.iterator();
			int count = 0;
			String s = null;
			for(Test t:q){
				if (count == i){
					try {
						s = parseDataRead(t);
					} catch (JSONException e) {
						e.printStackTrace();
					}
					break;
				}else{count++;}
			}
			out.print(s);
		}
	}

	private void parseDataStore(String data) throws JSONException{
		JSONObject js = new JSONObject(data);
		G = js.getJSONArray("G").toString();
		allX = js.getJSONArray("allX").toString();
		allY = js.getJSONArray("allY").toString();
		allInd = js.getJSONArray("allInd").toString();
		bestInd = js.getJSONArray("bestInd").toString();
		methodName = js.getString("methodName");
		modelName = js.getString("modelName");
		survey = js.getJSONArray("survey").toString();
		track = js.getJSONArray("track").toString();
		color = js.getJSONArray("color").toString();
	}
	
	private void parseDataCreate(String data) throws JSONException{
		JSONObject js = new JSONObject(data);
		X = js.getJSONArray("X").toString();
		JSONArray temp = js.getJSONArray("label");
		if(temp.length()>0){
			labelArray = new String[temp.length()];
			for(int i=0;i<temp.length();i++){
				labelArray[i] = temp.getString(i).toLowerCase();
			}
		}
//		label = js.getJSONArray("label").toString();
//		color = js.getJSONArray("color").toString();
	}

	private String parseDataRead(Test t) throws JSONException{
		JSONObject sj = new JSONObject();
		sj.put("id", t.id);
		sj.put("G", t.G);
		sj.put("allX", t.allX);
		sj.put("allY", t.allY);
		sj.put("allInd", t.allInd);
		sj.put("bestInd", t.bestInd);
		sj.put("methodName",t.methodName);
		sj.put("modelName",t.modelName);
		sj.put("survey", t.survey);
		sj.put("track", t.track);
		sj.put("color", t.color);
		return sj.toString();
	}
	
	private Label updateLabel(double[] x, Label l) throws JSONException{
		JSONArray X_temp = new JSONArray(l.X);
		double[][] X_ = JSONM2J(X_temp);
		if(X_[0].length==20){
			double[][] Xnew = new double[X_.length][19];
			for(int j=0;j<X_.length;j++){
				for(int i=0;i<8;i++){
					Xnew[j][i]=X_[j][i];
				}
				for(int i=9;i<19;i++){
					Xnew[j][i-1]=X_[j][i];
				}
			}
			X_ = Xnew;
		}
		
		X_ = arrayadd(x, X_);
		l.X = Arrays.deepToString(X_);
		svm_model model = trainLabelModel(X_);
		l.sv_indices = Arrays.toString(model.sv_indices);
		l.rho = Arrays.toString(model.rho);
		l.sv_coef = Arrays.deepToString(model.sv_coef);
		return l;
	}
	
	private svm_model trainLabelModel(double[][] X) {
		svm_parameter param = new svm_parameter();

		// default values
		param.svm_type = svm_parameter.ONE_CLASS;
		param.kernel_type = svm_parameter.RBF;
		param.cache_size = 100;
		param.gamma = 1.0/X.length;
		param.nu = 0.0001;
		param.eps = 0.0000000000000001;
		
		svm_problem prob = new svm_problem();
		prob.l = X.length;
		prob.y = new double[prob.l];
		prob.x = new svm_node [prob.l][19];
		for(int i=0;i<prob.l;i++){
			for(int j=0;j<19;j++){
				prob.x[i][j] = new svm_node();
				prob.x[i][j].index = j+1;
				prob.x[i][j].value = X[i][j];
			}
			prob.y[i] = 1;				
		}
		return svm.svm_train(prob, param);
	}
	
	private void refineModelFromMturk(HttpServletRequest request,
			HttpServletResponse response) throws JSONException {
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		String data = request.getParameter("data");
		JSONObject js = new JSONObject(data);
		JSONArray X_ = js.getJSONArray("X");
		JSONArray y_ = js.getJSONArray("y");
		double accuracy = js.getDouble("accuracy");
		String labelname = js.getString("name");
		double time = js.getDouble("time");
		Date d = new Date();
		
		Objectify ofy = ObjectifyService.begin();
		if(accuracy<0){
			Performance p = new Performance(Double.toString(accuracy),labelname, Double.toString(time), d.toString());
			ofy.put(p);
		}
		else{
			Label l = ofy.query(Label.class).filter("name",labelname).get();
			double[][][] X = null;
			double[] y = null;
			double[][][] XX = null;
			double[] Y = null;
			if(l.XX.length()!=0){
				JSONArray XX_ = new JSONArray(l.XX);
				XX = JSONMM2J(XX_);
				JSONArray Y_ = new JSONArray(l.Y);
				Y = JSON2J(Y_);
				X = new double[X_.length()+XX.length][2][19];
				y = new double[X_.length()+XX.length];
				for(int i=0;i<y_.length();i++){
					X[i] = JSONM2J(X_.getJSONArray(i));
					y[i] = y_.getDouble(i);
				}
				for(int i=0;i<XX.length;i++){
					X[y_.length()+i] = XX[i];
					y[y_.length()+i] = Y[i];
				}
			}
			else{
				X = new double[X_.length()][2][19];
				for(int i=0;i<y_.length();i++){
					X[i] = JSONM2J(X_.getJSONArray(i));
				}
				y = JSON2J(y_);
			}
			
			double[][][] F = new double[X.length][X[0].length][X[0][0].length];
			for(int i=0;i<X.length;i++){
				F[i] = calFeature(X[i]);
			}
			
			int nfeature = F[0][0].length;
			mean = new double[nfeature];
			std = new double[nfeature];
			double[][][] FBar = new double[F.length][F[0].length][F[0][0].length];
			for(int i=0;i<X.length;i++){
				FBar[i] = featureNormalize(F[i]);
			}
			double[][] H = new double[X.length][X.length];
			double[] minusOne = new double[X.length];
			double gamma = 1.0/nfeature;
			int[] sv_indices = new int[X.length];
			
			for (int i = 0; i<X.length; i++){
				for (int j=0; j<X.length; j++){
					H[i][j] = kernel(FBar[i][0],FBar[j][0],gamma)+kernel(FBar[i][1],FBar[j][1],gamma)
					-kernel(FBar[i][0],FBar[j][1],gamma)-kernel(FBar[i][1],FBar[j][0],gamma);
				}
				minusOne[i] = -1.0;
				sv_indices[i] = i+1;
			}
			Solver s = new Solver();
			s.Solve(X.length, H, minusOne, 1E-6);
			double[] sv_coef = s.alpha;
			

			l.XX = Arrays.deepToString(X);
			l.sv_coef = Arrays.toString(sv_coef);
			l.sv_indices = Arrays.toString(sv_indices);
			l.Y = Arrays.toString(y);
			l.mean = Arrays.toString(mean);
			l.std = Arrays.toString(std);
			
			ofy.put(l);
			Performance p = new Performance(Double.toString(accuracy), labelname, Double.toString(time), d.toString());
			
			ofy.put(p);
		}
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
		int n = X.length;
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
	
	private void getTest(HttpServletRequest request,
			HttpServletResponse response) throws IOException, JSONException {
		
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		PrintWriter out = response.getWriter();
		String name = request.getParameter("name");
		int ntest = Integer.parseInt(request.getParameter("ntest"));

		Objectify ofy = ObjectifyService.begin();
		Label l = ofy.query(Label.class).filter("name",name).get();
		if (l!=null){
			JSONArray sv_indices_ = new JSONArray(l.sv_indices);
			int[] sv_indices = JSONI2J(sv_indices_);
			JSONArray sv_coef_ = new JSONArray(l.sv_coef);
			JSONArray X_ = new JSONArray(l.X);
			double[][] sv = JSONM2J(X_);
			double[][][] XX = null;
			double[] Y = null;
			double[] sv_coef = null;
			if(l.XX.length()!=0){
				JSONArray XX_ = new JSONArray(l.XX);
				XX = JSONMM2J(XX_);
				JSONArray Y_ = new JSONArray(l.Y);
				Y = JSON2J(Y_);
				sv_coef = JSON2J(sv_coef_);
				JSONArray mean_ = new JSONArray(l.mean);
				mean = JSON2J(mean_);
				JSONArray std_ = new JSONArray(l.std);
				std = JSON2J(std_);
			}
			else{sv_coef = JSONM2J(sv_coef_)[0];}
			
			double[][][] X = new double[ntest][2][19];
			double[] y = new double[ntest];
			
			for(int i=0;i<ntest;i++){
				for(int j=0;j<19;j++){
					 X[i][0][j] = Math.random();
					 X[i][1][j] = Math.random();
				}
				
				double y1 = 0.0;
				double y2 = 0.0;
				if(XX!=null){
//					y1 = calDecision2(X[i][0],sv_indices,sv_coef,XX,Y);
//					y2 = calDecision2(X[i][1],sv_indices,sv_coef,XX,Y);
					y1 = decisionf(X[i][0],sv_coef,XX,Y);
					y2 = decisionf(X[i][1],sv_coef,XX,Y);
				}
				else{
					y1 = calDecision(X[i][0],sv_indices,sv_coef,sv);
					y2 = calDecision(X[i][1],sv_indices,sv_coef,sv);
				}
				if(y1<=y2){
					y[i]=-1;
				}
				else{
					y[i]=1;
				}
			}
			JSONObject sj = new JSONObject();
			sj.put("name",name);
			sj.put("X", X);
			sj.put("y", y);
			out.print(sj);	
		}
	}
	
	private double calDecision(double[] x, int[] sv_indices, double[] sv_coef, double[][] sv) {
		double y = 0;
		for(int i=0;i<sv_indices.length;i++){
			y += sv_coef[i]*kernel(x,sv[sv_indices[i]-1],1.0/sv.length);
		}
		return y;
	}
	private double calDecision2(double[] x, int[] sv_indices, 
			double[] sv_coef, double[][][] XX, double[] Y) {
		double y = 0;
		for(int i=0;i<sv_indices.length;i++){
			y += sv_coef[i]*Y[sv_indices[i]-1]*(kernel(x,XX[sv_indices[i]-1][0],1.0/XX.length)-kernel(x,XX[sv_indices[i]-1][1],1.0/XX.length));
		}
		return y;
	}	
	private double decisionf(double[] x, double[] sv_coef, double[][][] XX, double[] Y){
		double f = 0;
		double[] feature = calOneFeature(x);
		for (int i = 0; i<feature.length; i++){
			feature[i]= (feature[i]-mean[i])/std[i];
		}
		double[] feature0; double[] feature1;
		for (int i = 0; i<sv_coef.length;i++){
			feature0 = calOneFeature(XX[i][0]);
			feature1 = calOneFeature(XX[i][1]);
			for (int j = 0; j<feature.length; j++){
				feature0[j]= (feature0[j]-mean[j])/std[j];
				feature1[j]= (feature1[j]-mean[j])/std[j];
			}
			f+= sv_coef[i]*Y[i]*(kernel(feature0,feature,1.0/feature.length)-kernel(feature1,feature,1.0/feature.length));
		}
		return f;
	}
	
	private double kernel(double[] x1, double[] x2, double gamma) {
		double f = 0.0;
		for(int i=0;i<x1.length;i++){
			f+=(x1[i]-x2[i])*(x1[i]-x2[i]);
		}
		return Math.exp(-gamma*f);
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
	private int[] JSONI2J(JSONArray a){
		int[] b = new int[a.length()];
		for (int i=0;i<a.length();i++){
			try {
				b[i] = a.getInt(i);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		return b;
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
	private double[][][] JSONMM2J(JSONArray a){
		int pp = 0;
		try {
			pp = a.getJSONArray(0).length();
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		double[][][] b = new double[a.length()][pp][19];

		for (int i=0;i<a.length();i++){
			for (int j=0;j<pp;j++){
				for (int k=0;k<19;k++){
					try {
						b[i][j][k] = a.getJSONArray(i).getJSONArray(j).getDouble(k);
					} catch (JSONException e) {
						e.printStackTrace();
					}					
				}
			}
		}
		return b;
	}
	public void doPost(HttpServletRequest request,
	               HttpServletResponse response)
	throws ServletException, IOException {
		String action = request.getParameter("action");
		if (action.equals("store")){
			store(request, response);
		}
		else if (action.equals("read")){
			read(request, response);
		}
		else if (action.equals("create")){
			try {
				create(request, response);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		else if (action.equals("readlabel")){
			try {
				readlabel(request, response);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		else if (action.equals("mturkGetTest")){
			try {
				getTest(request, response);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		else if (action.equals("mturkSubmit")){
			try {
				refineModelFromMturk(request, response);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		else if (action.equals("validate")){
			try {
				validateLabels();
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		else if (action.equals("mturkGetCode")){
			mturkGetCode(request, response);
		}
	}

	private void mturkGetCode(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		PrintWriter out = response.getWriter();
		out.print("5409");
	}

	private void validateLabels() throws JSONException {
		Objectify ofy = ObjectifyService.begin();
		Query<Label> q = ofy.query(Label.class);
		if(q.count()>0){
//			String[] label = new String[q.count()];
//			double[][][] X = new double[q.count()][][];
//			int count = 0;
			for(Label l:q){
//				label[count] = l.name;
				if(l.XX!=null){
					if(l.XX.length()!=0){
						double[][][] X = null;
						double[] y = null;

						JSONArray XX_ = new JSONArray(l.XX);
						X = JSONMM2J(XX_);
						JSONArray Y_ = new JSONArray(l.Y);
						y = JSON2J(Y_);
						
						double[][][] F = new double[X.length][X[0].length][X[0][0].length];
						for(int i=0;i<X.length;i++){
							F[i] = calFeature(X[i]);
						}
						
						int nfeature = F[0][0].length;
						mean = new double[nfeature];
						std = new double[nfeature];
						double[][][] FBar = new double[F.length][F[0].length][F[0][0].length];
						for(int i=0;i<X.length;i++){
							FBar[i] = featureNormalize(F[i]);
						}
						double[][] H = new double[X.length][X.length];
						double[] minusOne = new double[X.length];
						double gamma = 1.0/nfeature;
						int[] sv_indices = new int[X.length];
						
						for (int i = 0; i<X.length; i++){
							for (int j=0; j<X.length; j++){
								H[i][j] = kernel(FBar[i][0],FBar[j][0],gamma)+kernel(FBar[i][1],FBar[j][1],gamma)
								-kernel(FBar[i][0],FBar[j][1],gamma)-kernel(FBar[i][1],FBar[j][0],gamma);
							}
							minusOne[i] = -1.0;
							sv_indices[i] = i+1;
						}
						Solver s = new Solver();
						s.Solve(X.length, H, minusOne, 1E-6);
						double[] sv_coef = s.alpha;
						

						l.XX = Arrays.deepToString(X);
						l.sv_coef = Arrays.toString(sv_coef);
						l.sv_indices = Arrays.toString(sv_indices);
						l.Y = Arrays.toString(y);
						l.mean = Arrays.toString(mean);
						l.std = Arrays.toString(std);
						ofy.put(l);
					}
				}
				
//				JSONArray X_ = new JSONArray(l.X);
//				X[count] = JSONM2J(X_);
//				count++;
			}
//			for(int i=0;i<q.count()-1;i++){
//				for(int j=i+1;j<q.count();j++){
//					String str1 = label[i];
//					String str2 = label[j];
//					if(str1.substring(0,3).equals(str2.substring(0,3))){
//						for(int k=0;k<X[j].length;k++){
//							X[i] = arrayadd(X[j][k],X[i]);
//						}
//						Label l = ofy.query(Label.class).filter("name",str1).get();
//						svm_model model = trainLabelModel(X[i]);
//						l.X = Arrays.deepToString(X[i]);
//						l.sv_indices = Arrays.toString(model.sv_indices);
//						l.rho = Arrays.toString(model.rho);
//						l.sv_coef = Arrays.deepToString(model.sv_coef);
//						ofy.put(l);
//					}
//				}
//			}
		}
	}
	
	
}