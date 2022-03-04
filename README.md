# $HOL TIME-WEIGHTED AVERAGE PRICE (TWAP) ORACLE

*Determines average price of $HOL in USD in the last 1 hour between exchanges (XCAD DEX + ZILSWAP DEX).*
***

## Oracle Contract + Oracle Client
###  *Oracle contract*

- getTWAPPrice() transition is called through caller (on-chain smart contracts) and then it invokes caller contract's receiveRequestId() transition to pass the request ID to the caller contract.
- setTWAPPrice(twapPrice: Uint256, callerAddress: ByStr20, id: Uint256) transition is called by the Oracle Client. Once this is invoked, it checks if the request ID is in the pendingRequests, and then if it matches, invokes caller smart contract's callback() transition to pass the fetched $HOL TWAP to the caller contract

### *Oracle client*
- Oracle client always listen events on the Oracle Contract. Once the event named GetLatestTWAPHol is emitted (this event is emitted when the getTWAPPrice() transition is called), it saved the caller's address and request ID to the pendingRequests List variable.
- Oracle client calls processQueue() function time interval, and this function process requests in the pendingRequests List.
  This function fetches $HOL TWAP through zilstream API and then calls setTWAPPrice(twapPrice: Uint256, callerAddress: ByStr20, id: Uint256) transition of the Oracle Contract.

### *Caller Contract*

- Caller contract must set the oracle contract address first.
- Then it need to call the getTWAPPrice() transition of Oracle Contract.
- Then it need to define transition to receive request id. It's name must be receiveRequestId()
- Lastly, there must be callback(twapPrice: Uint256, id: Uint256) transition to get the $HOL TWAP from the Oracle contract