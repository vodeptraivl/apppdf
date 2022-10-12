package jp.co.muratec.common.util;

import java.util.HashMap;

import jp.co.muratec.common.domain.AttachmentSessionDomain;

/****************************
 * static
 ****************************/
public class AttachmentSession {
	private static final HashMap<String, AttachmentSessionDomain> map = new HashMap<>();

	/**
	 * Session
	 * @param key
	 * @return item
	 */
	public static AttachmentSessionDomain getSession(String key) {
        return map.get(key);
    }
	
	/**
	 * Session
	 * @param key
	 * @param item
	 */
	public static void saveSession(String key, AttachmentSessionDomain item) {
		if (map.containsKey(key)) {
			map.replace(key, item);
		} else {
			map.put(key, item);
		}
    }
	
	/**
	 * Session clear
	 * @param key
	 */
	public static void clearSession(String key) {
		if (map.containsKey(key)) {
			map.remove(key);
		}
	}
}
