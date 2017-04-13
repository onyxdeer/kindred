require('dotenv').load();
const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const Promise = require('bluebird');
const cors = require('cors');
const bodyParser = require('body-parser');
const AccessToken = require('twilio').AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const app = express();
const jsonParser = bodyParser.json();
const client = require('twilio')(config.accountSid, config.authToken);
const keyGenerate = Promise.promisify(client.keys.create);
const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
}

app.use(cors());
app.use(jsonParser);

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });


app.get('/api/twilio', (req, res) => {
  //api/token?q=s
  var identity = req.query.q;
  console.log(identity)
  
  keyGenerate({ friendlyName: "Kindred Chat"}).then((key, err) => {
    console.log("key is", key);
    var token = new AccessToken(
      config.accountSid,
      key.sid,
      key.secret
    );

    token.identity = identity;

    var grant = new VideoGrant();
    grant.configurationProfileSid = config.rtcProfileSid;
    token.addGrant(grant);

    res.send({
      identity: identity,
      token: token.toJwt()
    });
  })
});


https.createServer(httpsOptions, app)
  .listen(config.PORT, () => {
    console.log(`App is listening at port ${config.PORT}.`)
  });