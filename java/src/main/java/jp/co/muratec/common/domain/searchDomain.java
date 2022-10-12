package jp.co.muratec.common.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jp.co.muratec.products.domain.productInfo;
import lombok.Data;

@Data
public class searchDomain {

	@JsonProperty("searchInfo")
	List<productInfo> searchInfo;
	
	@JsonProperty("count")
	Integer count;
}
