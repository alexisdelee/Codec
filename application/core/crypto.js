const fs = require("fs");
var anchor, ftarget;

gen_key = function(data){
	var key_parsed = data.split("\r\n");
	var N = key_parsed[0].length;
	
	var matrix = key_parsed.map(function(num){
		return parseInt(num, 2);
	});

	var bits = [],
			key = [];
	var id, bit, len;

	for(var idR = N - 1; idR >= 0; idR--){
		id = N - 1 - idR;
		bits[id] = 0;

		for(bit = N >> 1; bit >= 0; bit--){
			bits[id] = (bits[id] << 1) | (((1 << idR) & matrix[bit]) >> idR);
		}

		for(bit = 0x01, len = 1 << N; bit != len; bit <<= 1){
			if(!(bits[id] ^ bit)){
				key.push([id, bits[id]]);
				break;
			}
		}
	}

	return {
		N 		: N,
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
		var writeStream = fs.createWriteStream("../uploads/" + ftarget.name + "C");

		fs.readFile(fkey, "binary", function(errR, dataKey){
			if(errR) return alert(errR);

			container.innerHTML += "> " + ftarget.name + "<br>";
			var _start = process.hrtime();

			var gen = gen_key(dataKey);
			var dec, flagL, flagR, mask, bit, id, buf, half = gen.N >> 1, _buffer;

			readStream.on("data", function(chunk){
				_buffer = Buffer.from(chunk);
				buf = [];

				for(var char = 0, len = _buffer.length; char < len; char++){
					dec = _buffer[char];
					
					for(bit = half - 1; bit >= 0; bit--){
						flagL |= 1 << (bit + half);
						flagR |= 1 << bit;
					}

					flagL &= dec;
					flagL >>= half;
					flagR &= dec;

					mask = [0, 0];

					for(bit = half - 1; bit >= 0; bit--){
			    	id = half - 1 - bit;

			    	if(((1 << id) & flagL) >> id) mask[0] ^= gen.matrix[bit];
			      if(((1 << id) & flagR) >> id) mask[1] ^= gen.matrix[bit];
			    }

			    buf.push(mask[0], mask[1]);
				}

				writeStream.write(Buffer.from(buf), "binary");
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
		var writeStream = fs.createWriteStream("../uploads/" + ftarget.name + "D");

		fs.readFile(fkey, "binary", function(errR, dataKey){
			if(errR) return alert(errR);

			container.innerHTML += "> " + ftarget.name + "<br>";
			var _start = process.hrtime();

			var gen = gen_key(dataKey);
			var dec = [], mask, buf, bit, half = gen.N >> 1;

			readStream.on("data", function(chunk){
				buf = [];

				for(var char = 0, len = chunk.length; char < len; char += 2){
					dec[0] = chunk.codePointAt(char);
					dec[1] = chunk.codePointAt(char + 1);

					mask = 0;

					for(bit = 0; bit < half; bit++){
						mask |= ((((1 << (gen.N - 1 - gen.key[bit])) & dec[0]) >> (gen.N - 1 - gen.key[bit])) << (gen.N - 1 - bit));
						mask |= ((((1 << (gen.N - 1 - gen.key[bit])) & dec[1]) >> (gen.N - 1 - gen.key[bit])) << (half - 1 - bit));
					}

					buf.push(mask);
				}

				writeStream.write(Buffer.from(buf), "binary");
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