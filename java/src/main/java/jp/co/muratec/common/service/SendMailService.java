package jp.co.muratec.common.service;

import static java.util.stream.Collectors.joining;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.nio.charset.CharsetEncoder;
import java.nio.charset.CoderResult;
import java.nio.charset.CodingErrorAction;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jp.co.muratec.CollaboConst;
import jp.co.muratec.common.domain.SendMailDomain;
import jp.co.muratec.common.domain.SendMailInfo;
import jp.co.muratec.common.domain.UserInfoDomain;
import jp.co.muratec.common.mapper.SendMailMapper;

@Service
public class SendMailService {
	// logger定義
	Logger logger = LoggerFactory.getLogger(getClass().getName());
	
	@Autowired
	HttpServletRequest request;
	
	@Autowired
	private SendMailMapper sendMailMapper;
	
	/***********************
	 * Get Max SeqNo SendMail
	 ***********************/
	public long getMailSeqNextVal() {
		return sendMailMapper.getMailSeqNextVal();
	}
	
	/***********************
	 * Add Data To MailSend
	 * @param programUpdate 
	 ***********************/
	public void registerMailInfo(SendMailInfo sendMailInfo, String programUpdate) {
		SendMailDomain mailSend = new SendMailDomain();
		
		mailSend.setSeqNo(sendMailMapper.getMailSeqNextVal());
		mailSend.setSysId(CollaboConst.SSYSTEM_ID_CTB);
		mailSend.mailTo = "";
		mailSend.mailCc = "";
		
		if(sendMailInfo.getToList() != null && sendMailInfo.getToList().size() > 0) {
			mailSend.mailTo = sendMailInfo.getToList().entrySet()
                .stream()
                .filter(x -> x.getValue() != null && x.getValue() != "")
                .map(e -> e.getValue())
                .collect(joining(";"));
		}
		
		
		if(sendMailInfo.getCcList() != null && sendMailInfo.getCcList().size() > 0) {
			mailSend.mailCc = sendMailInfo.getCcList().entrySet()
	                .stream()
	                .filter(x -> x.getValue() != null && x.getValue() != "")
	                .map(e -> e.getValue())
	                .collect(joining(";"));
		}
		
		mailSend.setSubject(sendMailInfo.getSubject());
		
		String[] arrayBody = new String[10];
		String body = sendMailInfo.getMailBody();
		String tempBody;
		for(int i = 0; i < arrayBody.length; i++) {
			if(this.isValidByte(sendMailInfo.getMailBody()) == false) {
				arrayBody[i] = body;
				break;
			}
			
			tempBody = this.truncateBytes(body, Charset.defaultCharset(), 4000);
			arrayBody[i] = tempBody;
			body = body.replace(tempBody, "");
		}
		
		mailSend.setBody1(arrayBody[0]);
		mailSend.setBody2(arrayBody[1]);
		mailSend.setBody3(arrayBody[2]);
		mailSend.setBody4(arrayBody[3]);
		mailSend.setBody5(arrayBody[4]);
		mailSend.setBody6(arrayBody[5]);
		mailSend.setBody7(arrayBody[6]);
		mailSend.setBody8(arrayBody[7]);
		mailSend.setBody9(arrayBody[8]);
		mailSend.setBody10(arrayBody[9]);
		
		mailSend.setUsrSet(sendMailInfo.getUserId());
		mailSend.setUsrUpd(sendMailInfo.getUserId());
		mailSend.setPrgUpd(programUpdate);
		
		if(mailSend.getMailTo() != null && (!mailSend.getMailTo().equalsIgnoreCase(""))) {
			sendMailMapper.registerSendMail(mailSend);
		}
	}
	
	/******************************
	 * Split String By Byte
	 ******************************/
	private String truncateBytes(String s, Charset charset, int maxBytes) {
		ByteBuffer bb = ByteBuffer.allocate(maxBytes);
		CharBuffer cb = CharBuffer.wrap(s);
		CharsetEncoder encoder = charset.newEncoder().onMalformedInput(CodingErrorAction.REPLACE)
				.onUnmappableCharacter(CodingErrorAction.REPLACE).reset();
		CoderResult cr = encoder.encode(cb, bb, true);
		if (!cr.isOverflow()) {
			return s;
		}
		encoder.flush(bb);
		return cb.flip().toString();
	}
	
	/******************************
	 * Check Valid Byte
	 ******************************/
	private boolean isValidByte(String body) {
		byte[] array = body.getBytes();
		if (array.length > 4000) {
			return true;
		}

		return false;
	}
}
