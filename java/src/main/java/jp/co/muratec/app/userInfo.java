package jp.co.muratec.app;

import lombok.Data;

@Data
public class userInfo {
	private String usrId;
	private Long usrSeq;
	private String usrNm;
	private String dpmtCd;
	private String dpmtNm;
	private String mail;
	private boolean author;
}
