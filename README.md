# DataPipeline_StepFunctions

Datapipeline offers to run Shell scripts to accomplish certain tasks, and takes care of spinning up the EC2 instance to run the shell script job. Step Functions offers you to achieve the same, and deploying the script below deploys the StepFunction workflow to run the Shell script job and also terminate the resources when the job is complete as well send a user notification. 

![Alt text](stepfunctions.png?raw=true "SF_ShellScript")

## Steps to Deploy

### Step 1: 
Download the files from the "Shell_Script_Migration" folder 

### Step 2: 
From the AWS Console, choose:

```
AWS CloudFormation > Create Stack > With new resources (standard) > Upload a template file > Choose shell_template.yaml > Next
```
Alternatively if you have AWS CLI installed, you can run the following command: 

```
aws cloudformation deploy --template-file shell_template.yaml --stack-name datapipelineSFN --capabilities CAPABILITY_NAMED_IAM --region us-east-1
```

### Step 3:

Enter a stack name (the S3 bucket will have a similar name) and your email address,where you would like to receive the notifications about the Job status and click "Next" twice > Read and Acknowledge > Submit. 

This will create all the required resources in your AWS account and is customizable according to your business use case. Wait for the CloudFormation status to change to "CREATE_COMPLETE", and CloudFormation will deploy the following resources in your AWS Account: 

* **Step Function Workflow**  
* **S3 Bucket, S3 Bucket Policies**
* **Networking** - VPC, Subnet, Security Group, Internet Gateway, and Route Tables
* **Security** - EC2 IAM Role & IAM Policy, Step Functions Role & IAM Policy, EC2 Key Pair

___Note___: This template by default uses the AMI image in N.Virginia - "ami-005f9685cb30f234b". You can find the list of AMI's [here](https://aws.amazon.com/amazon-linux-ami/).

___Note___: [IMPORTANT] Subnet is configured to automatically assign public IP address for the purposes of this demo, any manual resources launched in this subnet, will be auto assigned with a public IP address. 

___Note___: The Subnet range is /24, which restricts the maximum number (254)of Step Function Executions to run the EC2 instances. 

### Step 4: 
You should have received an email to confirm your email address, once you accept the confirmation you will start receiving the email notifications. 

From the S3 console, find the S3 bucket with a name similar to the CloudFormation stack. Upload your shell script and the dependent packages to the S3 bucket from the AWS Console or via AWS CLI. 

```
aws s3 cp xyz.sh s3://BUCKET-NAME/  (OR)
aws s3 cp <your directory path> s3://BUCKET-NAME --recursive
```

For demonstration purposes, we have a supplied a sample Shell Script that runs a simple Node JS script. To run the sample, please upload "job.js", "datapipeline.sh", and "package.json" 

```
aws s3 cp job.js datapipeline.sh package.json s3://BUCKET-NAME/  

```

___NOTE___: 

_Changes to job.js:_ 

* Add your AWS Account number to line #26 under the "ActivityArn" resource. 

* This sample script is designed to run in 'us-east-1' region, if you plan to use a different region, update the script with the corresponding region. 

### Step 5: 
Navigate to AWS Step Functions Console and find the Step Function with a name similar to the CloudFormation deployment. Click "Start Execution" and enter the following input: 

```
{
	"userInput": "#!/bin/bash \n yum update -y \n echo \"Starting User Data\" \n mkdir stepUserInput && cd stepUserInput \n aws s3 cp --recursive s3://BUCKET-NAME/ . \n ls \n chmod -R 455 ./* \n sh SHELL FILE NAME \n echo \"User Data Ends\""
}
```

To run the above sample 

```
{
	"userInput": "#!/bin/bash \n yum update -y \n echo \"Starting User Data\" \n mkdir stepUserInput && cd stepUserInput \n aws s3 cp --recursive s3://BUCKET-NAME/ . \n ls \n chmod 455 ./* \n sh datapipeline.sh \n echo \"User Data Ends\""
}
```

The Step Function workflow takes 2-3 minutes for job completion. See the status of the job completion from Step Function console. Once the job is completed, you should receive an email notification. 


## Step Function Activity

Step Function task "Pause for Job Completion" waits for the job to complete and if it fails to complete within 3 minutes (configurable), it goes to failed state. From statemachine > "dpl_state_machine.asl.json" you can configure the "TimeoutSeconds" configurations depending on the time required to run your shell script. This file is embedded directly into the CloudFormation template (lines #245 to #342) which you can modify based on your business use case. 


In order for your job to pause in the "Pause for Job Completion" status, your job need to send heartbeats to the state machine. Once the job is completed you can either send a success/failure status along with some metadata from within the job. Please refer to the Resources section on how to send the Task status, alternatively you can also refer to the code available in "job.js" to see how to send the API calls via Node AWS SDK APIs. 


## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)

Step Function Task Heartbeat - https://docs.aws.amazon.com/cli/latest/reference/stepfunctions/send-task-heartbeat.html

Step Function Task Success - https://docs.aws.amazon.com/cli/latest/reference/stepfunctions/send-task-success.html

Step Function Task Failure - https://docs.aws.amazon.com/cli/latest/reference/stepfunctions/send-task-failure.html