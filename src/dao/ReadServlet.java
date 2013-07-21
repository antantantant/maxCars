//package dao;
//
//import java.io.IOException;
//import java.io.PrintWriter;
//
//import javax.servlet.ServletException;
//import javax.servlet.http.*;
//
//import org.json.JSONException;
//import org.json.JSONObject;
//
//import com.googlecode.objectify.*;
//
//
//@SuppressWarnings("serial")
//public class ReadServlet extends HttpServlet {
//	static{
//		ObjectifyService.register(Test.class);
//	}
//	
//	public void doGet(HttpServletRequest request,HttpServletResponse response)
//	throws ServletException, IOException {
//		response.setHeader("Cache-Control", "no-cache");
//		response.setHeader("Pragma", "no-cache");
//		PrintWriter out = response.getWriter();
//		String query = request.getParameter("query");
//
//		// Read data from Datastore
//		Objectify ofy = ObjectifyService.begin();
//		Query<Test> q = ofy.query(Test.class);
//		int n = q.count();
//		if (query.equals("all")){
//			out.print(n+"");
//		}
//		else{
//			int i = Integer.parseInt(query);
//			Test t = q.filter("id",i+1).get();
//			String s = null;
//			try {
//				s = parseData(t);
//			} catch (JSONException e) {
//				e.printStackTrace();
//			}
//			out.print(s);
//		}
//	}
//
///** Support both POST and GET so that showTimeInCityPost works
//*  identically to the earlier showTimeInCity example.
//*/
//	public void doPost(HttpServletRequest request,
//	               HttpServletResponse response)
//	throws ServletException, IOException {
//		doGet(request, response);
//	}
//	
//	public String parseData(Test t) throws JSONException{
//		JSONObject sj = new JSONObject();
//		sj.put("id", t.id);
//		sj.put("G", t.G);
//		sj.put("allX", t.allX);
//		sj.put("allY", t.allY);
//		sj.put("allInd", t.allInd);
//		sj.put("bestInd", t.bestInd);
//		sj.put("methodName",t.methodName);
//		sj.put("modelName",t.modelName);
//		sj.put("survey", t.survey);
//		sj.put("track", t.track);
//		return sj.toString();
//	}
//}