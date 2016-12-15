const fs = require("fs");
var anchor, ftarget;

gen_key = function(data){
	var len = data.length;
	var key_content = data.substring(data.indexOf('[') + 1, len - 1);
	var key_parsed = key_content.split(" ");
	
	var matrix = key_parsed.map(function(num){
		return parseInt(num, 2);
	});

	var bits = [],
			key = [];
	var id, bit;

	for(var idR = 7; idR >= 0; idR--){
		id = 7 - idR;
		bits[id] = 0;

		for(bit = 3; bit >= 0; bit--){
			bits[id] = (bits[id] << 1) | (((1 << idR) & matrix[bit]) >> idR);
		}

		if(!(bits[id] ^ 0x1) || !(bits[id] ^ 0x2) || !(bits[id] ^ 0x4) || !(bits[id] ^ 0x8) || !(bits[id] ^ 0x10) || !(bits[id] ^ 0x20) || !(bits[id] ^ 0x40) || !(bits[id] ^ 0x80)){
			key.push([id, bits[id]]);
		}
	}

	return {
		matrix: matrix,
		key   : key.sort(function(a, b){
							if(a[1] > b[1]) return 1;
							else if(a[1] < b[1]) return -1;
							else return 0;
						}).map(function(num){
							return num[0];
						})
	};
}

module.exports = {
	encrypt: function(fkey, files, bufferSize, container, index){
		anchor = this;
		ftarget = files[index];

		var readStream = fs.createReadStream(ftarget.pathname, {
			flags: "r",
			encoding: "binary",
			highWaterMark: bufferSize * 1024
		});
		var writeStream = fs.createWriteStream("uploads/" + ftarget.name + "C");

		fs.readFile(fkey, "binary", function(errR, dataKey){
			if(errR) return alert(errR);

			container.innerHTML += "> " + ftarget.name + "<br>";
			var _start = process.hrtime();

			var gen = gen_key(dataKey);
			var dec, flagL, flagR, mask, i, id, ascii;

			readStream.on("data", function(chunk){
				ascii = "";

				for(var char = 0, len = chunk.length; char < len; char++){
					dec = chunk.charCodeAt(char);
					
					flagL = (dec & 240) >> 4;
					flagR = dec & 15;

					mask = [0, 0];

					for(i = 0; i < 4; i++){
			      id = 3 - i;

			      if(((1 << id) & flagL) >> id) mask[0] ^= gen.matrix[i];
			      if(((1 << id) & flagR) >> id) mask[1] ^= gen.matrix[i];
			    }

			    ascii += String.fromCharCode(mask[0]) + String.fromCharCode(mask[1]);
				}

				writeStream.write(ascii, "binary");
			});

			readStream.on("end", function(){
				var _end = process.hrtime();
				container.innerHTML += "exec: " + (_end[0] - _start[0]) + "s " + (Math.abs(_end[1] - _start[1]) / 1000000) + "ms <br>";

				if(index++ < files.length - 1) anchor.encrypt(fkey, files, bufferSize, container, index);
				else container.innerHTML += "[end operation]";
			});
		});
	},
	decrypt: function(fkey, files, bufferSize, container, index){
		anchor = this;
		ftarget = files[index];

		var readStream = fs.createReadStream(ftarget.pathname, {
			flags: "r",
			encoding: "binary",
			highWaterMark: bufferSize * 1024
		});
		var writeStream = fs.createWriteStream("uploads/" + ftarget.name + "D");

		fs.readFile(fkey, "binary", function(errR, dataKey){
			if(errR) return alert(errR);

			container.innerHTML += "> " + ftarget.name + "<br>";
			var _start = process.hrtime();

			var gen = gen_key(dataKey);
			var dec = [], mask, ascii, bit;

			readStream.on("data", function(chunk){
				ascii = "";

				for(var char = 0, len = chunk.length; char < len; char += 2){
					dec[0] = chunk.charCodeAt(char);
					dec[1] = chunk.charCodeAt(char + 1);

					mask = 0;

					for(bit = 0; bit < 4; bit++){
						mask |= ((((1 << (7 - gen.key[bit])) & dec[0]) >> (7 - gen.key[bit])) << (7 - bit));
						mask |= ((((1 << (7 - gen.key[bit])) & dec[1]) >> (7 - gen.key[bit])) << (3 - bit));
					}

					ascii += String.fromCharCode(mask);
				}

				writeStream.write(ascii, "binary");
			});

			readStream.on("end", function(){
				var _end = process.hrtime();
				container.innerHTML += "exec: " + (_end[0] - _start[0]) + "s " + (Math.abs(_end[1] - _start[1]) / 1000000) + "ms <br>";

				if(index++ < files.length - 1) anchor.decrypt(fkey, files, bufferSize, container, index);
				else container.innerHTML += "[end operation]";
			});
		});
	}
};