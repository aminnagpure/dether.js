/* global describe it */
import { expect } from 'chai';
import Ethers  from 'ethers';
import sinon  from 'sinon';
import DetherJS from '../../src/detherJs';
import DetherUser from '../../src/detherUser';
import Wallet from '../../src/wallet';
import Contracts from '../../src/utils/contracts';

import contractMock from '../mock/contract';

describe('dether user', () => {

  let dether, wallet, user, stubs = [];


  beforeEach(async () => {
    stubs = [];

    dether = new DetherJS({
      network: 'kovan',
    });

    wallet = Wallet.createRandom();
    user = new DetherUser({ dether, wallet });

    user.signedDetherContract = contractMock;
  });

  afterEach(() => {
    stubs.forEach(s => s.restore && s.restore());
    stubs = [];
  });

  it('should instanciate', async () => {
    const wallet = Wallet.createRandom();
    const dether = { provider: { chainId: 42 } };
    const stub = sinon.stub(Contracts, 'getDetherContract').returns('contract');

    const detheruser = new DetherUser({
      dether,
      wallet,
    });
    expect(detheruser.dether).to.eq(dether);
    expect(detheruser.wallet).to.eq(wallet);
    expect(detheruser.wallet.provider).to.eq(dether.provider);
    expect(detheruser.signedDetherContract).to.eq('contract');

    stub.restore();
  });

  it('should create special contract', async () => {
    const stub = sinon.stub();
    stub.returns('result');

    user.wallet = {
      sendTransaction: stub,
      getAddress: () => 'address',
      provider: 'provider',
    };
    stubs.push(sinon.stub(Contracts, 'getDetherContract'));
    stubs[0].returns('res');

    const customContract = user._getCustomContract({
      value: 1.2,
    });

    expect(customContract).to.eq('res');
    const customProvider = stubs[0].args[0][0];

    expect(customProvider.getAddress()).to.eq('address');
    expect(customProvider.provider).to.eq('provider');

    const transactionResult = customProvider.sendTransaction({});
    expect(transactionResult).to.eq('result');
    expect(stub.calledWith({ value: 1.2 })).to.be.true;
  });

  it('should get user info', async () => {
    const stub = sinon.stub(dether, 'getTeller');
    stub.returns('info');

    const info = await user.getInfo();
    expect(stub.calledWith(wallet.address)).to.be.true;
    expect(info).to.eq('info');

    stub.restore();
  });

  it('should get user escrow balance', async () => {
    const stub = sinon.stub(dether, 'getBalance');
    stub.returns('balance');

    const balance = await user.getBalance();
    expect(stub.calledWith(wallet.address)).to.be.true;
    expect(balance).to.eq('balance');

    stub.restore();
  });

  // TODO
  it('should register point', async () => {
    const sellPoint = {
      lat: 1,
      lng: 2,
      zone: 42,
      rates: 20.20,
      avatar: 1,
      currency: 2,
      telegram: 'abc',
      username: 'cba',
      amount: 0.01,
    };

    stubs.push(sinon.stub());
    stubs[0].returns({
      hash: 'hash',
    });
    stubs.push(sinon.stub(user, '_getCustomContract'));
    stubs[1].returns({
      registerPoint: stubs[0],
    });

    const result = await user.addSellPoint(sellPoint, 'password');
    expect(result).to.eq('hash');

    expect(stubs[0].args[0][0]).to.eq(100000);
    expect(stubs[0].args[0][1]).to.eq(200000);
    expect(stubs[0].args[0][2]).to.eq(42);
    expect(stubs[0].args[0][3]).to.eq(2020);
    expect(stubs[0].args[0][4]).to.eq(1);
    expect(stubs[0].args[0][5]).to.eq(2);
    expect(stubs[0].args[0][6][0]).to.eq(97);
    expect(stubs[0].args[0][6][1]).to.eq(98);
    expect(stubs[0].args[0][6][2]).to.eq(99);
    expect(stubs[0].args[0][7][0]).to.eq(99);
    expect(stubs[0].args[0][7][1]).to.eq(98);
    expect(stubs[0].args[0][7][2]).to.eq(97);

    const transactionValue = Ethers.utils.parseEther('0.01');
    expect(stubs[1].args[0][0].value.eq(transactionValue)).to.be.true;
  });

  it('should send coin', async () => {
    const opts = {
      amount: 1,
      receiver: '0x085b30734fD4f48369D53225b410d7D04b2d9011',
    };
    const stub = sinon.stub(user.signedDetherContract, 'sendCoin');
    stub.returns({
      hash: 'hash',
    });

    const result = await user.sendCoin(opts, 'password');
    expect(result).to.eq('hash');

    expect(stub.calledWith(
      '0x085b30734fD4f48369D53225b410d7D04b2d9011',
      Ethers.utils.parseEther('1'),
    )).to.be.true;

    stub.restore();
  });

  it('should withdraw all', async () => {
    const result = await user.withdrawAll('password');
    expect(result).to.eq('hash');
  });
});