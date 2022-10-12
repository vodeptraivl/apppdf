package jp.co.muratec.framework.auth;

import java.net.URL;
import java.net.MalformedURLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.autoconfigure.security.SpringBootWebSecurityConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AccountStatusUserDetailsChecker;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationProvider;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;

import jp.co.muratec.app.AuthenticatedUserDetailsService;
import jp.co.muratec.framework.auth.AuthenticatedProcessingFilter;

@Configuration
@EnableWebSecurity
public class CollaboWebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Value("${login-type}")
	int LOGIN_TYPE;

	@Value("${login-url}")
	String LOGIN_URL;

	@Value("${login-checkpage}")
	String LOGIN_CHECKPAGE;
	
	@Autowired
	private SecurityProperties security;
	
	@Bean
    public PreAuthenticatedAuthenticationProvider preAuthenticatedAuthenticationProvider() {
        PreAuthenticatedAuthenticationProvider provider = new PreAuthenticatedAuthenticationProvider();
        // ユーザ取得サービス
        provider.setPreAuthenticatedUserDetailsService(authenticationUserDetailsService());
        // ユーザチェック
        provider.setUserDetailsChecker(new AccountStatusUserDetailsChecker());
        return provider;
    }
	@Bean
    public AuthenticationUserDetailsService<PreAuthenticatedAuthenticationToken> authenticationUserDetailsService() {
        return new AuthenticatedUserDetailsService();
	}	
	@Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(preAuthenticatedAuthenticationProvider());
    }
	@Bean
    public AbstractPreAuthenticatedProcessingFilter preAuthenticatedProcessingFilter() throws Exception {
        AuthenticatedProcessingFilter filter = new AuthenticatedProcessingFilter();
        filter.setAuthenticationManager(authenticationManager());
        return filter;
    }
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		//SpringSecurityを動作させない設定
		if(LOGIN_TYPE==2) {
			return ;
		}
		
		http.addFilter(preAuthenticatedProcessingFilter());
		if (this.security.isRequireSsl()) {
			http.requiresChannel().anyRequest().requiresSecure();
		}
		if (!this.security.isEnableCsrf()) {
			http.csrf().disable();
		}
		
		//ドメイン以降を取得(権限設定用に該当箇所のみが必要)
		String strPermPath="";
		try {
			strPermPath = new URL(LOGIN_URL).getPath();
		}catch(MalformedURLException e){
			  e.printStackTrace();
		}
		
		http.sessionManagement().sessionCreationPolicy(this.security.getSessions());
		SpringBootWebSecurityConfiguration.configureHeaders(http.headers(), this.security.getHeaders());
		
		http.authorizeRequests()
		.antMatchers(LOGIN_CHECKPAGE).permitAll()
		.antMatchers("/v1/api/login","/v1/api/notices","/v1/api/messages","/v1/api/logout","/v1/api/pdf-combination-upload","/v1/api/download-pdf","/v1/api/pdf-extracts").permitAll()
		.antMatchers("/autoupdate/**","/autoupdate/.yml","/autoupdate/.exe").permitAll()
		.antMatchers("/api/**").hasRole("ADMIN")
		.anyRequest().authenticated();
		
		http.exceptionHandling()
        .authenticationEntryPoint(new ForbiddenEntryPoint());
		
		/** 独自のログインフォーム  */
		if(LOGIN_TYPE == 0) {
			http
			.formLogin()
			.loginPage(strPermPath).permitAll()
			.and().logout().permitAll();
		}
	}
}
