import * as ethTx from '@ethereumjs/tx';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
const privateKeyToAddress = require('ethereum-private-key-to-address');

type DynamicTxInput = {
    to: string,
    data?: string,
    value?: string,
    nonce?: number,
    gasLimit?: string,
    feeCap?: string,
    tip?: string,
}

class DynamicSender {
    private client: Web3;
    private privateKey: string;
    private address: string;

    constructor(httpProviderUrl: string, privateKey: string) {
        this.client = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
        this.privateKey = privateKey;
        this.address = privateKeyToAddress(this.privateKey);
    }

    public async getSignedTransaction(input: DynamicTxInput) {
        const data = input.data ?? '0x';
        const value = input.value ?? '0';
        const nonce = input.nonce ?? await this.client.eth.getTransactionCount(this.address);
        const gasLimit = input.gasLimit ?? '21000';
        const feeCap = input.feeCap ?? new BigNumber(await this.client.eth.getGasPrice()).times(2).toFixed();
        const tip = input.tip ?? '0';
        const fullInput = {
            from: this.address,
            to: input.to,
            data,
            value: Web3.utils.toHex(Web3.utils.toWei(value, 'wei')),
            nonce: Web3.utils.toHex(nonce),
            gasLimit: Web3.utils.toHex(gasLimit),
            feeCap: Web3.utils.toHex(feeCap),
            tip: Web3.utils.toHex(tip),
        }

        const unsignedTx = ethTx.FeeMarketEIP1559Transaction.fromTxData(fullInput);
        const signedTx = unsignedTx.sign(Buffer.from(this.privateKey));
        return '0x' + signedTx.serialize().toString('hex');
    }

    public async sendSignedTransaction (raw: string) {
        return await this.client.eth.sendSignedTransaction(raw);
    }
}

export default DynamicSender;