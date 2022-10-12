package jp.co.muratec;

import java.util.regex.Pattern;

public class CollaboConst {

	
	/*
	 * ※ToDo 改修予定？ エラーメッセージは一時的にConst値で管理する。
	 */

	public static final String CATEGORY_ID_CTB = "CTD_TODOKNR";
	public static final String SSYSTEM_ID_CTB = "CTD";
	public static final String ERR_MSG_EN_AUTHENTICATION_ERROR = "Authentication error"; // 認証失敗(英語)
	public static final String REGEX = "^(\\d{4})([0-9])(\\d*?)([0-9]\\d?)$";	
	public static final String TEMPLATE_XLSX_FILE_PATH = "classpath:static/excelTemplate/costReport.xlsx";
	public static final String PRGUPD_CCE = "CTD";
	public static final String FORMAT_DAY = "yyyyMMdd";
	public static final Pattern VALID_EMAIL_ADDRESS_REGEX = Pattern.compile(
			"^([a-z0-9A-Z\\+_\\-]+)(\\.[a-z0-9A-Z\\+_\\-]+)*@([a-z0-9A-Z\\-]+\\.)+[a-zA-Z]{2,6}$",
			Pattern.CASE_INSENSITIVE);
	public static final String URL = "@URL";
	public static final String EXCEL_SUCCESS = "3で発行したダウンロードトークン";
	public static final String SUS304 = "SUS304";
	
	public interface language{
		public static final String LANG_JP = "ja";

		public static final String LANG_US = "en";
	}
	
	public interface masterCode{
		// 管理費マスタ
		public static final String MANAGEMENT_COST_CODE = "101";
		
		// パターン見積マスタ
		public static final String PATTERN_ESTIMATION_CODE = "102";
		
		// パターンオプションマスタ
		public static final String PATTERN_OPTION_CODE = "103";
		
		// 労務単価マスタ
		public static final String LABOR_PRICE_CODE = "104";
		
		// 板金コストマスタ
		public static final String METAL_PLATE_CODE = "105";
		
		// 塗装費マスタ
		public static final String PAINT_COST_CODE = "106";
		
		// 運賃マスタ
		public static final String FARE_CODE = "107";
		
		// 梱包費マスタ
		public static final String PACKING_COST_CODE = "108";
		
		// 市販品単価率マスタ
		public static final String COMMERICIAL_PRICE_CODE = "109";
		
		// 組立費マスタ
		public static final String ASSEMBLY_COST_CODE = "110";
		
		// LOCAL部品コストマスタ
		public static final String LOCAL_PART_COST_CODE = "111";
		
		// 盤種マスタ
		public static final String CONTROL_PANEL_TYPE_CODE = "112";
	}
	
	public interface className{
		// 管理費マスタ
		public static final String MANAGEMENT_COST_CLASS = "ManagementCostDomain";
		
		// パターン見積マスタ
		public static final String PATTERN_ESTIMATION_CLASS = "PatternEstimationDomain";
		
		// パターンオプションマスタ
		public static final String PATTERN_OPTION_CLASS = "PatternOptionDomain";
		
		// 労務単価マスタ
		public static final String LABOR_PRICE_CLASS = "LaborPriceDomain";
		
		// 板金コストマスタ
		public static final String METAL_PLATE_CLASS = "MetalPlateCostDomain";
		
		// 塗装費マスタ
		public static final String PAINT_COST_CLASS = "PaintCostDomain";
		
		// 運賃マスタ
		public static final String FARE_CLASS = "FareDomain";
		
		// 梱包費マスタ
		public static final String PACKING_COST_CLASS = "PackingCostDomain";
		
		// 市販品単価率マスタ
		public static final String COMMERICIAL_PRICE_CLASS = "CommercialPriceRateDomain";
		
		// 組立費マスタ
		public static final String ASSEMBLY_COST_CLASS = "AssemblyCostDomain";
		
		// LOCAL部品コストマスタ
		public static final String LOCAL_PART_COST_CLASS = "LocalPartCostDomain";
		
		// 盤種マスタ
		public static final String CONTROL_PANEL_TYPE_CLASS = "ControlPanelTypeDomain";
	}
	
	public interface actionName{
		public static final String ACTION_INSERT = "insert";
		
		public static final String ACTION_INSERT_TEMP = "insertTemp";
		
		public static final String ACTION_UPDATE = "update";
		
		public static final String ACTION_UPDATE_TEMP = "updateTemp";
	}
	
	public interface statusCode{
		public static final String CODE_10001 = "10001";
		public static final String CODE_10002 = "10002";
		public static final String CODE_10003 = "10003";
		public static final String CODE_10004 = "10004";
		public static final String CODE_10005 = "10005";
		public static final String CODE_10006 = "10006";
		public static final String CODE_10007 = "10007";
		public static final String CODE_10008 = "10008";
		public static final String CODE_10009 = "10009";
		public static final String CODE_10010 = "10010";
		public static final String CODE_10011 = "10011";
		public static final String CODE_10012 = "10012";
	}
	
	public interface status{
		public static final int STATUS_USE = 101;
		
		public static final int STATUS_NON_USE = 102;
		
		public static final int STATUS_VERIFICATION = 103;
		
		public static final int STATUS_APPROVE = 104;
		
		public static final int STATUS_COMPLETE = 105;
		
		public static final int STATUS_REJECT = 106;
		
		public static final int STATUS_NEW = 101;
	}
	
	public interface actionType{
		public static final int CREATE_ACTION = 1;
		
		public static final int UPDATE_ACTION = 2;
		
		public static final int VERIFY_ACTION = 3;
		
		public static final int APPROVE_ACTION = 4;
	}
}
