package jp.co.muratec.common.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class ApiResponse {
	/*
	 * ステータスCD
	 */
	@JsonProperty("statusCode")
	public String statusCode;
}
