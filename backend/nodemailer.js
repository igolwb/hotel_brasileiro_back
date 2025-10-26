import nodemailer from 'nodemailer';

// Função para enviar email de recuperação de senha
// Exemplo: await sendTokenEmail(email, token)
const sendTokenEmail = async (email, token) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	});

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Recuperação de Senha - Hotel Brasileiro',
		text: `Seu código de recuperação é: ${token}`
	};

	await transporter.sendMail(mailOptions);
};

export default sendTokenEmail;
