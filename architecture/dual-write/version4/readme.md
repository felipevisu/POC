# Version 4 — outbox pattern

## Problem

Versions 1 to 3 all write to two systems (database and notification service, or database and RabbitMQ). Whatever the order, a crash between the two writes leaves them out of sync: a user without an email, or an email without a user.

## Solution

Write to one system only. The API saves the user and a row in an `outbox` table in the same database transaction, so both exist or neither does. It never talks to RabbitMQ.

A separate service, the outbox consumer, listens to the database (`LISTEN/NOTIFY`, plus a poll every 2 seconds), publishes the pending rows to RabbitMQ and marks a row as published only after RabbitMQ confirms it.

```
POST /users -> BEGIN -> INSERT user + INSERT outbox row -> COMMIT -> 201
                        outbox consumer -> rabbitmq -> notification service -> email
```

## Why it works

The tests look for two wrong outcomes: a user created without the welcome email, and a welcome email sent for a user that was not created. Neither can happen here:

- The user and the outbox row are one transaction in one database, so there is never a user without a pending email, or a pending email without a user.
- A row leaves the outbox only after RabbitMQ confirms it, so whatever goes down (RabbitMQ, the outbox consumer, the notification service, the database) the email just waits and is sent later.

Trade-off: an email can be sent twice. If something dies right after a message is sent but before it is marked as done, it is sent again.

## Run

One compose file starts everything: the API, its database, the notification service and RabbitMQ. Only one version can run at a time (they share ports), so stop the others first.

```
docker compose up -d --build
./load-test.sh queue-down
./load-test.sh consumer-down
./load-test.sh notification-down
./load-test.sh database-down
```

Each test registers 10 users per second for 30 seconds and kills one container from second 10 to second 20.

## Output

All four tests, each run from clean data:

| Test | What is killed | Waiting during the outage | Registered | With an email | User without email | Email without user | Emailed twice |
|---|---|---|---|---|---|---|---|
| `queue-down` | RabbitMQ | 102 rows in the outbox | 301 | 301 | 0 | 0 | 1 |
| `consumer-down` | outbox consumer | 102 rows in the outbox | 301 | 301 | 0 | 0 | 0 |
| `notification-down` | notification service | 106 messages in RabbitMQ | 301 | 301 | 0 | 0 | 0 |
| `database-down` | version4 database | 102 registrations rejected (503) | 198 | 198 | 0 | 0 | 0 |

Output of `queue-down`:

```
>>> killing rabbitmq
>>> waiting while rabbitmq was down: 102 rows in the outbox
users_created..................: 301

source: version4
users registered:     301
users with a request: 301
users with an email:  301
registered but never requested (call never reached the service): 0
requested but never emailed (service failed): 0
emailed more than once: 1
    load-1790005192184000099@example.com x2
emailed but not registered: 0
```
