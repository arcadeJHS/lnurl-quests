import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { ItemsService } from './items.service';
const lnurl = require('lnurl');
// const { encode } = require('lnurl');
const crypto = require('crypto');

export class itemBody {
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  description?: string
}

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Post()
  @ApiBody({ type: itemBody })
  create(@Body() createItemDto: itemBody) {
    return this.itemsService.create(createItemDto);
  }
}

@Controller('lnurl')
export class WithdrawController {
  constructor() {}

  @Get()
  async withdraw() {
    // console.log(lnurl);
    // const encoded = lnurl.encode('https://service.com/api?q=3fc3645b439ce8e7f2553a69e5267081d96dcd340693afabe04be7b0ccd178df');
    // return encoded;

    const server = lnurl.createServer({
      host: 'localhost',
      port: 3013,
      auth: {
        apiKeys: [
          {
            id: '46f8cab814de07a8a65f',
            key: 'ee7678f6fa5ab9cf3aa23148ef06553edd858a09639b3687113a5d5cdb5a2a67',
            encoding: 'hex',
          },
        ],
      },
      lightning: {
        backend: 'dummy',
        config: {},
      },
    });

    const w = await server.generateNewUrl(
      'withdrawRequest',
      {
        minWithdrawable: 1000,
        maxWithdrawable: 100000000,
        defaultDescription: 'LNURL Withdrawal',
      },
      {
        k1: crypto.randomBytes(32).toString('hex'),
      },
    );
    

    function createWithdrawUrl(callbackUrl, minWithdrawable, maxWithdrawable) {
        const k1 = crypto.randomBytes(32).toString('hex');
        
        const params = new URLSearchParams({
            minWithdrawable: minWithdrawable.toString(),
            maxWithdrawable: maxWithdrawable.toString(),
            default_description: 'LNURL Withdrawal',
            k1: k1
        });

        const fullUrl = `${callbackUrl}?${params.toString()}`;
        const url = lnurl.encode(fullUrl);
        
        return { url, k1 };
    }

    // Example usage
    const callbackUrl = 'https://your-service.com/api/lnurl-withdraw/callback';
    const minWithdrawable = 1000;  // 1000 millisatoshis
    const maxWithdrawable = 100000000;  // 100,000,000 millisatoshis (0.1 BTC)

    const { url, k1 } = createWithdrawUrl(callbackUrl, minWithdrawable, maxWithdrawable);
    console.log(`LNURL: ${url}`);
    console.log(`k1: ${k1}`);
    console.log(`w: `, w);
  }
}