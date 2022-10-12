package jp.co.muratec.products.api;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;
import javax.servlet.http.HttpServletResponse;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jp.co.muratec.ErrorCode;
import jp.co.muratec.common.domain.ApiListResponseDomain;
import jp.co.muratec.common.domain.ApiResponseDomain;
import jp.co.muratec.common.domain.searchDomain;
import jp.co.muratec.common.service.CommonService;
import jp.co.muratec.products.domain.DownloadRequest;
import jp.co.muratec.products.domain.DownloadSessionDomain;
import jp.co.muratec.products.domain.MergeDomain;
import jp.co.muratec.products.domain.DownloadSession;
import jp.co.muratec.products.domain.message;
import jp.co.muratec.products.domain.savePdfDomain;
import jp.co.muratec.products.service.ProductsService;

@RestController
public class ProductsController {	
	/**************************
	 * Logger縺ｮ
	 **************************/
	Logger log = Logger.getLogger(this.getClass());
	
	@Autowired
	CommonService commonService;
	
	@Autowired
	ProductsService productsService;
	
	/**
	 * 品番情報一覧の取得
	 * @param 品番
	 * @return 品番一覧
	 */
	@RequestMapping(value="/v1/api/products", method=RequestMethod.GET)
	public ResponseEntity<ApiResponseDomain<searchDomain>> getProducts(@RequestParam("productCode") String productCode)
	{
		log.debug("Start Api Get products List");
		ApiResponseDomain<searchDomain> response = new ApiResponseDomain<searchDomain>();
		
		try {
			response = productsService.getProducts(productCode);
			
			//・取得した結果は100件超える場合エラーとしてレスポンスを返す
			if(response.getErrorCode() != null) {
				
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.error("", e);
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				response.setErrorCode(ErrorCode.DBException.toString());
				
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			} else {
				response.setErrorCode(ErrorCode.Exception.toString());
				
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}  finally {
			log.debug("Finished Api Get products List");
		}
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	/**
	 * PDFファイル一覧のダウンロードトークンの取得
	 * @param 品番
	 * @param ユーザーID
	 * @param プログラムID
	 * @return トークン
	 */
	@RequestMapping(value="/v1/api/pdf-download-token", method=RequestMethod.POST)
	public ResponseEntity<ApiResponseDomain<String>> getDownloadTokenPDF(@RequestBody DownloadRequest request)
	{
		log.debug("Start Api Get Download Token Of Product List");
		ApiResponseDomain<String> response = new ApiResponseDomain<String>();
		
		//1. パラメータ有効チェック
		if(request == null || request.getProductList() == null || request.getProgramId() == null || request.getUserId() == null) {
			response.setErrorCode("E01");
			
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}
		
		try {
			response = productsService.getDownloadTokenPDF(request);	
		} catch (Exception e) {
			e.printStackTrace();
			log.error("", e);
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				response.setErrorCode(ErrorCode.DBException.toString());
				
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			} else {
				response.setErrorCode(ErrorCode.Exception.toString());
				
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}  finally {
			log.debug("Finished Api Get Download Token Of Product List");
		}
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	
	/**
	 * 	メッセージ一覧の取得
	 * @param 無し
	 * @return メッセージ一覧
	 */
	@RequestMapping(value="/v1/api/messages", method=RequestMethod.GET)
	public ResponseEntity<ApiListResponseDomain<message>> getMessage()
	{
		log.debug("Start Api Get messages List");
		ApiListResponseDomain<message> response = new ApiListResponseDomain<message>();
		
		try {
			response = productsService.getMessage();	
		} catch (Exception e) {
			e.printStackTrace();
			log.error("", e);
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				response.setErrorCode(ErrorCode.DBException.toString());
				
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			} else {
				response.setErrorCode(ErrorCode.Exception.toString());
				
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}  finally {
			log.debug("Finished Api Get messages List");
		}
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	/**
	 * 	ファイルのアップロード
	 * @param ファイル情報一覧,Zipファイル
	 * @return ダウンロードトークン
	 */
	@RequestMapping(value="/v1/api/pdf-combination-upload", method=RequestMethod.POST)
	public ResponseEntity<ApiResponseDomain<String>> pdfCominationUpload(@RequestBody savePdfDomain upItem)
	{
		log.debug("Start Api PDF Comination Upload");
		ApiResponseDomain<String> response = new ApiResponseDomain<String>();
		
		try {
			response = productsService.pdfCombinationUpload(upItem);
		} catch (Exception e) {
			e.printStackTrace();
			log.error("", e);
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				response.setErrorCode(ErrorCode.DBException.toString());
				
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			} else {
				response.setErrorCode(ErrorCode.Exception.toString());
				
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}  finally {
			log.debug("Finished Api PDF Comination Upload");
		}
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	/**
	 * ファイルのダウンロード
	 * @param ダウンロードトークン
	 * @return PDFファイルデータ
	 * @throws IOException 
	 */
	@RequestMapping(value = "/v1/api/download-pdf", method = RequestMethod.GET)
	public void downloadPdf(@RequestParam(value="downloadToken",required=true) String downloadToken, HttpServletResponse response)  throws IllegalArgumentException, IllegalAccessException, IOException {
		InputStream myInputStream = null;
		// ダウンロードファイル情報の取得
		DownloadSessionDomain sessionItem = DownloadSession.getSession(downloadToken);
		
		try {
			File downloadFile = new File(sessionItem.getDownloadFilePath());
	        FileInputStream inStream = new FileInputStream(downloadFile);
	                 
	        // modifies response
	        response.setContentType("application/octet-stream");
	        response.setContentLength((int) downloadFile.length());
	         
	        // forces download
	        String headerKey = "Content-Disposition";
	        String filename = URLEncoder.encode(sessionItem.getOrgFileNm(), "UTF-8").replace("+", "%20");
	        String headerValue = String.format("attachment; filename=\"%s\"", filename);
	        response.setHeader(headerKey, headerValue);
	         
	        // obtains response's output stream
	        OutputStream outStream = response.getOutputStream();
	         
	        byte[] buffer = new byte[4096];
	        int bytesRead = -1;
	         
	        while ((bytesRead = inStream.read(buffer)) != -1) {
	            outStream.write(buffer, 0, bytesRead);
	        }
	         
	        inStream.close();
	        outStream.close();   
	        File file = new File(sessionItem.getDownloadFilePath());
			file.delete();
		} catch (Exception ex) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}finally {
			if(myInputStream != null) myInputStream.close();
			DownloadSession.clearSession(downloadToken);
		}
	}
	
	@RequestMapping(value="/v1/api/pdf-extracts", method=RequestMethod.POST)
	public ResponseEntity<ApiResponseDomain<String>> pdfExtract(
			@RequestBody MergeDomain upItem
			)
	{
		log.debug("Start Api PDF extract Upload");
		ApiResponseDomain<String> response = new ApiResponseDomain<String>();
		
		try {
//			files;
			response.setResult(productsService.pdfExtract(upItem));
		} catch (Exception e) {
			e.printStackTrace();
			log.error("", e);
			if (e instanceof SQLException || e instanceof SQLSyntaxErrorException || e instanceof BadSqlGrammarException
					|| e instanceof PersistenceException) {
				response.setErrorCode(ErrorCode.DBException.toString());
				
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			} else {
				response.setErrorCode(ErrorCode.Exception.toString());
				
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}  finally {
			log.debug("Finished Api PDF extract Upload");
		}
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
}
