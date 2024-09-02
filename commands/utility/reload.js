const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload.')
                .setRequired(true)),
    async execute(interaction) {
        console.log('Comando reload ejecutado');
        const commandName = interaction.options.getString('command', true).toLowerCase();
        console.log(`Comando a recargar: ${commandName}`);
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            console.log(`No se encontró ningún comando con el nombre: ${commandName}`);
            return interaction.reply(`No existe un comando con el nombre \`${commandName}\`!`);
        }

        console.log(`Comando encontrado: ${commandName}`);
        delete require.cache[require.resolve(`../utility/${command.data.name}.js`)];

        try {
            interaction.client.commands.delete(command.data.name);
            console.log(`Comando eliminado de la caché: ${command.data.name}`);
            const newCommand = require(`../utility/${command.data.name}.js`);
            console.log(`Comando recargado: ${newCommand.data.name}`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`El comando \`${newCommand.data.name}\` fue recargado!`);
        } catch (error) {
            console.error('Error al recargar el comando:', error);
            await interaction.reply(`Hubo un error al recargar el comando \`${command.data.name}\`:\n\`${error.message}\``);
        }
    },
};