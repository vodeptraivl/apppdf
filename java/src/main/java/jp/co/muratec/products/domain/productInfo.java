package jp.co.muratec.products.domain;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class productInfo {
	//発注番号	
	@JsonProperty("seqNo")
	private String seq_No;
	
	//品番	
	@JsonProperty("productCode")
	private String hinb;
	
	//PDFファイル名	
	@JsonProperty("pdfFileName")
	private String pdfFileName;
	
	//更新日
	@JsonProperty("updateDate")
	private Date upday;
	
	//サーバー名		
	@JsonProperty("serverName")
	private String pdfsrv;
	
	//PDFファイルパス	
	@JsonProperty("pdfFilePath")
	private String pdfpas;
	
	//品名
	@JsonProperty("productName")
	private String hinm;
	
	//品名
	@JsonProperty("count")
	private String count;
}
