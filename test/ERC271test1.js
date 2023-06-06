const { expect } = require("chai");
const { ethers } = require("hardhat");

const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

const ZERO = "0x0000000000000000000000000000000000000000";


describe("merkle", function () {
    
    it("merkle test", async function () {
        const accounts = await ethers.getSigners()


        // 指定需要的地址
        const [owner, addr1,wallet] = await ethers.getSigners()
        // 加载ERC721合约
        const NFT = await ethers.getContractFactory("ERC721Mock")
        // 部署合约
        const nft = await NFT.deploy("t","5","https://uri.com")
        // 等待打包
        await nft.deployed()
    
        signer = accounts[2];

       // 加载白名单合约
        const Tree1 = await ethers.getContractFactory("MerkleDistributor")
        // 部署合约
        const tree1 = await Tree1.deploy(owner.address,owner.address)
        // 等待打包
        await tree1.deployed()

    // 给白名单合约授权
        // await nft.setApprovalForAll(tree.address,true)
        // 添加操作权限
        await nft.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", tree1.address)
       
        calldatas = [
            "0x40c10f190000000000000000000000000078a70fdab38e8e910facb87a122abddba187e80000000000000000000000000000000000000000000000000000000000000faf",
            "0x40c10f19000000000000000000000000128f19a6fdd737b0937627738313e8bf5527aceb0000000000000000000000000000000000000000000000000000000000001415",
            "0x40c10f19000000000000000000000000244291d3f74380d7cd10b861622aff1216fc26970000000000000000000000000000000000000000000000000000000000001c5c",

            "0x40c10f190000000000000000000000006c05994f781e4aa7ef66ed58bf3422a1a966b48900000000000000000000000000000000000000000000000000000000000018bd",
            "0x40c10f190000000000000000000000006c77f32eef9ac76cff1ae411d125d03f81f24a550000000000000000000000000000000000000000000000000000000000000d4d",
            "0x40c10f1900000000000000000000000089653c7156ccc49be0e0b5ab63f2848296bb1a8d00000000000000000000000000000000000000000000000000000000000023ad",

            "0x40c10f1900000000000000000000000099391c6f4d33ddac56e0856db4ef0013851031bd00000000000000000000000000000000000000000000000000000000000009bf",
            "0x40c10f19000000000000000000000000bc74773ee70a0923e33630c9ebf00cf17d9ae0260000000000000000000000000000000000000000000000000000000000001e3f",
            "0x40c10f19000000000000000000000000d6db168643284dd26cc48114c97d844d2b65b3020000000000000000000000000000000000000000000000000000000000001687",

            "0x40c10f19000000000000000000000000d7bc18733ba69067d2af976011e54ec5d3239e7c0000000000000000000000000000000000000000000000000000000000002290",
          ];

        // make tree with abi
        const leaves = calldatas.map(( v, k ) => {
            // roundID, index, calldata
            return ethers.utils.solidityKeccak256(['uint256', 'uint256', 'uint256', 'bytes'], [201, k, 1, v]);
        })
        
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        // get tree root
        const root = tree.getHexRoot()

         // 创建Launchpad信息
         await tree1.launchpad(201,nft.address,root,
         wallet.address,ZERO,100000,0,0);

        const leaf = ethers.utils.solidityKeccak256(['uint256', 'uint256', 'uint256', 'bytes'], [201, 9, 1, "0x40c10f19000000000000000000000000d7bc18733ba69067d2af976011e54ec5d3239e7c0000000000000000000000000000000000000000000000000000000000002290"]);
        const proof = tree.getHexProof(leaf)

        console.log({
            leaves,
            root,
            leaf,
            proof
        });

        data = calldatas[9];


        // await merkle.launchpad(root);
        // const getRoot = await tree1.merkleRoot();

        let result = await tree1.claim(201,9,1,data, proof,{value:100000});


        console.log({
            // getRoot,
            // result
        });

    });

});