package jp.co.muratec.common.api;

import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;
import java.util.List;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jp.co.muratec.ApiStatus;
import jp.co.muratec.ErrorCode;
import jp.co.muratec.Tip;
import jp.co.muratec.common.domain.noiticeDomain;
import jp.co.muratec.common.request.DataApiRequest;
import jp.co.muratec.common.request.fileUploadRequest;
import jp.co.muratec.common.response.DataApiResponse;
import jp.co.muratec.common.response.DataListApiResponse;
import jp.co.muratec.common.response.downloadTokenDomain;
import jp.co.muratec.common.service.CommonService;


@RestController
public class CommonController {
	@Autowired
	CommonService commonService;
	
	/**************************
	 * Loggerの
	 **************************/
	Logger log = Logger.getLogger(this.getClass());
	
	/**
	 * 知らせ情報一覧の取得
	 * @param 無し
	 * @return 知らせ一覧
	 */
	@RequestMapping(value="/v1/api/notices", method=RequestMethod.GET)
	public ResponseEntity<DataListApiResponse<noiticeDomain>> getNotices()
	{
		DataListApiResponse<noiticeDomain> response = new DataListApiResponse<noiticeDomain>();
		
		try {
			
			//1.データを取得する
			//・取得したデータを知らせ一覧に設定する
			response.setDataList(commonService.getNoitice());
		} catch (Exception e) {
			e.printStackTrace();
			log.error("", e);
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				
				//上記の処理を実行時、DB例外エラーが発生した場合、処理を中断し、レスポンスを返します。
				response.setErrorCode(ErrorCode.DBException.toString());
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			} else {
				
				//他の例外エラーが発生した場合、処理を中断し、レスポンスを返します。
				response.setErrorCode(ErrorCode.Exception.toString());
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}
