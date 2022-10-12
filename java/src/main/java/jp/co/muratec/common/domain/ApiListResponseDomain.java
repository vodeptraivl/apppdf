package jp.co.muratec.common.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jp.co.muratec.common.response.ApiResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@JsonPropertyOrder({ "statusCd", "result" })
public class ApiListResponseDomain<T> extends ApiResponse {
	public ApiListResponseDomain() {
	}

	@JsonProperty("dataList")
	private List<T> result;
}
