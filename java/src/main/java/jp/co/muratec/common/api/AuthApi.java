package jp.co.muratec.common.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jp.co.muratec.common.domain.AuthListDomain;
import jp.co.muratec.common.service.LoginCheckService;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * ファイルControllerクラス
 */
@RestController
public class AuthApi {
	
	/**************************
	 * Serviceの定義
	 **************************/
	@Autowired
	LoginCheckService commonCheckService;

	/**************************
	 * レスポンスの定義
	 **************************/
	@Data
	@AllArgsConstructor
	class MembersResponse {
		List<AuthListDomain> authListDomain;
	}
	
	/**************************
	 * URIマッピング定義
	 ***************************/
	/**
	 * 権限一覧取得
	 * @param attachmentFileDomain ファイル情報
	 * @return 結果リスト
	 * @throws Exception
	 */
	@RequestMapping(value="/api/auth", method=RequestMethod.GET)
	public ResponseEntity<MembersResponse> getAuthList() throws Exception
	{
		List<AuthListDomain> list = commonCheckService.getAuthList();
		return ResponseEntity.ok(new MembersResponse(list));
	}

}
