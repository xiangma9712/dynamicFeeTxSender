"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethTx = __importStar(require("@ethereumjs/tx"));
const web3_1 = __importDefault(require("web3"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const privateKeyToAddress = require('ethereum-private-key-to-address');
class DynamicSender {
    constructor(httpProviderUrl, privateKey) {
        this.client = new web3_1.default(new web3_1.default.providers.HttpProvider(httpProviderUrl));
        this.privateKey = privateKey;
        this.address = privateKeyToAddress(this.privateKey);
    }
    async getSignedTransaction(input) {
        var _a, _b, _c, _d, _e, _f;
        const data = (_a = input.data) !== null && _a !== void 0 ? _a : '0x';
        const value = (_b = input.value) !== null && _b !== void 0 ? _b : '0';
        const nonce = (_c = input.nonce) !== null && _c !== void 0 ? _c : await this.client.eth.getTransactionCount(this.address);
        const gasLimit = (_d = input.gasLimit) !== null && _d !== void 0 ? _d : '21000';
        const feeCap = (_e = input.feeCap) !== null && _e !== void 0 ? _e : new bignumber_js_1.default(await this.client.eth.getGasPrice()).times(2).toFixed();
        const tip = (_f = input.tip) !== null && _f !== void 0 ? _f : '0';
        const fullInput = {
            from: this.address,
            to: input.to,
            data,
            value: web3_1.default.utils.toHex(web3_1.default.utils.toWei(value, 'wei')),
            nonce: web3_1.default.utils.toHex(nonce),
            gasLimit: web3_1.default.utils.toHex(gasLimit),
            feeCap: web3_1.default.utils.toHex(feeCap),
            tip: web3_1.default.utils.toHex(tip),
        };
        const unsignedTx = ethTx.FeeMarketEIP1559Transaction.fromTxData(fullInput);
        const signedTx = unsignedTx.sign(Buffer.from(this.privateKey));
        return '0x' + signedTx.serialize().toString('hex');
    }
    async sendSignedTransaction(raw) {
        return await this.client.eth.sendSignedTransaction(raw);
    }
}
exports.default = DynamicSender;
