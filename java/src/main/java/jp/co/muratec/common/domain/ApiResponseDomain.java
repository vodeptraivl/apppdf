package jp.co.muratec.common.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jp.co.muratec.common.response.ApiResponse;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonPropertyOrder({ "statusCd", "result" })
public class ApiResponseDomain<T> extends ApiResponse {
	@JsonProperty("data")
	private T result;
}
