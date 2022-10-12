package jp.co.muratec.common.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jp.co.muratec.common.mapper.LoginCheckMapper;
import jp.co.muratec.CollaboConst;
import jp.co.muratec.common.domain.AuthListDomain;
import jp.co.muratec.common.domain.CstLangDomain;
import jp.co.muratec.common.domain.UserIdDomain;

/**
 * 共通チェックServiceクラス
 */
@Service
@Transactional
public class LoginCheckService {
	
	// logger定義
	Logger logger = LoggerFactory.getLogger(getClass().getName());
	
	/**************************
	 * Mapperの定義
	 **************************/
	@Autowired
	private LoginCheckMapper LoginCheckMapper;
	
	/**************************
	 * Mapperの呼び出し
	 **************************/
	/**
	 * 権限情報取得
	 * @return 権限情報
	 */
	public List<AuthListDomain> getAuthList() {
		Integer userseq = LoginCheckMapper.getUserId_to_Seq();
		
		//取得できない時、エラーメッセージを出す
		if (userseq == null) {
			
			// エラーメッセージ取得
			String errMsg = CollaboConst.ERR_MSG_EN_AUTHENTICATION_ERROR;
			 
		    //errMsgList.add(errMsg);
		    logger.error(errMsg);
		}		
		
		// 権限情報取得 
		return LoginCheckMapper.getAuthList(userseq);
	}
	
	/**
	 * 個人言語設定取得
	 * @return 言語ID
	 */
	public CstLangDomain getCstLang() {
		
		// 権限情報取得 
		return LoginCheckMapper.getCstLang();
	}
	
	/**
	 * ユーザーID取得
	 * @return ユーザーID
	 */
	public UserIdDomain getUserId(Map<String, List<String>> errorList) {
		List<String> errMsgList = new ArrayList<String>();	
		
		// ユーザーseq取得
		Integer userseq = LoginCheckMapper.getUserId_to_Seq();
		
		//取得できない時、エラーメッセージを出す
		if (userseq == null) {
			
			// エラーメッセージ取得
			String errMsg = CollaboConst.ERR_MSG_EN_AUTHENTICATION_ERROR;
			// 
		    errMsgList.add(errMsg);
		    logger.error(errMsg);
		}
		
		// ユーザーID取得
		return  LoginCheckMapper.getUserId(userseq);
	}
	
	/**
	 * 言語変更
	 */
	public void updateLang(String val) {
		
		// ユーザーseq取得
		Integer usrseq = LoginCheckMapper.getUserId_to_Seq();
		
		// ユーザーID取得
		String usrid =  LoginCheckMapper.getUserId(usrseq).getUserId();
		
		// 言語変更
		LoginCheckMapper.updateLang(usrid,val,usrseq);
	}
}
