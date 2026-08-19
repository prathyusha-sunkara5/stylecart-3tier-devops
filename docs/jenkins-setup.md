# Jenkins setup

Install Jenkins on a dedicated Ubuntu EC2 instance.

Required capabilities:
- Git
- Docker
- AWS CLI
- Jenkins Pipeline
- GitHub integration
- Docker Pipeline
- Credentials Binding

Create a Pipeline job using `Pipeline script from SCM`, choose Git, and point it to this repository. Jenkins supports keeping the Jenkinsfile in source control as Pipeline-as-Code.

Add a Jenkins AWS credential with ID:
`aws-credentials`

Then update the AWS values in the root Jenkinsfile.

For GitHub push automation, configure a GitHub webhook to the Jenkins endpoint supported by your Jenkins GitHub integration.
