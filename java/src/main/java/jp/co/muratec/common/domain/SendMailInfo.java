package jp.co.muratec.common.domain;

import java.util.HashMap;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class SendMailInfo {
	
	/**
	 * 言語
	 */
	@JsonProperty("language")
	public String language;
	
	/**
	 * メールCD
	 */
	@JsonProperty("mailCode")
	public String mailCode;

	/**
	 * 宛先（TO）一覧
	 */
	@JsonProperty("toList")
	public HashMap<String, String> toList;

	/**
	 * 同報（CC）一覧
	 */
	@JsonProperty("ccList")
	public HashMap<String, String> ccList;

	/**
	 * 件名
	 */
	@JsonProperty("subject")
	public String subject;

	/**
	 * 本文
	 */
	@JsonProperty("mailBody")
	public String mailBody;
	
	/**
	 * ユーザID
	 */
	@JsonProperty("userId")
	public String userId;
	
	/**
	 * progId
	 */
	@JsonProperty("progId")
	public String progId;
}
