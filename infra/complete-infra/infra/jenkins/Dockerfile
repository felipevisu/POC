FROM jenkins/jenkins:2.516.1-jdk21

# Switch to root to install packages
USER root

# Create symlink for python command
RUN ln -s /usr/bin/python3 /usr/bin/python

RUN apt-get update && apt-get install -y lsb-release ca-certificates curl && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/debian $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && apt-get install -y docker-ce-cli && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Build argument to receive host Docker group ID (default to 999)
ARG DOCKER_GID=999

# Create docker group with the host Docker group ID, add jenkins user to it
RUN groupadd -for -g ${DOCKER_GID} docker && \
    usermod -aG docker jenkins

USER jenkins

RUN jenkins-plugin-cli --plugins "blueocean docker-workflow json-path-api"