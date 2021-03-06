'use strict'

const Twitter = require('twit')
const tokens = require('twitter-tokens')
const parseRawTweet = require('./lib/parse-raw-tweet')
const parseTweet = require('./parse')
const filterQuoted = require('./lib/filter-quoted')

const ACCOUNT = 'SBahnBerlin'

const twitter = new Twitter(tokens)

const fetchTweets = async (count = 5, opt = {}) => {
	const {data: raw} = await twitter.get('statuses/user_timeline', {
		screen_name: ACCOUNT,
		count,
		trim_user: true,
		include_rts: true, // todo
		exclude_replies: true,
		tweet_mode: 'extended'
	})

	const tweets = raw
	.map(parseRawTweet)
	.map(t => ({...parseTweet(t, opt), account: ACCOUNT}))
	return filterQuoted(tweets)
}

module.exports = fetchTweets
