import * as dotenv from 'dotenv';
dotenv.config();

import DynamicSender from '../index';
const privateKey: string = process.env.PRIVATE_KEY ?? '';
const url: string = process.env.URL ?? 'http://localhost:8545';


(async() => {
    const sender = new DynamicSender(url, privateKey, 'ropsten');

    const input = {
        to: '0x432D4dA3fCeCDa336e430b2750d04BB484A5A38f',
        value: 0.5 * 10 ** 18,
    }
    
    const rawTransaction = await sender.getSignedTransaction(input);
    const receipt = await sender.sendSignedTransaction(rawTransaction);

    console.log(receipt);
})()