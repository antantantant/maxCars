package dao;

import javax.persistence.Id;
import javax.persistence.Transient;

public class Performance {
	// Objectify auto-generates Long IDs just like JDO / JPA
	@Id Long id;
	String accuracy;
	String name;
	String time;
	String date;
	@Transient String doNotPersist;
	
	public Performance(){}
	
	public Performance(String accuracy, String name, String time, String date){
		this.accuracy = accuracy;
		this.name = name;
		this.time = time;
		this.date = date;
	}
}
