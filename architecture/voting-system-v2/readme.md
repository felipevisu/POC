## Entities

### Survey

Survey

- id: string
- title: string
- startDate: Date
- finishDate: Date

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
- image: string;
- question: Question.ID
- order: int

### Answers

SurveyAnswer

- id: string;
- survey: Survey.ID
- initialized: Date
- finished: Date

QuestionAnswer

- id: string;
- surveyAnswer: SurveyAnswer.ID
- question: Question.ID
- option: Options.ID
- text: string

## Endpoints

### Management

#### Create Survey

POST /v1/internal/surveys

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
          "image": "https://example.com/homer.jpg",
          "order": 0
        },
        {
          "text": "Ned Flanders",
          "image": "https://example.com/ned.jpg",
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
  "id": "1"
  "title": "Elections Survey",
  "startDate": null,
  "finishDate": null,
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
            "image": "https://example.com/homer.jpg",
            "order": 0
          },
          {
            "id": "2"
            "text": "Ned Flanders",
            "image": "https://example.com/ned.jpg",
            "order": 1
          }
        ]
      }
    ]
}
```

#### Update survey

PUT /v1/internal/surveys/<id>

**Payload**

You can update the survey title, add/update/remove questions and their options all in one request.

- To update existing questions/options, include their `id`
- To create new questions/options, omit the `id` field
- To delete questions/options, omit them from the payload

**Example:** This request updates the survey title, updates question 1 (keeps options 1 and 2, adds a new option "Marge Simpson"), and creates a new question 2 with two new options.

```json
{
  "title": "Elections Survey For President",
  "questions": [
    {
      "id": "1",
      "title": "Who would you vote for president?",
      "min": 1,
      "max": 2,
      "order": 0,
      "options": [
        {
          "id": "1",
          "text": "Homer Simpson",
          "image": "https://example.com/homer.jpg",
          "order": 0
        },
        {
          "id": "2",
          "text": "Ned Flanders",
          "image": "https://example.com/ned.jpg",
          "order": 1
        },
        {
          "text": "Marge Simpson",
          "image": "https://example.com/marge.jpg",
          "order": 2
        }
      ]
    },
    {
      "title": "Who would you vote for minister?",
      "min": 1,
      "max": 1,
      "order": 1,
      "options": [
        {
          "text": "Montgomery Burns",
          "image": "https://example.com/burns.jpg",
          "order": 0
        },
        {
          "text": "Sideshow Bob",
          "image": "https://example.com/bob.jpg",
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
  "id": "1",
  "title": "Elections Survey For President",
  "startDate": null,
  "finishDate": null,
  "questions": [
    {
      "id": "1",
      "title": "Who would you vote for president?",
      "min": 1,
      "max": 2,
      "order": 0,
      "options": [
        {
          "id": "1",
          "text": "Homer Simpson",
          "image": "https://example.com/homer.jpg",
          "order": 0
        },
        {
          "id": "2",
          "text": "Ned Flanders",
          "image": "https://example.com/ned.jpg",
          "order": 1
        },
        {
          "id": "5",
          "text": "Marge Simpson",
          "image": "https://example.com/marge.jpg",
          "order": 2
        }
      ]
    },
    {
      "id": "2",
      "title": "Who would you vote for minister?",
      "min": 1,
      "max": 1,
      "order": 1,
      "options": [
        {
          "id": "3",
          "text": "Montgomery Burns",
          "image": "https://example.com/burns.jpg",
          "order": 0
        },
        {
          "id": "4",
          "text": "Sideshow Bob",
          "image": "https://example.com/bob.jpg",
          "order": 1
        }
      ]
    }
  ]
}
```

#### Publish Survey

PUT /v1/internal/surveys/<id>/publish

Publish a survey making it available for public responses. Sets the startDate to current timestamp.

**Response**

```json
{
  "id": "1",
  "title": "Elections Survey For President",
  "startDate": "2025-12-09T10:00:00Z",
  "finishDate": null
}
```

#### Finish Survey

PUT /v1/internal/surveys/<id>/finish

Close a survey, preventing new responses. Sets the finishDate to current timestamp.

**Response**

```json
{
  "id": "1",
  "title": "Elections Survey For President",
  "startDate": "2025-12-09T10:00:00Z",
  "finishDate": "2025-12-09T18:00:00Z"
}
```

#### Delete Survey

DELETE /v1/internal/surveys/<survey_id>

**Response**

HTTP 204 No Content

#### Get Survey Results

GET /v1/internal/surveys/<survey_id>/results

**Response**

```json
{
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
            "image": "https://example.com/homer.jpg",
            "order": 0,
            "votes": 85
          },
          {
            "id": "2",
            "text": "Ned Flanders",
            "image": "https://example.com/ned.jpg",
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
            "image": "https://example.com/burns.jpg",
            "order": 0,
            "votes": 70
          },
          {
            "id": "4",
            "text": "Sideshow Bob",
            "image": "https://example.com/bob.jpg",
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

#### Get Survey Details

GET /v1/surveys/<survey_id>

Get public survey details including all questions and options.

**Response**

```json
{
  "id": "1",
  "title": "Elections Survey",
  "startDate": "2025-12-09T10:00:00Z",
  "finishDate": null,
  "questions": [
    {
      "id": "1",
      "title": "Who would you vote for president?",
      "min": 1,
      "max": 2,
      "order": 0,
      "options": [
        {
          "id": "1",
          "text": "Homer Simpson",
          "image": "https://example.com/homer.jpg",
          "order": 0
        },
        {
          "id": "2",
          "text": "Ned Flanders",
          "image": "https://example.com/ned.jpg",
          "order": 1
        }
      ]
    }
  ]
}
```

#### Submit Answer

POST /v1/surveys/<survey_id>/answers

Submit an answer to a question. On the first answer submission, a SurveyAnswer is automatically created. Include the `surveyAnswerId` in subsequent requests to add more answers to the same survey session.

**Payload (First Answer)**

```json
{
  "question": "1",
  "option": "1",
  "text": ""
}
```

**Response**

```json
{
  "surveyAnswer": {
    "id": "1",
    "survey": "1",
    "initialized": "2025-11-21T10:30:00Z",
    "finished": null
  },
  "questionAnswer": {
    "id": "1",
    "surveyAnswer": "1",
    "question": "1",
    "option": "1",
    "text": ""
  }
}
```

**Payload (Subsequent Answers)**

```json
{
  "surveyAnswerId": "1",
  "question": "2",
  "option": "3",
  "text": ""
}
```

**Response**

```json
{
  "id": "2",
  "surveyAnswer": "1",
  "question": "2",
  "option": "3",
  "text": ""
}
```

#### Finish Survey

PUT /v1/surveys/<survey_id>/answers/<survey_answer_id>/finish

Mark a survey answer session as completed.

**Response**

```json
{
  "id": "1",
  "survey": "1",
  "initialized": "2025-11-21T10:30:00Z",
  "finished": "2025-11-21T10:35:00Z"
}
```
