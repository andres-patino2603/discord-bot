const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
console.log(`Reading command folders from: ${foldersPath}`);
const commandFolders = fs.readdirSync(foldersPath).filter(folder => {
    const folderPath = path.join(foldersPath, folder);
    const isDirectory = fs.statSync(folderPath).isDirectory();
    console.log(`Found ${isDirectory ? 'directory' : 'file'}: ${folderPath}`);
    return isDirectory;
});

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    console.log(`Reading command files from: ${commandsPath}`);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => {
        const filePath = path.join(commandsPath, file);
        const isFile = fs.statSync(filePath).isFile();
        console.log(`Found ${isFile ? 'file' : 'directory'}: ${filePath}`);
        return isFile && file.endsWith('.js');
    });

    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        console.log(`Processing command file: ${filePath}`);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`Registered command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();