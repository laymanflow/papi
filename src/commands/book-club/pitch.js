// commands/addbook.js
const { SlashCommandBuilder } = require('discord.js');
const session = require('./vote-session-data.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pitch')
        .setDescription('Pitch a book title for the upcoming month of book club')
        .addStringOption(opt =>
            opt.setName('title')
                .setDescription('Book title to submit')
                .setRequired(true)
        ),

    async execute(interaction) {
        if(!session.sessionOpen) {
            return interaction.reply('There is no open book club voting session at the moment.');
        }

        const title = interaction.options.getString('title');

        //prevent duplicate submissions
        if(session.submissions.includes(title)) {
            return interaction.reply('This book title has already been submitted.');
        }

        const userId = interaction.user.id;

        // allow only one submission per user per session
        if (session.users[userId] && session.users[userId].hasSubmitted == true ) {
            return interaction.reply('You have already pitched a book for this session.');
        }

        // add submission
        session.submissions.push(title);
        session.users[userId] = {
            name: userId,
            hasSubmitted: true
        };

        return interaction.reply(`**${title}** has been submitted!`);
    }
};
