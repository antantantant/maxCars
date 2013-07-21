//package dao;
//import java.beans.BeanInfo;
//import java.beans.IntrospectionException;
//import java.beans.Introspector;
//import java.beans.PropertyDescriptor;
//import java.lang.reflect.InvocationTargetException;
//import java.lang.reflect.Method;
//import java.util.List;
//
//import com.google.appengine.api.datastore.EntityNotFoundException;
//import com.google.appengine.api.datastore.QueryResultIterable;
//import com.googlecode.objectify.Key;
//import com.googlecode.objectify.Query;
//import com.googlecode.objectify.helper.DAOBase;
//
//public class ObjectifyDAO<T> extends DAOBase{
//	private Class<?> clazz;
//	protected ObjectifyDAO(Class<?> clazz){
//		this.clazz = clazz;
//	}
//	
//	public Key<T> add(T entity){
//		Key<T> key = ofy().put(entity);
//		return key;
//	}
//	
//	public void delete(T entity){
//		ofy().delete(entity);
//	}
//	
//	public void delete(Key<?> entityKey){
//		ofy().delete(entityKey);
//	}
//	
//	public T get(Long id) throws EntityNotFoundException{
//		@SuppressWarnings("unchecked")
//		T obj = (T) ofy().get(this.clazz, id);
//		return obj;
//	}
//	
//	public T get(String id) throws EntityNotFoundException{
//		@SuppressWarnings("unchecked")
//		T obj = (T) ofy().get(this.clazz, id);
//		return obj;
//	}
//	
//	/**
//	* Convenience method to get an object matching a single property
//	*
//	* @param propName
//	* @param propValue
//	* @return T matching Object
//	*/
//	
//	public QueryResultIterable<?> queryKeys(){
//		QueryResultIterable<?> allKeys = ofy().query(this.clazz).fetchKeys();
//		return allKeys;
//	}
//	
//	public T getByProperty(String propName, Object propValue){
//		@SuppressWarnings("unchecked")
//		T result = (T) ofy().query(this.clazz).filter(propName, propValue).get();
//		return result;
//	}
//	
//	public List<?> listByProperty(String propName, Object propValue){
//		List<?> list = ofy().query(this.clazz).filter(propName, propValue).list();
//		return list;
//	}
//	
//	public T getByExample(T u, String...matchProperties){
//		Query<?> q = ofy().query(this.clazz);
//		// Find non-null properties and add to query
//		for (String propName : matchProperties){
//			Object propValue = getPropertyValue(u, propName);
//			q.filter(propName, propValue);
//		}
//		@SuppressWarnings("unchecked")
//		T obj = (T) q.get();
//		return obj;
//	}
//	
//	public List<?> listByExample(T u, String...matchProperties){
//		Query<?> q = ofy().query(this.clazz);
//		// Find non-null properties and add to query
//		for (String propName : matchProperties){
//			Object propValue = getPropertyValue(u, propName);
//			q.filter(propName, propValue);
//		}
//		List<?> list = q.list();
//		return list;
//	}
//	
//	public int countEntity(){
//		return ofy().query(Test.class).filter("name", "test").count();	
//	}
//	
//	private Object getPropertyValue(Object obj, String propertyName){
//		BeanInfo beanInfo;
//		try{
//			beanInfo = Introspector.getBeanInfo(obj.getClass());
//		}
//		catch (IntrospectionException e){
//			throw new RuntimeException(e);
//		}
//		PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
//		for (PropertyDescriptor propertyDescriptor : propertyDescriptors){
//			String propName = propertyDescriptor.getName();
//			if (propName.equals(propertyName)){
//				Method readMethod = propertyDescriptor.getReadMethod();
//				try{
//					Object value = readMethod.invoke(obj, new Object[] {});
//					return value;
//				}
//				catch (IllegalArgumentException e){
//					throw new RuntimeException(e);
//				}
//				catch (IllegalAccessException e){
//					throw new RuntimeException(e);
//				}
//				catch (InvocationTargetException e){
//					throw new RuntimeException(e);
//				}
//			}
//		}
//		return null;
//	}
//}
