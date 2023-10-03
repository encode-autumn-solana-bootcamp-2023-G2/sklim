import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  mplTokenMetadata,
  createNft,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import "dotenv/config";
import fs from "fs";
import path from "path";

const NFT_METADATA = {
  name: "SKLIM TEAM",
  symbol: "SKLIM",
  imageFilename: "logo.jpg",
  description: "Encode Autumn Solana Bootcamp Q3-2023 - Group 2 Project",
};

const umi = createUmi("https://api.devnet.solana.com");

async function bootstrapMasterEdition() {
  const keypair = getKeypair();

  umi
    .use(keypairIdentity(keypair))
    .use(mplTokenMetadata())
    .use(bundlrUploader());

  const nftMint = generateSigner(umi);
  const nftUri = await uploadMetadata();
  await createNft(umi, {
    mint: nftMint,
    name: NFT_METADATA.name,
    symbol: NFT_METADATA.symbol,
    uri: nftUri,
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
  }).sendAndConfirm(umi);

  const asset = await fetchDigitalAsset(umi, nftMint.publicKey);
  console.log(asset);
}

async function uploadMetadata() {
  const imageBuffer = fs.readFileSync(
    path.resolve(__dirname, "../assets/logo.jpg")
  );
  const [imageUri] = await umi.uploader.upload([
    {
      buffer: imageBuffer,
      fileName: NFT_METADATA.imageFilename,
      displayName: NFT_METADATA.imageFilename,
      uniqueName: NFT_METADATA.imageFilename,
      extension: "jpg",
      contentType: "image/jpeg",
      tags: [],
    },
  ]);

  return await umi.uploader.uploadJson({
    name: NFT_METADATA.name,
    symbol: NFT_METADATA.symbol,
    description: NFT_METADATA.description,
    image: imageUri,
  });
}

function getKeypair() {
  const secretKey = bs58.decode(process.env.PRIVATE_KEY!);
  return umi.eddsa.createKeypairFromSecretKey(secretKey);
}

bootstrapMasterEdition();
