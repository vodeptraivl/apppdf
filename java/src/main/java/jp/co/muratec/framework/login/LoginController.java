package jp.co.muratec.framework.login;

import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jp.co.muratec.ApiStatus;
import jp.co.muratec.ErrorCode;


@RestController
public class LoginController {
	
	Logger log = Logger.getLogger(this.getClass());
	
	private LoginService service;
	@Autowired
	private ApplicationContext context;
	
	@RequestMapping(value = "/v1/api/login")
	public ResponseEntity<AbstLoginResponse> login(HttpServletRequest request, HttpServletResponse response) {
		AbstLoginResponse res;
		try {
			
			service = context.getBean(LoginService.class);
			res = service.login(request);
			if(res.getErrorMess() != null) {
				return new ResponseEntity<>(res, HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			log.error(e.getStackTrace());
			return ResponseEntity
					.status(HttpStatus.FORBIDDEN)
					.build();
		}
		return ResponseEntity.ok(res);
	}
	
	@RequestMapping(value = "/v1/api/hashkey-login")
	public ResponseEntity<AbstLoginResponse> getUserInfo(HttpServletRequest request, HttpServletResponse response) {
		AbstLoginResponse res;
		try {
			
			service = context.getBean(LoginService.class);
			res = service.getUserInfo(request);
			if(res.getErrorMess() != null) {
				return new ResponseEntity<>(res, HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			log.error(e.getStackTrace());
			return ResponseEntity
					.status(HttpStatus.FORBIDDEN)
					.build();
			
		}
		return ResponseEntity.ok(res);
	}
	
	@RequestMapping(value = "/v1/api/logout",method = RequestMethod.DELETE)
	public ResponseEntity<AbstLoginResponse> logout(HttpServletRequest request, HttpServletResponse response) {
		AbstLoginResponse res;
		try {
			
			service = context.getBean(LoginService.class);
			res = service.logout(request);
			if(res.getErrorMess() != null) {
				return new ResponseEntity<>(res, HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			log.error(e.getStackTrace());
			return ResponseEntity
					.status(HttpStatus.FORBIDDEN)
					.build();
			
		}
		return ResponseEntity.ok(res);
	}
}
