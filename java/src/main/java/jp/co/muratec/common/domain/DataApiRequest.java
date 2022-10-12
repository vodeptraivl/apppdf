package jp.co.muratec.common.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class DataApiRequest<T> {
	@JsonProperty("dataList")
	List<T> dataList;
	
	@JsonProperty("data")
	T data;
}
