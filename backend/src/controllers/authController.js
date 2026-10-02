const authService = require("../services/authService");

async function login(req, res) {
	const result = await authService.login(req.body.email, req.body.password);
	res.json({ data: result });
}

async function register(req, res) {
	const result = await authService.register(req.body);
	res.status(201).json({ data: result });
}

async function me(req, res) {
	const user = await authService.getCurrentUser(req.user.id);
	res.json({ data: user });
}

module.exports = { login, register, me };
