package jp.co.muratec.common.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
public class DataApiResponse<T> extends ApiResponse {
	public DataApiResponse(){}
	/**
	 * レスポンスデータ
	 */
	@JsonProperty("data")
	public T data;
}
