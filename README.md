# papi
Porter All Purpose Interface, a discord bot catered to George Porter World and its members.

# Commands

## example
### ping.js
 - use /ping and bot will return "Pong!"

## book-club
### pitch.js
 - use **/pitch [titleOfBook]** to pitch your book (must have an open session)
### vote-session.js
 - use **/session open** to open a new voting session, enabling users to use /pitch
 - use **/session close** to close the session from pitching
 - use **/session vote [rankedChoice1, rankedChoice2, rankedChoice3, etc]** to place a ranked choice vote on your favorite of the pitched books (titles must match)
 - use **/session results** after everyone has voted to calculate and display the results with the winning book club pitch
### vote-session-data.js
 - holds necessary data during an active session

# Main scripts

# deploy-commands.js
 - run to deploy newly developed commands and enable them for usage
# index.js
 - run to start up the bot instance after deploying commands
 - contains error handling for when commands fail