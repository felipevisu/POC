import time

from django.core.management.base import BaseCommand
from django.tasks import DEFAULT_TASK_QUEUE_NAME
from django.utils.crypto import get_random_string


class Worker:
    def __init__(self, *, queue_names: list[str], batch, worker_id):
        self.queue_names = queue_names
        self.batch = batch
        self.worker_id = worker_id

        self.interval = 1.0
        self.max_tasks = None

        self.running = True
        self._run_tasks = 0

    def run(self) -> None:
        print("Worker:", self.worker_id)
        print("Queues:", ",".join(self.queue_names))

        while self.running:
            print("Worker running")
            time.sleep(self.interval)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--queue_name",
            type=str,
            default=DEFAULT_TASK_QUEUE_NAME,
            help="Queue name",
        )
        parser.add_argument(
            "--batch",
            type=bool,
            default=False,
            help="Process all and exit",
        )

    def handle(self, *, queue_name, batch, **options):
        worker = Worker(
            queue_names=queue_name.split(","),
            batch=batch,
            worker_id=get_random_string(32),
        )

        worker.run()
