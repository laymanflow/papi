const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const session = require('./vote-session-data.js');

const VOTE_SELECT_ID = 'bookclub:vote:select';

//calculate results of voting
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

function formatSubmissions(submissions) {
    if (!submissions.length) return 'No submissions yet.';
    return submissions.map((title, index) => `${index + 1}. ${title}`).join('\n');
}

function buildVoteMenu(userId) {
    const currentVote = session.votes[userId] || [];
    const options = session.submissions
        .filter(title => !currentVote.includes(title))
        .map(title => ({
            label: title,
            value: title,
        }));

    return new StringSelectMenuBuilder()
        .setCustomId(VOTE_SELECT_ID)
        .setPlaceholder('Pick your next ranked title')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);
}

function voteSummary(vote) {
    if (!vote?.length) return 'No vote recorded yet.';
    return vote.map((title, index) => `${index + 1}. ${title}`).join('\n');
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
                .setDescription('Open private vote UI for the book club voting session')
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
            return interaction.reply(`Submissions for the current book club voting session have been closed.\n\n**Submitted titles:**\n${formatSubmissions(session.submissions)}\n\nUse /session vote to cast your private ranking.`);
        }
        if (interaction.options.getSubcommand() === 'vote') {
            if (!session.votingOpen) {
                return interaction.reply({ content: 'Voting is not open.', ephemeral: true });
            }

            const userId = interaction.user.id;
            return interaction.reply({
                content: `Voting is open!\n\n**Current submissions:**\n${formatSubmissions(session.submissions)}\n\n**Your current vote:**\n${voteSummary(currentVote)}`,
                components: [new ActionRowBuilder().addComponents(buildVoteMenu(userId))],
                ephemeral: true,
            });
        }
        if (interaction.options.getSubcommand() === 'results') {
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

    async handleVoteSelect(interaction) {
        if (interaction.customId !== VOTE_SELECT_ID) return;

        if (!session.votingOpen) {
            return interaction.reply({ content: 'Voting is not open.', ephemeral: true });
        }

        const userId = interaction.user.id;
        const currentVote = session.votes[userId] || [];
        const selectedTitle = interaction.values[0];
        session.votes[userId] = [...currentVote, selectedTitle];

        const updatedVote = session.votes[userId];
        const allRanked = updatedVote.length >= session.submissions.length;

        const expectedVoters = Object.keys(session.users);
        const allVotersComplete = expectedVoters.length > 0 && expectedVoters.every(voterId => {
            const vote = session.votes[voterId] || [];
            return vote.length >= session.submissions.length;
        });

        if (allVotersComplete) {
            session.votingOpen = false;
            await interaction.channel.send(
                `All ${expectedVoters.length} voters have completed voting! Use /session results to see the final ranking.`
            );
        }

        await interaction.update({
            content: allRanked
                ? `Your vote is complete.

            **Final ranking:**
            ${voteSummary(updatedVote)}`
                    : `Your vote has been recorded.

            **Your ranking so far:**
            ${voteSummary(updatedVote)}`,
                components: allRanked ? [] : [new ActionRowBuilder().addComponents(buildVoteMenu(userId))],
                ephemeral: true,
        });
    },
};