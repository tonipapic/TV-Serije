const crypto = require('crypto');


class Kodovi{
	constructor(){
		this.sol="";
	}
dajSol(){
		return this.sol;
	}

kreirajSHA256 = function(tekst,sol){
	this.sol=generirajSol(16);
	const hash = crypto.createHash('sha256');
	hash.write(tekst+this.sol);
	console.log("Sol unutar klase: "+this.sol);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}

 EnkriptirajLozinku=function(password, salt) {
	const hash = crypto.createHash('sha256');
	hash.write(password+salt);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}



}

module.exports=Kodovi


function generirajSol(duljina) {
	const znakovi = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let sol = "";
	for (let i = 0; i < duljina; i++) {
	  const rand = Math.floor(Math.random() * znakovi.length);
	  sol += znakovi.charAt(rand);
	}
	return sol;
  }
