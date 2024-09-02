const { SlashCommandBuilder } = require('discord.js');
const { cooldwon } = require('./ping');

module.exports = {
	cooldwon:5,
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Este es un servidor para hacer pruebas en el funcionamiento del bot.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`Este server es ${interaction.guild.name} y tiene ${interaction.guild.memberCount}, fue creado para probar las funcionalidades de los bots.`);
	},
};