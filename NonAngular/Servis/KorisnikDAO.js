const DB = require("./DB.js");
const Kodovi = require("./kodovi.js");
class KorisnikDAO {
	constructor() {
		this.baza = new DB("RWA2023tpapic21.sqlite");
	}

	async GetAllUsers() {
		this.baza.connectToDB();
		let sql = "SELECT * FROM Korisnik WHERE IsDeleted=0;";
		let podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();

		return podaci;
	}

	async GetUserWithUsername(username) {
		this.baza.connectToDB();
		let sql =
			"select * from Korisnik inner join Uloga on Korisnik.Uloga_ID=Uloga.ID_uloge Where Username=? AND IsDeleted=0;";
		console.log("saljem username: " + username);
		let param = [username];
		console.log("param:" + param);
		var podaci = await this.baza.executeSQL(sql, param);

		this.baza.disconnectFromDB();

		return podaci;
	}

	async AddNewUser(user) {
		let sql =
			"INSERT INTO Korisnik(Ime,Prezime,Email,Godina_rodenja,Spol,Drzava,Username,Password_Hash,Salt,Uloga_ID) VALUES(?,?,?,?,?,?,?,?,?,?)";
		let kodovi = new Kodovi();
		user.Password_Hash = kodovi.kreirajSHA256(user.Password_Hash);
		let existingUser = await this.GetUserWithUsername(user.Username);
		if (existingUser.length > 0) {
			throw new Error("Postojeci korisnik");
		}
		user.Salt = kodovi.dajSol();
		console.log(
			"Sol van funkcije: " + kodovi.dajSol() + " user.salt:" + user.Salt
		);
		let params = [
			user.Ime,
			user.Prezime,
			user.Email,
			user.Godina_rodenja,
			user.Spol,
			user.Drzava,
			user.Username,
			user.Password_Hash,
			user.Salt,
			user.Uloga_ID,
		];
		console.log("Add korisnik: " + params);
		this.baza.connectToDB();
		await this.baza.executeSQL(sql, params);
		this.baza.disconnectFromDB();
		return params;
	}

	async UpdateUser(username, user) {
		console.log(username);
		let sql = `UPDATE Korisnik SET Ime=?,Prezime=?,Email=?,Godina_rodenja=?,Spol=?,Drzava=? WHERE Username='${username}'`;

		let params = [
			user.Ime,
			user.Prezime,
			user.Email,
			user.Godina_rodenja,
			user.Spol,
			user.Drzava,
		];
		console.log("UPDATEUSER PARAMS:");
		console.log(params);
		this.baza.connectToDB();
		await this.baza.executeSQL(sql, params);
		this.baza.disconnectFromDB();
	}

	async deleteUser(korime) {
		this.baza.connectToDB();
		let parms = [korime];
		let sql = "UPDATE Korisnik SET IsDeleted=1 WHERE Username=?";
		let podaci = await this.baza.executeSQL(sql, parms);
		this.baza.disconnectFromDB();
		console.log(podaci);
		return podaci;
	}

	async provjeriKorisnika(user) {
		let podaci = await this.GetUserWithUsername(user.username);

		if (podaci.length === 0) return false;
		else {
			podaci = podaci[0];
		}
		let hashPass = new Kodovi().EnkriptirajLozinku(user.password, podaci.Salt);
		console.log(
			hashPass + " " + podaci.Password_Hash + " " + hashPass ===
				podaci.Password_Hash
		);
		if (hashPass === podaci.Password_Hash) return podaci;
		return null;
	}
}

module.exports = KorisnikDAO;
