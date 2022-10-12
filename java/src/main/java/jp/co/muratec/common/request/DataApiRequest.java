package jp.co.muratec.common.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class DataApiRequest<T> {
	/**
	 * リクエストパラメータ
	 */
	@JsonProperty("data")
	public T data;
}
