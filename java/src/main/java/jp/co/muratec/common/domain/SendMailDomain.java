package jp.co.muratec.common.domain;

import java.util.HashMap;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class SendMailDomain {
	/**
	 * 管理番号
	 */
	@JsonProperty("seqNo")
	private Long seqNo;
	/**
	 * システムID
	 */
	@JsonProperty("sysId")
	private String sysId;
	/**
	 * 重要F
	 */
	@JsonProperty("mailHigh")
	private int mailHigh;
	/**
	 * 宛先（TO）一覧
	 */
	@JsonProperty("mailTo")
	public String mailTo;

	/**
	 * 同報（CC）一覧
	 */
	@JsonProperty("mailCc")
	public String mailCc;
	/**
	 * MAILBCC
	 */
	@JsonProperty("mailBcc")
	private String mailBcc;
	/**
	 * 件名
	 */
	@JsonProperty("subject")
	private String subject;
	/**
	 * 本文１
	 */
	@JsonProperty("body1")
	private String body1;
	/**
	 * 本文2
	 */
	@JsonProperty("body2")
	private String body2;
	/**
	 * 本文3
	 */
	@JsonProperty("body3")
	private String body3;
	/**
	 * 本文4
	 */
	@JsonProperty("body4")
	private String body4;
	/**
	 * 本文5
	 */
	@JsonProperty("body5")
	private String body5;
	/**
	 * 本文6
	 */
	@JsonProperty("body6")
	private String body6;
	/**
	 * 本文7
	 */
	@JsonProperty("body7")
	private String body7;
	/**
	 * 本文8
	 */
	@JsonProperty("body8")
	private String body8;
	/**
	 * 本文9
	 */
	@JsonProperty("body9")
	private String body9;
	/**
	 * 本文10
	 */
	@JsonProperty("body10")
	private String body10;
	/**
	 * 登録日
	 */
	@JsonProperty("dySet")
	private String dySet;
	/**
	 * 更新日
	 */
	@JsonProperty("dyUpd")
	private String dyUpd;
	/**
	 * 登録ユーザID
	 */
	@JsonProperty("usrSet")
	private String usrSet;
	/**
	 * 更新ユーザID
	 */
	@JsonProperty("kindCd")
	private String usrUpd;
	/**
	 * 更新プログラムID
	 */
	@JsonProperty("prgUpd")
	private String prgUpd;

	@JsonIgnore
	private boolean isValid = true;
	
	@JsonIgnore
	private boolean isInsert = true;
}
