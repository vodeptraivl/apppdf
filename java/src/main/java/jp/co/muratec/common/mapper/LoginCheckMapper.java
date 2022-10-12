package jp.co.muratec.common.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import jp.co.muratec.app.userInfo;
//import jp.co.muratec.inquiry.domain.InquiryDomain;
import jp.co.muratec.common.domain.AuthListDomain;
import jp.co.muratec.common.domain.CstLangDomain;
import jp.co.muratec.common.domain.UserIdDomain;

/**
 * Login用Mapperインタフェース
 */
@Mapper
public interface LoginCheckMapper {
	/**
	 * 権限リスト取得
	 * @return 権限リスト
	 */
	List<AuthListDomain> getAuthList(@Param("_userseq")Integer userseq);
	
	/**
	 * 個人言語設定取得
	 * @return 言語ID
	 */
	CstLangDomain getCstLang();
	
	/**
	 * ユーザーSEQ取得
	 * @return ユーザーSEQ
	 */
	Integer getAuthUserSeq(@Param("_usrhash")String code);
	
	/**
	 * ユーザーID取得
	 * @return ユーザーID
	 */
	UserIdDomain getUserId(@Param("_userseq")Integer userseq);
	/**
	 * ユーザーSEQ取得(UserID To UserSeq)
	 * @return ユーザーID
	 */
	Integer getUserId_to_Seq();
	
	/**
	 * ユーザーHash取得(UserSeq To UserHash)
	 * @return ユーザーID
	 */
	Integer getUserSeq_to_Hash(@Param("_userseq")Integer userseq);
	
	/**
	 * 言語変更
	 * 
	 */
	void updateLang(@Param("_usrid")String usrid,@Param("_val")String val,@Param("_usrseq")Integer userseq);

	Long getUserIdNotExpired(@Param("_hashNo") String hashNo);
	

	/**
	 * 
	 */
	Long loginLPW(@Param("_key")String key,@Param("_pass")String pass);
	
	/**
	 * 
	 */
	String checkHashLPW(@Param("_key")Long key);
	
	/**
	 * 
	 */
	void delHashWithUserSeq(@Param("_key")Long key);
	
	/**
	 * 
	 */
	void delHashWithHash(@Param("_key")String key);
	
	/**
	 * 
	 */
	void registerHash(@Param("_seq")Long key,@Param("_hash")String pass,@Param("_expDate")Long expDate);
	
	/**
	 * 
	 */
	void updaterHash(@Param("_seq")Long key,@Param("_hash")String hash,@Param("_expDate")Long expDate);
	
	/**
	 * 
	 */
	Long getUsrSeqFromHash(@Param("_key")String key);
	
	/**
	 * 
	 */
	userInfo getUserInfo(@Param("_seq")Long seq);
	
	/**
	 * 
	 */
	Long checkRole(@Param("_key")Long seq);
}
