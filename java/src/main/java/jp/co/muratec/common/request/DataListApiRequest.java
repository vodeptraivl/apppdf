package jp.co.muratec.common.request;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class DataListApiRequest<T> {
	/**
	 * 
	 */
	@JsonProperty("dataList")
	public List<T> dataList;
}
