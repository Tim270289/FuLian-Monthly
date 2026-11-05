// 閱讀頁深色 / 淺色模式的共用設定（伺服器端與瀏覽器端都會用到）
export const READER_THEME_STORAGE_KEY = "reader-theme";
export const READER_THEME_ATTRIBUTE = "data-reader-theme";

// 放在根版面 <head>：在畫面繪製前套用上次的選擇，避免先閃一下淺色
export const READER_THEME_SCRIPT = `(function(){try{if(localStorage.getItem("${READER_THEME_STORAGE_KEY}")==="dark")document.documentElement.setAttribute("${READER_THEME_ATTRIBUTE}","dark")}catch(e){}})()`;
