package jp.co.muratec.common.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class ApiResponse {
	
	/*
	 * ステータスCD
	 */
	@JsonProperty("statusCode")
	public String statusCode;
	
	/*
	 * ステータスCD
	 */
	@JsonProperty("statusCd")
	public String statusCd;

	/**
	 * エラーコード
	 */
	@JsonProperty("errorCode")
	public String errorCode;
	/**
	 * エラーコード
	 */
	@JsonProperty("errorCd")
	public String errorCd;

	/**
	 * チップ
	 */
	@JsonProperty("tip")
	public String tip;
}