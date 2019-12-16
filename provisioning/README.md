# To begin with
 
Any resources that we add to our environment are tied to the environment's lifecycle and should be terminated on environment termination.
Our web servers are in a public subnet and the database servers - in a private subnet. 

The instances in the public subnet can send outbound traffic directly to the Internet, whereas the instances in the private subnet can't. Instead, the instances in the private subnet can access the Internet by using a network address translation (NAT) gateway that resides in the public subnet. The database servers can connect to the Internet for software updates using the NAT gateway, but the Internet cannot establish connections to the database servers. Security and routing are properly set up so that the web servers can communicate with the database servers as well.

So, to sum up we are following
![VPC with Public and Private Subnets (NAT)](nat-gateway-diagram.png) [scenario](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html)

# AWS infrastructure and helpful tips 

# Prerequisites
To walk through environment creation/modification you need the following :

- An AWS account
- An access key and secret key for a user in existed AWS account
- The AWS CLI installed
- Generated SSH key 

## Deployment steps for the whole environment
1. [Upload configuration properties and AWS resources](#configuration-deployment-into-aws-s3)
2. Set proper ENVIRONMENT variable in bitbucket **Repository variables** part
3. [Push docker images into AWS ECR](#upload-docker-images-into-aws-ecr)
4. [Deploy AWS VPC](#amazon-vpc-deployment)
5. [Deploy AWS ECS](#amazon-elastic-container-service-deployment)


### Configuration deployment into AWS S3
All our sensitive information(database name, user name and password) we are keeping encrypted on AWS S3 bucket for now. To make any updates there you need to replace all 
placeholders in [application-secured.properties](../improver/src/main/resources/application-secured.properties) and run:
```bash
mvn s3-upload:s3-upload@configs-deploy -Daws.profile=deploy -pl improver,provisioning
```
That will upload [application-secured.properties](../improver/src/main/resources/application-secured.properties) into `s3://improver/configs/$ENVIRONMENT/application-secured.properties`, which will be used by bitbucket to retrieve all necessary information for its jobs run.
And will upload cloud formation stacks for VPC and ECS creation.

NOTES: 
- aws.profile=$AWS_PROFILE is necessary when you have other profile with deployment permissions(see [AWS credentials file example with multiple AWS profiles](#aws-credentials-file-example-with-multiple-aws-profiles))
- when you have more then one occurrences of some variable( @placeholder@ ), then change <source> configuration in [improver module pom.xml](../improver/pom.xml) 
```xml
<execution>
    <id>configs-deploy</id>
    <phase>none</phase>
    <goals>
        <goal>s3-upload</goal>
    </goals>
    <configuration>
        <source>${project.basedir}/target/classess/application-secured.properties</source>
        <destination>configs/${environment}/application-secured.properties</destination>
    </configuration>
</execution>
```
and deploy the application like:
```bash
mvn clean deploy s3-upload:s3-upload@configs-deploy -Denvironment=$ENVIRONMENT -DdomainName=$DOMAIN_NAME -DdbName=$DB_NAME -DdbUserName=$DB_USER_NAME -DdbPassword=$DB_PASSWORD -pl improver,provisioning
```

so you have only one place to set properties in.  All `$` vars are environment variables. 

- application-secured.properties custom config is set withing `spring.config.additional-location` parameter, so that it will be used in addition to the default locations. 
Additional locations are searched before the default locations( check out [spring documentation part](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config-application-property-files)) 
and spring profile-specific properties are loaded from the same locations as standard application.properties, with profile-specific files always overriding the non-specific ones, whether or not the profile-specific files are inside or outside our packaged jar.

### Upload docker images into AWS ECR
Run **ops-push-docker** job of [bitbucket datapipeline](../bitbucket-pipelines.yml) in bitbucket. For more information please have a look at [Push docker images into ECR](#docker-image-build) part.

### Amazon VPC deployment
Run **ops-deploy-env** job of [bitbucket datapipeline](../bitbucket-pipelines.yml) in bitbucket.

### Amazon Elastic Container Service deployment
Run **ops-deploy-app** job of [bitbucket datapipeline](../bitbucket-pipelines.yml) in bitbucket.

## Amazon Elastic Container Services CloudFormation quick start.

This directory contains an Amazon ECS cloudformation template for the initial setup of the:
 - VPC
 - Amazon ECS cluster, task, service
 - Amazon RDS instance. 
 - Amazon ECR repository 
 - Amazon Application Load Balancer and target groups.
 
*Tips to work with CFN:* 

1. By default, Elastic Load Balancing associates the latest predefined policy with our load balancer.)
2. When you create a stack, [all update actions are allowed on all resources](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/protect-stack-resources.html). By default, anyone with stack update permissions
can update all of the resources in the stack. During an update, some resources might require an interruption or be completely
replaced, resulting in new physical IDs or completely new storage  
3. If you want to modify resources and properties that are declared in a stack template, you must modify the stack's template. To ensure that you update only the resources that you intend to update, use the template for
the existing stack as a starting point and make your updates to that template
4. To enable HTTPS connections to our application in AWS, we use SSL/TLS server certificate provided by AWS Certificate Manager (ACM),
 that is free and automatically renew. We've chosen [DNS validation](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html)
  of provided certificate, thereby ACM provided us one CNAME record to insert into our DNS database that we accepted.
  We are not charged by AWS for the SSL/TLS certificates that you manage with AWS Certificate Manager. 
5. If you use the CLI or API to create a stack, you can upload a template with a maximum size of 51,200 bytes
6. __Manage All Stack Resources Through AWS CloudFormation!__
   After you launch a stack, use the AWS CloudFormation console, API, or AWS CLI to update resources in your stack. Do not make changes to stack resources outside of AWS CloudFormation. Doing so can create a mismatch between your stack's template and the current state of your stack resources, which can cause errors if you update or delete the stack.
7. Create Change Sets Before Updating Your Stacks
   Change sets allow you to see how proposed changes to a stack might impact your running resources before you implement them. AWS CloudFormation doesn't make any changes to your stack until you execute the change set, allowing you to decide whether to proceed with your proposed changes or create another change set.

To create the cluster and start application from your local machine you need to have [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) installed and configured.
If that is done, please check [run_cfn.sh](./scripts/run_cfn.sh) script

## [Blue-Green Deployments on Amazon EC2 Container Service](https://aws.amazon.com/blogs/compute/bluegreen-deployments-with-amazon-ecs/)

Blue/green deployments are a type of immutable deployment used to deploy software updates with less risk by creating two separate environments, blue and green. “Blue” is the current running version of our application and “green” is the new version of our application we will deploy.
By following this method, we can update and roll back features with near zero downtime.
This ability to quickly roll traffic back to the still-operating blue environment is one of the key benefits of blue/green deployments.  

Depending on the size and complexity of our application architecture, a second environment can will be quite costly for all environments(qa, dev, stg). So, we will do that for production only by **ops-redeploy-app-blue-green** [bitbucket datapipeline](../bitbucket-pipelines.yml) job.
Looking at a most basic example, we are following, consider having two EC2 instances in an ECS cluster. We have a service defined to run a single task instance. That task will be running on just one of the EC2 instances. When the task definition is updated and the service is updated to use the new task definition, ECS will start a new task on the second EC2 instance, register it with the ELB, drain connection from the first, and then kill the old task.
Since we have initially only one EC2 instance with enough capacity to keep only one task, we will add one more instance before ECS service updating, and after its successful stabilization we will revert back to use one EC2.

The process looks a little different if database changes are involved. Strict developer policies are needed to manage schema changes specifically to ensure that no deployment breaks the possibility of a rollback. 
Please check [this](https://medium.com/@ahmetatalay/zero-down-time-blue-green-deployment-in-an-aws-ecs-with-database-schema-changes-de88133001e5) information before proceeding doing any changes. 

### Stack parameters that are NOT SAFE to update. Instance will be recreated:
### Stack parameters that are SAFE to update. Amazon offers update without interruption:

## AWS NAT Instance Size on EC2
The m1.small instance, which most examples utilize, offers quite limited bandwidth and is not a good choice for a production environment. The t2.micro instance is even worse. The t2.small and t2.medium instances seem like good fits for production environments where cost is a concern. The c3 instances with enhanced networking clearly realize a performance boost compared to the other instances but come at a higher cost

## AWS credentials file example with multiple AWS profiles
```properties
[default]
aws_access_key_id = ABCDEF
aws_secret_access_key = /ABCDEF

[deploy]
aws_access_key_id = GHIJK
aws_secret_access_key = /GHIJK

```
NOTE: you must have [AWS cli installed and configured locally](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

## [How we are billed by AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts-reserved-instances-application.html)
   Until we know the terms we are going to use AWS for our infrastructure, we use On-demand AWS EC2 instances.
    Amazon EC2 usage of Linux based instances (we use) that are launched in On-Demand, Reserved and Spot form are billed on one second increments, with a minimum of 60 seconds.
    
   List prices and Spot Market prices are listed on a per-hour basis, but bills are calculated down to the second. 
   
   In future we can get the Reserved Instance Benefit for all of the instances.     
   All Reserved Instances provide a discount compared to On-Demand pricing. With Reserved Instances, we pay for the entire term regardless of actual use. We can choose to pay for your Reserved Instance upfront, partially upfront, or monthly, depending on the payment option specified for the Reserved Instance. When Reserved Instances expire, we will be charged On-Demand rates for EC2 instance usage. 

# Docker image build
To properly build/deploy our docker images you need to authenticate docker against ECR with basic auth credentials with:
`` eval $(aws ecr get-login --region ${AWS_DEFAULT_REGION} --no-include-email --profile $AWS_PROFILE) ``

NOTE: you should have proper AWS permissions to push a docker image. 
 
After having logged in, we could assume that the plugin picks up the credentials and uses it to authenticate against ECR. On Linux, this will work, but sadly, on macOS, Docker by default uses the macOS keychain to store the credentials (you can see it in ~/.docker/config.json), and this workflow is not working with dockerfile-maven.
To work around [this issue](https://github.com/spotify/docker-maven-plugin/issues/321), please update your .m2/settings.xml with:
```
<server>
    <id>[[ACCOUNT_ID]].dkr.ecr.us-east-1.amazonaws.com</id>
    <username>AWS</username>
    <password>[[YOUR_PASSWORD]]</password>
</server>
```
where [[ACCOUNT_ID]] is your AWS account id and [[YOUR_PASSWORD]] is a docker login authentication password you can retrieve by running:
``aws ecr get-login --no-include-email``

Now, you can build some of the images specified under [docker](docker) directory by running
```bash
mvn clean dockerfile:build -Ddocker.image.name=mvn-awscli-alpine -pl provisioning
mvn dockerfile:tag@tag-version -Ddocker.image.name=mvn-awscli-alpine -pl provisioning
mvn dockerfile:push@push-latest -Ddocker.image.name=mvn-awscli-alpine -pl provisioning
mvn dockerfile:push@push-version -Ddocker.image.name=mvn-awscli-alpine -pl provisioning
```
, where *mvn-awscli-alpine* is an image name

To test newly created image locally through a simple bash console from the container, you can execute:
```bash
docker run --name test-image -it 815041732288.dkr.ecr.us-east-1.amazonaws.com/mvn-awscli-alpine /bin/bash
``` 

, where -it flags mean to start the container interactively (with the ability to type into it) and with a TTY (so you can see the input and output).
