package jp.co.muratec.common.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserInfoDomain {

	/**
	 * ユーザ管理番号
	 */
	@JsonProperty("usrSeq")
	private int usrSeq;
	/**
	 * ユーザ区分
	 */
	@JsonProperty("usrKbn")
	private String usrKbn;
	/**
	 * メールアドレス
	 */
	@JsonProperty("mail")
	private String mail;
	/**
	 * ユーザ名称
	 */
	@JsonProperty("usrNm")
	private String usrNm;
	/**
	 * 職階区分
	 */
	@JsonProperty("sykiId")
	private String sykiId;
	/**
	 * sykmId.
	 */
	@JsonProperty("sykmId")
	private String sykmId;
	/**
	 * 削除FG
	 */
	@JsonProperty("delFlg")
	private String delFlg;
	/**
	 * 部署名
	 */
	@JsonProperty("dpmtNm")
	private String dpmtNm;
	/**
	 * 部署コード
	 */
	@JsonProperty("dpmtCd")
	private String dpmtCd;
	/**
	 * ユーザID
	 */
	@JsonProperty("usrId")
	private String usrId;
}
