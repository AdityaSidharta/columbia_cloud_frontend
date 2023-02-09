$( document ).ready(function() {
    // console.log(window.sessionStorage)
    $("#upload_image").attr("src", window.sessionStorage.getItem("urldata"))
    $("#upload_date").text(window.sessionStorage.getItem("uploaded_date"))
    $("#upload_language").text(window.sessionStorage.getItem("language"))
    $("#upload_summary").text(window.sessionStorage.getItem("summary"))
})