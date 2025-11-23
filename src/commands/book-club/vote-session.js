const { SlashCommandBuilder } = require('discord.js');
const session = require('./vote-session-data.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('session')
        .setDescription('Voting commands')
        .addSubcommand(subCommand =>
            subCommand.setName('open')
                      .setDescription('Open submissions for a new book club voting session')
        )
        .addSubcommand(subCommand =>
            subCommand.setName('close')
                        .setDescription('Close submissions for the current book club voting session')
        )
        .addSubcommand(subCommand =>
            subCommand.setName('vote')
                        .setDescription('Rank your favorite pitched books')
        ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'open') {
            session.reset();
            session.sessionOpen = true;
            return interaction.reply('A new book club voting session has been opened. You may now pitch a book title.');
        }
        if (interaction.options.getSubcommand() === 'close') {
            session.sessionOpen = false;
            session.votingOpen = true;
            //TODO: display the choices that were submitted and let the user know to begin voting with vote command
            return interaction.reply('Submissions for the current book club voting session have been closed.');
        }
        if (interaction.options.getSubcommand() === 'vote') {
            session.sessionOpen = false;
            session.votingOpen = true;
            return interaction.reply('Submissions for the current book club voting session have been closed.');
        }
    },
};