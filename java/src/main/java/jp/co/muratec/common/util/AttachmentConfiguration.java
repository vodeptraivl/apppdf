package jp.co.muratec.common.util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jp.co.muratec.common.domain.AttachmentConfigDomain;

/*************************************
 * 設定情報を取込するクラス
 *************************************/
@Configuration
public class AttachmentConfiguration {
	
	@Bean
    public AttachmentConfigDomain config() {
        return new AttachmentConfigDomain();
    }
}

