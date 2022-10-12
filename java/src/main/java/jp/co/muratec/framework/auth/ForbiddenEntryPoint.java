package jp.co.muratec.framework.auth;

import java.io.IOException;
import java.net.URLEncoder;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;

public class ForbiddenEntryPoint extends Http403ForbiddenEntryPoint {

	
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
			throws IOException, ServletException {
		super.commence(request, response, authException);
//		if (request.getServletPath().startsWith("/v1/api/")) {
//			super.commence(request, response, authException);
//		} else {
//			RequestDispatcher dispatcher = request.getRequestDispatcher("/autherror");
//			dispatcher.forward(request, response);
//		}
	}
}
