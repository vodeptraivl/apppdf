package jp.co.muratec.common.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class downloadTokenDomain {
	
	@JsonProperty("downloadToken")
	private String downloadToken;
	
}
