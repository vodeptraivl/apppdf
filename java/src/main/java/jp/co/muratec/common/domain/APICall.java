package jp.co.muratec.common.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class APICall {
	public APICall() {
		this.error = false;
		this.data = "";
	}
	
	@JsonProperty("error")
	Boolean error;
	
	@JsonProperty("data")
	String data;
	
}
