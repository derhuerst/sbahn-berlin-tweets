'use strict'

const fetchTweets = require('.')

fetchTweets()
.then((tweets) => {
	for (const tweet of tweets) console.log(tweet)
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})

// const parseTweet = require('./parse')
// console.log(parseTweet({
// 	id: '1169285882949636096',
// 	text: [
// 		{type: 'hashtag', content: 'S42'},
// 		{type: 'plain', content: ', '},
// 		{type: 'hashtag', content: 'S45'},
// 		{type: 'plain', content: ' nach Betätigung der Notbremse in einem Zug in '},
// 		{type: 'hashtag', content: 'Sonnenallee'},
// 		{type: 'plain', content: ', kommt es zu Verspätungen und vereinzelten Zugausfällen.'}
// 	]
// }))
