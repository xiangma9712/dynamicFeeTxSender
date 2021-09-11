import * as dotenv from 'dotenv';
dotenv.config();

import DynamicSender from '../index';
const privateKey: string = process.env.PRIVATE_KEY ?? '';
const url: string = process.env.URL ?? 'http://localhost:8545';


(async () => {
    const sender = new DynamicSender(url, privateKey, { chain: 'ropsten', echo: true });

    const input = {
        to: '0x6a264F7f27377b0223991E58340Ebbbb4892E8e0',
        value: 0.01 * 10 ** 18,
        maxFeePerGas: String(36 * 10 ** 9),
        maxPriorityFeePerGas: "1",
    }

    for (const maxPriorityFeePerGas of [3, 10, 20]) {
        input.maxPriorityFeePerGas = String(maxPriorityFeePerGas * 10 ** 9);
        const rawTransaction = await sender.getSignedTransaction(input);
        const receipt = await sender.sendSignedTransaction(rawTransaction);
        console.log(receipt);
    }
})()