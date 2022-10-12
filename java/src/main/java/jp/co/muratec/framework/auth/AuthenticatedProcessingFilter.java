package jp.co.muratec.framework.auth;

import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;

/**
 * リクエストの認証情報取得フィルター 
 */
public class AuthenticatedProcessingFilter extends AbstractPreAuthenticatedProcessingFilter {

	@Autowired
	CreateAuthenticatedPrincipal authenticatedPrincipal; 
	
	@Override
	protected Object getPreAuthenticatedPrincipal(HttpServletRequest request) {
		return authenticatedPrincipal.createAuthenticatedPrincipal(request);
	}

	@Override
	protected Object getPreAuthenticatedCredentials(HttpServletRequest request) {
		return "";
	}
	

}
