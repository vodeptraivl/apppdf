package jp.co.muratec.products.domain;

import lombok.Data;

@Data
public class PageInfo {
	private String fileName;
	private int pageIndex;
	private int index;
	private int pageNumber;
	private int indexSave;
	private int rotate;
}
