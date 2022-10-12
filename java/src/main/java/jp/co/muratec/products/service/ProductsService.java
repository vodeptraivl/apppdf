package jp.co.muratec.products.service;

import java.awt.Rectangle;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import jp.co.muratec.ApiStatus;
import jp.co.muratec.common.domain.ApiListResponseDomain;
import jp.co.muratec.common.domain.ApiResponseDomain;
import jp.co.muratec.common.domain.searchDomain;
import jp.co.muratec.common.service.CommonService;
import jp.co.muratec.products.domain.AccessLogDomain;
import jp.co.muratec.products.domain.DownloadRequest;
import jp.co.muratec.products.domain.DownloadSession;
import jp.co.muratec.products.domain.DownloadSessionDomain;
import jp.co.muratec.products.domain.MergeDomain;
import jp.co.muratec.products.domain.MergeReadDomain;
import jp.co.muratec.products.domain.PageInfo;
import jp.co.muratec.products.domain.message;
import jp.co.muratec.products.domain.pageDomain;
import jp.co.muratec.products.domain.positionDomain;
import jp.co.muratec.products.domain.productInfo;
import jp.co.muratec.products.domain.savePdfDomain;
import jp.co.muratec.products.mapper.ProductsMapper;
import org.apache.pdfbox.pdmodel.PDDocument; 
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.util.Matrix;

@Service
public class ProductsService {
	/**************************
	 * Logger縺ｮ
	 **************************/
	Logger log = Logger.getLogger(this.getClass());
	
	/**************************
	 * TransactionManager縺ｮ螳夂ｾｩ
	 **************************/
	@Autowired
	PlatformTransactionManager txManager;
	
	@Autowired
	ProductsMapper productsMapper;
	
	@Autowired
	CommonService commonService;
	
	@Value("${temp-download-path}")
	String TEMP_DOWNLOAD_PATH;
	
	@Value("${temp-save-path}")
	String TEMP_SAVE_PATH;
	
	@Value("${subfix_pathFile}")
	String SUBFIX_PATH;
	
	List<AccessLogDomain> listLog;
	
	//************************************************************************ START **************************************************************************
	//* PDF書き込みアプリ
	//* APIの品番情報一覧の取得
	public ApiResponseDomain<searchDomain> getProducts(String productCode) throws Exception {
		ApiResponseDomain<searchDomain> result = new ApiResponseDomain<searchDomain>();
		searchDomain res = new searchDomain();
		res.setSearchInfo(productsMapper.getProducts(productCode));
//		res.setCount(productsMapper.getRowProducts(productCode));
		res.setCount(res.getSearchInfo().size());
		if(res.getSearchInfo().size() == 101) {
			res.setSearchInfo(res.getSearchInfo().subList(0, 100));
		}
		result.setResult(res);
		result.setStatusCd(ApiStatus.Successed.toString());
		
		return result;
	}
	//* PDF書き込みアプリ
	//* APIの品番情報一覧の取得
	//************************************************************************* END **************************************************************************

	//************************************************************************ START **************************************************************************
	//* PDF書き込みアプリ	
	//* APIのメッセージ一覧の取得
	public ApiListResponseDomain<message> getMessage() throws Exception {
		ApiListResponseDomain<message> result = new ApiListResponseDomain<message>();
		
		result.setResult(productsMapper.getMessage());
		result.setStatusCd(ApiStatus.Successed.toString());
		
		return result;
	}
	//* PDF書き込みアプ
	//* APIの品番情報一覧の取得
	//************************************************************************* END **************************************************************************

