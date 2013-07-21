package dao;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Transient;

@Entity
public class Test
{
	// Objectify auto-generates Long IDs just like JDO / JPA
	@Id Long id;
	String G;
	String allX;
	String allY;
	String allInd;
	String bestInd;
	String methodName;
	String modelName;
	String survey;
	String track;
	String color;
	@Transient String doNotPersist;
	
	public Test(){}
	
	public Test(String G,String allX,String allY,String allInd, String bestInd,
			String methodName,String modelName,String survey,String track,String color){
		this.G = G;
		this.allX = allX;
		this.allY = allY;
		this.allInd = allInd;
		this.bestInd = bestInd;
		this.methodName = methodName;
		this.modelName = modelName;
		this.survey = survey;
		this.track = track;
		this.color = color;
	}
}
