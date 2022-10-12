package jp.co.muratec.framework.login;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface LoginService {

	public AbstLoginResponse login(HttpServletRequest request) throws UsernameNotFoundException;
	public AbstLoginResponse getUserInfo(HttpServletRequest request) throws UsernameNotFoundException;
	public AbstLoginResponse logout(HttpServletRequest request) throws UsernameNotFoundException;
}
