declare type DynamicTxInput = {
    to: string;
    data?: string;
    value?: string;
    nonce?: number;
    gasLimit?: string;
    feeCap?: string;
    tip?: string;
};
declare class DynamicSender {
    private client;
    private privateKey;
    private address;
    constructor(httpProviderUrl: string, privateKey: string);
    getSignedTransaction(input: DynamicTxInput): Promise<string>;
    sendSignedTransaction(raw: string): Promise<import("web3-core").TransactionReceipt>;
}
export default DynamicSender;
