# LNURL-Quests

A core and basic implementation of a REST API able to automatically reward users for quest completion by paying through LNURL-withdraw.  
The ```lnurl``` module implements a simple LNURL server.

See: [LUD-03: withdrawRequest](https://github.com/lnurl/luds/blob/luds/03.md).

Requirements:
1. git
2. Docker and Docker Compose

## Getting started

Clone the project:
```bash
git clone https://github.com/arcadeJHS/lnurl-quests.git
cd lnurl-quests
```

Add your ```.env``` configuration file in the root of the ```nestjs_api``` folder.  
An example configuration is provided in ```.env.example```:
```
MONGODB_URI=mongodb://lnurl_user:lnurl_password@localhost:27017/lnurl-quests
BASE_URL=http://localhost:3000
LNBITS_URL=https://lb1.yourdomain.wtf/
LNBITS_API_KEY=123a123b123c123d
API_KEY=123a123b123c123d
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=10
MAX_WITHDRAW_AMOUNT=1000
MIN_WITHDRAW_AMOUNT=50
ALLOWED_ORIGINS=http://localhost:3000,https://other-domain.com
```

> Note: API reuests need to be authorized by a ```X-Api-Key``` in the header of the request.   > Use the param ```API_KEY``` in the .env file.

Start the Docker containers:

```bash
docker compose -f docker-compose.dev.yml up --build

# or (to avoid cache and force rebuild) execute the following two commands 
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up

# if you want to log into a container
docker compose -f docker-compose.dev.yml exec nestjs_api bash
```

Navigate to the API docs here (Swagger): 
``` 
http://localhost:3001/api
``` 

You can also curl the API:
```bash
curl -X 'GET' \
  'http://localhost:3000/api/lnurl/generateWithdrawUrl?minAmount=100&maxAmount=500&defaultDescription=test' \
  -H 'accept: */*' \
  -H 'X-Api-Key: 123a123b123c123d'
``` 

## Debugging (optional)
If you are using Visual Studio Code, a debug ready launch configuration is provided.  
Go to the "Run and Debug" tab and launch "Docker attach to NodeJS".  
You can edit the launch config in ```.vscode/launch.json```. 

## Run automated tests
```bash
cd nestjs_api
npm run test
```

## Modules

### quests
This module manages quests life cycle.
```
GET    /api/quests          - List quests
POST   /api/quests          - Create quest
GET    /api/quests/:id      - Get quest details
PUT    /api/quests/:id      - Update quest
DELETE /api/quests/:id      - Delete quest
```

### claim
This module manages claims life cycle.
```
POST   /api/claim           - Create a claim
GET    /api/claim           - Get claim detail
PUT    /api/claim/:id       - Update claim
```

### lnurl
This module interfaces with the Lightning network.  
It handles funds management, LNURL generation, payments.  
```
<delw>GET     /api/lnurl/generateWithdrawUrl       - Generate LNURL-withdraw (do not expose, internal only)</delw>
GET     /api/lnurl/handleWithdrawRequest     - Send to client LNURL-withdraw params
GET     /api/lnurl/handleWithdrawCallback    - Handle withdraw callback and payment
```

### api
This module interacts with the external world.  
Moreover: exposes additional controllers/endpoints not directly implemented by other modules. The reason being controllers exposed by this module require cross-module access to different services.
```
POST    /api/quests/validate    - Handle all the logic required to verify, validate, and pay a claim (see the claim reward flow below)
```

## Claim reward flow
Basically, a complete and successful reward flow starts with the user asking to validate a solution, and ends with the user receiving the payment:

![sequence diagram][1]

### Create a quest
POST ```api/quest```  
Insert the following json as the body payload:
```javascript
{
  "title": "Quest1",
  "description": "Players must guess at least 3 words. The first player to submit a correct answer wins 1000 sats.",
  "rewardAmount": 1000,
  "totalRewards": 1,
  "startDate": "2024-12-18T00:00:00.000Z",
  "endDate": "2024-12-25T00:00:00.000Z",
  "claimedRewards": 0,
  "active": true,
  "conditions": {
    "wordsToGuess": {
      "words": ["quantum", "relativity", "neuroscience", "blockchain", "algorithm"],
      "min": 3
    }
  }
}
``` 

## Testing a base case via API

### Verify the quest has been inserted in the DB
GET ```/api/quests/{id}```  
To fill the ```{id}``` parameter, use the ```_id``` field returned in the previous step.  
For instance, you should call something similar to:
```
http://localhost:3000/api/quests/676278b9847f7c325add7daf
```
If the quest exists, you should receive, as the response, the json of the entire document.

### Validate the solution provided by a user
POST ```/api/quests/validate```  
Mock an answer (a "scenario"):
```javascript
{
   // The words guessed by the player
   wordsToGuess: ['quantum', 'blockchain', 'algorithm']
}
```  
Then combine the quest ```_id``` in the previous steps with this scenario to create the body payload:
```javascript
{
   "questId": "676278b9847f7c325add7daf",
   "scenario": {
      "wordsToGuess": ["quantum", "blockchain", "algorithm"]
   }
}
```  
This will return a boolean value: true if the scenario fullfills the quest. Otherwise false.

## TODO
- [] Currently operations which involve LNURL and payment management are handled by the  ```lnurl-node``` package (https://www.npmjs.com/package/lnurl) and ```LNBits API``` (https://lnbits.com/).  
   Is it possible to use something more robust/reliable like Greenlight or Breez SDK to handle LNURL operations?  
   Probably it's possible to receive payments with the Breeze SDK (see: https://sdk-doc-greenlight.breez.technology/guide/lnurl_withdraw.html).
- [] Improve lightning funds management.
- [] Refactor the lnurl module in order to make it pluggable and swappable, not relying on a single implementation. Every new implementation should adhere to a common interface. A plugin system? Libs inside a NestJS workspace? An external service required as a dependency in the API application? To be explored.
- [] Migrate from LNRL-whithdraw to Bolt12 (in the future...)?
- [] Improve API error management and output documentation for Swagger.
- [] Improve tests (currently only the ```conditions-validator.ts``` is covered by tests).
- [] Test a LN nodes network with Polar (see: https://lightningpolar.com/)?
- [] Add a Docker production ready configuration.

## References and Useful links
Lightning decoder: https://lightningdecoder.com/

LUD-03 spec: https://github.com/lnurl/luds/blob/luds/03.md

## Usecases
1. Let's say a famous influencer from CompanyA is holding a talk on X.
For commercial purposes, they want to reward the first 3 listeners who, having followed them, know that a voucher worth a total of 3000 sats will be published on one of their posts on X.
Each competitor can withdraw a maximum of 1000 sats.
The first 3 who arrive will each receive 1000 sats.

2. Bob is giving the introductory presentation for the PlanB Tech School 2024.
During the presentation, he mentions 5 names of guest lecturers who will be teaching during the course.
He puts up for grabs a 50% refund of the paid registration fee if a candidate posts on X, as a comment on the video, at least two of the mentioned names.
At this point, at the end of the video, Bob will collect the names inserted in the comments and feed them to the system that will check: are at least 2 of the names present in the array of possible solutions?
If yes, the system responds by generating an LNURL-withdraw.
Bob will then send this "voucher" to the quest winner, who will be able to receive back, in sats, once enrolled in the course, 50% of the total cost.

[1]: https://github.com/arcadeJHS/lnurl-quests/blob/main/assets/sequence_diagram_success.jpg