const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

async function espera(interaction) {
    try {
        await wait(4000);
        await interaction.followUp('Pong again!');
        // espera(interaction); // Llamada recursiva con el argumento correcto
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    cooldown: 5, // Corregido el error tipográfico
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply({ content: 'Pooooooooong!' });
        await wait(10000);
        try {
            const message = await interaction.fetchReply();
            if (message) {
                console.log('Mensaje obtenido:', message.content);
            } else {
                console.log('No se pudo obtener el mensaje');
            }
            await interaction.deleteReply();
        } catch (error) {
            console.log('Error al obtener o eliminar el mensaje:', error);
        }
        espera(interaction); // Llamada a la función espera con el argumento correcto
    },
};