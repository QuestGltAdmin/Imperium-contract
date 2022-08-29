async function main() {
  const deployer= await ethers.getSigner();
  console.log("deployer address ", deployer.address);
  console.log("deployer balance ", (await deployer.getBalance())/1e18);

  // ERC20 
  const imperium = await ethers.getContractFactory("ICO");
  const Imperium = await imperium.deploy();

  await Imperium.deployed();

  console.log("ICO Token: ", Imperium.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
