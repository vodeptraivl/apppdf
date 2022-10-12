package jp.co.muratec.framework.login;


import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(value = "/autherror")
public class AuthErrorController {
	@Value("${login-url}")
	String LOGIN_URL;

	@RequestMapping
	String index(HttpServletRequest request ) {
		String pathRedirec = LOGIN_URL;
		String Path = (String) request.getAttribute("path");
		if(Path != null && Path != "") {
			pathRedirec += Path;
		}
		
		return "redirect:" + pathRedirec;
	}
	
}
