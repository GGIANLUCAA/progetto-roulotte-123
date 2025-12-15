import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { CONFIG } from "../config.js";

let client = null;
function getClient(){
  if (!client){
    client = new S3Client({
      region: CONFIG.S3_REGION,
      credentials: CONFIG.S3_ACCESS_KEY_ID && CONFIG.S3_SECRET_ACCESS_KEY ? {
        accessKeyId: CONFIG.S3_ACCESS_KEY_ID,
        secretAccessKey: CONFIG.S3_SECRET_ACCESS_KEY
      } : undefined
    });
  }
  return client;
}

export async function uploadLocalFile(localPath, keyPrefix = "uploads/"){
  const bucket = CONFIG.S3_BUCKET;
  if (!bucket) return null;
  const key = keyPrefix + path.basename(localPath);
  const Body = fs.readFileSync(localPath);
  const ContentType = "application/octet-stream";
  await getClient().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body, ContentType }));
  return key;
}

export async function streamObject(key, res){
  const bucket = CONFIG.S3_BUCKET;
  if (!bucket) return false;
  try{
    const data = await getClient().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
    data.Body.pipe(res);
    return true;
  }catch{
    return false;
  }
}
