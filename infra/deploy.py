import mimetypes
import os
import subprocess
import time
from pathlib import Path

import boto3


def sync_s3_bucket(s3_client, source_dir: Path, bucket: str) -> None:
    """Sync local directory to S3 bucket with proper content types and cache control."""
    for file_path in source_dir.rglob("*"):
        if file_path.is_file():
            # Get relative path from source_dir
            relative_path = str(file_path.relative_to(source_dir))

            # Guess content type
            content_type, _ = mimetypes.guess_type(str(file_path))
            extra_args = {
                "CacheControl": "max-age=31536000,public,immutable",
                "ContentType": content_type or "application/octet-stream",
            }

            print(f"Uploading {relative_path} to s3://{bucket}/{relative_path}")
            with open(file_path, "rb") as f:
                s3_client.upload_fileobj(f, bucket, relative_path, ExtraArgs=extra_args)


def main() -> None:
    # Get the project root directory
    project_root = Path(__file__).parent.parent

    # Build the React app
    print("Building React app...")
    subprocess.run(["npm", "run", "build"], cwd=project_root, check=True)

    # Initialize boto3 clients
    s3_client = boto3.client("s3")
    cloudfront_client = boto3.client("cloudfront")

    # Constants
    BUCKET_NAME = "marky-chat-ui-static-679808196654"
    DISTRIBUTION_ID = "E2L8B1IIN9J7IY"

    # Upload files to S3
    print("Uploading files to S3...")
    dist_dir = project_root / "dist"
    sync_s3_bucket(s3_client, dist_dir, BUCKET_NAME)

    # Invalidate CloudFront cache
    print("Invalidating CloudFront cache...")
    cloudfront_client.create_invalidation(
        DistributionId=DISTRIBUTION_ID,
        InvalidationBatch={
            "Paths": {"Quantity": 1, "Items": ["/*"]},
            "CallerReference": str(int(time.time())),
        },
    )

    print("Deployment complete!")


if __name__ == "__main__":
    main()
