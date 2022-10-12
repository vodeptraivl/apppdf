package jp.co.muratec.common.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class Employee {
	/**
	 * ユーザーID
	 */
	@JsonProperty("code")
	String usrid;
	/**
	 * ユーザー名
	 */
	@JsonProperty("name")
	String usrnm;
	/**
	 * 部署コード
	 */
	@JsonProperty("departmentCode")
	String dpmtcd;
	/**
	 * 部署名
	 */
	@JsonProperty("departmentName")
	String dpmtnm;
}
