#!/usr/bin/env bash
# Fail if an undefined variable is used.
set -o nounset
# Print every command before executing it.
set -o xtrace

AUTO_SCALING_GROUP_NAME=$1
ECS_CLUSTER_NAME=$2
ECS_SERVICE_NAME=$3
COUNT=$4
MAX_PERCENT=$5
MIN_HEALTHY_PERCENT=$6
FORCE_DEPLOYMENT=$7

# AWS ECS wait has its own timeout, but it is not configurable  10 minutes value that is not enough for our cluster.
# We'll start with a 15 minute timeout and see how that goes.
TIMEOUT=$((60 * 15))

usage() {
    echo "./blue_green_deployment.sh <AUTO_SCALING_GROUP_NAME> <ECS_CLUSTER_NAME> <ECS_SERVICE_NAME> <COUNT> <MAX_PERCENT> <MIN_HEALTHY_PERCENT> <FORCE_DEPLOYMENT>"
    echo "AUTO_SCALING_GROUP_NAME - auto scaling group name"
    echo "ECS_CLUSTER_NAME - ECS cluster name"
    echo "ECS_SERVICE_NAME - ECS cluster service name"
    echo "COUNT - number of nodes to scale auto scaling group to, or the desired number (desiredCount below) of instantiations of the task definition to keep running on the service."
    echo "MAX_PERCENT - the upper limit (as a percentage of the service's desiredCount ) of the number of tasks that are allowed in the RUNNING or PENDING state in a service during a deployment. The maximum number of tasks during a deployment is the desiredCount multiplied by maximumPercent /100, rounded down to the nearest integer value."
    echo "MIN_HEALTHY_PERCENT - the lower limit (as a percentage of the service's desiredCount ) of the number of running tasks that must remain in the RUNNING state in a service during a deployment. The minimum number of healthy tasks during a deployment is the desiredCount multiplied by minimumHealthyPercent /100, rounded up to the nearest integer value."
    echo "FORCE_DEPLOYMENT - whether to force a new deployment of the service. You can use this option to trigger a new deployment with no service definition changes. For example, you can update a service's tasks to use a newer Docker image with the same image/tag combination"
    echo "Example: ./blue_green_deployment.sh asg_name ecs_cluster_name ecs_service_name 3 100 0 true# SCALE ecs_cluster_name cluster to 3 instances"
    exit 1
}

running_ec2_instances() {
    echo $(aws ecs describe-clusters --cluster ${ECS_CLUSTER_NAME} | grep registeredContainerInstancesCount | sed -e "s:.*\([0-9]\+\).*:\1:g")
}

scale() {
    aws autoscaling update-auto-scaling-group --auto-scaling-group-name ${AUTO_SCALING_GROUP_NAME} --min-size ${COUNT} --desired-capacity ${COUNT}
    echo "Waiting for ec2 instances to be up or down"
    while [[ "$(running_ec2_instances)" -lt ${COUNT} ]]; do sleep 10; echo -n "." ;done
    echo "Done"
}

# Wait until JMESPath query length(services[?!(length(deployments) == 1 &&runningCount == desiredCount)]) == 0 returns True when polling with describe-services.
# It will poll every 15 seconds until a successful state has been reached. This will exit with a return code of 255 after 40 failed checks.
wait_for_stable_ecs(){
    aws ecs wait services-stable --cluster ${ECS_CLUSTER_NAME} --services ${ECS_SERVICE_NAME}
}

is_finished () {
  pid=$1
  # Check the PID is still running
  ! (kill -0 "$pid" 2> /dev/null);
}

spin_wait_for_stable_check () {
  pid=$1
  time_left=$2

  if [ "$time_left" -lt 0 ]; then
    echo ""
    echo "It has taken too long. Probably something went wrong with the deployment."
    echo "You should check the AWS console and take a look at $ECS_SERVICE_NAME to see how things are."

    kill "$pid"
    exit 255
  fi

  if is_finished "$pid"; then
    echo ""
    #  Wait until the process with ID is complete
    wait "$pid"
    pid_status=$?

    if [ "$pid_status" -eq 255 ]; then
        elapsed_time=$(( TIMEOUT-time_left ))
        echo "The deployment ended with $pid_status exit status in $elapsed_time minutes. Wait a little bit more"
        wait_for_stable_ecs &
        spin_wait_for_stable_check $! $time_left
    fi
    echo "The deployment stabilized in time. $ECS_SERVICE_NAME has been deployed!"

  else
    echo "."
    sleep 20
    spin_wait_for_stable_check "$pid" $((time_left - 10))

  fi;
}

if [[ ! "$COUNT" =~ ^[0-9]+$ ]]; then
    echo "Invalid nodes count $COUNT"
    usage
fi

if [[ "$FORCE_DEPLOYMENT" == "true" ]]; then
    scale &&
    aws ecs update-service --service ${ECS_SERVICE_NAME} --cluster ${ECS_CLUSTER_NAME} --force-new-deployment --deployment-configuration maximumPercent=${MAX_PERCENT},minimumHealthyPercent=${MIN_HEALTHY_PERCENT} --desired-count ${COUNT} > /dev/null &&
    { wait_for_stable_ecs & spin_wait_for_stable_check $! $TIMEOUT; }
else
    aws ecs update-service --service ${ECS_SERVICE_NAME} --cluster ${ECS_CLUSTER_NAME} --deployment-configuration maximumPercent=${MAX_PERCENT},minimumHealthyPercent=${MIN_HEALTHY_PERCENT} --desired-count ${COUNT} > /dev/null &&
    { wait_for_stable_ecs & spin_wait_for_stable_check $! $TIMEOUT; } &&
    scale
fi

exit 0
