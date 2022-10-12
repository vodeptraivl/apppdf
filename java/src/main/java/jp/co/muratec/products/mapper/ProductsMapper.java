package jp.co.muratec.products.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import jp.co.muratec.products.domain.AccessLogDomain;
import jp.co.muratec.products.domain.message;
import jp.co.muratec.products.domain.productInfo;

@Mapper
public interface ProductsMapper {
	List<productInfo> getProducts(@Param("_productCode")String productCode);
	List<message> getMessage();
	void registerLog(@Param("_item") AccessLogDomain log);
	Long getRowProducts(@Param("_productCode")String productCode);
}
