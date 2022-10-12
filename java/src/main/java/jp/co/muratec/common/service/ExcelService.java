package jp.co.muratec.common.service;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.io.FileUtils;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.PaperSize;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFPrintSetup;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import jp.co.muratec.CollaboConst;
import jp.co.muratec.common.domain.AttachmentSessionDomain;
import jp.co.muratec.common.util.AttachmentConfiguration;
import jp.co.muratec.common.util.AttachmentSession;


@Service
public class ExcelService {
	
	@Autowired
	private AttachmentConfiguration AttachmentConfig;

	/***
	 * @param XSSFWorkbook
	 * @param fileName
	 * @throws Exception 
	 */
	public String saveExcel(XSSFWorkbook book,String fileName) throws Exception {
		
		//DownloadToken
		String dowloadToken = UUID.randomUUID().toString();
		
		Date currDate = new Date();
		DateFormat dateFormat = new SimpleDateFormat(CollaboConst.FORMAT_DAY);
		String strCurrDate = dateFormat.format(currDate);
		
		//TEMPフォルダに出力したEXCELファイルを一時保存します。
		String pathFile = String.join(File.separator,
				AttachmentConfig.config().
				getTempFilePath(),
				"temp_"+strCurrDate+"_"+UUID.randomUUID());
		
		AttachmentSessionDomain session = new AttachmentSessionDomain();
		try {
			
			// TEMPフォルダに出力したEXCELファイルを一時保存します。
			File outputDirectory = new File(pathFile);
			
			if(!outputDirectory.exists()) {
				outputDirectory.mkdirs();
			}else {
				FileUtils.deleteDirectory(outputDirectory);
				outputDirectory.mkdirs();
			}
			
			//TEMPフォルダに出力したEXCELファイルを一時保存します。
			File file = new File(String.join(File.separator,pathFile, fileName+".xlsx"));
			FileOutputStream out = new FileOutputStream(file);
			
			book.write(out);
			
			//発行したダウンロードトークンをキーとしてstatic変数を作成し、EXCELファイルのパスとファイル名を保存します。
			session.setOrgFileNm(file.getName());
			session.setDownloadFilePath(pathFile);
			
			AttachmentSession.saveSession(dowloadToken, session);
			out.flush();
			out.close();
			
			//で発行したダウンロードトークン
			return dowloadToken;
		} catch (Exception ex) {
			
			AttachmentSession.clearSession(dowloadToken);
			throw ex;
		}
	}
	
	/***
	 * @param Token
	 * @Return InputStreamResource
	 * @throws UnsupportedEncodingException 
	 */
	public ResponseEntity<InputStreamResource> downLoadExcel(String dowloadToken) {
		
	    HttpHeaders responseHeader = new HttpHeaders();
		try {
			AttachmentSessionDomain session = AttachmentSession.getSession(dowloadToken);
			
			//パラメータのダウンロードトークンキーとして、static変数からEXCELファイルのパスパスとファイル名を取得します。
			File fileExcel = new File(String.join(File.separator,session.getDownloadFilePath(),session.getOrgFileNm()));
		      byte[] data = FileUtils.readFileToByteArray(fileExcel);
		      
		      String fileName = URLEncoder.encode(session.getOrgFileNm(), "UTF-8");
		      
		      responseHeader.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		      responseHeader.set("Content-Disposition","attachment; filename="+fileName);
		      responseHeader.setContentLength(data.length);
		      
			  //取得した上でダウンロードトークンに該当するstatic変数を解放します。
			  //HTTPResponseにファイルデータをFlushし、返します。
		      InputStream inputStream = new BufferedInputStream(new ByteArrayInputStream(data));
		      InputStreamResource inputStreamResource = new InputStreamResource(inputStream);
		      
		      return new ResponseEntity<InputStreamResource>(inputStreamResource, responseHeader, HttpStatus.OK);
 		} catch (Exception e) {
 			
			AttachmentSession.clearSession(dowloadToken);
			e.printStackTrace();
			
			return new ResponseEntity<InputStreamResource>(null, responseHeader, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		
	}
	
	/**
     * @param oldCell
     * @param newCell
     * @param styleMap
     */
    public static void copyCell(Cell oldCell, Cell newCell, Map<Integer, CellStyle> styleMap) {    
      if(styleMap != null) {    
        if(oldCell.getSheet().getWorkbook() == newCell.getSheet().getWorkbook()){    
          newCell.setCellStyle(oldCell.getCellStyle());    
        } else{    
          int stHashCode = oldCell.getCellStyle().hashCode();    
          CellStyle newCellStyle = styleMap.get(stHashCode);    
          if(newCellStyle == null){    
            newCellStyle = newCell.getSheet().getWorkbook().createCellStyle();    
            newCellStyle.cloneStyleFrom(oldCell.getCellStyle());
            Font newFont = newCell.getSheet().getWorkbook().createFont();
            newFont.setFontHeightInPoints((short) 9);
            newCellStyle.setFont(newFont);
            styleMap.put(stHashCode, newCellStyle);    
          }    
          newCell.setCellStyle(newCellStyle);    
        }    
      }    
    }
}
