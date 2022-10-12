package jp.co.muratec.app;

import java.awt.List;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;
import java.util.ArrayList;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.apache.ibatis.exceptions.PersistenceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jp.co.muratec.ApiStatus;
import jp.co.muratec.framework.login.AbstLoginResponse;
import jp.co.muratec.framework.login.LoginService;

/**
 * 独自ログイン処理サービス
 *　　ログイン画面のフォーム値を用いて、ログイン認証処理を実装します。
 */
@Service
@Transactional
public class CustomLoginService implements LoginService{
	
	@Autowired
	private jp.co.muratec.common.mapper.LoginCheckMapper LoginCheckMapper;
	
	//有効期間 1 = 1時
	@Value("${expiration-date}")
	Long expDate;
	
	
	//SERVICE ログイン
	@Override
	public AbstLoginResponse login(HttpServletRequest request) throws UsernameNotFoundException {
		
		// サンプルでは、認証は常にOKとする。
		String userid = request.getParameterMap().get("userid")[0];
		String password = request.getParameterMap().get("password")[0];
		
		// 定義したログインレスポンスを認証情報を設定し、返却する。
		CustomLoginResponse res = new CustomLoginResponse();
		CustomAuthenticatedPrincipal auth = new CustomAuthenticatedPrincipal();
		
		// 1.パラメータの必須チェック
		if (StringUtils.isEmpty(userid) || StringUtils.isEmpty(password)) {
			res.setError(true);
			res.setLogin(false);
			res.setErrorMess(ApiStatus.Parameter.toString());
			
			return res;
		}
		
		try {
			
			//2.2. 暗号化したパスワードとログインIDによりユーザー管理番号(USRSEQ)がデータを取得する。
			Long userSeq = LoginCheckMapper.loginLPW(userid, this.getPassMd5(password));
			
			//データが存在しない場合、処理を中断し、レスポンスを返します。
			if(userSeq == null) {
				res.setErrorMess(ApiStatus.PasswordInvalid.toString());
				res.setLogin(false);
				res.setError(true);
				
				return res;
			}
			
			//新ハッシュはユーザの個人情報などから類推されないように、ランダムに生成されるUUID（v4）を使用する。
			//生成したUUIDの文字列からハイフン（-）を削除し、ラテン文字を大文字に変換する。
			String uuidMD5 = this.getPassMd5(this.unique()).toUpperCase();
			
			//3.ユーザー管理番号(USRSEQ)によりユーザハッシュ情報を取得する。
			String uhCheck = LoginCheckMapper.checkHashLPW(userSeq);
			
			//「CBT_USRHASH」テーブルにログインユーザのレコードがあるか？
			if(uhCheck == null) {
				
				//（※1）新ハッシュを生成し、「CBT_USRHASH」テーブルにレコードを挿入する（表2を参照）
				LoginCheckMapper.delHashWithUserSeq(userSeq);
				LoginCheckMapper.registerHash(userSeq,uuidMD5,expDate);
			}else {
				
				//現在時刻は該当レコードの有効期限内か？
				uuidMD5 = uhCheck;
//				LoginCheckMapper.updaterHashPWA(userSeq,uuidMD5,expDate);
			}
			
			auth.setUserId(userid);
			auth.setHashValue(uuidMD5);
			res.setLogin(true);
			res.setAuth(auth);
			
		}catch(Exception e) {
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				
				//上記の処理を実行時、DB例外エラーが発生した場合、処理を中断し、レスポンスを返します。
				res.setError(true);
				res.setLogin(false);
				res.setErrorMess(ApiStatus.DBException.toString());
			} else {
				
				//他の例外エラーが発生した場合、処理を中断し、レスポンスを返します。
				res.setError(true);
				res.setLogin(false);
				res.setErrorMess(ApiStatus.Exception.toString());
			}
		}
		
