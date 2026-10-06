import { ethers } from "ethers";
import { readFileSync } from "fs";

async function main() {
  console.log("Iniciando a implantação do contrato com Ethers puro...");

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  const signer = await provider.getSigner(); 

  const artifactJson = readFileSync("./artifacts/contracts/EVBatteryPassport.sol/EVBatteryPassport.json", "utf8");
  const artifact = JSON.parse(artifactJson);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const passport = await factory.deploy();
  await passport.waitForDeployment();

  const address = await passport.getAddress();
  console.log(`Passaporte de Baterias implantado com sucesso no endereço: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});