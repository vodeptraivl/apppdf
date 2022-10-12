package jp.co.muratec.products.domain;

import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=false)
public class savePdfDomain extends productInfo {
	
	private String nameZip;
	
	private List<pageDomain> page;
	
	private String zipFile;
	
	private String fileNameJoin;
	
	private Boolean joinFile;
}
