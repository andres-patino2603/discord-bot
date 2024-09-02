const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción de YouTube en tu canal de voz')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('La URL del video de YouTube')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            console.log('El usuario no está en un canal de voz');
            return interaction.reply('¡Debes estar en un canal de voz para usar este comando!');
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT')) {
            console.log('El bot no tiene permisos para conectarse al canal de voz');
            return interaction.reply('¡Necesito permisos para unirme a tu canal de voz!');
        }
        if (!permissions.has('SPEAK')) {
            console.log('El bot no tiene permisos para hablar en el canal de voz');
            return interaction.reply('¡Necesito permisos para hablar en tu canal de voz!');
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            console.log('Bot se ha unido al canal de voz');

            // Check if the bot is connected to the voice channel
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Bot está conectado al canal de voz y listo para reproducir audio');
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('Bot se ha desconectado del canal de voz');
            });

            connection.on('stateChange', (oldState, newState) => {
                console.log(`Connection state changed from ${oldState.status} to ${newState.status}`);
            });

            const player = createAudioPlayer();
            console.log('Audio player creado');

            // Obtener el stream de audio del video de YouTube
            const stream = ytdl(url, { filter: 'audioonly' });
            stream.on('error', error => {
                console.error('Error al obtener el stream de YouTube:', error);
                interaction.reply('Hubo un error al obtener el stream de YouTube.');
            });

            const resource = createAudioResource(stream, {
                inlineVolume: true
            });
            resource.volume.setVolume(1); // Asegúrate de que el volumen esté al máximo
            console.log('Audio resource creado');

            player.play(resource);
            console.log('Reproducción iniciada');

            connection.subscribe(player);
            console.log('Player suscrito a la conexión');

            player.on(AudioPlayerStatus.Playing, () => {
                console.log('La canción está reproduciéndose');
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('La canción ha terminado');
                // No destruir la conexión
            });

            player.on('error', error => {
                console.error('Error al reproducir la canción:', error);
                interaction.reply('Hubo un error al reproducir la canción.');
                // No destruir la conexión
            });

            await interaction.reply(`Reproduciendo: ${url}`);
        } catch (error) {
            console.error('Error al intentar unirse al canal de voz:', error);
            await interaction.reply('Hubo un error al intentar unirse al canal de voz.');
        }
    },
};