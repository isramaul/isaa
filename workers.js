const fs = require("fs");
const { ethers } = require("ethers");
const crypto = require("crypto");

var tries = 0, hits = 0;

const delay = time => new Promise(res => setTimeout(res, time));
console.log("starting....");


const words = fs.readFileSync("bip39.txt", { encoding: 'utf8', flag: 'r' })
    .replace(/(\r)/gm, "")  
    .toLowerCase()  
    .split("\n");

// Define the mapping object `c`
const c = {
    k: words // Use the loaded words array here
};
function generate() {
    let A = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 128;
    if ((A = A || 128) % 32 > 0) return "Error";

    const e = new Uint8Array(A / 8);
    crypto.randomFillSync(e);

    return (function(A) {
        if (A.length % 4 > 0) return "Error";

        const convertTo32BitWords = function(A) {
            const e = [];
            for (let t = 0; t < A.length / 4; t++) {
                let n = 0;
                n += A[4 * t + 0] << 24;
                n += A[4 * t + 1] << 16;
                n += A[4 * t + 2] << 8;
                n += A[4 * t + 3];
                e.push(n);
            }
            return e;
        };

        const l = (str, padLength) => str.padStart(padLength, '0');

        const e = convertTo32BitWords(A);
        const t = crypto.createHash('sha256').update(Buffer.from(e)).digest();
        const n = t.toString('hex');

        const r = function(A) {
            let e = "";
            for (let t = 0; t < A.length; t++) e += l(A[t].toString(2), 8);
            return e;
        }(A);

        const s = l(function(A) {
            let e = "";
            for (let t = 0; t < A.length; t++) e += l(parseInt(A[t], 16).toString(2), 4);
            return e;
        }(n), 256);

        const i = r + s.substring(0, 8 * A.length / 32);
        const o = [];
        const a = i.length / 11;

        for (let u = 0; u < a; u++) {
            const w = parseInt(i.substring(11 * u, 11 * (u + 1)), 2);
            o.push(c.k[w]);
        }
        return o.join(" ");
    })(e).split(" ").slice(0, 12).join(" ");
}

// Usage
console.log(generate());



async function doCheck() {
    tries++;
    try {
        const mnemonic = generate();
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        await fs.promises.appendFile(
         "hits",
         wallet.address + "," + mnemonic + "\n"
         );
        
        hits++;
        process.stdout.write("+");
    } catch (e) {
       // console.error("err:", e);
    }
    await delay(0); // Prevent Call Stack Overflow
    doCheck();
}

doCheck();