package jp.co.muratec.products.domain;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class MergeDomain {

	private MultipartFile[] files;
	private List<FileDomain> files2;
	private List<PageInfo> infoMerge;
	private String dataMerge;
	private int countPage;
}
