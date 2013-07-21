package dao;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Transient;

@Entity
public class Label
{
	// Objectify auto-generates Long IDs just like JDO / JPA
	@Id Long id;
	String name;
//	String center;
	String sv_indices;
	String rho;
	String sv_coef;
	String X;
	String XX;
	String Y;
	String mean;
	String std;
	@Transient String doNotPersist;
	
	public Label(){}
	
	public Label(String name,String X,String sv_indices,String rho,String sv_coef,String XX,String Y,String mean,String std){
		this.name = name;
		this.sv_indices = sv_indices;
		this.rho = rho;
		this.sv_coef = sv_coef;
		this.X = X;
		this.XX = XX;
		this.Y = Y;
		this.mean = mean;
		this.std = std;
	}
}
