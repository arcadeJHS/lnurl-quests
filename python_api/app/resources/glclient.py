from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
import bip39
import secrets
from pathlib import Path
from glclient import Credentials, Signer, Scheduler, Node, clnpb

network = "testnet"

def save_to_file(file_name: str, data: bytes) -> None:
    with open(file_name, "wb") as file:
        file.write(data)

def read_file(file_name: str) -> bytes:
    with open(file_name, "rb") as file:
        return file.read()

def create_seed() -> bytes:
    rand = secrets.randbits(256).to_bytes(32, "big")  # 32 bytes of randomness

    # Show seed phrase to user
    phrase = bip39.encode_bytes(rand)
    # Only need the first 32 bytes
    seed = bip39.phrase_to_seed(phrase)[:32] 

    # Store the seed on the filesystem, or secure configuration system
    save_to_file("gl_certs/seed", seed)
    return seed

def register_node(seed: bytes, developer_cert_path: str, developer_key_path: str) -> Node:
    developer_cert = Path(developer_cert_path).open(mode="rb").read()
    developer_key = Path(developer_key_path).open(mode="rb").read()

    developer_creds = Credentials.nobody_with(developer_cert, developer_key)

    signer = Signer(seed, network, developer_creds)
    scheduler = Scheduler(network, developer_creds)

    registration_response = scheduler.register(signer, invite_code=None)

    device_creds = Credentials.from_bytes(registration_response.creds)
    save_to_file("gl_certs/creds", device_creds.to_bytes())

    scheduler = scheduler.authenticate(device_creds)
    node = scheduler.node()

    return node

def start_node(device_creds_path: str) -> None:
    device_creds = Credentials.from_path(device_creds_path)
    
    scheduler = Scheduler(network, device_creds)
    print('====>', scheduler.get_node_info().grpc_uri)

    node = scheduler.node()
    seed = read_file("gl_certs/seed")
    signer = Signer(seed, network, device_creds)
    signer.run_in_thread()

    # print('=== CREATING INVOICE... ===')
    # invoice = node.invoice(
    #     amount_msat=clnpb.AmountOrAny(amount=clnpb.Amount(msat=10000)),
    #     description="description",
    #     label="label",
    # )
    
    info = node.get_info()
    print(info)

    # withdrawal = node.withdraw(
    #     destination="tb1qlj64u6fqutr0xue85kl55fx0gt4m4urun25p7q",
    #     amount=clnpb.AmountOrAll(amount=clnpb.Amount(msat=1000))
    # )
    # print('=== INVOICE CREATED 1 ===')
    # # print(invoice)
    # print(withdrawal)
    # print('=== INVOICE CREATED 2 ===')

router = APIRouter()

@router.get("/getglnode")
def get_glnode():
    seed = create_seed()
    phrase = bip39.encode_bytes(seed)

    node = register_node(seed, "gl_certs/client.crt", "gl_certs/client-key.pem")
    info = node.get_info()

    node = start_node("gl_certs/creds")

    print('=== NODE INFO ===')
    print(info)

    return {
        "seed": phrase
    }