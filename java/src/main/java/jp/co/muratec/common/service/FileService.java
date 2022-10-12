package jp.co.muratec.common.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jp.co.muratec.common.request.fileUploadRequest;
import jp.co.muratec.common.util.AttachmentConfiguration;

@Service
public class FileService {
	
	@Autowired
	private AttachmentConfiguration AttachmentConfig;
	
	public String saveFile(fileUploadRequest data) throws Exception {
		String res = "";
		
		//設定ファイルから一時保存先を取得し、セッションキーをフォルダ名として、TEMPフォルダを作成します。
		String pathTemp = String.join(File.separator,
				AttachmentConfig.config().getTempFilePath(),
				"TEMP_"+data.getTempFolder());
		
		//で作成したパス+リクエストのfileDataのファイル名
		String pathFolderFile = String.join(File.separator,
					pathTemp, 
					data.getSessionKey());
		
		//で作成したパス+リクエストのfileDataのファイル名
		String pathFile = String.join(File.separator,
				pathFolderFile,
				data.getFileName());
		try {
			
			File outputDirectory = new File(pathTemp);
			if(!outputDirectory.exists()) {
				outputDirectory.mkdirs();
			}
			
			File outputDirectoryFile = new File(pathFolderFile);
			if(!outputDirectoryFile.exists()) {
				outputDirectoryFile.mkdirs();
			}else {
				FileUtils.deleteDirectory(outputDirectoryFile);
				outputDirectoryFile.mkdirs();
			}
			
			File file = new File(pathFile);
			FileOutputStream out = new FileOutputStream(file);
			
			out.write(data.getFileData().getBytes());
			res = pathFolderFile;
			out.flush();
			out.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return res;
	}
	
	public void moveFile(String from, String to, String fileName) {
		try {
			File fileFrom = new File(from);
			if(fileFrom.exists()) {
				File ROOT = new File(to);
				if(!ROOT.exists()) {
					ROOT.mkdirs();
				}
				FileOutputStream out = new FileOutputStream(String.join(File.separator, to,fileName));
				out.write(readFileToByteArray(fileFrom));
				out.flush();
				out.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	public void Clear(String pathFolder) throws Exception {
		
		File pathClear = new File(pathFolder);
		FileUtils.deleteDirectory(pathClear);
		
	}
	
	
	/**
     * @param file
     * @return byte
     */
    private static byte[] readFileToByteArray(File file){
        FileInputStream fis = null;
        byte[] bArray = new byte[(int) file.length()];
        try{
            fis = new FileInputStream(file);
            fis.read(bArray);
            fis.close();        
            
        }catch(Exception ioExp){
            ioExp.printStackTrace();
        }
        return bArray;
    }
}
