package jp.co.muratec.common.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import jp.co.muratec.common.domain.noiticeDomain;


/**
 * Common用Mapperインタフェース
 */
@Mapper
public interface CommonMapper {
	List<noiticeDomain>getNoitice();
}
