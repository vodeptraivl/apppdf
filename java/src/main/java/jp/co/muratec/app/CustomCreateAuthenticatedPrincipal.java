package jp.co.muratec.app;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

import jp.co.muratec.framework.auth.AuthenticatedPrincipal;
import jp.co.muratec.framework.auth.CreateAuthenticatedPrincipal;

/**
 * サンプル用の認証 情報取得
  * 　　リクエストに含まれる認証情報を取得します。
  * アプリケーションで定義した認証情報を取得してください。
  * (例えば、ユーザIDのハッシュ値とワンタイムパスワードなど）
 */
@Component
public class CustomCreateAuthenticatedPrincipal implements CreateAuthenticatedPrincipal {
	
	@Override
	public AuthenticatedPrincipal createAuthenticatedPrincipal(HttpServletRequest request) {
		
		// サンプルでは、cookieのuseridをそのまま認証情報として利用している。
		// 個別認証では、セキュリティを考慮して認証情報を作成するようにしてください！！！！
		// 認証情報が空の場合は、クラスインスタンスをそのまま返却する。
		CustomAuthenticatedPrincipal pri =new CustomAuthenticatedPrincipal();
//		Cookie[] cookies = request.getCookies();
		String userid = request.getHeader("userid");
		String uh2 = request.getHeader("uh2");
//		String uh3 = request.getHeader("uh3");
		if(userid != null && uh2 != null) {
			pri.setUserId(userid);
			pri.setHashValue(uh2);
		}
//		if(cookies != null) {
//			for (Cookie cookie : cookies) {
//				if ("userid".equals(cookie.getName())) {
//					pri.setUserId(cookie.getValue());
//				}
//				if ("uh2".equals(cookie.getName())) {
//					pri.setHashValue(cookie.getValue());
//				}
//			}
//		}
		return pri;
	}
}
