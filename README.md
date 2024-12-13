# LNURL-Quests
Note: for the Python API to work, you must request a pair of greenlight key and credential (client-key.pem and client.crt) and put them in the ```/python_api/app/gl_certs``` folder.  
In the same folder the app will create a ```creds``` and a ```seed``` files.

Obtain a developer identity using the [Greenlight Developer Console](https://greenlight.blockstream.com/).

## Docker dev
```bash
# Start the project with a development Docker configuration
docker compose -f docker-compose.dev.yml up --build

# or execute the following commands (always to avoid cache and force rebuild)
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
``` 

## Python API:  
Endpoints:
http://localhost:5001/health  
http://localhost:5001/items

FastApi swagger:  
http://localhost:5001/docs

## NestJs API:
Enspoints:
http://localhost:3001/items

NestJs swagger:
http://localhost:3001/api


## Curl on FastApi endpoints
Health check:
```bash
curl http://localhost:5001/health
``` 

Get all items
```bash
curl http://localhost:5001/items
``` 

Create an item
```bash
curl -X POST http://localhost:5001/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "This is a test item"}'
```

## Update python dependencies
```bash
docker compose exec python_api bash
pip install --upgrade fastapi uvicorn bip39
pip freeze > requirements.txt
```

# References
https://blockstream.github.io/greenlight/  
https://github.com/Blockstream/greenlight/tree/main/libs/gl-client-py  
https://github.com/ElementsProject/lightning/blob/master/cln-grpc/proto/node.proto

# Pip commands
```bash
# lista i pacchetti installati
pip list

# informazioni su un pacchetto
pip show gl-client # stesso nome di pip list
```

# TODO
1. Aggiungere i18n all'app NestJs
2. test (sia NestJs che Python)
3. Generazione LNURL-withdraw come voucher Azteco, UI piacevole (https://azte.co/bitcoin-vouchers/prize-rebel?country=CHE) ostile retrogaming...

# Usecase
Diciamo che un famoso influencer della CompagniaA sta tenendo un talk su X.
A scopo commerciale vuole premiare i primi 3 ascoltatori che, avendolo seguito, sanno che andando su un suo post su X viene pubblicato un voucher del valore complessivo di 3000 sats.
Ogni concorrente può prelevare al massimo 1000 sats.
I primi 3 che arrivano prendono ciascuno 1000 sats.

Oppure: Bob sta facendo la presentazione introduttiva della PlanB Tech Scool 2024. 
Durante la presentazione nomina 5 nomi di quelli che saranno guest lecturer durante il corso.
Mette in palio il rimborso del 50% del costo pagato per iscriversi se un candidato posta su X, come commento al video, almeno due dei nomi citati.
A questo punto, a fine video, Bob raccoglierà i nomi inseriti nei commenti e li manderà in pasto al sistema che controllerà: ci sono almeno 2 dei nomi presenti nell'array delle possibili soluzioni?
Se sì, il sistema risponde con la generazione di un LNURL-withdraw.
Bob inverà poi questo "voucher" al vincitore della quest, che potrà ricevere indietro, in sats, una volta iscrittosi al corso, il 50% del costo totale.