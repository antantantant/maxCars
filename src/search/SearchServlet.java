package search;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.*;
import org.json.JSONException;
import search.Algorithm;

@SuppressWarnings("serial")
public class SearchServlet extends HttpServlet {
	  public void doGet(HttpServletRequest request,
              HttpServletResponse response)
throws ServletException, IOException {
	response.setHeader("Cache-Control", "no-cache");
	response.setHeader("Pragma", "no-cache");
	
	String quest = request.getParameter("data");
	String model = null;
	try {
		model = Algorithm.doCal(quest);
	} catch (JSONException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	PrintWriter out = response.getWriter();
	out.print(model);
}

/** Support both POST and GET so that showTimeInCityPost works
*  identically to the earlier showTimeInCity example.
*/

	public void doPost(HttpServletRequest request,
	               HttpServletResponse response)
	throws ServletException, IOException {
	doGet(request, response);
	}
}