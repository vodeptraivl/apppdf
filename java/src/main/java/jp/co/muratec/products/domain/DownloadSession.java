package jp.co.muratec.products.domain;

import java.util.HashMap;

import jp.co.muratec.products.domain.DownloadSessionDomain;

/****************************
 * static変数の保存、参照を処理するクラス
 ****************************/
public class DownloadSession {
	private static final HashMap<String, DownloadSessionDomain> map = new HashMap<>();

	/**
	 * Sessionデータの取得メソッド
	 * @param key 識別用UUIDをキーとしてSessionAttachmentDomainを取得する
	 * @return
	 */
	public static DownloadSessionDomain getSession(String key) {
        return map.get(key);
    }
	
	/**
	 * Sessionデータの保存メソッド
	 * @param key 識別用UUIDをキーとしてSessionAttachmentDomainを保存する
	 * @param item アップロードやダウンロードのトランセッションの情報対象
	 */
	public static void saveSession(String key, DownloadSessionDomain item) {
		if (map.containsKey(key)) {
			map.replace(key, item);
		} else {
			map.put(key, item);
		}
    }
	
	/**
	 * Sessionデータのクリアメソッド
	 * @param key 識別用UUIDをキーとしてSessionAttachmentDomainをクリアする
	 */
	public static void clearSession(String key) {
		if (map.containsKey(key)) {
			map.remove(key);
		}
	}
}
