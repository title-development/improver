# The image size is 556 MB
FROM adoptopenjdk/openjdk14:jre-14.0.2_12

# Install curl, bash, wget and awscli
RUN set -eux; \
apt-get update && apt-get install -y curl bash wget awscli

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 8080
