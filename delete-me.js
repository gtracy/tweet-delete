let moment = require('moment-timezone');
let async = require('async');
const Twit = require('twit')
const Google = require('./google');
const google = new Google();

let T = new Twit({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token: process.env.TW_ACCESS_TOKEN,
  access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:  true,     // optional - requires SSL certificates to be valid.
});


async function pushToGoogle(tweet) {

    const tweet_date = moment.tz(tweet.created_at,"ddd MMM DD HH:mm:ss Z YYYY",process.env.TIMEZONE).format("YYYY-MM-DD hh:mm:ss");
    const data_row = [tweet_date, tweet.full_text, tweet.retweet_count, tweet.favorite_count];
    console.dir(data_row);

    const data = await google.postRowData(process.env.GOOGLE_SHEET_ID, data_row);
    console.log('done posting '+tweet.id_str);

}

async function deleteTweet(tweet) {
    T.post('statuses/destroy/:id', { id: tweet.id_str }, async (err, data, response) => {
        if (err) {
            console.log('Failed to destroy tweet, ' + tweet.id_str);
        }
        else {
            await pushToGoogle(tweet, (err) => {
                write_count++;
                if (err) {
                    console.log('failed to push tweet to google, ' + tweet.id_str);
                }
                else {
                    console.log(tweet.created_at);
                }
            });
        }
    });
}


/*
 * Start the simple script to read timeline and groom tweets
 */
exports.handler = () => {
    const promise = new Promise( async function(resolve, reject) {
        try {
            await google.init();
            T.get('statuses/user_timeline', {count:100,tweet_mode:"extended"}, (err,data,response) => {

                if( err ) {
                    console.log('Twitter API fail... ' + err);
                } else {
                    let start_date = new Date();
                    start_date.setDate(start_date.getDate() - process.env.DAYS_TO_GROOM);
                    async.eachSeries(data, (tweet,callback) => {

                        let tweet_date = new Date(tweet.created_at);
                        if( tweet_date.getTime() > start_date.getTime() ) {
                            console.log('DELETE MISS : ' + tweet.id_str + " - " + tweet_date);
                            callback();
                        } else {
                            console.log('DELETE HIT : ' + tweet.id_str + " - " + tweet_date);
                            deleteTweet(tweet);
                            callback();
                        }
                        
                    });

                }

            });
        } catch (e) {
            console.log('ERROR :: script failed, ' + e);
        }
    });
    return promise;
};
