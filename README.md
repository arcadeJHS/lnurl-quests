# LNURL-Quests

A basic REST API implementation that automatically rewards users for completing quests via ```LNURL-withdraw```.  
The ```lnurl``` module implements a simple LNURL service.

See: [LUD-03: withdrawRequest](https://github.com/lnurl/luds/blob/luds/03.md).

## Introduction
LNURL-withdraw is a quite complex process, but that can have many interesting use cases.  
Basically, it is a protocol specification that makes it much easier and more user-friendly to withdraw Bitcoin from services using the Lightning Network.   Without LNURL-withdraw, receiving Lightning payments requires generating an invoice first, then somehow communicating that invoice to the sender.  
This process is cumbersome, especially on mobile devices.  
Instead of asking for Lightning invoice, a service could display a "withdraw" QR code which contains a specialized LNURL.  
With LNURL-withdraw, the process is:  
1. A service (the API implemented in this repo) provides a short LNURL (or its QR code version).
2. A LNURL enabled wallet scans/opens it, decodes it, and use it to make a GET request to the service.
3. The response is a JSON containing al the params required to generate and ask for a payment:
    ```
    {
        "tag": "withdrawRequest", // type of LNURL
        "callback": "string", // The URL which LN SERVICE would accept a withdrawal Lightning invoice as query parameter
        "k1": "string", // Random or non-random string to identify the user's LN WALLET when using the callback URL
        "defaultDescription": "string", // A default withdrawal invoice description
        "minWithdrawable": "number", // Min amount (in millisatoshis) the user can withdraw from LN SERVICE, or 0
        "maxWithdrawable": "number", // Max amount (in millisatoshis) the user can withdraw from LN SERVICE, or equal to minWithdrawable if the user has no choice over the amounts
    }
    ```
4. The wallet displays a withdraw dialog where the user can specify how much to withdraw (bounded by minWithdrawable and maxWithdrawable), or an error.
5. Once accepted, the wallet automatically generates a ```bolt11 invoice```, and makes a GET call to the service ```callback``` url appending the ```k1``` param and the invoice: ```https://<service.url>?k1={k1}&pr={pr}```.
6. The service sends a ```{"status": "OK"}``` or ```{"status": "ERROR", "reason": "error details..."}``` JSON response, and then attempts to pay the invoices asynchronously.
7. If the call was successful, the wallet only needs to wait for the incoming payment.

## Requirements:
1. git
2. Docker and Docker Compose
3. To complete LN payments, this implementation relies on an instance of ```LNBits``` (see ```LNBITS_URL``` and ```LNBITS_API_KEY``` configuration params in .env file).

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
HOST=http://localhost
PORT=3000
LNBITS_URL=https://lb1.yourdomain.wtf/
LNBITS_API_KEY=123a123b123c123d
API_KEY=123a123b123c123d
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=10
MAX_WITHDRAW_AMOUNT=1000
MIN_WITHDRAW_AMOUNT=50
ALLOWED_ORIGINS=http://localhost:3000,https://other-domain.com
```

> Note: API requests need to be authorized by a ```X-Api-Key``` in the header of the request.   
> Use the param ```API_KEY``` in the .env file.
> LNBITS_API_KEY: required only to complete the payment. Not necessary to generate a LNURL-withdraw.

Also, add a new (or edit the existing) ```.env.docker``` file.  
This is used by Docker and in app to configure and access MongoDB.
```
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secret
MONGO_APP_USERNAME=lnurl_user
MONGO_APP_PASSWORD=lnurl_password

# Update MongoDB URI in your .env to use these credentials
MONGODB_URI=mongodb://lnurl_user:lnurl_password@localhost:27017/lnurl-quests
``` 

You can also refine application config params in ```src/config/configuration.ts```.

Now start the Docker containers:

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

Now you can interact with the API via the Swagger UI, or you can curl it:
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
Go tot Swagger for the complete API documentation:
``` 
http://localhost:3001/api
``` 

### quests
This module manages quests life cycle.
```
GET    /api/quests            - List quests
POST   /api/quests            - Create quest
GET    /api/quests/:id        - Get quest details
PUT    /api/quests/:id        - Update quest
DELETE /api/quests/:id        - Delete quest
```

### claim
This module manages claims life cycle.
```
POST  /api/claim          - Create a claim
GET   /api/claim          - Get claim detail
PUT   /api/claim/:id      - Update claim
```

### lnurl
This module interfaces with the Lightning network.  
It handles funds management, LNURL generation, payments.  
```
GET  /api/lnurl/handleWithdrawRequest     - Send to client LNURL-withdraw params
GET  /api/lnurl/handleWithdrawCallback    - Handle withdraw callback and payment
```

### api
This module exposes additional endpoints not directly implemented by other modules.  
The reason being thise endpoints require cross-module logic, and need to access services define elsewhere.
```
POST   /api/quests/validate    - Handle all the logic required to verify, validate, and pay a claim (see the claim reward flow below)
GET    /api/claim/reward       - Claim a payment
```

## Claim reward flow
Basically, a complete and successful reward flow starts with the user asking to validate a solution, and ends with the user receiving the payment:

![sequence diagram][1]

## Testing a base case via API

### Create a quest
POST ```api/quest```  

Insert the following json as the body payload:
```json
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

This will return the document created, with its ```_id```.

### Verify the quest has been inserted in the DB
```GET /api/quests/{id}```  

To fill the ```{id}``` parameter, use the ```_id``` field returned in the previous step.  
For instance, you should call something similar to:
```
http://localhost:3000/api/quests/676278b9847f7c325add7daf
```
If the quest exists, you should receive, as the response, the json of the entire document.

### Validate the solution provided by a user
```POST /api/quests/validate```  

Mock an answer (a "scenario").  
```wordsToGuess``` is an array of words gueessed by the player:
```json
{
  "wordsToGuess": ["quantum", "blockchain", "algorithm"]
}
```  

Then combine the quest ```_id``` in the previous steps with this scenario to create the body payload:
```json
{
   "questId": "676278b9847f7c325add7daf",
   "scenario": {
      "wordsToGuess": ["quantum", "blockchain", "algorithm"]
   }
}
``` 

When you submit your guess to ```/api/quests/validate```, a new claim is created in the database, with ```status = pending```.

If the scenario fulfills the quest, the claim status is updated to ```validated```, and you will receive the ```ID``` of the newly created claim as the response, for instance ```6764842c34c8683216206bf5```.  
This will be used as the token to claim the reward.

### Claim reward
```GET /api/claim/reward?{token}```  

Use the claim id returned in the previous step as the token, to call:  
```/api/claim/reward?6764842c34c8683216206bf5``` 

This request update claim status to ```claimed```, and returns LNURL-withdraw data to send to a LN wallet:
```json
{
  "encoded": "lnurl1dp68gup69uhkcmmrv9kxsmmnwsarxvpsxqhksctwv3kx24mfw35xgunpwafx2ut4v4ehg0m3856nzenyxyunzctxxgmk2venv4snzefk8qmrvdfcxf3x2dphxvmnxe3nvf3xyvryvenxgd3evgensde4xfnrwe3hv93xzd34vymngdnxqwyrxa",
  "secret": "51fd191af27e33ea1e6866582be47373f3bbb0dffd69b38752f7f7aba65a746f",
  "url": "http://localhost:3000/api/lnurl/handleWithdrawRequest?q=51fd191af27e33ea1e6866582be47373f3bbb0dffd69b38752f7f7aba65a746f"
}
```

## TODO
- Currently operations which involve LNURL and payment management are handled by the  ```lnurl-node``` package (https://www.npmjs.com/package/lnurl) and ```LNBits API``` (https://lnbits.com/).  
   Is it possible to use something more robust/reliable like Greenlight or Breez SDK to handle LNURL operations?  
   Probably it's possible to receive payments with the Breeze SDK (see: https://sdk-doc-greenlight.breez.technology/guide/lnurl_withdraw.html).
- Improve lightning funds management.
- Refactor the lnurl module in order to make it pluggable and swappable, not relying on a single implementation. Every new implementation should adhere to a common interface. A plugin system? Libs inside a NestJS workspace? An external service required as a dependency in the API application? Or maybe the LNURL-withdraw should be a pluggable dedicated second service, used by this API. To be explored.
- Migrate from LNRL-whithdraw to Bolt12 (in the future...)?
- Improve management of worst case scenarios.
- Improve API error management and output documentation for Swagger.
- Improve tests. Currently only a few "logic-heavy" files are covered.
- Test a LN nodes network with Polar (see: https://lightningpolar.com/)?
- Add a Docker production ready configuration.

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

[1]: https://github.com/arcadeJHS/lnurl-quests/blob/main/assets/sequence_diagram_success.png