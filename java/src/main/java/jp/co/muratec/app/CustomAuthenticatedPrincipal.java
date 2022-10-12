package jp.co.muratec.app;

import jp.co.muratec.framework.auth.AuthenticatedPrincipal;

/**
 * 認証情報クラス
 * 基底クラスのAuthenticatedPrincipalを継承し、作成してください。
 * 本クラスで定義するのは、アプリで使用する認証項目です。（ユーザハッシュ値や、ワンタイムパスワードなど）
 */
public class CustomAuthenticatedPrincipal extends AuthenticatedPrincipal {
	// サンプルのため、認証項目は基底クラスのもののみ使用する
}
