function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload)["cognito:username"];
}

function getImageDataURL(url, success, error) {
	var data, canvas, ctx;
	var img = new Image();
	img.onload = function(){
		// Create the canvas element.
	    canvas = document.createElement('canvas');
	    canvas.width = img.width;
	    canvas.height = img.height;
		ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0);
		try{
			data = canvas.toDataURL();
			success({data:data});
		}catch(e){
			error(e);
		}
	}
	try{
		img.src = url;
	}catch(e){
		error(e);
	}
}

var onSuccess = function(e){
    window.sessionStorage.setItem('urldata', e.data)
    console.log("getImageDataURL success")
};
    
var onError = function(e){
    window.sessionStorage.setItem('urldata', null)
    console.log("getImageDataURL failure")
};

function upload(){
    var files = $('#file').prop('files')
    var summary_language = $('#language-select').find(":selected").val();
    var summary_language_text = $('#language-select').find(":selected").text();
    console.log(files)
    console.log(summary_language)

    if (files.length == 0) {
        $('#upload-status').text("Please select an image")
    } else{
        var file = files[0]
        var url = URL.createObjectURL(file)
        var dataurl = getImageDataURL(url, onSuccess, onError)
        var file_name = file.name
        var file_type = file['type']
        var form_data = new FormData()
        form_data.append("file", file)
        
        console.log(file)
        console.log(file_name)
        console.log(file_type)

        if (!validImageTypes.includes(file_type)) {
            $('#upload-status').text("Not an image. Upload files ending with .jpg, .jpeg, or .png")
        } else {
            $('#upload-status').text("Loading... Please Wait")

            var reader = new FileReader();
            // var urlToParse = window.location.href;
            // var jwt_token=urlToParse.match(/\#(?:id_token)\=([\S\s]*?)\&/)[1];
            // var user_id=parseJwt(jwt_token);
            // console.log(user_id, "function inside")
            if (sessionStorage.getItem("user_id")){
                user_id = sessionStorage.getItem("user_id");
            } 
            else{
                var urlToParse = window.location.href;
                var jwt_token=urlToParse.match(/\#(?:id_token)\=([\S\s]*?)\&/)[1];
                var user_id=parseJwt(jwt_token);
                sessionStorage.setItem("user_id", user_id);
            }
            console.log(user_id, 'important===---')
            var params = {
                'x-amz-meta-userid': user_id, // TODO: Need to Change this according to the User ID
                'x-amz-meta-language': summary_language,
                "Content-Type" : "image/jpeg"
            }
            reader.onload = function(event) {
                const file =  new Uint8Array(event.target.result)
                file.constructor = () => file;
                sdk.uploadPost(
                    params, file, {} 
                ).then(function(result){
                    console.log("clciked")
                    window.sessionStorage.setItem('summary', result['data']['summary']);
                    window.sessionStorage.setItem('uploaded_date', result['data']['current_datetime'])
                    window.sessionStorage.setItem("language", summary_language_text)
                    if (sessionStorage.getItem("user_id")){
                        user_id = sessionStorage.getItem("user_id");
                    }
                    console.log(result)
                    console.log(window.sessionStorage)
                    console.log("testing ---------------")

                    console.log(user_id, '----------')
					console.log(summary_language, '------------')
					console.log(result['data']['summary'],'--------')
                    fetch('https://qrk2bf37j3.execute-api.us-east-1.amazonaws.com/test/gethistory', {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'x-amz-meta-userid': user_id, 
                            'x-amz-meta-language': summary_language,
                            'x-amz-meta-filename': file_name,
                            'x-amz-meta-summary': result['data']['summary'].replace(/[^\x00-\x7F]/g, ""),
                            "content-type": "application/json"
                        },
                    }).then((res) => {
                      console.log("im here");
                      fetch('https://swr83cch42.execute-api.us-east-1.amazonaws.com/test/triggerbucketsummit/' + file_name, {
                        method: 'PUT',
                        mode: 'cors',
                        headers: {
                            "Content-Type" : "image/jpeg"
                        },
                        body: file
                    }).then((result) => {window.location.href = "result.html";})});
                }).catch(function(result){
                    console.log(result)
                    $('#upload-status').text("Upload has failed. Try again")
                })

            };
            reader.readAsArrayBuffer(file);
        }
    }
}

function load_language(){
    for (const [key, value] of Object.entries(languages)) {
        $("#language-select").append(`<option value=${value}>${key}</option>`);
    }
}


$( document ).ready(function() {
    sessionStorage.setItem("test1", "Lorem ipsum");
    if (sessionStorage.getItem("user_id")){
        user_id = sessionStorage.getItem("user_id");
    } 
    else{
        var urlToParse = window.location.href;
        var jwt_token=urlToParse.match(/\#(?:id_token)\=([\S\s]*?)\&/)[1];
        var user_id=parseJwt(jwt_token);
        sessionStorage.setItem("user_id", user_id);
    }
    load_language()
    console.log(user_id, "ready")
    


    $("#submit-article").click(function(event) {
        upload();
    })
    $("#file").click(function(event) {
        console.log("New File Requested")
        $('#upload-status').text("");
    })

})