## Django + OpenSearch

### Goal
Create a simple Django app with OpenSearch and provide a simple API to search for data.

### Stack
* Django 
  * Django REST Framework
  * Django Opensearch DSL
  * Django Seeds
* OpenSearch
* Postgres
* Docker

### Learning
* Django Opensearch DSL will automatically index the data after updates, by using django features for post_save and post_delete signals;
* OpenSearch needs a separate container to run;
* Create better health checks with docker-compose.

### How to run
```bash
docker-compose build
docker-compose up -d
curl http://localhost:8000/books/search/?q=test
```