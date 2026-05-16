//hold all necessary data for a book club voting session
module.exports = {
    users: {},
    submissions: [],
    votes: {},
    sessionOpen: false,
    votingOpen: false,

    reset() {
        this.users = {};
        this.submissions = [];
        this.votes = {};
        this.sessionOpen = false;
        this.votingOpen = false;
    }
};