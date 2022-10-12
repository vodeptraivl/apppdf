package jp.co.muratec.common.domain;

import lombok.Data;

/********************************
 * static変数を格納するクラス
 ********************************/
@Data
public class AttachmentSessionDomain {
	
	/***********************
	 * ダウンロードファイルパス
	 ***********************/
	private String downloadFilePath;
	
	/***********************
	 * オリジナルファイル名
	 ***********************/
	private String orgFileNm;
}
