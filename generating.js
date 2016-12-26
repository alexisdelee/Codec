const fs = require("fs");
const crypto = require("crypto");
const program = require("commander");

Array.prototype.shuffle = function(){
  let s = this.length, i;
  while(s){
    i = (Math.random() * s--) >>> 0;
    [this[s], this[i]] = [this[i], this[s]];
  }

  return this;
};

Array.prototype.decbin = function(bits){
  let out = [], o, n;
  this.forEach((value, index) => {
    o = "", n = bits;
    while(n--){ o += (value >> n) & 1; }
    out.push(o);
  });

  return out;
};

Array.prototype.layout = function(){
  let copy = new Array(this[0].length);
  copy.fill("");
  this.forEach((value) => {
    value.split("").reverse().forEach((bit, pos) => {
      copy[pos] += bit;
    });
  });

  return copy.join("\r\n");
};

program
  .option("-l, --lines <n>", "number of lines", parseInt)
  .parse(process.argv);

let n = program.lines || 4;
if(n < 3) n = 3;
else if(n > 16) n = 16;

let m = 1 << n, seed = new Array(m - 1);
let matrix = seed
  .fill(null)
  .map((value, index) => {
    return index + 1;
  })
  .filter((el) => {
    return !(el && !(el & (el - 1)));
  })
  .shuffle()
  .slice(0, n)
  .concat(
    new Array(n)
    .fill(null)
    .map(function(value, index){
      return 1 << index;
    })
  )
  .shuffle()
  .decbin(n)
  .layout();

let time = Date.now() / 1000 | 0, name = crypto.createHmac("sha1", time.toString()).digest("hex");
fs.writeFile(name, matrix, (err) => {
  if(err) throw err;
  console.log(name);
});