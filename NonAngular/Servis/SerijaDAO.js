const DB = require("./DB.js");
class SerijaDAO {
	constructor() {
		this.baza = new DB("RWA2023tpapic21.sqlite");
	}

	async GetSerieWithId(serieID) {
		let sql = `SELECT * FROM Serija WHERE TMDB_ID_serije=${serieID};`;
		this.baza.connectToDB();
		let podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();

		return podaci;
	}

	async GetAllFavouritesForUser(username) {
		let sql = `SELECT 
            Serija.TMDB_ID_serije,
            Serija.Naziv,
            Serija.Opis,
            Serija.Slika,
            Serija.Broj_sezona,
            Serija.Broj_epizoda,
            Serija.Homepage,
            Serija.Popularnost
            FROM 
            ((Favorit inner join Korisnik on Favorit.ID_user=Korisnik.ID_user) 
            INNER join Serija on Favorit.TMDB_ID_serije=Serija.TMDB_ID_serije) 
            WHERE Korisnik.Username='${username}';`;
		console.log("sql" + sql);

		this.baza.connectToDB();
		var podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();

		return podaci;
	}

	async AddNewTvSerie(serija) {
		let sql = `INSERT INTO Serija(TMDB_ID_serije,Naziv,Opis,Slika,Broj_sezona,Broj_epizoda,Homepage, Popularnost)
             VALUES(?,?,?,?,?,?,?,?)`;

		let params = [
			serija.TMDB_ID_serije,
			serija.Naziv,
			serija.Opis,
			serija.Slika,
			serija.Broj_sezona,
			serija.Broj_epizoda,
			serija.Homepage,
			serija.Popularnost,
		];
		console.log("Add serija: " + params);
		this.baza.connectToDB();
		await this.baza.executeSQL(sql, params);
		this.baza.disconnectFromDB();

		return params;
	}

	async AddNewSeason(sezona) {
		let sql = `INSERT INTO SezonaSerije(TMDB_ID_sezone,Naziv,Opis,Slika,Broj_sezone,Broj_epizoda_u_sezoni,TMDB_ID_serije)
             VALUES(?,?,?,?,?,?,?)`;

		let params = [
			sezona.TMDB_ID_sezone,
			sezona.Naziv,
			sezona.Opis,
			sezona.Slika,
			sezona.Broj_sezone,
			sezona.Broj_epizoda,
			sezona.TMDB_ID_serije,
		];
		console.log("Add sezona: " + sezona);
		this.baza.connectToDB();
		await this.baza.executeSQL(sql, sezona);
		this.baza.disconnectFromDB();
		return params;
	}

	async AddToFavourite(userID, serija) {
		let getSerija = await this.GetSerieWithId(serija.TMDB_ID_serije);
		if (getSerija.length == 0) {
			await this.AddNewTvSerie(serija);
		}
		console.log("ADDTOFAVOURITE");

		for (var season of serija.Seasons) {
			if (await this.postojiSezonaUBazi(season.id)) {
				continue;
			}
			let seas = [
				season.id,
				season.name,
				season.overview,
				`https://image.tmdb.org/t/p/w500/${season.poster_path}`,
				season.season_number,
				season.episode_count,
				serija.TMDB_ID_serije,
			];
			await this.AddNewSeason(seas);
		}

		if (!(await this.postojiFavoritUBazi(userID, serija.TMDB_ID_serije))) {
			let sql = `INSERT INTO Favorit(ID_user,TMDB_ID_serije) VALUES(${userID},${serija.TMDB_ID_serije})`;
			this.baza.connectToDB();
			var podaci = await this.baza.executeSQL(sql, []);
			this.baza.disconnectFromDB();
			return true;
		} else {
			return false;
		}
	}

	async postojiFavoritUBazi(userID, serijaID) {
		console.log("USER ID" + userID + " serija id" + serijaID);
		let sql = `SELECT * FROM Favorit WHERE ID_user=${userID} AND TMDB_ID_serije=${serijaID}`;
		this.baza.connectToDB();
		var podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();

		if (podaci.length > 0) return await this.GetSerieWithId(serijaID);
		return false;
	}

	async postojiSezonaUBazi(sezonaID) {
		let sql = `SELECT * FROM SezonaSerije WHERE TMDB_ID_sezone=${sezonaID} `;
		this.baza.connectToDB();
		var podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();
		console.log("POSTOJI SEZONA");
		console.log(podaci);
		if (podaci.length > 0) return podaci;
		return false;
	}

	async SezoneSerija(serijaID) {
		let sql = `SELECT * FROM SezonaSerije WHERE TMDB_ID_serije=${serijaID} `;
		this.baza.connectToDB();
		var podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();

		if (podaci.length > 0) return podaci;
		return false;
	}

	async ukloniIzFavorita(userID, serijaID) {
		let sql = `DELETE FROM Favorit WHERE ID_user=${userID} AND TMDB_ID_serije=${serijaID}`;
		this.baza.connectToDB();
		var podaci = await this.baza.executeSQL(sql, []);
		this.baza.disconnectFromDB();
	}
}

module.exports = SerijaDAO;
