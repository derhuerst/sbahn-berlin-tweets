'use strict'

const fetchTweets = require('../index')

fetchTweets('SBahnBerlin')
.then((tweets) => {
	for (const tweet of tweets) {
		process.stdout.write(JSON.stringify(tweet) + '\n')
	}
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