	//************************************************************************ START **************************************************************************
	//* PDF書き込みアプリ
	//* APIのPDFファイル一覧のダウンロードトークンの取得
	public ApiResponseDomain<String> getDownloadTokenPDF(DownloadRequest request) throws Exception {
		String resource = 
				(TEMP_DOWNLOAD_PATH == null || TEMP_DOWNLOAD_PATH.equals("")) 
				? ProductsService.class.getResource("/static/temp/download").toString()
				: TEMP_DOWNLOAD_PATH;
				resource = (resource.substring(0,4).equals("file") ? resource.substring(6,resource.length()) : resource);
				resource = resource.replaceAll("%20", " ");
		DefaultTransactionDefinition def = new DefaultTransactionDefinition();
		def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
		TransactionStatus status = txManager.getTransaction(def);
		
		ApiResponseDomain<String> result = new ApiResponseDomain<String>();
		HashMap<String, String> filePaths = this.getListPdfPath(request);
		String downloadToken = UUID.randomUUID().toString();
		String zipFileName = downloadToken.concat(".zip");
		String pathFileTemp = String.join(File.separator, resource , zipFileName);
		boolean zip = zipFile(pathFileTemp,filePaths);
		
		try {
			DownloadSessionDomain session = new DownloadSessionDomain();
			session.setDownloadFilePath(pathFileTemp);
			session.setOrgFileNm(zipFileName);
			DownloadSession.saveSession(downloadToken, session);
			result.setResult(zip ? downloadToken : "");
			
			if(listLog != null) {
				for(AccessLogDomain log : listLog) {
					productsMapper.registerLog(log);
				}
			}
			result.setStatusCode(ApiStatus.Successed.toString());
			txManager.commit(status);
		} catch(Exception ex) {
			
			DownloadSession.clearSession(downloadToken);
			txManager.rollback(status);
			throw ex;
		}
		return result;
	}
	//* PDF書き込みアプリ
	//* APIのPDFファイル一覧のダウンロードトークンの取得
	//************************************************************************* END ****************************************************************************
	
	//************************************************************************ START **************************************************************************
	//* PDF書き込みアプリ
	//* APIのファイルのアップロード
	public ApiResponseDomain<String> pdfCombinationUpload(savePdfDomain upItem) throws Exception {
		String resource = (TEMP_SAVE_PATH == null || TEMP_SAVE_PATH.equals("") ) 
						? ProductsService.class.getResource("/static/temp/save").toString() 
						: TEMP_SAVE_PATH;
						resource = (resource.substring(0,4).equals("file") ? resource.substring(6,resource.length()) : resource);
						resource = resource.replaceAll("%20", " ");
//		String path  = ProductsService.class.getResourceAsStream("\stat");
		ApiResponseDomain<String> result = new ApiResponseDomain<String>();
		String uuid = UUID.randomUUID().toString();
		try {
//			ObjectMapper objectMapper = new ObjectMapper();
//			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//			upItem.setPage(objectMapper.readValue(upItem.getDataPageString(), new TypeReference<List<pageDomain>>(){}));
			//3．PDFファイルを保存することに新フォルダを作成する。
			String nameZip = uuid+".zip";
			String path = String.join(File.separator, resource, uuid);
			String pathSave = String.join(File.separator, resource, nameZip);
			String pathUnzip = String.join(File.separator, resource,upItem.getNameZip());
			
			if(upItem.getPage().size() == 0) {
				 addImgToPagePdf(upItem,path,pathSave);
			}else {
				//4．受信したZipファイルを一時保存します。
				//・Zipファイルを解凍し、zipフォルダに全てのファイルは「3.」で作成したフォルダに保存する。
				unZipStart(upItem,resource);
				unzip(pathUnzip, path);
				//5．元のPDFファイルとイメージファイルを組み合わせる。
			    addImgToPagePdf(upItem,path,pathSave);
			}
			
			//ダウンロードトークン
		    //「3.」で生成したトークン
		    DownloadSessionDomain session = new DownloadSessionDomain();
			session.setDownloadFilePath(pathSave);
			session.setOrgFileNm(nameZip);
			DownloadSession.saveSession(uuid, session);
			result.setResult(uuid);
		    
		} catch (Exception e) {
			DownloadSession.clearSession(uuid);
			throw e;
		}
		
		return result;
	}
	//* PDF書き込みアプリ
	//* APIのファイルのアップロード
	//************************************************************************* END ****************************************************************************
	
