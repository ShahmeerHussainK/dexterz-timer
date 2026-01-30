import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET || 'cvbuckets3.11';
  }

  async uploadScreenshot(
    buffer: Buffer,
    fileName: string,
    contentType: string = 'image/png',
  ): Promise<string> {
    const key = `screenshots/${fileName}`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
    });

    await upload.done();

    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async deleteScreenshot(fileUrl: string): Promise<void> {
    const key = fileUrl.split('.com/')[1];

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }
}
