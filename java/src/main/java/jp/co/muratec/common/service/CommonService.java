package jp.co.muratec.common.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.client.HttpStatusCodeException;

import jp.co.muratec.ApiStatus;
import jp.co.muratec.CollaboConst;
import jp.co.muratec.ErrorCode;
import jp.co.muratec.Tip;
import jp.co.muratec.common.domain.APICall;
import jp.co.muratec.common.domain.noiticeDomain;
import jp.co.muratec.common.mapper.CommonMapper;
import jp.co.muratec.common.request.DataApiRequest;
import jp.co.muratec.common.request.fileUploadRequest;
import jp.co.muratec.common.response.DataApiResponse;
import jp.co.muratec.common.response.DataListApiResponse;
import jp.co.muratec.common.response.downloadTokenDomain;

/**
 * 共通チェックServiceクラス
 */
@Service
@Transactional
public class CommonService {
	
	// logger定義
	Logger logger = LoggerFactory.getLogger(getClass().getName());
	
	/**************************
	 * TransactionManagerの取得
	 **************************/
	@Autowired
	PlatformTransactionManager txManager;

	@Autowired
	ExcelService excelService;
	
	@Autowired
	CommonMapper CommonMapper;
	
	@Autowired
	FileService fileService;
	
	/**
	 * 
	 * @param iconName
	 * @param folderPath
	 * @return
	 * @throws IOException
	 */
	
	public List<noiticeDomain> getNoitice() throws Exception {
		return CommonMapper.getNoitice();
	}
	
	public String getImageToBase64(String iconName , String folderPath) throws IOException {
		if(iconName == null || folderPath == null) {
			return null;
		}
		
		File folder = new File(folderPath);
		logger.debug(folderPath);
		if (!folder.exists()) {
			folder.mkdirs();
			logger.debug("not found");
			return null;
		}
		
		for (final File fileEntry : folder.listFiles()) {
	       if(fileEntry.getName().indexOf(iconName) >= 0) {
	    	   byte[] fileContent = Files.readAllBytes(fileEntry.toPath());
	    	   String encodedString = Base64.getEncoder().encodeToString(fileContent);
	    	   logger.debug("not file");
	    	   return encodedString;
	       }
	    }
		
		return null;
	}
	
	/**
	 * 
	 * @param iconUrl
	 * @return
	 */
	public String getDomainIconUrl(String iconUrl) {
		String result = null;
		try {
			if(iconUrl != null && !iconUrl.isEmpty())
			{
				 URI uri = new URI(iconUrl);
				 String domain = uri.getHost();
				 
				 result = domain.startsWith("www.") ? domain.substring(4) : domain;
			}
			
			return result;
		}
		catch (Exception e) {
			return result;
		}
		
	}
	
	/**
	 * 
	 * @param keyExtractor
	 * @return
	 */
	public static <T> Predicate<T> distinctByKey(Function<? super T, Object> keyExtractor)
	{
		Map<Object, Boolean> map = new ConcurrentHashMap<>();
		return t -> map.putIfAbsent(keyExtractor.apply(t), Boolean.TRUE) == null;
	}
	
	private HSSFSheet createSheetMMCCost(HSSFWorkbook workbook) {
		HSSFSheet sheet = workbook.createSheet("MMC見積書");
		int rownum = 0;
        Cell cell;
        Row row;
		//K2
        row = sheet.createRow(1);
        cell = row.createCell(10, CellType.STRING);
        cell.setCellValue("発効日：");
        cell.setCellStyle(this.borderBottom(workbook));
        //L2+M2
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 11, 12));
        cell = row.createCell(11, CellType.STRING);
        cell.setCellValue("");
        cell.setCellStyle(this.borderBottom(workbook));
        
        //K4
        row = sheet.createRow(3);
        cell = row.createCell(10, CellType.STRING);
        cell.setCellValue("見積No.");
        //L4+M4
        sheet.addMergedRegion(new CellRangeAddress(3, 3, 11, 12));
        cell = row.createCell(11, CellType.STRING);
        cell.setCellValue("");
        cell.setCellStyle(this.borderBottom(workbook));
        
		return sheet;
	}
	
	private HSSFCellStyle borderBottom(HSSFWorkbook workbook) {
		HSSFCellStyle style = workbook.createCellStyle();
		HSSFFont font = workbook.createFont();
		font.setFontHeightInPoints((short)11);
		style.setBorderBottom(BorderStyle.THICK);
		style.setFont(font);
		return style;
	}
	

	/**
	 * 
	 * @param downloadTokenDomain
	 * @return にファイルデータをFlushし、返します。
	 */
	public ResponseEntity<InputStreamResource> dowloadFileExcel(String dowloadToken) {
		return excelService.downLoadExcel(dowloadToken);
	}
	
	/**
	 * 言語の
	 * @param requests
	 * @return
	 */
	public String getUserId(HttpServletRequest request) {
		String result = "";
		Cookie[] cookies = request.getCookies();
		for(int i = 0; i < cookies.length; i++ ) {
			if(cookies[i].getName().equals("userid")) {
				result = cookies[i].getValue();
				
				break;
			}
		}
		
		return result;
	}
	
	public APICall callAPIOutside(String API_URL, String method, String requestBody, HttpServletRequest cookieRequest) throws Exception {
		APICall result = new APICall();
		
		try {
			URL url = new URL(API_URL);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setDoOutput(true);
			conn.setRequestMethod(method);
			conn.setRequestProperty("Content-Type", "application/json");
			conn.setRequestProperty("Cookie", "userid=" + this.getCookie("userid", cookieRequest) + "; uh2=" + this.getCookie("uh2", cookieRequest));
			
			if(method != "GET") {
				OutputStream os = conn.getOutputStream();
				byte[] input = requestBody.getBytes("utf-8");
				os.write(input, 0, input.length);
				os.flush();				
			}
			
			if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
				result.setError(true);
			} else {
				BufferedReader br = new BufferedReader(new InputStreamReader(
						(conn.getInputStream()), "UTF-8"));
				String output;
				
				while ((output = br.readLine()) != null) {
					result.setData(result.getData() + output);
				}
			}
			
			conn.disconnect();
		} catch(Exception ex) {
			result.setError(true);
		}
		
		return result;
	}
	
	public String parseString(Object data) {
		return data == null ? "" : data.toString();
	}
	
	public String getCookie(String key, HttpServletRequest cookieRequest) {
		String result = "";
		
		Cookie[] cookies = cookieRequest.getCookies();
		for(int i = 0; i < cookies.length; i++ ) {
			if(cookies[i].getName().equals(key)) {
				result = cookies[i].getValue();
				
				break;
			}
		}
		
		return result;
	}
}
