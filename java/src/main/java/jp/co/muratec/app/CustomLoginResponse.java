package jp.co.muratec.app;

import jp.co.muratec.framework.login.AbstLoginResponse;

/**
 * ログイン結果のレスポンスクラス
 * フール度には認証情報を含めるようにしてください。
 */
public class CustomLoginResponse extends AbstLoginResponse {
	
	// 認証情報
	private CustomAuthenticatedPrincipal auth;

	private userInfo userInfo;
	
	public userInfo getUserInfo() {
		return userInfo;
	}

	public void setUserInfo(userInfo userInfo) {
		this.userInfo = userInfo;
	}

	public CustomAuthenticatedPrincipal getAuth() {
		return auth;
	}

	public void setAuth(CustomAuthenticatedPrincipal auth) {
		this.auth = auth;
	}	
}
