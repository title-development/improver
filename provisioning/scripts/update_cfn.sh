#!/usr/bin/env bash
# Fail if an undefined variable is used.
set -o nounset
# Print every command before executing it.
set -o xtrace

STACK_NAME="$1"
ENVIRONMENT="$2"
USER="$3"
TEMPLATE_OPTION="${4:---template-body}"
STACK_URL="$5"
STACK_PARAMETERS="$6"

[ -z "$STACK_NAME" ] && ERROR 'No stack name provided'
[ -z "$STACK_URL" ] && ERROR 'No stack url provided'

CLUSTER_NAME=$(aws ecs list-clusters --query "clusterArns[?contains(@,'ecs-$USER-$ENVIRONMENT-cluster')]" --output text)
TASK_ID=$(aws ecs list-tasks --cluster $CLUSTER_NAME --desired-status RUNNING | egrep "task" | tr "/" " " | tr "[" " " |  awk '{print $3}' | sed 's/"$//')

function aws_change_set(){
	echo -e "Creating cloudformation stack change set for: $STACK_NAME"
	echo -e 'Changeset details:'
	aws cloudformation create-change-set \
		--stack-name "$STACK_NAME" \
		--change-set-name "$CHANGE_SET_NAME" \
		--capabilities CAPABILITY_IAM \
		--capabilities CAPABILITY_NAMED_IAM \
		--parameters $STACK_PARAMETERS \
		$TEMPLATE_OPTION $STACK_URL

	# Changesets only have three states: CREATE_IN_PROGRESS, CREATE_COMPLETE & FAILED.
	echo -e "Waiting for cloudformation changeset to be created: $CHANGE_SET_NAME"
	aws cloudformation wait change-set-create-complete --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"
	>/dev/null 2>&1 || :

	echo -e 'Checking changeset status'
	if aws --output text --query \
		"Status == 'CREATE_COMPLETE' && ExecutionStatus == 'AVAILABLE'" \
		cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" | grep -Eq '^True$'; then

		echo -e 'Stack change set details:'
		aws cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"

		echo -e "Starting cloudformation changeset: $CHANGE_SET_NAME"
		aws cloudformation execute-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"

		echo -e 'Waiting for cloudformation stack to finish creation'
		aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" || ERROR 'cloudformation stack
		changeset failed to complete'

	elif aws --output text --query "StatusReason == 'The submitted information didn"\\\'"t contain changes. Submit different information to create a change set.'" \
		cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" | grep -Eq '^True$'; then

		WARN "Changeset did not contain any changes: $CHANGE_SET_NAME"
		WARN "Deleting empty changeset: $CHANGE_SET_NAME"
		aws cloudformation delete-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"
	else
		WARN "Changeset failed to create"
		aws cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"

		WARN "Deleting failed changeset: $CHANGE_SET_NAME"
		aws cloudformation delete-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"
	fi

	return 0
}

# Wrap warning message into a yellow color
function WARN() {
    echo -e "\e[33m$1\e[0m"
}

# Wrap warning message into a red color and exit
function ERROR() {
    echo -e "\e[31m$1\e[0m"
    exit 1
}

aws cloudformation get-template --stack-name $STACK_NAME | jq -c '.["TemplateBody"]' > running-ecs.cfn.json
DIFFS=$(cmp -s <(jq -cS . running-ecs.cfn.json) <(jq -cS . provisioning/aws/ecs.cfn.json); echo $?)

if [[ $DIFFS -eq 0 ]]; then
    echo -e "There are no changes in ECS cloudformation stack. Simply stopping ECS task"
    aws ecs stop-task --cluster $CLUSTER_NAME --task $TASK_ID
else
    echo -e "There are some changes in ECS cloudformation stack."
    CHANGE_SET_NAME="$STACK_NAME-update"
    aws_change_set || ERROR "Failed to update $STACK_NAME stack"
fi
