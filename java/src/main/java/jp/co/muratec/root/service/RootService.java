package jp.co.muratec.root.service;

import java.io.*;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xddf.usermodel.PresetColor;
import org.apache.poi.xddf.usermodel.XDDFColor;
import org.apache.poi.xddf.usermodel.XDDFLineProperties;
import org.apache.poi.xddf.usermodel.XDDFShapeProperties;
import org.apache.poi.xddf.usermodel.XDDFSolidFillProperties;
import org.apache.poi.xddf.usermodel.chart.AxisCrossBetween;
import org.apache.poi.xddf.usermodel.chart.AxisCrosses;
import org.apache.poi.xddf.usermodel.chart.AxisPosition;
import org.apache.poi.xddf.usermodel.chart.BarDirection;
import org.apache.poi.xddf.usermodel.chart.BarGrouping;
import org.apache.poi.xddf.usermodel.chart.ChartTypes;
import org.apache.poi.xddf.usermodel.chart.LegendPosition;
import org.apache.poi.xddf.usermodel.chart.MarkerStyle;
import org.apache.poi.xddf.usermodel.chart.XDDFBarChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFCategoryAxis;
import org.apache.poi.xddf.usermodel.chart.XDDFChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFChartLegend;
import org.apache.poi.xddf.usermodel.chart.XDDFDataSource;
import org.apache.poi.xddf.usermodel.chart.XDDFDataSourcesFactory;
import org.apache.poi.xddf.usermodel.chart.XDDFLineChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFNumericalDataSource;
import org.apache.poi.xddf.usermodel.chart.XDDFValueAxis;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jp.co.muratec.common.domain.AuthListDomain;
import jp.co.muratec.common.domain.UserIdDomain;
import jp.co.muratec.common.mapper.LoginCheckMapper;
import jp.co.muratec.common.service.CommonService;
import jp.co.muratec.root.domain.RootHistoryDomain;
import jp.co.muratec.root.mapper.RootMapper;
import com.aspose.cells.*;
import com.aspose.cells.Cell;
import com.aspose.cells.Chart;
import com.aspose.cells.Workbook;

@Service
public class RootService {
	
	@Autowired
	private RootMapper mapper;

	@Autowired
	private LoginCheckMapper LoginCheckMapper;
	
	@Autowired
	private CommonService commonService;
	
	/**
	 * ログイン処理
	 * 
	 * @return LIST DATA
	 */
	public RootHistoryDomain login(HttpServletRequest cookieRequest) {
		RootHistoryDomain result = new RootHistoryDomain();
		
		try {
			//1-1．Cookieからキー「uh2」の値を取得してハッシュ値として保持する。
			String hashNo = commonService.getCookie("uh2", cookieRequest);
			
			//1-2．HashNoをCBスキーマのユーザーハッシュテーブル（CB.CBT_USRHASH）に問合せ、ユーザー管理番号を取得する。
			Long usrSeq = LoginCheckMapper.getUserIdNotExpired(hashNo);
			
			//1-3．CAAスキーマのユーザー情報ビュー（CAA.CBV_USRINF）に問合せ、ユーザー情報を取得する。
			result = mapper.getUserInfo(usrSeq);
		} catch(Exception ex) {
			throw ex;
		}
		
		return result;
	}
}
