# Version 2 — queue between the API and the notification service

## Problem

In version 1 every user registered while the notification service was down lost the welcome email.

## Solution

Put RabbitMQ in the middle. The API publishes a message instead of calling the service. The notification service consumes the queue, so while it is down the messages wait and are delivered when it comes back.

```
POST /users -> INSERT user -> publish to rabbitmq -> 201
                                   rabbitmq -> notification service -> email
```

## Why it fails

It is still a dual write, the second write just moved from the notification service to RabbitMQ. The user is committed before the publish, so if RabbitMQ is down the message is never queued and the email is lost.

## Run

One compose file starts everything: the API, its database, the notification service and RabbitMQ. Only one version can run at a time (they share ports), so stop the others first.

```
docker compose up -d --build
./load-test.sh notification-down
./load-test.sh queue-down
```

Each test registers 10 users per second for 30 seconds and kills one container from second 10 to second 20.

## Output

| Test | What is killed | Waiting during the outage | Registered | With an email | User without email | Email without user | Emailed twice |
|---|---|---|---|---|---|---|---|
| `notification-down` | notification service | 104 messages in RabbitMQ | 301 | 301 | 0 | 0 | 0 |
| `queue-down` | RabbitMQ | nothing, the publish just fails | 301 | 178 | 123 | 0 | 2 |

`notification-down` — solved, the queue held the emails:

```
>>> messages held in the queue while the service was down: 104
users_created..................: 301
welcome_emails_queued..........: 301

users registered:     301
users with an email:  301
registered but never requested (call never reached the service): 0
emailed more than once: 0
emailed but not registered: 0
```

`queue-down` — still fails, 123 users without the email:

```
users_created..................: 301
welcome_emails_not_queued......: 123
welcome_emails_queued..........: 178

users registered:     301
users with an email:  178
registered but never requested (call never reached the service): 123
emailed more than once: 2
emailed but not registered: 0
```

The 2 duplicates are messages that were being processed when RabbitMQ died: the email was recorded, the acknowledgement was lost, and RabbitMQ delivered them again.
