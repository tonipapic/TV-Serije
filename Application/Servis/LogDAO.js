const DB = require("./DB.js");

class LogDAO {
	constructor() {
		this.baza = new DB("RWA2023tpapic21.sqlite");
	}

	dodajLog = async function (log) {
		let option = {
			day: "numeric",
			month: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
			hour12: false,
		};

		let sql = `INSERT INTO Dnevnik(Vrsta_Zahtjeva,Trazeni_Resurs,Tijelo,User_ID,DatumVrijeme)
		VALUES(?,?,?,?,?)`;
	
		let param = [
			log.Vrsta_Zahtjeva,
			log.Trazeni_Resurs,
			JSON.stringify(log.Tijelo),
			log.User_ID,
			new Date().toLocaleDateString("hr-HR", option),
		];
	
		this.baza.connectToDB();
		let podaci = await this.baza.executeSQL(sql, param);
		this.baza.disconnectFromDB();
	};

	dajLog = async function () {
		this.baza.connectToDB();
		let sql = "Select * from Dnevnik";
		let podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();
		return podaci;
	};
}

module.exports = LogDAO;
