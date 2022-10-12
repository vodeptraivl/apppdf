package jp.co.muratec.root.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import jp.co.muratec.root.domain.RootHistoryDomain;

@Mapper
public interface RootMapper {
	
	
	/**
	 * ログイン処理
	 */
	RootHistoryDomain login(@Param("_userId") String userId);
	
	/**
	 * スキーマのユーザー情報ビュー（CAA.CBV_USRINF）に問合せ、ユーザー情報を取得する。
	 */
	RootHistoryDomain getUserInfo(@Param("_usrSeq") Long usrSeq);
	
}
