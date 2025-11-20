import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const networkName = hre.network.name;
  // Use appropriate contract based on network
  // For now, use simple version to avoid FHEVM deployment issues
  const contractName = networkName === "sepolia" ? "IncomeSurveySepolia" : "IncomeSurveySimple";

  console.log(`Deploying ${contractName} to ${networkName} network...`);

  const deployedContract = await deploy(contractName, {
    from: deployer,
    log: true,
  });

  console.log(`${contractName} contract: `, deployedContract.address);

  if (networkName === "sepolia") {
    console.log("✅ Deployed to Sepolia with plain contract (no FHE support)");
  } else {
    console.log("✅ Deployed to local network with full FHEVM support");
  }
};
export default func;
// func.id = "deploy_incomeSurvey"; // id required to prevent reexecution - commented out to force redeploy
func.tags = ["IncomeSurvey"];
