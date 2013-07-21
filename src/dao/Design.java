package dao;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Transient;

@Entity
public class Design
{
	// Objectify auto-generates Long IDs just like JDO / JPA
	@Id Long id;
	String X;
	String label;
	String color;
	@Transient String doNotPersist;
	
	public Design(){}
	
	public Design(String X,String label,String color){
		this.X = X;
		this.label = label;
		this.color = color;
	}
}
