package jp.co.muratec;

public enum ErrorCode {
	ParamInvalid("E01"), Exception("E99"), DBException("E98"), InvalidVersion("E02"),
	DataPresent("E03"),
	SystemMasterNotSet("4")
	;

	private String errorCd;

	private ErrorCode(String errorCd) {
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
	public static ErrorCode getValue(String errorCd) {
		for (ErrorCode dow : ErrorCode.values()) {
			if (dow.toString().equalsIgnoreCase(errorCd)) {
				return dow;
			}
		}

		return null;
	}
}
