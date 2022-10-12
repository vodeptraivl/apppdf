package jp.co.muratec.common.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DataListApiResponse<T> extends ApiResponse{
	public DataListApiResponse() {
	}
	/**
	 * レスポンスデータ一覧
	 */
	@JsonProperty("dataList")
	public List<T> dataList;
}
