const nodemailer = require("nodemailer");

let mailer = nodemailer.createTransport({
	host: "mail.foi.hr",
	port: 25,

	//auth: {
	//user: "",
	//pass: ""
	//},
});

/*let mailer = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	
	auth: {
	user: "tpapic21@student.foi.hr",
	pass: "dljk ttkr wsid hehd"
	},
});*/

exports.posaljiMail = async function (salje, prima, predmet, poruka) {
	message = {
		from: salje,
		to: prima,
		subject: predmet,
		text: poruka,
	};
	console.log("SLANJE MAILA..." + message);
	let odgovor = await mailer.sendMail(message);
	console.log(odgovor);
	return odgovor;
};
