#! /usr/bin/env bash
# Fail if an undefined variable is used.
set -o nounset
# Quit executing the script if a command fails.
set -o errexit
# Print every command before executing it.
set -o xtrace

#
# Usage:             Creates, updates ECS cluster in AWS
#
# Example:           run_cfn.sh ecs stopTask qa improve db_user_name db_password domain_name stack-name default


# Tips:
# If you didn't configure any AWS profile locally, but used environment environment variables like AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY instead,
# then don't specify --profile ${AWS_PROFILE} in commands below


# AWS CFN Parameters description:
# --tags (list) : Key-value pairs to associate with this stack.
# AWS CloudFormation also propagates these tags to the resources created in the stack.
# A maximum number of 50 tags can be specified
#
#--parameters (list)
# A list of Parameter structures that specify input parameters for the stack.
#
#--capabilities (list)#
# A list of values that you must specify before AWS CloudFormation can create certain stacks.
# Some stack templates might include resources that can affect permissions in your AWS account, for example, by creating new AWS Identity and Access Management (IAM) users.
# For those stacks, you must explicitly acknowledge their capabilities by specifying this parameter.
# The only valid values are CAPABILITY_IAM and CAPABILITY_NAMED_IAM

homedir=`pwd`
ENVIRONMENT=$3
DB_NAME=$4
DB_USER_NAME=$5
DB_PASSWORD=$6
DOMAIN_NAME=$7
STACK_NAME=$8
AWS_PROFILE=$9
AWS_ACCOUNT_ID=815041732288

function createSshKey {
    aws ec2 import-key-pair \
          --key-name ecs-$USER-key \
              --public-key-material  "$(ssh-keygen -y -f ~/.ssh/id_rsa__)"
}

function createEcsStack {
    STACK_NAME="ecs-${STACK_NAME}-${ENVIRONMENT}-cluster"
    echo -e "Create ecs stack: $STACK_NAME"

    sed -i "s/\(datasource\.name=\).*\$/\1$DB_NAME/" $homedir/../../improver/target/classes/application-env.properties
    sed -i "s/\(spring\.datasource\.username=\).*\$/\1$DB_USER_NAME/" $homedir/../../improver/target/classes/application-env.properties
    sed -i "s/\(spring\.datasource\.password=\).*\$/\1$DB_PASSWORD/" $homedir/../../improver/target/classes/application-env.properties
    aws s3 cp $homedir/../../improver/target/classes/application-env.properties s3://improver/configs/${ENVIRONMENT}/application.properties --profile ${AWS_PROFILE}

    aws s3 cp $homedir/../aws/ecs.cfn.json s3://improver/configs/${ENVIRONMENT}/ecs.cfn.json --profile ${AWS_PROFILE}

    VpcId=$(aws cloudformation list-stack-resources --stack-name vpc-$USER-$ENVIRONMENT --query 'StackResourceSummaries[?LogicalResourceId==`Vpc`].PhysicalResourceId' --profile ${AWS_PROFILE} --output text)

    HostedZoneId=$(aws route53 list-hosted-zones-by-name --query "HostedZones[?Name=='$DOMAIN_NAME.'].Id" --profile ${AWS_PROFILE} --output text | cut -d'/' -f3)

    SubnetId1=$(aws cloudformation list-stack-resources --stack-name vpc-$USER-$ENVIRONMENT --query 'StackResourceSummaries[?LogicalResourceId==`PubSubnetAz1`].PhysicalResourceId' --profile ${AWS_PROFILE} --output text)

    SubnetId2=$(aws cloudformation list-stack-resources --stack-name vpc-$USER-$ENVIRONMENT --query 'StackResourceSummaries[?LogicalResourceId==`PubSubnetAz2`].PhysicalResourceId' --profile ${AWS_PROFILE} --output text)

    ElbSslCertificate=$(aws acm list-certificates --query "CertificateSummaryList[?DomainName=='$DOMAIN_NAME'].CertificateArn" --profile ${AWS_PROFILE} --output text)

    echo -e  "\nRetrieved VPC data:  \nVpcId=${VpcId} \nHostedZoneId=${HostedZoneId} \nSubnetId1=${SubnetId1} \nSubnetId2=${SubnetId2} \nElbSslCertificate=${ElbSslCertificate}"

    aws cloudformation create-stack \
        --profile ${AWS_PROFILE} \
        --stack-name ${STACK_NAME} \
        --template-url https://s3.amazonaws.com/improver/configs/${ENVIRONMENT}/ecs.cfn.json \
        --capabilities CAPABILITY_IAM \
        --tags Key=name,Value=${STACK_NAME} \
        --parameters ParameterKey=AccountId,ParameterValue=$AWS_ACCOUNT_ID ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME ParameterKey=EcsClusterName,ParameterValue=$STACK_NAME ParameterKey=EcsEnvironmentName,ParameterValue=$ENVIRONMENT ParameterKey=HostedZoneId,ParameterValue=${HostedZoneId} ParameterKey=SubnetIds,ParameterValue=${SubnetId1}\\,${SubnetId2} ParameterKey=VpcId,ParameterValue=${VpcId} ParameterKey=ElbSslCertificateArn,ParameterValue=${ElbSslCertificate}
}


