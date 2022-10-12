package jp.co.muratec.products.domain;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class DownloadRequest {

	@JsonProperty("productList")
	private List<productInfo> productList;
	
	@JsonProperty("userId")
	private String userId;
	
	@JsonProperty("programId")
	private String programId;
}
