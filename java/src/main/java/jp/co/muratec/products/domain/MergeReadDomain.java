package jp.co.muratec.products.domain;

import org.apache.pdfbox.pdmodel.PDDocument;
import lombok.Data;

@Data
public class MergeReadDomain {

	private String fileName;
	private int indexFile;
	private PDDocument file;
}
