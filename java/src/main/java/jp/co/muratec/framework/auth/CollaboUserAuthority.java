package jp.co.muratec.framework.auth;

import org.springframework.security.core.GrantedAuthority;

public class CollaboUserAuthority implements GrantedAuthority {

	private static final long serialVersionUID = 1L;

	@Override
    public String getAuthority() {
        return "ROLE_USER";
    }
}
