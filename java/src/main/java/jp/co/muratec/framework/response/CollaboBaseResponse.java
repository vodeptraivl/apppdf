package jp.co.muratec.framework.response;

import java.util.List;
import java.util.Map;

/**
 * バックエンド側から返却するレスポンスの基底クラスです。
 * レスポンスBody内に、エラー判定を追記します。
 */
public class CollaboBaseResponse {
	boolean isError = false;
	
	String errorMess ;
	
	Map<String, List<String>> errorList;
	
	public void setError(boolean isError) {
		this.isError = isError;
	}
	public String getErrorMess() {
		return errorMess;
	}
	public void setErrorMess(String errorMess) {
		this.errorMess = errorMess;
	}
	public Map<String, List<String>> getErrorList() {
		return errorList;
	}
	public boolean isError() {
		return isError;
	}
	public void setError(Map<String, List<String>> errorList) {
		this.isError = true;
		this.errorList = errorList;
	}
	
}
