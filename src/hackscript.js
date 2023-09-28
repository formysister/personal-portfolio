var code = `'use strict'

const ethers = require('ethers');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { RPC_URL_HTTP_ENDPOINT } = require('./config');
const ERC721 = require('./erc721-abi.json');

//define & initizlize ethers project
const provider = new ethers.providers.JsonRpcProvider(RPC_URL_HTTP_ENDPOINT);

//define data items
var collectedAddresses = [], startBlock, lastBlock;

/**
 * @description input the number of start block
 */
const initApp = async () => {
    //read blocknumber from console readline
    readline.question("Please input block number: ", async (blockNumber) => {

        startBlock = blockNumber;
        lastBlock = await provider.getBlockNumber();

        await mainProcess(startBlock, lastBlock);
    })
}

/**
 * 
 * @param {String} startBlock 
 * @param {String} lastBlock
 * @description get blocks between two block numbers from parameter and 
 * get ERC721 creation transactions for each block 
 */
const mainProcess = async (startBlock, lastBlock) => {

    console.log("Searching...");

    let block;
    for (let i = startBlock; i <= lastBlock; i++) {

        //get block and transactions from blocknumber
        try {
            block = await provider.getBlockWithTransactions(Number(i));
            console.log('Block' + i + '_>');
        } catch (err) {
            continue;
        }

        //scan each transaction in block
        for await (const transaction of block.transactions) {

            //check if any smart contract created with this transaction
            if (transaction?.creates !== null) {

                //check if created smart contract is ERC721 or not
                try {
                    const contract = new ethers.Contract(transaction?.creates, ERC721.abi, provider);
                    const isERC721 = await contract.supportsInterface('0x80ac58cd');
                    if(isERC721) {
                        collectedAddresses.push(transaction?.creates);
                    }
                    else {
                        continue;
                    }
                } catch (_) {
                    continue;
                }
            }
        }

        //print result on console
        if (collectedAddresses.length > 0) {
            console.log('For block' + 'i': ', collectedAddresses);
            collectedAddresses = [];
            console.log("Searching...");
        }
    }
    //close console readline
    readline.close();
}

initApp(); //start app`;

export default code;
