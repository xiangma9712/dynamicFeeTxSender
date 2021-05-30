import Common from '@ethereumjs/common'
import * as ethTx from '@ethereumjs/tx';
import Web3 from 'web3';
import { chain } from 'web3-eth';
import BigNumber from 'bignumber.js';
const privateKeyToAddress = require('ethereum-private-key-to-address');

type DynamicTxInput = {
    to: string,
    data?: string,
    value?: string | number,
    nonce?: number,
    gasLimit?: string,
    feeCap?: string,
    tip?: string,
}

class DynamicSender {
    private client: Web3;
    private privateKey: string;
    private address: string;
    private chain = 'mainnet';

    constructor(httpProviderUrl: string, privateKey: string, chain?: chain) {
        this.client = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
        this.privateKey = privateKey;
        this.address = privateKeyToAddress(this.privateKey);
        if (chain != undefined) {
            this.chain = chain;
        }
    }

    public async getSignedTransaction(input: DynamicTxInput) {
        const nonce = input.nonce ?? await this.client.eth.getTransactionCount(this.address);
        const feeCap = input.feeCap ?? new BigNumber(await this.client.eth.getGasPrice()).times(2).toFixed();
        const fullInput = {
            to: input.to,
            data: input.data ?? '0x',
            value: Web3.utils.toHex(input.value ?? '0'),
            nonce: Web3.utils.toHex(nonce),
            gasLimit: Web3.utils.toHex(input.gasLimit ?? '21000'),
            maxFeePerGas: Web3.utils.toHex(feeCap),
            maxPriorityFeePerGas: Web3.utils.toHex(input.tip ?? '0'),
            chainId: Web3.utils.toHex(await this.client.eth.getChainId()),
            accessList: [],
            type: "0x02"
        }
        const common = new Common({ chain: this.chain, hardfork: 'london' });

        const unsignedTx = new ethTx.FeeMarketEIP1559Transaction(fullInput, {common});
        const signedTx = unsignedTx.sign(Buffer.from(this.privateKey, 'hex'));
        return '0x' + signedTx.serialize().toString('hex');
    }

    public async sendSignedTransaction (raw: string) {
        return await this.client.eth.sendSignedTransaction(raw);
    }
}

export default DynamicSender;