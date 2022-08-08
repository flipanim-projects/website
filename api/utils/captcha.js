let got, formData;
import("got").then((data) => (got = data.got));
import("formdata-node").then((data) => (formData = data.FormData));
function CaptchaHandler() {
	this.send = async function ({ hcaptcha, invalid, next }) {
		if (!hcaptcha) return invalid();
		else {
			console.log("Sending to captcha");
			const form = new formData();
			form.set("secret", "0xC5B6Bd0750C259aa60648bd42Fd44C6974172b31");
			form.set("response", hcaptcha);
			await got
				.post("https://hcaptcha.com/siteverify", {
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					form: {
						secret: "0xC5B6Bd0750C259aa60648bd42Fd44C6974172b31",
						response: hcaptcha,
					},
				})
				.json()
				.then((resp) => {
					if (resp.success === false) return invalid();
					else next();
				});
		}
	};
	return this;
}

module.exports = CaptchaHandler;
