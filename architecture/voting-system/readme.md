## Entities

### Survey

Survey

- id: string
- title: string

Question

- id: string
- title: string
- description: string
- survey: Survey.ID
- order: int
- min: int
- max: int

Option

- id: string
- text: string;
- question: Question.ID
- order: int

### Answers

Response

- id: string;
- survey: Survey.ID
- initialized: Date
- finished: Date

Answer

- id: string;
- response: Response.ID
- question: Question.ID
- option: Options.ID
- text: string

## Endpoints

### Management

#### Create Survey

POST /surveys

**Payload**

```json
{
  "title": "Elections Survey",
  "questions": [
    {
      "title": "Who would you vote for president?",
      "min": 1,
      "max": 2,
      "order": 0,
      "options": [
        {
          "text": "Homer Simpsom",
          "order": 0
        },
        {
          "text": "Ned Flanders",
          "order": 1
        }
      ]
    }
  ]
}
```

**Response**

```json
{
  "status": 201,
  "survey": {
    "id": "1"
    "title": "Elections Survey",
    "questions": [
      {
        "id": "1"
        "title": "Who would you vote for president?",
        "min": 1,
        "max": 2,
        "order": 0,
        "options": [
          {
            "id": "1"
            "text": "Homer Simpsom",
            "order": 0
          },
          {
            "id": "2"
            "text": "Ned Flanders",
            "order": 1
          }
        ]
      }
    ]
  }
}
```

#### Update survey

PUT /surveys/<id>

**Payload**

```json
{
  "title": "Elections Survey For President"
}
```

**Response**

```json
{
    "status": 200,
    "survey": {
        "id": "1"
        "title": "Elections Survey For President",
    }
}
```

#### Create Question

POST /surveys/<id>/questions

**Payload**

```json
{
  "title": "Who would you vote for minister?",
  "min": 1,
  "max": 2,
  "order": 1,
  "options": [
    {
      "text": "Montgomery Burns",
      "order": 0
    },
    {
      "text": "Sideshow Bob",
      "order": 1
    }
  ]
}
```

**Response**

```json
{
  "status": 201,
  "question": {
    "id": "2"
    "title": "Who would you vote for minister?",
    "min": 1,
    "max": 2,
    "order": 1,
    "options": [
      {
        "id": "3"
        "text": "Montgomery Burns",
        "order": 0
      },
      {
        "id": "4"
        "text": "Sideshow Bob",
        "order": 1
      }
    ]
  }
}
```

#### Update Question

PUT /surveys/<survey_id>/questions/<question_id>

**Payload**

```json
{
  "title": "Who would you vote for minister next year?",
  "min": 1,
  "max": 1,
  "order": 1
}
```

**Response**

```json
{
  "status": 200,
  "question": {
    "id": "2",
    "title": "Who would you vote for minister next year?",
    "min": 1,
    "max": 1,
    "order": 1
  }
}
```

#### Create Option

POST /surveys/<survey_id>/questions/<question_id>/options

**Payload**

```json
{
  "text": "Marge Simpson",
  "order": 2
}
```

**Response**

```json
{
  "status": 201,
  "option": {
    "id": "5",
    "text": "Marge Simpson",
    "order": 2
  }
}
```

#### Update Option

PUT /surveys/<survey_id>/questions/<question_id>/options/<option_id>

**Payload**

```json
{
  "text": "Marge Bouvier Simpson",
  "order": 2
}
```

**Response**

```json
{
  "status": 200,
  "option": {
    "id": "5",
    "text": "Marge Bouvier Simpson",
    "order": 2
  }
}
```

#### Delete Option

DELETE /surveys/<survey_id>/questions/<question_id>/options/<option_id>

**Response**

```json
{
  "status": 204
}
```

#### Delete Question

DELETE /surveys/<survey_id>/questions/<question_id>

**Response**

```json
{
  "status": 204
}
```

#### Delete Survey

DELETE /surveys/<survey_id>

**Response**

```json
{
  "status": 204
}
```

#### Get Survey Results

GET /surveys/<survey_id>/results

**Response**

```json
{
  "status": 200,
  "results": {
    "survey": {
      "id": "1",
      "title": "Elections Survey"
    },
    "totalResponses": 150,
    "questions": [
      {
        "id": "1",
        "title": "Who would you vote for president?",
        "order": 0,
        "options": [
          {
            "id": "1",
            "text": "Homer Simpson",
            "order": 0,
            "votes": 85
          },
          {
            "id": "2",
            "text": "Ned Flanders",
            "order": 1,
            "votes": 65
          }
        ]
      },
      {
        "id": "2",
        "title": "Who would you vote for minister?",
        "order": 1,
        "options": [
          {
            "id": "3",
            "text": "Montgomery Burns",
            "order": 0,
            "votes": 70
          },
          {
            "id": "4",
            "text": "Sideshow Bob",
            "order": 1,
            "votes": 80
          }
        ]
      }
    ]
  }
}
```

### Public

#### Create Response

POST /answers/responses

**Payload**

```json
{
  "survey": "1"
}
```

**Response**

```json
{
  "status": 201,
  "response": {
    "id": "1",
    "survey": "1",
    "initialized": "2025-11-21T10:30:00Z",
    "finished": null
  }
}
```

#### Update Response

PUT /answers/responses/<response_id>

**Payload**

```json
{
  "finished": "2025-11-21T10:35:00Z"
}
```

**Response**

```json
{
  "status": 200,
  "response": {
    "id": "1",
    "survey": "1",
    "initialized": "2025-11-21T10:30:00Z",
    "finished": "2025-11-21T10:35:00Z"
  }
}
```

#### Create Answer

POST /answers

**Payload**

```json
{
  "response": "1",
  "question": "1",
  "option": "1",
  "text": ""
}
```

**Response**

```json
{
  "status": 201,
  "answer": {
    "id": "1",
    "response": "1",
    "question": "1",
    "option": "1",
    "text": ""
  }
}
```

#### Update Answer

PUT /answers/<answer_id>

**Payload**

```json
{
  "option": "2",
  "text": "Changed my mind"
}
```

**Response**

```json
{
  "status": 200,
  "answer": {
    "id": "1",
    "response": "1",
    "question": "1",
    "option": "2",
    "text": "Changed my mind"
  }
}
```
