package jp.co.muratec.framework.auth;

import javax.servlet.http.HttpServletRequest;

/**
 * リクエスト情報に含まれる認証情報を取得する。
 * 
 */
public interface CreateAuthenticatedPrincipal {
	
	public AuthenticatedPrincipal createAuthenticatedPrincipal(HttpServletRequest request);
}