		return res;
	}
	
	//SERVICE ハッシュキーログイン
	@Override
	public AbstLoginResponse logout(HttpServletRequest request) throws UsernameNotFoundException {
		// 定義したログインレスポンスを認証情報を設定し、返却する。
		CustomLoginResponse res = new CustomLoginResponse();
		try {
			
			//1.1．依頼のヘッダーからキー「uh2」の値を取得してハッシュ値として保持する。
			String uh2 = request.getHeader("uh2");
			
			//1.2．HashNoをCBスキーマのユーザーハッシュテーブル（CB.CBT_USRHASH）に問合せ、ログインユーザの情報を削除する。
			LoginCheckMapper.delHashWithHash(uh2);
		} catch(Exception e) {
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				
				//上記の処理を実行時、DB例外エラーが発生した場合、処理を中断し、レスポンスを返します。
				res.setError(true);
				res.setLogin(false);
				res.setErrorMess(ApiStatus.DBException.toString());
			} else {
				
				//他の例外エラーが発生した場合、処理を中断し、レスポンスを返します。
				res.setError(true);
				res.setLogin(false);
				res.setErrorMess(ApiStatus.Exception.toString());
			}
		}
		return res;
	}
		
	//SERVICE ハッシュキーログイン
		@Override
		public AbstLoginResponse getUserInfo(HttpServletRequest request) throws UsernameNotFoundException {
			// 定義したログインレスポンスを認証情報を設定し、返却する。
			CustomLoginResponse res = new CustomLoginResponse();
			try {
				
				//1.1．依頼のヘッダーからキー「uh2」の値を取得してハッシュ値として保持する。
				String uh2 = request.getHeader("uh2");

				//1.2．HashNoをCBスキーマのユーザーハッシュテーブル（CB.CBT_USRHASH）に問合せ、ユーザー管理番号を取得する。
				Long userSeq = LoginCheckMapper.getUserIdNotExpired(uh2);
				
				//データが存在しない場合、処理を中断し、レスポンスを返します。
				if(userSeq == null) {
					res.setErrorMess("LPWE03");
					res.setLogin(false);
					res.setError(true);
					return res;
				}
				
				//1.3．CAAスキーマのユーザー情報ビュー（CAA.CBV_USRINF）に問合せ、ユーザー情報を取得する。
				//ユーザー情報ビューから取得した各カラムの値は以下のように扱う。
				Long MSTIDNO = LoginCheckMapper.checkRole(userSeq);
				userInfo usrInfo = LoginCheckMapper.getUserInfo(userSeq);
				usrInfo.setAuthor((MSTIDNO != null && MSTIDNO != 0) ? true : false);
				res.setUserInfo(usrInfo);
				
			}catch(Exception e) {
				if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
						|| e instanceof PersistenceException) {
					
					//上記の処理を実行時、DB例外エラーが発生した場合、処理を中断し、レスポンスを返します。
					res.setError(true);
					res.setLogin(false);
					res.setErrorMess(ApiStatus.DBException.toString());
				} else {
					
					////他の例外エラーが発生した場合、処理を中断し、レスポンスを返します。
					res.setError(true);
					res.setLogin(false);
					res.setErrorMess(ApiStatus.Exception.toString());
				}
			}
			
			return res;
		}

		
		
	private static String getPassMd5(String pass) 
    { 
        try { 
  
            MessageDigest md = MessageDigest.getInstance("MD5"); 
            byte[] messageDigest = md.digest(pass.getBytes()); 
            BigInteger no = new BigInteger(1, messageDigest);
            String hashtext = no.toString(16); 
            while (hashtext.length() < 32) { 
                hashtext = "0" + hashtext; 
            } 
            return hashtext; 
        } catch (NoSuchAlgorithmException e) { 
            throw new RuntimeException(e); 
        } 
    } 
	
	private static volatile SecureRandom numberGenerator = null;
    private static final long MSB = 0x8000000000000000L;

    public static String unique() {
        SecureRandom ng = numberGenerator;
        if (ng == null) {
            numberGenerator = ng = new SecureRandom();
        }

        return Long.toHexString(MSB | ng.nextLong()) + Long.toHexString(MSB | ng.nextLong());
    }

}
