from aws_cdk import App, Environment

from .stack import ChatUIStack

app = App()

env = Environment(
    account="679808196654",
    region="us-east-1",
)

ChatUIStack(
    app,
    "MarkyProdChatUI",
    env=env,
    description="Marky Chat UI Production Stack",
)

app.synth()
