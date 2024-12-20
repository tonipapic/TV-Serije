const jwt = require("jsonwebtoken");

exports.kreirajToken = function (korisnik, Konf) {
	let konfPodaci = Konf.dajKonf();

	let token = jwt.sign(
		{ userID: korisnik.id, username: korisnik.username, role: korisnik.role },
		konfPodaci.jwtTajniKljuc,
		{ expiresIn: konfPodaci.jwtValjanost + "s" }
	);
	console.log("Kreiran token:" + token);
	return token;
};

exports.provjeriToken = function (token, konf) {
	if (token != null) {
		try {
			let podaci = jwt.verify(token, konf.dajKonf().jwtTajniKljuc);
			return podaci;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
	return false;
};

exports.dekodirajBase64 = function (data) {
	let buff = new Buffer(data, "base64");
	return buff.toString("ascii").split("{");
};

exports.ispisiDijelove = function (token) {
	let dijelovi = token.split(".");
	let zaglavlje = dekodirajBase64(dijelovi[0]);
	console.log(zaglavlje);
	let tijelo = dekodirajBase64(dijelovi[1]);
	console.log(tijelo);
	let potpis = dekodirajBase64(dijelovi[2]);
	console.log(potpis);
};

exports.dajTijelo = function (token) {
	let dijelovi = token.split(".");
	return JSON.parse(dekodirajBase64(dijelovi[1]));
};

function dekodirajBase64(data) {
	let buff = new Buffer(data, "base64");
	return buff.toString("ascii");
}
