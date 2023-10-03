import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  some,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  mplTokenMetadata,
  createNft,
  fetchDigitalAsset,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import "dotenv/config";
import fs from "fs";
import path from "path";

const NFT_METADATA = {
  name: "SKLIM NFT",
  symbol: "SKLIM",
  imageFilename: "logo.jpg",
};

const umi = createUmi("https://api.devnet.solana.com");
const COLLECTION_NFT_ADDRESS = publicKey(
  "5PAMMbZ5E2ZKLvncK4PSsftd897N17h1FXJw8UzAKBWC"
);

async function bootstrapMasterEdition() {
  const keypair = getKeypair();

  umi
    .use(keypairIdentity(keypair))
    .use(mplTokenMetadata())
    .use(bundlrUploader());

  const nftMint = generateSigner(umi);
  const nftUri = await uploadMetadata();
  console.log("Creating NFT...");
  await createNft(umi, {
    mint: nftMint,
    name: NFT_METADATA.name,
    symbol: NFT_METADATA.symbol,
    uri: nftUri,
    sellerFeeBasisPoints: percentAmount(0),
    collection: some({
      key: COLLECTION_NFT_ADDRESS,
      verified: false,
    }),
  }).sendAndConfirm(umi);

  setTimeout(async () => {
    console.log("Fetching NFT...");
    const asset = await fetchDigitalAsset(umi, nftMint.publicKey);
    console.log(asset);

    console.log("Verifying NFT...");
    await verifyCollectionV1(umi, {
      metadata: nftMint.publicKey,
      collectionMint: COLLECTION_NFT_ADDRESS,
    }).sendAndConfirm(umi);
  }, 10000);
}

async function uploadMetadata() {
  const imageBuffer = fs.readFileSync(
    path.resolve(__dirname, "../assets/logo.jpg")
  );

  console.log("Uploading image...");
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

  console.log("Uploading metadata...");
  return await umi.uploader.uploadJson({
    name: NFT_METADATA.name,
    symbol: NFT_METADATA.symbol,
    image: imageUri,
  });
}

function getKeypair() {
  console.log("Loading private key...");
  const secretKey = bs58.decode(process.env.PRIVATE_KEY!);
  return umi.eddsa.createKeypairFromSecretKey(secretKey);
}

bootstrapMasterEdition();
