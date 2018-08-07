function getCookies() {
	return document.cookie.split(';').map((x) => x.trim().split('=')).reduce((a, b) => { a[b[0]] = b[1]; return a; }, {});
}
function setCookie(name, value) {
	//document.cookie = name+'='+value;
	document.cookie = name+'='+value+';expires=Tue, 01 Jan 2030 00:00:01 GMT;';
}
function deleteCookie(name, value) {
	document.cookie = name+'=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
