# Version 3 — publish inside the database transaction

## Problem

In version 2, users registered while RabbitMQ was down were saved without their welcome email ever being queued.

## Solution

Make the insert and the publish look atomic: open a transaction, insert the user, publish to RabbitMQ, and only then commit. If the publish fails, roll back and answer 503, so no user exists without a queued email.

```
POST /users -> BEGIN -> INSERT user -> publish to rabbitmq -> COMMIT -> 201
                                       publish failed     -> ROLLBACK -> 503
```

## Why it fails

A database transaction cannot include RabbitMQ. There is a gap of a few milliseconds between the publish being confirmed and the `COMMIT`. If the database dies inside it, the message is already queued and the user is rolled back: a welcome email goes to a user that does not exist.

It also makes registration depend on RabbitMQ: while the queue is down nobody can register.

## Run

One compose file starts everything: the API, its database, the notification service and RabbitMQ. Only one version can run at a time (they share ports), so stop the others first.

```
docker compose up -d --build
RATE=100 PHASE=3 ./load-test.sh
```

The test kills this version's database in the middle of the run, RabbitMQ stays up. Nothing is slowed down to force the failure, so most runs find nothing: at 100 users per second it showed up in 3 of 14 runs, and the single run at 10 users per second found nothing. Run it a few times.

## Output

| Test | What is killed | Waiting during the outage | Registered | With an email | User without email | Email without user | Emailed twice |
|---|---|---|---|---|---|---|---|
| `./load-test.sh` (10 users/s) | version3 database | 102 registrations rejected (503) | 199 | 199 | 0 | 0 | 0 |
| `RATE=100 PHASE=3 ./load-test.sh` | version3 database | 329 registrations rejected (503) | 570 | 570 | 0 | 1 | 0 |

A run that hit the gap:

```
registrations_failed_500.......: 1
registrations_rejected_503.....: 329
users_created..................: 570

source: version3
users registered:     570
users with an email:  571
registered but never requested (call never reached the service): 0
requested but never emailed (service failed): 0
emailed more than once: 0
emailed but not registered: 1
    load-1790004630596000302@example.com
```

The 329 rejected registrations arrived while the database was down and are harmless, nothing was saved or sent. The one 500 is the registration caught in the gap: its email was sent, its user was never saved.
