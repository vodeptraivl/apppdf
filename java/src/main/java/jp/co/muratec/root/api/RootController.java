package jp.co.muratec.root.api;

import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;

import javax.servlet.http.HttpServletRequest;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jp.co.muratec.ApiStatus;
import jp.co.muratec.common.domain.ApiResponseDomain;
import jp.co.muratec.root.domain.LoginDomain;
import jp.co.muratec.root.domain.RootHistoryDomain;
import jp.co.muratec.root.service.RootService;

@RestController
public class RootController {

	/**************************
	 * Loggerの定義
	 **************************/
	Logger log = Logger.getLogger(this.getClass());

	/**************************
	 * Serviceの定義
	 **************************/
	@Autowired
	private RootService service;
	
	

	/**
	 * ログイン処理
	 *
	 */
	@CrossOrigin
	@RequestMapping(value = "v1/api/login", method = RequestMethod.GET)
	public ResponseEntity<ApiResponseDomain<RootHistoryDomain>> login(HttpServletRequest cookieRequest) {

		log.debug("Started Api Login");
		ApiResponseDomain<RootHistoryDomain> response = new ApiResponseDomain<RootHistoryDomain>();
		response.setStatusCode(ApiStatus.Successed.toString());
		try {
			response.setResult(service.login(cookieRequest));
		} catch (Exception e) {
			log.error(e.getStackTrace());
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				response.setStatusCode(ApiStatus.DBException.toString());
			} else {
				response.setStatusCode(ApiStatus.Exception.toString());
			}
		} finally {
			log.debug("Response:" + response.toString());
			log.debug("Finished Api Login");
		}

		return ResponseEntity.ok(response);
	}
	
	
//	@CrossOrigin
//	@RequestMapping(value = "v1/api/export-chart", method = RequestMethod.GET)
//	public ResponseEntity<ApiResponseDomain<RootHistoryDomain>> exportChart() {
//
//		log.debug("Started exportChart");
//		ApiResponseDomain<RootHistoryDomain> response = new ApiResponseDomain<RootHistoryDomain>();
//		response.setStatusCd(ApiStatus.Successed.toString());
//		try {
//			response.setResult(service.exportChart());
//		} catch (Exception e) {
//			log.error(e.getStackTrace());
//			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
//					|| e instanceof PersistenceException) {
//				response.setStatusCd(ApiStatus.DBException.toString());
//			} else {
//				response.setStatusCd(ApiStatus.Exception.toString());
//			}
//		} finally {
//			log.debug("Response:" + response.toString());
//			log.debug("Finished exportChart");
//		}
//
//		return ResponseEntity.ok(response);
//	}
}
