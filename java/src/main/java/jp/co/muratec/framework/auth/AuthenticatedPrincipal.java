package jp.co.muratec.framework.auth;

import lombok.Data;

@Data
public abstract class AuthenticatedPrincipal {	
	private String userId;
	private String hashValue;
}
