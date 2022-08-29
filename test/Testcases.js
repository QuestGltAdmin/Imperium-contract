const { expect } = require("chai");
const { ethers, upgrades, network } = require("hardhat");
const { Contract, Signer, BigNumber } = require('ethers')
require('dotenv').config()

const toKBNDenomination = (Imperium) =>
  ethers.utils.parseUnits(Imperium, DECIMALS)

const DECIMALS = 18
const INITIAL_SUPPLY = ethers.utils.parseUnits('10',10 + DECIMALS)

let accounts = Signer[15],
  deployer = Signer,
  Imperium = Contract,
  initialSupply = BigNumber

async function setupContracts() {
  accounts = await ethers.getSigners()
  deployer = accounts[0]
  const imperium = await ethers.getContractFactory("ICO");
  const ImperiumToken = await imperium.deploy();
  Imperium = await ImperiumToken.deployed();
  initialSupply = await ImperiumToken.totalSupply()
}

describe('Imperium', () => {
  before('setup Imperium contract', setupContracts)

  it('should reject any ether sent to it', async function () {
    const user = accounts[1]
    await expect(user.sendTransaction({ to: Imperium.address, value: 1 })).to
      .be.reverted
  })
})

describe('Imperium:Initialization', () => {
  before('setup Imperium contract', setupContracts)

  it('should transfer 10B Imperium to the deployer', async function () {
    expect(await Imperium.balanceOf(await deployer.getAddress())).to.eq(
      INITIAL_SUPPLY,
    )
  })

  it('should set the totalSupply to 10B', async function () {
    expect(await Imperium.totalSupply()).to.eq(INITIAL_SUPPLY)
  })

  it('should set the owner', async function () {
    expect(await Imperium.owner()).to.eq(await deployer.getAddress())
  })

  it('should set detailed ERC20 parameters', async function () {
    expect(await Imperium.name()).to.eq('Imperium Coin')
    expect(await Imperium.symbol()).to.eq('ICO')
    expect(await Imperium.decimals()).to.eq(DECIMALS)
  })
})

describe('Imperium:Transfer', function () {
  let UserA = Signer, UserB = Signer, UserC = Signer, provider = Signer

  before('setup Imperium contract', async () => {
    await setupContracts()
    provider = accounts[9]
    UserA = accounts[10]
    UserB = accounts[11]
    UserC = accounts[12]
  })

  describe('deployer transfers sell', function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Imperium.balanceOf(
        await deployer.getAddress(),
      )
      await Imperium
        .connect(deployer)
        .transfer(await provider.getAddress(), toKBNDenomination('10'))
      expect(await Imperium.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBNDenomination('10')),
      )
      expect(await Imperium.balanceOf(await provider.getAddress())).to.eq(
        toKBNDenomination('10'),
      )
    })
  })

  describe('deployer transfers 100 to userA', async function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Imperium.balanceOf(
        await deployer.getAddress(),
      )
      await Imperium
        .connect(deployer)
        .transfer(await UserA.getAddress(), toKBNDenomination('100'))
      expect(await Imperium.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBNDenomination('100')),
      )
      expect(await Imperium.balanceOf(await UserA.getAddress())).to.eq(
        toKBNDenomination('100'),
      )
    })
  })

  describe('deployer transfers 200 to userB', async function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Imperium.balanceOf(
        await deployer.getAddress(),
      )

      await Imperium
        .connect(deployer)
        .transfer(await UserB.getAddress(), toKBNDenomination('200'))
      expect(await Imperium.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBNDenomination('200')),
      )
      expect(await Imperium.balanceOf(await UserB.getAddress())).to.eq(
        toKBNDenomination('200'),
      )
    })
  })

  describe('deployer transfers 100 Buy fees', function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Imperium.balanceOf(
        await deployer.getAddress(),
      )
      const providerBefore = await Imperium.balanceOf(
        await provider.getAddress(),
      )
      await Imperium
        .connect(provider)
        .transfer(await deployer.getAddress(), toKBNDenomination('1'))
      expect(await Imperium.balanceOf(await provider.getAddress())).to.eq(
        providerBefore.sub(toKBNDenomination('1')),
      )
      expect(await Imperium.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.add(toKBNDenomination('1')),
      )
    })
  })
})

describe('Imperium:Mint', async () => {
  let user = Signer
  let balanceOfUserBefore;
  let TotalSupply;

  before('setup Imperium contract', async () => {
    await setupContracts()
    user = accounts[2]
  })

  it('should be callable by owner', async function () {
    balanceOfUserBefore = await Imperium.balanceOf(user.address);
    TotalSupply = await Imperium.totalSupply();
  })
  it('should be callable by deployer', async function () {
    await expect(Imperium.connect(deployer).mint(user.address, 10000000000))
      .to.not.be.reverted
  })
  it('should not be callable by any other', async function () {
    await expect(Imperium.connect(user).mint(user.address, 10000000000))
      .to.be.reverted
  })
  it('Balance will be increased by 10000000000', async function () {
    const ExpectedtotalBalance = balanceOfUserBefore.add(10000000000);
    const BalanceOf = await Imperium.balanceOf(user.address);
    expect(BalanceOf).to.be.equal(ExpectedtotalBalance);
  })
  it('Totalsupply will be increased by 10000000000', async function () {
    const ExpectedTotalSupply = TotalSupply.add(10000000000);
    const TotalSup = await Imperium.totalSupply();
    expect(TotalSup).to.be.equal(ExpectedTotalSupply);
  })
})

describe('Imperium:Burn', async () => {
  let user = Signer
  let balanceOfUserBefore;
  let TotalSupply;

  before('setup Imperium contract', async () => {
    await setupContracts()
    user = accounts[2]

  })

  it('should be callable by owner', async function () {
    balanceOfUserBefore = await Imperium.balanceOf(deployer.address);
    TotalSupply = await Imperium.totalSupply();
  })
  it('should be callable by deployer', async function () {
    await expect(Imperium.connect(deployer).burn(deployer.address, 10000000000))
      .to.not.be.reverted
  })
  it('can not burn more then balance', async function () {
    await expect(Imperium.connect(user).burn(user.address, 10000000000))
      .to.be.reverted
  })
  it('Balance will be decreased by 10000000000', async function () {
    const ExpectedtotalBalance = balanceOfUserBefore.sub(10000000000);
    const BalanceOf = await Imperium.balanceOf(deployer.address);
    expect(BalanceOf).to.be.equal(ExpectedtotalBalance);
  })
  it('Totalsupply will be decreased by 10000000000', async function () {
    const ExpectedTotalSupply = TotalSupply.sub(10000000000);
    const TotalSup = await Imperium.totalSupply();
    expect(TotalSup).to.be.equal(ExpectedTotalSupply);
  })
})