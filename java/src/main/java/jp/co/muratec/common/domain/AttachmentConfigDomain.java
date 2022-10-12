package jp.co.muratec.common.domain;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

/********************************
 * 設定ファイルに該当するクラス
 ********************************/
@Data
@ConfigurationProperties(prefix = "Attachment")
public class AttachmentConfigDomain {
	
	/********************
	 * 一時保存先
	 *******************/
	private String tempFilePath;
	
	/********************
	 * 保存先
	 *******************/
	private String filePath;
	
	/********************
	 * 分割単位　　　※Mb単位
	 *******************/
	private int mbSplit;
	
	/********************
	 * システムID
	 *******************/
	private String systemId;
	
	/********************
	 * ファイル最大容量(maxSize)
	 ********************/
	private String maxSize;
	
	/********************
	 * サーバー名
	 ********************/
	private String server;
}
