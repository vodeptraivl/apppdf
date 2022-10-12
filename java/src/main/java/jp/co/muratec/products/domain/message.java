package jp.co.muratec.products.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class message {
	
	//エラーコード	
	@JsonProperty("code")
	private String errorCd;
	
	//メッセージ	
	@JsonProperty("contents")
	private String message;
}
