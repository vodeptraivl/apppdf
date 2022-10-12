package jp.co.muratec.products.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class pageDomain {

	@JsonProperty("index")
	private Integer index;
	
	@JsonProperty("position")
	private List<positionDomain> position;
	
	@JsonProperty("rotate")
	private Integer rotate;
	
	private int pageNumber;
	
	private String fileName;
}
