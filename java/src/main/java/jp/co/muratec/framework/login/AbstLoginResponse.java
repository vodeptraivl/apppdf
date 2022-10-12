package jp.co.muratec.framework.login;

import jp.co.muratec.framework.response.CollaboBaseResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=false)
public abstract class AbstLoginResponse extends CollaboBaseResponse {
	private boolean isLogin = false;
	
}
