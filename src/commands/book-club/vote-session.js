const { SlashCommandBuilder } = require('discord.js');
const session = require('./vote-session-data.js');

// calculate results of voting
function calculateResult(submissions, votes) {
    const score = {};
    const N = submissions.length;

    submissions.forEach(title => score[title] = 0);

    for (const userId in votes) {
        const ranked = votes[userId];
        ranked.forEach((title, index) => {
            score[title] += (N - index);
        });
    }

    return Object.entries(score)
        .sort((a, b) => b[1] - a[1]);
}

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
                .addStringOption(opt =>
                    opt.setName('choices')
                        .setDescription('Comma-separated ranked choices')
                        .setRequired(true)
                )               
        )
        .addSubcommand(subCommand =>
            subCommand.setName('results')
                .setDescription('Get results of voting session when all votes are in')
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
            if (!session.votingOpen) {
                return interaction.reply("Voting is not open.");
            }

            const userId = interaction.user.id;
            const choices = interaction.options.getString('choices');
            const ranked = choices.split(",").map(x => x.trim());

            const invalid = ranked.filter(x => !session.submissions.includes(x));
            if (invalid.length)
                return interaction.reply(`Invalid titles: ${invalid.join(", ")}`);

            session.votes[userId] = ranked;

            return interaction.reply("Your vote has been submitted!");
        }
        if (interaction.options.getSubcommand() === 'results') {
            if (!session.votingOpen)
                return interaction.reply("Voting is not open.");

            session.votingOpen = false;

            const results = calculateResult(session.submissions, session.votes);

            let response = "**Final Results:**\n\n";
            results.forEach(([title, score], i) => {
                response += `${i + 1}. ${title} — ${score} awesomeness points\n`;
            });

            const winner = results[0]?.[0] ?? "No votes cast";

            session.reset();

            return interaction.reply(`${response}\n**Winner: ${winner}**`);
        }
    },
};