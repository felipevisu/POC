### How to run

```bash
docker build --build-arg DOCKER_GID=$(getent group docker | cut -d: -f3) -t my-jenkins-docker .

docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  my-jenkins-docker
```
