# tweet-delete
Twitter grooming.

## background
this is designed as a lambda bot that periodically deletes old tweets on my account. by default, it deletes anything older than 60 days, but the time period can be configured. if it finds a tweet needing deletion, it will tuck it into a google sheet because, well, nothing is ever truly deleted. it just may not be public anymore. 

## configuration
the bot depends on API credentials for your twitter and Google Drive accounts. 

### google oauth
the google api uses process.env.GOOGLE_APPLICATION_CREDENTIALS to point to your credential file. This should be the same json file you download from the [google console](https://support.google.com/googleapi/answer/6158862?hl=en). 

to make deployment easier, i download and deploy the creds.json file. note, however, that the file is not in this repo.

### app config
.env lists out instance specific configuration for the bot, google sheet, and twitter api credentials.

for google sheets, setup your own spreadsheet and grab the sheet id from the browswer. note that i've renamed my tab to "tweets". you should do the same or update this configuration to reflect your tab name.

for twitter, [create an app and grab your credentials](https://developer.twitter.com/en/apps)

## running locally
note the dotenv package being used here. when running within lambda, the environment vars are passed in with the function definition. this shortcut helps avoid the need to type them all out on the command line.
```
npm install
node app.local.js
```

## deploying to aws
read the [docs](https://docs.aws.amazon.com/lambda/index.html). there's nothing really unique here. just make sure to setup the environment variables found in .env. The handler is ```delete-me.handler```
```
zip -r function.zip .
aws lambda update-function-code --function-name tweet-delete --zip-file fileb://function.zip
```

