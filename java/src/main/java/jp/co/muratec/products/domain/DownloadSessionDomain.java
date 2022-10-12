package jp.co.muratec.products.domain;

import lombok.Data;

/********************************
 * static変数を格納するクラス
 ********************************/
@Data
public class DownloadSessionDomain {
	
	/***********************
	 * セッションID
	 ***********************/
	private String sessionId;
	
	/***********************
	 * ダウンロードファイルパス
	 ***********************/
	private String downloadFilePath;
	
	/***********************
	 * オリジナルファイル名
	 ***********************/
	private String orgFileNm;
}
