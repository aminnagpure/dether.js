import ethToolbox from 'eth-toolbox';

import { UTILITYWEB3, getContractInstance } from '../constants/appConstants';


/**
 * get dtr balance
 * @param  {string}  address ethereum address
 * @return {Promise}
 */
const getBalance = async (address, providerUrl) =>
  new Promise(async (res, rej) => {
    if (!ethToolbox.utils.isAddr(address)) return rej(new TypeError('Invalid ETH address'));
    if (!providerUrl) return rej(new TypeError('No provider url'));

    try {
      const dtrContractInstance = await getContractInstance(providerUrl);

      if (!dtrContractInstance) return rej(new TypeError('Invalid provider URL'));

      const result = await dtrContractInstance.getTellerBalances
        .call(ethToolbox.utils.add0x(address));

      if (Number.isNaN(Number(result))) return res(0);

      return res(Number(UTILITYWEB3.fromWei(result.toNumber(), 'ether')));
    } catch (e) {
      return rej(new TypeError(e));
    }
  });

export default getBalance;