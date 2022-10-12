package jp.co.muratec.root.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jp.co.muratec.common.domain.AuthListDomain;
import lombok.Data;

@Data
public class RootHistoryDomain {

	/**
	 * usrId.
	 */
	@JsonProperty("userId")
	private String usrId;
	
	/**
	 * usrSeq.
	 */
	@JsonProperty("usrSeq")
	private Integer usrSeq;
	
	/**
	 * usrNm.
	 */
	@JsonProperty("userName")
	private String usrNm;
	/**
	 * dpmtCd
	 */
	@JsonProperty("departmentCode")
	private String dpmtCd;
	/**
	 * dpmtNm
	 */
	@JsonProperty("departmentName")
	private String dpmtNm;
	
	/**
	 * mail
	 */
	@JsonProperty("mail")
	private String mail;
	
	/**
	 * auth List
	 */
	@JsonProperty("authList")
	private List<AuthListDomain> usrAuthList;

}
