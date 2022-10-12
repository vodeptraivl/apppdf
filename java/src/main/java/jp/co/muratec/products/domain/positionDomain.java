package jp.co.muratec.products.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class positionDomain {
	@JsonProperty("nm")
	private String nm;
	
	@JsonProperty("type")
	private String type;
	
	@JsonProperty("x")
	private float x;
	
	@JsonProperty("y")
	private float y;
	
	@JsonProperty("w")
	private float w;
	
	@JsonProperty("h")
	private float h;
}