function updateEcsStack {
    STACK_NAME="ecs-${STACK_NAME}-${ENVIRONMENT}-cluster"
    echo -e "Update ecs stack: $STACK_NAME"
    aws s3 cp $homedir/../aws/ecs.cfn.json s3://improver/configs/${ENVIRONMENT}/ecs.cfn.json --profile ${AWS_PROFILE}

    aws cloudformation update-stack \
        --profile ${AWS_PROFILE} \
        --stack-name ${STACK_NAME} \
        --template-url https://s3.amazonaws.com/improver/configs/${ENVIRONMENT}/ecs.cfn.json \
        --capabilities CAPABILITY_IAM \
        --tags Key=name,Value=${STACK_NAME}
}

function stopEcsTask {
    CLUSTER_NAME=$(aws ecs list-clusters --profile ${AWS_PROFILE} --query "clusterArns[?contains(@,'ecs-${USER}-${ENVIRONMENT}-cluster')]" --output text)
    TASK_ID=$(aws ecs list-tasks --cluster $CLUSTER_NAME --profile ${AWS_PROFILE} --desired-status RUNNING | egrep "task" | tr "/" " " | tr "[" " " |  awk '{print $2}' | sed 's/"$//')
    echo -e "Stop ecs task: $TASK_ID for $CLUSTER_NAME cluster"
    cd $homedir/../..
    mvn clean deploy -Denvironment=$ENVIRONMENT -DdomainName=$DOMAIN_NAME -DdbName=$DB_NAME -DdbUserName=$DB_USER_NAME -DdbPassword=$DB_PASSWORD -Daws.account.id=$AWS_ACCOUNT_ID -Daws.profile=$AWS_PROFILE
    aws ecs stop-task --cluster ${CLUSTER_NAME} --task ${TASK_ID} --profile ${AWS_PROFILE}
}

function deployProperties {
    echo -e "Deploy cloud formation stacks and secured properties into s3:"
    cd $homedir/../..
    mvn s3-upload:s3-upload@configs-deploy -Denvironment=$ENVIRONMENT -DdomainName=$DOMAIN_NAME -DdbName=$DB_NAME -DdbUserName=$DB_USER_NAME -DdbPassword=$DB_PASSWORD -Daws.account.id=$AWS_ACCOUNT_ID -Daws.profile=$AWS_PROFILE
}

function createVpcStack {
    STACK_NAME="vpc-${STACK_NAME}-${ENVIRONMENT}"
    echo -e "Create vpc stack: ${STACK_NAME}"

    aws s3 cp $homedir/../aws/vpc.cfn.json s3://improver/configs/${ENVIRONMENT}/vpc.cfn.json --profile ${AWS_PROFILE}

    HostedZoneId=$(aws route53 list-hosted-zones-by-name --query "HostedZones[?Name=='$DOMAIN_NAME.'].Id" --output text --profile ${AWS_PROFILE} | cut -d'/' -f3)

    aws cloudformation create-stack \
        --profile ${AWS_PROFILE} \
        --stack-name ${STACK_NAME} \
        --template-url https://s3.amazonaws.com/improver/configs/${ENVIRONMENT}/vpc.cfn.json \
        --capabilities CAPABILITY_IAM \
        --tags Key=name,Value=${STACK_NAME} \
        --parameters ParameterKey=DBName,ParameterValue=$DB_NAME ParameterKey=DBUsername,ParameterValue=$DB_USER_NAME ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT ParameterKey=HostedZoneId,ParameterValue=${HostedZoneId}
}

function updateVpcStack {
    STACK_NAME="vpc-${STACK_NAME}-${ENVIRONMENT}"
    echo -e "Update vpc stack: $STACK_NAME"
    aws s3 cp $homedir/../aws/vpc.cfn.json s3://improver/configs/${ENVIRONMENT}/vpc.cfn.json --profile ${AWS_PROFILE}

    aws cloudformation update-stack \
        --profile ${AWS_PROFILE} \
        --stack-name ${STACK_NAME} \
        --template-url https://s3.amazonaws.com/improver/configs/${ENVIRONMENT}/vpc.cfn.json \
        --capabilities CAPABILITY_IAM \
        --tags Key=name,Value=${STACK_NAME}
}

function waitOnCompletion {
    echo -e "Waiting for stack: ${STACK_NAME}"
	STATUS=IN_PROGRESS
	while expr "$STATUS" : '^.*PROGRESS' > /dev/null ; do
		sleep 10
		STATUS=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --profile ${AWS_PROFILE} | jq -r '.Stacks[0].StackStatus')
		echo $STATUS
	done
}

[[ $# < 9 ]] && echo -e "\nUsage: $0 <ecs|vpc> <create|update|stopTask> ENVIRONMENT DB_NAME DB_USER_NAME DB_PASSWORD DOMAIN_NAME STACK_NAME AWS_PROFILE" && exit 1

echo -e "Used parameters: \nENVIRONMENT = $ENVIRONMENT\nDB_NAME = $DB_NAME\nDB_USER_NAME = $DB_USER_NAME\nDB_PASSWORD = $DB_PASSWORD\nDOMAIN_NAME = $DOMAIN_NAME\nSTACK_NAME = $STACK_NAME\nAWS_PROFILE = $AWS_PROFILE"

[[ $1 = "ecs" && $2 = "create" ]] && createEcsStack && waitOnCompletion && exit 1;
[[ $1 = "ecs" && $2 = "update" ]] && updateEcsStack && waitOnCompletion && exit 1;
[[ $1 = "ecs" && $2 = "stopTask" ]] && stopEcsTask && exit 1;
[[ $1 = "ecs" && $2 = "deployProps" ]] && deployProperties && exit 1;
[[ $1 = "vpc" && $2 = "create" ]] && createVpcStack && waitOnCompletion && exit 1;
[[ $1 = "vpc" && $2 = "update" ]] && updateVpcStack && waitOnCompletion && exit 1;




