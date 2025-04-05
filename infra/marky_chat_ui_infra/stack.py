from aws_cdk import CfnOutput, RemovalPolicy, Stack
from aws_cdk import aws_certificatemanager as acm
from aws_cdk import aws_cloudfront as cloudfront
from aws_cdk import aws_cloudfront_origins as origins
from aws_cdk import aws_iam as iam
from aws_cdk import aws_s3 as s3
from constructs import Construct


class ChatUIStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        domain_name = "chat.mymarky.ai"

        # Look up existing wildcard certificate
        certificate = acm.Certificate.from_certificate_arn(
            self,
            "ChatUICertificate",
            certificate_arn="arn:aws:acm:us-east-1:679808196654:certificate/eb7ff4b7-6c21-46bf-a474-66ff867c775a",
        )

        # Create S3 bucket for static website
        website_bucket = s3.Bucket(
            self,
            "ChatUIBucket",
            bucket_name="marky-chat-ui-static-679808196654",  # Using account ID for uniqueness
            public_read_access=False,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.RETAIN,
            auto_delete_objects=False,
        )

        # Create Origin Access Control for CloudFront
        cloud_front_oac = cloudfront.CfnOriginAccessControl(
            self,
            "ChatUIOriginAccessControl",
            origin_access_control_config=cloudfront.CfnOriginAccessControl.OriginAccessControlConfigProperty(
                name="ChatUIOriginAccessControl",
                origin_access_control_origin_type="s3",
                signing_behavior="always",
                signing_protocol="sigv4",
                description="Access Control for Chat UI CloudFront Distribution",
            ),
        )

        # Create CloudFront distribution
        distribution = cloudfront.Distribution(
            self,
            "ChatUIDistribution",
            domain_names=[domain_name],
            certificate=certificate,
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(
                    website_bucket,
                    origin_access_identity=None,  # We're using OAC instead of OAI
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
                origin_request_policy=cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
            ),
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
            ],
        )

        # Add OAC to the CloudFront distribution using escape hatch
        cfn_distribution = distribution.node.default_child
        cfn_distribution.add_property_override(
            "DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity", ""
        )
        cfn_distribution.add_property_override(
            "DistributionConfig.Origins.0.OriginAccessControlId", cloud_front_oac.ref
        )

        # Grant CloudFront access to the S3 bucket
        website_bucket.add_to_resource_policy(
            iam.PolicyStatement(
                actions=["s3:GetObject"],
                resources=[website_bucket.arn_for_objects("*")],
                principals=[iam.ServicePrincipal("cloudfront.amazonaws.com")],
                conditions={
                    "StringEquals": {
                        "AWS:SourceArn": f"arn:aws:cloudfront::{self.account}:distribution/{distribution.distribution_id}"
                    }
                },
            )
        )

        # Output the custom domain URL
        CfnOutput(
            self,
            "CustomDomainUrl",
            value=f"https://{domain_name}",
            description="Custom Domain URL",
        )

        # Output the CloudFront URL
        CfnOutput(
            self,
            "DistributionUrl",
            value=f"https://{distribution.distribution_domain_name}",
            description="CloudFront Distribution URL",
        )

        # Output the CloudFront Distribution ID
        CfnOutput(
            self,
            "DistributionId",
            value=distribution.distribution_id,
            description="CloudFront Distribution ID",
        )
