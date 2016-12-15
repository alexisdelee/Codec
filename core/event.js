var range = document.querySelector("input[type=range]");
var bufferDiv = document.querySelector("#buffer");
var files_container = document.querySelector("#files");
var key, files_list = [];

/*
	States
	0: home menu
	1: inserted key
	2: encryption menu
	2.5: inserted files
	3: decryption menu
	3.5: inserted files
*/
var state = 0;

range.addEventListener("change", function(){
	bufferDiv.innerHTML = "<small>Buffer size</small><br>" + this.value + " KB";
});

document.querySelector("#uploadKey").addEventListener("change", function(e){
	key = this.value.split(";")[0];
	document.querySelector("label[for=uploadKey]").textContent = this.files[0].name;

	state = 1;
});

document.querySelector("#uploadFiles").addEventListener("change", function(e){
	if(this.files.length != 0){
		files_container.innerHTML = "";
		files_list = [];

		var pathnames = this.value.split(";");
		for(var i = 0; i < this.files.length; i++){
			files_list.push({
				pathname: pathnames[i],
				name: this.files[i].name
			});
			
			files_container.innerHTML += this.files[i].name + "<br>";
		}

		if(state == 2) state = 2.5;
		else if(state == 3) state = 3.5;
	}
});