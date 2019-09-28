'use strict'

const Twitter = require('twit')
const tokens = require('twitter-tokens')
const parseRawTweet = require('./lib/parse-raw-tweet')
const parseTweet = require('./parse')

const ACCOUNT = 'SBahnBerlin'

const twitter = new Twitter(tokens)

const fetchTweets = async (count = 5) => {
	const {data: tweets} = await twitter.get('statuses/user_timeline', {
		screen_name: ACCOUNT,
		count,
		trim_user: true,
		include_rts: true, // todo
		exclude_replies: true,
		tweet_mode: 'extended'
	})

	return tweets
	.map(parseRawTweet)
	.map(t => parseTweet(t))
}

module.exports = fetchTweets
