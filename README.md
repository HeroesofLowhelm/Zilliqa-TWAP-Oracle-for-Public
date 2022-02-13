TWAP-Oracles
Time-Weight-Average-Price Oracles for $HOL & $CAST 

$HOL TIME-WEIGHTED AVERAGE PRICE (TWAP) ORACLE
-Determines average price of $HOL in USD in the last 1 hour between exchanges (XCAD DEX+ZILSWAP DEX).

$CAST TIME-WEIGHTED AVERAGE PRICE (TWAP) ORACLE
-Determines average price of $CAST in USD in the last 1 hour from ZILSWAP DEX.
-Note: As of 2/11/22 $CAST is not yet listed in ZILSWAP DEX however, we can list it whenever we want.

USE OF TWAP ORACLES:
-All In-game purchases will use fixed USD costs.
  .Using TWAP Oracle, game knows how much tokens it cost for the fixed USD pricing.
  .Real-time market manipulators cannot momentarily cause pump or dump to manipulate prices in-game.

After creating the two TWAP Oracles, we create APIs for in-game server to use to obtain live average pricing data.
