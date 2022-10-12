package jp.co.muratec.app;

import java.util.Collection;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.util.StringUtils;

import jp.co.muratec.common.domain.UserIdDomain;
import jp.co.muratec.common.mapper.LoginCheckMapper;
import jp.co.muratec.root.domain.RootHistoryDomain;
import jp.co.muratec.root.mapper.RootMapper;
//import jp.co.muratec.framework.auth.AuthenticatedPrincipal;
import jp.co.muratec.framework.auth.CollaboAdminAuthority;
/**
 * ユーザ情報の取得
 * 入手した認証情報から、ユーザ情報を取得するように実装してください。
 */
public class AuthenticatedUserDetailsService implements 
	AuthenticationUserDetailsService<PreAuthenticatedAuthenticationToken> {

	@Autowired
	private LoginCheckMapper LoginCheckMapper;
	
	@Autowired
	private RootMapper mapper;
	
	@Value("${expiration-date}")
	Long expDate;
	
	
	@Override
	public UserDetails loadUserDetails(PreAuthenticatedAuthenticationToken token)
			throws UsernameNotFoundException {
		
		// 認証情報からユーザ情報を取得する。
		// ※ ユーザ情報の取得
		CustomAuthenticatedPrincipal principal = (CustomAuthenticatedPrincipal) token.getPrincipal();
		
		if(principal == null || StringUtils.isEmpty(principal.getUserId()) || StringUtils.isEmpty(principal.getHashValue())) {
			throw new UsernameNotFoundException("User Not Found");
		}
		
		
		// 実際の実装では、データベースと連携し、ユーザ情報を取得することになると思います。
		// 例） 認証情報のハッシュ値、ユーザIDなどから、ログインテーブル・ユーザマスタを検索し、ユーザ情報と
		//    認証の有効期限切れなどを取得など
		
		// ユーザ情報を設定する。
		// サンプルでは、ユーザ名と権限のみ設定
		// org.springframework.security.core.userdetails.User 
		//  ユーザ名と権限を設定する。※権限は通常CollaboAdminAuthorityを設定してください。
        Collection<GrantedAuthority> authorities =new HashSet<GrantedAuthority>() ;
        authorities.add(new CollaboAdminAuthority());
        
        
        //int userSeq = LoginCheckMapper.getAuthUserSeq(principal.getHashValue());
		
        //UserIdDomain userIdDomain = LoginCheckMapper.getUserId(userSeq);
        
        //1-2．HashNoをCBスキーマのユーザーハッシュテーブル（CB.CBT_USRHASH）に問合せ、ユーザー管理番号を取得する。
      	Long userSeq = LoginCheckMapper.getUsrSeqFromHash(principal.getHashValue());
              
      	if(userSeq == null) {
      		throw new UsernameNotFoundException("User Not Found");
      	}
//      	else {
//      		String hash = LoginCheckMapper.checkHashPWA(userSeq);
//      		if(hash == null) {
//      			LoginCheckMapper.delHashPWA(userSeq);
//      			throw new UsernameNotFoundException("User Not Found");
//      		}
//      	}
      	
		//1-3．CAAスキーマのユーザー情報ビュー（CAA.CBV_USRINF）に問合せ、ユーザー情報を取得する。
      	RootHistoryDomain result = mapper.getUserInfo(userSeq);
        User user = new User(result.getUsrId(), "", authorities);
        
		return user;
	}
}
