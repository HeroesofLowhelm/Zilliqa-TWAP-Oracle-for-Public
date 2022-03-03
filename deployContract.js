//  Copyright (C) 2018 Zilliqa
//
//  This file is part of Zilliqa-Javascript-Library.
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

const { BN, Long, bytes, units } = require('@zilliqa-js/util');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const {
  toBech32Address,
  getAddressFromPrivateKey,
} = require('@zilliqa-js/crypto');

const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');


// These are set by the core protocol, and may vary per-chain.
// You can manually pack the bytes according to chain id and msg version.
// For more information: https://apidocs.zilliqa.com/?shell#getnetworkid

const chainId = 333; // chainId of the developer testnet
const msgVersion = 1; // current msgVersion
const VERSION = bytes.pack(chainId, msgVersion);

// Populate the wallet with an account
const privateKey =
  'deb5c896228f8515146aa16f94a558ba14e52d8496b4b267b2d59cd9036f39a6';

zilliqa.wallet.addByPrivateKey(privateKey);

const address = getAddressFromPrivateKey(privateKey);
console.log(`My account address is: ${address}`);
console.log(`My account bech32 address is: ${toBech32Address(address)}`);

async function testBlockchain() {
  try {
    // Get Balance
    const balance = await zilliqa.blockchain.getBalance(address);
    // Get Minimum Gas Price from blockchain
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();

    // Account balance (See note 1)
    console.log(`Your account balance is:`);
    console.log(balance.result);
    console.log(`Current Minimum Gas Price: ${minGasPrice.result}`);
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions
    console.log(`My Gas Price ${myGasPrice.toString()}`);
    const isGasSufficient = myGasPrice.gte(new BN(minGasPrice.result)); // Checks if your gas price is less than the minimum gas price
    console.log(`Is the gas price sufficient? ${isGasSufficient}`);

    // Deploy a contract
    console.log(`Deploying a new contract....`);
    const oracleContractCode = `(* SPDX-License-Identifier: MIT *)
    scilla_version 0
    
    (***************************************************)
    (*               Associated library                *)
    (***************************************************)
    import IntUtils
    
    library HolTWAPOracle
    let one = Uint256 1
    let zero = Uint128 0
    let true = True
    let false = False
    (* Dummy user-defined ADT *)
    (* Error events *)
    type Error =
    | CodeIsOwner
    | CodeIsPendingRequest
    
    let random =
        fun (entropy: Uint256) =>
        fun (block_number: BNum) =>
        fun (addr: ByStr20) =>
            let addr_hash = builtin keccak256hash addr in
            let entropy_hash = builtin keccak256hash entropy in
            let blockhash = builtin keccak256hash block_number in
            let ehash = builtin concat entropy_hash blockhash in
            let ahash = builtin concat ehash addr_hash in
            let last_hash = builtin concat ehash ahash in
            let hash = builtin keccak256hash last_hash in
                builtin to_uint256 hash
    
    let make_error =
        fun (result : Error) =>
            let result_code = 
            match result with
            | CodeIsOwner               => Int32 -1
            | CodeIsPendingRequest      => Int32 -2
            end
            in
            { _exception : "Error"; code : result_code }
    
    let one_msg = 
        fun (msg : Message) => 
            let nil_msg = Nil {Message} in
            Cons {Message} msg nil_msg       
    
    (***************************************************)
    (*             The contract definition             *)
    (***************************************************)
    contract HolTWAPOracle 
    (
        contract_owner: ByStr20
    )
    
    (* Mutable fields *)
    field randNonce: Uint256 = Uint256 0
    field modulus: Uint256 = Uint256 1000
    field pendingRequests: Map Uint256 Bool = Emp Uint256 Bool
    
    (**************************************)
    (*             Procedures             *)
    (**************************************)
    
    procedure ThrowError(error: Error)
        e = make_error error;
        throw e
    end
    
    procedure IsNotOwner(address: ByStr20)
        is_owner = builtin eq contract_owner address;
        match is_owner with
        | False =>
            err = CodeIsOwner;
            ThrowError err
        | True =>
        end
    end
    
    
    (***************************************)
    (*             Transitions             *)
    (***************************************)
    
    (* @dev: Generate random requset id and then returns it to the caller contract by invoking "receiveRequestId" transition  *)
    transition getTWAPPrice()
        randNonceTemp <- randNonce;
        cur_nonce = builtin add randNonceTemp one;
        randNonce := cur_nonce;
        blk <- & BLOCKNUMBER;
        id = random cur_nonce blk _sender;
        pendingRequests[id] := true;
        e = {_eventname: "GetLatestTWAPHol"; id: id};
        event e;
        msg = {_tag: "receiveRequestId"; _recipient: _sender; _amount: zero; id: id};
        msgs = one_msg msg;
        send msgs
    end
    
    (* @dev: Returns TWAP of $HOL to _callerAddress by invoking "callback" transition on it. Only contract owner allowed to invoke.   *)
    (* param _twapPrice:      TWAP of $Hol.                                                                                           *)
    (* param _callerAddress:       Original sender address which invokes "getTWAPPrice" transition.                                   *)
    (* param _id:       Request id.                                                                                                   *)
    transition setTWAPPrice(twapPrice: Uint256, callerAddress: ByStr20, id: Uint256)
        IsNotOwner _sender;
        isPendingRequest <- exists pendingRequests[id];
        match isPendingRequest with
        | False =>
            err = CodeIsPendingRequest;
            ThrowError err
        | True =>
        end;
        delete pendingRequests[id];
        msg = {_tag: "callback"; _recipient: callerAddress; _amount: zero; twapPrice: twapPrice; id: id};
        msgs = one_msg msg;
        send msgs;
        e = {_eventname: "SetLatestTWAPHol"; twapPrice: twapPrice; callerAddress: callerAddress};
        event e
    end
    `;
    const init = [
      // this parameter is mandatory for all init arrays
      {
        vname: '_scilla_version',
        type: 'Uint32',
        value: '0',
      },
      {
        vname: 'contract_owner',
        type: 'ByStr20',
        value: `${address}`,
      },
    ];

    const contract = zilliqa.contracts.new(oracleContractCode, init);

    // Deploy the contract.
    // Also notice here we have a default function parameter named toDs as mentioned above.
    // A contract can be deployed at either the shard or at the DS. Always set this value to false.
    const [deployTx, deployedContract] = await contract.deployWithoutConfirm(
      {
        version: VERSION,
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(10000),
      },
      false,
    );

    // process confirm
    console.log(`The transaction id is:`, deployTx.id);
    console.log(`Waiting transaction be confirmed`);
    const confirmedTxn = await deployTx.confirm(deployTx.id);

    console.log(`The transaction status is:`);
    console.log(confirmedTxn.receipt);
    if (confirmedTxn.receipt.success === true) {
      console.log(`Contract address is: ${deployedContract.address}`);
      return "0x" + deployedContract.address;
    }
  } catch (err) {
    console.log(err);
  }
}

async function DeploySendListenMonitor()
{
    deployed_contract_base_16 = await testBlockchain();
    bech_32_bystr = toBech32Address(deployed_contract_base_16);
    console.log(`got ${bech_32_bystr} from ${deployed_contract_base_16}`)
}

// Start
DeploySendListenMonitor();