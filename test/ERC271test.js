const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
} = require('@openzeppelin/test-helpers')

const ZERO = "0x0000000000000000000000000000000000000000";

async function expectR(promise, expectedError){
  try{
      await promise
    }catch(error){
      let index = error.message.indexOf(expectedError)
      if(index === -1){
        expect.fail('Do not have error msg');
      }
      return
    }
    expect.fail('Expected an exception but none was received');
}

async function getDT(){
  const blockNumBefore = await ethers.provider.getBlockNumber()
  const blockBefore = await ethers.provider.getBlock(blockNumBefore)
  return blockBefore.timestamp
}

describe("ERC721", function () {
  it("tt", async function () {
    // 指定需要的地址
    const [owner, addr1,wallet] = await ethers.getSigners()
    // 加载ERC721合约
    const NFT = await ethers.getContractFactory("ERC721Mock")
    // 部署合约
    const nft = await NFT.deploy("t","5","https://uri.com")
    // 等待打包
    await nft.deployed()
    // 输出钱包地址
    console.log("owner: " + owner.address)// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    console.log("addr1: " + addr1.address)// 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    console.log("wallet: " + wallet.address)// 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

    // 加载白名单合约
    const Tree = await ethers.getContractFactory("MerkleDistributor")
    // 部署合约
    const tree = await Tree.deploy(owner.address,owner.address)
    // 等待打包
    await tree.deployed()
    // 给白名单合约授权
    // await nft.setApprovalForAll(tree.address,true)
    // 添加操作权限
    await nft.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", tree.address)
    // 创建Launchpad信息
    await tree.launchpad(238,nft.address,"0xd4d76ae5fa5e5028459f974f929db657eda79ff526ef418ae61baa0fd8273b19",
                        wallet.address,ZERO,100000,0,0);



    // 定义call_data
    let calldata = "0x40c10f19000000000000000000000000ed08b533c736744bd2f4e333cf4105e01f773b85000000000000000000000000000000000000000000000000000000000000000f"
    // 定义proof
    let proof = ["0xc2a513d048402b9c5c41f121e1f34f5277f2822084245d8ff8a0e5b8f8ff42d5","0xab53499a84e22b91d6e89d1f24ab273315b264f1a3209cd8daf9e8fc92e04889","0x901eccfbcf895185dc39e6cb580fdfa0c8293c896d9f83cfbf1a2c353e8d48f3","0xfec879bbd3c57130754dee4110ad1eb3f757eb5bc567d0926bd42a57280b4f14"]

    // 用户调用获得NFT
    await tree.claim(201,9,1,calldata,proof,{value:100000})
    // 查询tokenID为11的NFT属于哪个用户
    const b = await nft.ownerOf(15)
    console.log("ownerOf: " + b)
    console.log("wallet balance: " + await ethers.provider.getBalance(wallet.address))

  });
});




// describe("ERC721", function () {
//   it("tt", async function () {
//     // 指定需要的地址
//     const [owner, addr1,wallet] = await ethers.getSigners()
//     // 加载ERC721合约
//     const NFT = await ethers.getContractFactory("ERC721Mock")
//     // 部署合约
//     const nft = await NFT.deploy("t","5","https://uri.com")
//     // 等待打包
//     await nft.deployed()
//     console.log("completed nft " + nft.address)

//     // 输出钱包地址
//     console.log("owner: " + owner.address)// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
//     console.log("addr1: " + addr1.address)// 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
//     console.log("wallet: " + wallet.address)// 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

    

//     // 加载白名单合约
//     const Tree = await ethers.getContractFactory("MerkleDistributor")
//     // 部署合约
//     const tree = await Tree.deploy(owner.address,owner.address)
//     // 等待打包
//     await tree.deployed()

//     console.log("completed tree " + tree.address)


//     // 部署质押合约
//     const DEPOSIT = await ethers.getContractFactory("Deposit")
//     const deposit = await DEPOSIT.deploy(owner.address,tree.address)
//     await deposit.deployed()
//     console.log("completed deposit " + deposit.address)

//     // 将NFTmint到质押合约
//     nft.mint(deposit.address,1)
//     nft.mint(deposit.address,2)
//     nft.mint(deposit.address,3)
//     nft.mint(deposit.address,4)
//     nft.mint(deposit.address,5)
//     nft.mint(deposit.address,6)
//     nft.mint(deposit.address,7)
//     nft.mint(deposit.address,8)
//     nft.mint(deposit.address,9)
//     nft.mint(deposit.address,10)
//     nft.mint(deposit.address,11)
//     nft.mint(deposit.address,12)

//     // 给质押合约授权
//     await nft.setApprovalForAll(deposit.address,true)
//     // 添加操作权限
//     // await nft.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", tree.address)
//     // 创建Launchpad信息
//     await tree.launchpad(177,deposit.address,"0x4f62b6dc46878cd4dbd6011f2a4767afe50a79248778bc66173819f975e42680",
//                         wallet.address,ZERO,100000,0,0);



//     // 定义call_data
//     let calldata = "0x39943acf0000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa300000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c800000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000900000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c"
//     // 定义proof
//     let proof = ["0xf4ff13d06f9223f89486054005893c8777f06e4adfed1c82a90e828884d6536c", 
//       "0xeea63e2296bb079678d1ce2cdee2283d08ce8390f15aeab6dbe2578987300e8f", 
//       "0xb3960350faefdd179ead287e0749485b4c1521b6929f3b3cba11f003def69518", 
//       "0x39bcd478ca2c9cab754720bc0f806ff8eac6d0ba6b79d11af8f535390a685688"]
//     // 用户调用获得NFT 此处模拟数据为9条，所以num传9，同时需要支付的价格也*9.
//     await tree.claim(177,2,9,calldata,proof,{value:900000})
//     // 查询tokenID为9的NFT属于哪个用户
//     const b = await nft.ownerOf(9)
//     console.log("ownerOf: " + b)
//     console.log("wallet balance: " + await ethers.provider.getBalance(wallet.address))

//   });
// });