	//************************************************************************ START **************************************************************************
	//* PDF MERGE
	//* API MERGE PDF
	public String pdfExtract(MergeDomain mergeDomain) throws Exception {
		String uuid = UUID.randomUUID().toString();
		try{
//			ObjectMapper objectMapper = new ObjectMapper();
//			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//			mergeDomain.setInfoMerge(objectMapper.readValue(mergeDomain.getDataMerge(), new TypeReference<List<PageInfo>>(){}));
//			
			String resource = (TEMP_SAVE_PATH == null || TEMP_SAVE_PATH.equals("") ) 
					? ProductsService.class.getResource("/static/temp/save").toString() 
					: TEMP_SAVE_PATH;
					resource = (resource.substring(0,4).equals("file") ? resource.substring(6,resource.length()) : resource);
					resource = resource.replaceAll("%20", " ");
			List<File> files = new ArrayList<File>();
			if(mergeDomain.getFiles2() != null && mergeDomain.getFiles2().size() > 0) {
				List<MergeReadDomain> pdfs = new ArrayList<MergeReadDomain>();
				for(int i = 0; i < mergeDomain.getFiles2().size() ;i++) {
//					FileUtils.read(Base64.getDecoder().decode(mergeDomain.getFiles2().get(i).getFileBase64()));
					String name = mergeDomain.getFiles2().get(i).getFileName();
					File fileC = writeFileToTemp(String.join(File.separator, resource,name),mergeDomain.getFiles2().get(i).getFileBase64());
					MergeReadDomain pR = new MergeReadDomain();
					pR.setFile(PDDocument.load(fileC));
					pR.setIndexFile(i);
					pR.setFileName(name);
					pdfs.add(pR);
					files.add(fileC);
					mergeDomain.getFiles2().get(i).setFileBase64("");
				}
				PDDocument mergeDoc = new PDDocument();
				
				for(int i = 0; i < mergeDomain.getInfoMerge().size() ; i++) {
					PageInfo page = mergeDomain.getInfoMerge().get(i);
					List<MergeReadDomain> docFile = pdfs.stream()
	                        .filter(x -> x.getFileName().equals(page.getFileName())).collect(Collectors.toList());
					if(docFile != null && docFile.size() == 1) {
						PDPage pageMerge = docFile.get(0).getFile().getPage(page.getPageNumber());
						pageMerge.setRotation((pageMerge.getRotation()+page.getRotate()));
						mergeDoc.addPage(pageMerge);
					}
				}
				
				
				String fileName = "unnamed"+mergeDomain.getCountPage()+".pdf";
				String pathSave = String.join(File.separator, resource, fileName);
				
				mergeDoc.save(new File(pathSave));
				mergeDoc.close();
				for(int i = 0; i < pdfs.size() ; i++) {
					pdfs.get(i).getFile().close();
					files.get(i).deleteOnExit();
				}
			    DownloadSessionDomain session = new DownloadSessionDomain();
				session.setDownloadFilePath(pathSave);
				session.setOrgFileNm(fileName);
				DownloadSession.saveSession(uuid, session);
				return uuid+';'+fileName;
			}
		    
		} catch (Exception e) {
			DownloadSession.clearSession(uuid);
			throw e;
		}
		return null;
		
	}
	//* PDF MERGE
	//* API MERGE PDF
	//************************************************************************* END ****************************************************************************
		
		
	//************************************************************************ START **************************************************************************
	//* PDF書き込みアプリ
	//* APIのFunction
	private HashMap<String, String> getListPdfPath(DownloadRequest request) throws Exception{
		HashMap<String, String> filePaths = new HashMap<String,String>();
		List<productInfo> listFile = new LinkedList<productInfo>();
		listFile.addAll(request.getProductList());
		listLog = new ArrayList<AccessLogDomain>();
		String subfix = SUBFIX_PATH == null ? "" :SUBFIX_PATH;
		for(int j = 0; j<listFile.size(); j++) {				
			if(!filePaths.containsValue(listFile.get(j).getPdfFileName())) {
				String serverName = "\\\\" + listFile.get(j).getPdfsrv();
				String filePathUrl = listFile.get(j).getPdfpas();
				filePathUrl = filePathUrl.replace("\\\\", "\\").replace("//", "\\").replace("/", "\\");
				filePathUrl = filePathUrl.toUpperCase();
				
				if(filePathUrl.indexOf("\\MAIN\\") > -1) {
					if(filePathUrl.indexOf("\\PDF\\") > -1) {
						filePathUrl = filePathUrl.replace("\\PDF\\", "\\PDF"+subfix+"\\");
					}
					else {
						filePathUrl = filePathUrl.replace("\\MAIN\\", "\\MAIN"+subfix+"\\");
					}
				}
				
				String filePath = String.join(File.separator, serverName, filePathUrl, listFile.get(j).getPdfFileName());
				
				filePaths.put(filePath, listFile.get(j).getPdfFileName());
				AccessLogDomain log = new AccessLogDomain();
				log.setProdno(listFile.get(j).getHinb());
				log.setPdffName(listFile.get(j).getPdfFileName());
				log.setUsrSet(request.getUserId());
				log.setUsrUpd(request.getUserId());
				log.setPrgupd(request.getProgramId());
				listLog.add(log);
				
			}
		}
		
		return filePaths;
	}
	
