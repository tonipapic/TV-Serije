const SQLite = require("sqlite3").Database;

class DB {
	constructor(putanjaSQLliteDatoteka) {
		this.vezaDB = new SQLite(putanjaSQLliteDatoteka);
		this.putanjaSQLliteDatoteka = putanjaSQLliteDatoteka;
		this.vezaDB.exec("PRAGMA foreign_keys = ON;");
	}

	connectToDB() {
		this.vezaDB = new SQLite(this.putanjaSQLliteDatoteka);
		this.vezaDB.exec("PRAGMA foreign_keys = ON;");
	}

	executeSQL(sql, params) {
		return new Promise((uspjeh, neuspjeh) => {
			this.vezaDB.all(sql, params, (greska, rezultat) => {
				if (greska) neuspjeh(greska);
				else uspjeh(rezultat);
			});
		});
	}

	disconnectFromDB() {
		this.vezaDB.close();
	}
}

module.exports = DB;
