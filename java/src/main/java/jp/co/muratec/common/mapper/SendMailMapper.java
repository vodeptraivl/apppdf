package jp.co.muratec.common.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import jp.co.muratec.common.domain.SendMailDomain;
import jp.co.muratec.common.domain.UserInfoDomain;

@Mapper
public interface SendMailMapper {

	/***********************
	 * Register Data SendMail
	 ***********************/
	UserInfoDomain getUserInfo(@Param("_code") String code);
	
	List<UserInfoDomain> getUsrRoleOfSzi();
	
	boolean registerSendMail(@Param("_item") SendMailDomain mailSend);
	
	Long getMailSeqNextVal();	
}
