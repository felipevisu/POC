# Version 1 — naive dual write

## Problem

Registering a user needs two writes in two systems: save the user in Postgres and ask the notification service to send a welcome email. Both must happen, or neither.

## Solution

The simplest thing: insert the user, then call the notification service over HTTP.

```
POST /users -> INSERT user -> HTTP POST notification/welcome-email -> 201
```

## Why it fails

The user is already committed when the HTTP call is made. If the notification service is down, the call fails and nothing retries it. The user exists and never gets the email.

## Run

One compose file starts everything: the API, its database, the notification service and RabbitMQ. Only one version can run at a time (they share ports), so stop the others first.

```
docker compose up -d --build
./load-test.sh
```

The test registers 10 users per second for 30 seconds and kills the notification service from second 10 to second 20.

## Output

| Test | What is killed | Waiting during the outage | Registered | With an email | User without email | Email without user | Emailed twice |
|---|---|---|---|---|---|---|---|
| `./load-test.sh` | notification service | nothing, the calls just fail | 300 | 189 | 111 | 0 | 0 |

```
users_created..................: 300
welcome_emails_lost............: 111
welcome_emails_sent............: 189

source: version1
users registered:     300
users with a request: 190
users with an email:  189
registered but never requested (call never reached the service): 110
requested but never emailed (service failed): 1
emailed more than once: 0
emailed but not registered: 0
```

111 of 300 users never got the welcome email: 110 registered while the service was down, and 1 whose request was in progress when it was killed.
