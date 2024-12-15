# LNURL-Quests

A library to automatically mint LNURL whitdraws.  
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

## Debugging (optional)
If you are using Visual Studio Code, a debug ready launch configuration is provided.  
Go to the "Run and Debug" tab and launch "Docker attach to NodeJS".  
You can edit the launch config in ```.vscode/launch.json```.  

## Curl NextJS API
```bash
curl 'http://localhost:3000/api/withdraw/generateLnurlLink?uuid=1234abc4bebebebeb' -H "X-Api-Key: <your-api-key>"
``` 

## References and Useful links
https://lightningdecoder.com/

https://github.com/lnurl/luds/blob/luds/03.md

Test a LN nodes network with Polar?
https://lightningpolar.com/

## TODO
1. Add tests
2. Add i18n
3. Is it possible to use Breez SDK to claim a paiment (see: https://sdk-doc-greenlight.breez.technology/guide/lnurl_withdraw.html)?

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