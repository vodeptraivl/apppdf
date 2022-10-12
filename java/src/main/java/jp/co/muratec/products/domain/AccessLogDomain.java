package jp.co.muratec.products.domain;

import lombok.Data;

@Data
public class AccessLogDomain {
	
	//管理番号	
	private Long seqNo;
	
	//品番	
	private String prodno;
	
	//PDFファイル名	
	private String pdffName;
	
	//登録日
	private String dyset;

	//更新日
	private String dyupd;
	
	//登録ユーザID
	private String usrSet;
	
	//更新ユーザID
	private String usrUpd;
	
	//更新プログラムID	
	private String prgupd;
}
