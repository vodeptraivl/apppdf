package jp.co.muratec;

public enum ApiStatus {
	Successed("200"), ParamInvalid("400"), Exception("E99"), DBException("E98"), InvalidVersion("400"),
	Parameter("E01"),
	PasswordInvalid("E02"),
	SystemMasterNotSet("4"),DataPresent("400"),
	;

	private String apiStatusCd;

	private ApiStatus(String apiStatusCd) {
		this.apiStatusCd = apiStatusCd;
	}

	/**
	 * Get custom value
	 */
	public String toString() {
		return this.apiStatusCd;
	}

	/**
	 * Based on custom value to enum
	 * 
	 * @param apiStatusCd
	 * @return
	 */
	public static ApiStatus getValue(String apiStatusCd) {
		for (ApiStatus dow : ApiStatus.values()) {
			if (dow.toString().equalsIgnoreCase(apiStatusCd)) {
				return dow;
			}
		}

		return null;
	}
}