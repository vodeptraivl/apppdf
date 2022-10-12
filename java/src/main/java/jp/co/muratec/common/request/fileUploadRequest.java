package jp.co.muratec.common.request;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class fileUploadRequest {
	
	@JsonProperty("tempFolder")
	private String tempFolder;
	
	@JsonProperty("sessionKey")
	private String sessionKey;
	
	@JsonProperty("fileData")
	private MultipartFile fileData;
	
	@JsonProperty("fileName")
	private String fileName;
	
}
