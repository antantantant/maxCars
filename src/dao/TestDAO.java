//package dao;
//import java.util.logging.Logger;
//
//import com.googlecode.objectify.ObjectifyService;
//import dao.Test;
//
//public class TestDAO extends ObjectifyDAO<Test>{
//	private static final Logger LOG = Logger.getLogger(TestDAO.class.getName());
//	static{
//		ObjectifyService.register(Test.class);
//	}
//	public TestDAO(){
//		super(Test.class);
//	}
//	public static Logger getLog() {
//		return LOG;
//	}
//}