	private void unZipStart(savePdfDomain upItem,String resources)  throws Exception{
		FileOutputStream fos = new FileOutputStream(String.join(File.separator, resources ,upItem.getNameZip()));
		fos.write(Base64.getDecoder().decode(upItem.getZipFile()));
		fos.close();
	}

	
    private void unzip(String zipFilePath, String destDir) throws Exception{
	    File dir = new File(destDir);
	    if(!dir.exists()) dir.mkdirs();
	    FileInputStream fis;
	    byte[] buffer = new byte[1024];
	    fis = new FileInputStream(zipFilePath);
	    ZipInputStream zis = new ZipInputStream(fis);
	    ZipEntry ze = zis.getNextEntry();
	    while(ze != null){
	        String fileName = ze.getName();
	        File newFile = new File(destDir + File.separator + fileName);
	        new File(newFile.getParent()).mkdirs();
	        FileOutputStream fos = new FileOutputStream(newFile);
	        int len;
	        while ((len = zis.read(buffer)) > 0) {
	        fos.write(buffer, 0, len);
	        }
	        fos.close();
	        zis.closeEntry();
	        ze = zis.getNextEntry();
	    }
	    zis.closeEntry();
	    zis.close();
	    fis.close();
		File file = new File(zipFilePath);
		file.delete();
    }
	 
