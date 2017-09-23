# docker-cdmon
Docker image for CDMON dynamic DNS IP update

### Create container with docker cli
``` cmd
docker run -d \
  --name cdmon \
  --restart always \
  -e CDMON_DOMAIN=[DOMAIN] \
  -e CDMON_USERNAME=[USERNAME] \
  -e CDMON_PASSWORD=[MD5_PASSWORD] \
  -e CDMON_INTERVAL=1800000 \
  pferraris/docker-cdmon
```

### Using docker-compose
``` cmd
version: '2'
services:
    cdmon:
        container_name: cdmon
        image: pferraris/docker-cdmon
        restart: always
        environment:
          CDMON_DOMAIN: [DOMAIN]
          CDMON_USERNAME: [USERNAME]
          CDMON_PASSWORD: [MD5_PASSWORD]
          CDMON_INTERVAL: 1800000
```

### Environment variables
- `CDMON_DOMAIN` (required): domain registered in CDmon
- `CDMON_USERNAME` (required): username of CDmon account
- `CDMON_PASSWORD` (required): MD5 that represent the user password
- `CDMON_INTERVAL` (optional): check interval in milliseconds (default 30 minutes)
