package jp.co.muratec;

public enum Tip {
	ParamInvalid("パラメータが無効です。"), Exception("'システムエラーが発生しました。"), DBException("データアクセス処理のエラーが発生しました。"), InvalidVersion("排他制御チェックエラー"),
	SystemMasterNotSet("4"),DataPresent("データ存在")
	;

	private String errorCd;

	private Tip(String errorCd) {
		this.errorCd = errorCd;
	}

	/**
	 * Get custom value
	 */
	public String toString() {
		return this.errorCd;
	}

	/**
	 * Based on custom value to enum
	 * 
	 * @param apiStatusCd
	 * @return
	 */
	public static Tip getValue(String errorCd) {
		for (Tip dow : Tip.values()) {
			if (dow.toString().equalsIgnoreCase(errorCd)) {
				return dow;
			}
		}

		return null;
	}
}