	 private boolean zipFile(String pathFileTemp,HashMap<String, String> filePaths) throws Exception {
		boolean res = false;
		File zf = new File(pathFileTemp);
		BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(zf));
		ZipOutputStream zos = new ZipOutputStream(bos);
		for(Map.Entry<String, String> aFile : filePaths.entrySet()) {
			File tmpDir = new File(aFile.getKey());
			if(tmpDir.exists()) {
				res = true;
				zos.putNextEntry(new ZipEntry(aFile.getValue()));
				InputStream inputStream = new BufferedInputStream(new FileInputStream(tmpDir));
				byte[] buf = new byte[1024];
				int len = 0;
				while(len != -1) {
					zos.write(buf, 0, len);
					len = inputStream.read(buf);
				}
				
				inputStream.close();
				zos.closeEntry();
			}
		}
		zos.close();
	    return res;
	}
	 
	private void addImgToPagePdf(savePdfDomain upItem,String path,String pathSave) throws Exception {
		List<pageDomain> pages = upItem.getPage();
		PDDocument document = null;
		try {
			if(upItem.getPage() == null || upItem.getPage().size() == 0) {
				document = new PDDocument();
				document.addPage(new PDPage());
			} else {
				document = PDDocument.load(new File( (upItem.getJoinFile() != null &&  upItem.getJoinFile() == true )? extractPageForJoin(upItem, path) : String.join(File.separator, path ,upItem.getPdfFileName())));
				for(pageDomain page : pages) {
					PDPage pageOfIndex = document.getPage(page.getIndex());
					Integer rotation = pageOfIndex.getRotation();
		        	if(page.getPosition() != null && page.getPosition().size() > 0) {
		        		//add draw line
		        		List<positionDomain> line = page.getPosition().stream()
		                        .filter(x -> "line".equals(x.getType())).collect(Collectors.toList());
		        		//add image
		        		List<positionDomain> image = page.getPosition().stream()
		                        .filter(x -> "img".equals(x.getType()))
		                        .collect(Collectors.toList());
		        		//add text
		        		List<positionDomain> text = page.getPosition().stream()
		                        .filter(x -> "text".equals(x.getType()))
		                        .collect(Collectors.toList());
		        		//svg
		        		List<positionDomain> shape = page.getPosition().stream()
		                        .filter(x -> "shape".equals(x.getType()))
		                        .collect(Collectors.toList());
		        		
		        		Matrix matrix = Matrix.getRotateInstance(Math.toRadians(rotation), 0, 0);
		        		PDRectangle cropBox = pageOfIndex.getCropBox();
		        		Rectangle rectangle = cropBox.transform(matrix).getBounds();
		        		float h = (float) rectangle.getHeight();
		      	      	float w = (float) rectangle.getWidth();
		      	      	//add image
		      	      	drawContent(image,page,document,pageOfIndex,matrix,path,w,h,rotation);
		      	      	//add draw line
		      	     	drawContent(line,page,document,pageOfIndex,matrix,path,w,h,rotation);
		    			//add text
		      	      	drawContent(text,page,document,pageOfIndex,matrix,path,w,h,rotation);
		      	      	//add shape
		      	      	drawContent(shape,page,document,pageOfIndex,matrix,path,w,h,rotation);
		        	}
		        	pageOfIndex.setRotation((page.getRotate()+rotation));
		        }
			}
			

			document.save(new File(pathSave));
			document.close();
			FileUtils.deleteDirectory(new File(path));
		} catch (Exception e) {
			throw e;
		}
	}

	private void drawContent(List<positionDomain> position,pageDomain page,PDDocument document,PDPage pageOfIndex,Matrix matrix,String path,float w,float h,Integer rol) throws Exception {
		
		if(position != null && position.size() > 0) {
			for(positionDomain pos : position) {
				PDPageContentStream contentStream = null;
	    		try {
	    			contentStream = new PDPageContentStream(document, pageOfIndex, AppendMode.APPEND,true,true);
	    			contentStream.transform(matrix);
	    			contentStream.saveGraphicsState();
	        		contentStream.restoreGraphicsState();
					String pathImg = String.join(File.separator,path, pos.getNm());
					PDImageXObject pdImage = PDImageXObject.createFromFile(pathImg,document);

					float x = calcPostion(pos.getX(),w);
					float y = calcPostion((pos.getY()),h);
					float ww = calcPostion(pos.getW(),w);
					float hh = calcPostion(pos.getH(),h);
					ww = ww > w ? w : ww;
					hh = hh > h ? h : hh;
					float maxX = w - ww;
					float maxY = h - hh;
					x = (x < 0 ? 0 : (x < maxX ? x : maxX));
					y = (y < 0 ? 0 : (y < maxY ? y : maxY));
					switch(rol) {
						case 90:
							y += (h*-1);
							break;
						case 180 : 
							x += (w*-1);
							y += (h*-1);
							break;
						case 270:
							x += (w*-1);
							break;
					}
					contentStream.drawImage(pdImage,x,y,ww,hh);
				} catch (Exception e) {
					throw e;
				} finally {
					contentStream.close();
				}
			}
		}
		
	}
	
	private float calcPostion(float d, float d2) {
		return (float) (((d2)/100)*d);
	}
	
	private String extractPageForJoin(savePdfDomain info,String pathUnzip) throws Exception {
		PDDocument mergeDoc = new PDDocument();
		String fileName = "unnamed_"+(UUID.randomUUID().toString().replace("-","").substring(0,8))+".pdf";
		String pathSave = String.join(File.separator, pathUnzip, fileName);
		try{
			List<pageDomain> pages = info.getPage();
			String[] fileNames = info.getFileNameJoin().split(";");
			if(fileNames != null && fileNames.length > 0) {
				List<MergeReadDomain> pdfs = new ArrayList<MergeReadDomain>();
				for(int i = 0; i < fileNames.length; i++) {
					if(fileNames[i] == null || fileNames[i].equals("")) {
						continue;
					}
					MergeReadDomain pR = new MergeReadDomain();
					pR.setFile(PDDocument.load(new File(String.join(File.separator, pathUnzip ,fileNames[i]))));
					pR.setIndexFile(i);
					pR.setFileName(fileNames[i]);
					pdfs.add(pR);
				}
				
				for(int i = 0; i < pages.size() ; i++) {
					pageDomain page = pages.get(i);
					List<MergeReadDomain> docFile = pdfs.stream()
	                        .filter(x -> x.getFileName().equals(page.getFileName())).collect(Collectors.toList());
					if(docFile != null && docFile.size() == 1) {
						PDPage pageMerge = docFile.get(0).getFile().getPage(page.getPageNumber());
						mergeDoc.addPage(pageMerge);
					}
				}
				
				mergeDoc.save(new File(pathSave));
				mergeDoc.close();
				for(int i = 0; i < pdfs.size() ; i++) {
					pdfs.get(i).getFile().close();
				}
				
			}
			return pathSave;
		} catch (Exception e) {
			throw e;
		}
		
	}
	
	private File writeFileToTemp(String path,String base64String) throws Exception {
		FileOutputStream fos = new FileOutputStream(path);
		fos.write(Base64.getDecoder().decode(base64String));
		fos.close();
		return new File (path);
	}
	
	//* PDF書き込みアプリ
	//* APIのFunction
	//************************************************************************* END ****************************************************************************
}