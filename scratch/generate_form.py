import dataclasses
import json
import os
import pickle
from collections.abc import Iterator

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Example challenge JSON:
# {"id":"date","title":"Today's date","description":"Enter today's date","path":"date","password":"DATE_MASTER_2024","tags":["form","date"]}

SCOPES = [
    "https://www.googleapis.com/auth/forms",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
]

_FORM_DESCRIPTION = """
WebGames is a set of online tasks that are designed to be easy for humans to do but hard for AI agents to do.

Each task will show you a password once it is successfully completed. Please attempt to complete each task, and the enter the password you get for each task into this answer sheet.

The set of tasks should take 60–90 minutes to complete. If you spend more than five minutes on a single task, please move on. You can complete the tasks in any order.

The tasks are available at https://webgames.convergence.ai/
"""

_CONSENT_TEXT = """
Please read the following information carefully before deciding to participate in this research study:

1. Purpose of the Study: This study aims to understand human performance on various web-based tasks.

2. Study Procedures: You will be asked to complete a series of web-based tasks. Each task is designed to be completed within 5 minutes. We will collect information supplied in this form, to verify your completion of the tasks, and metadata about task completions.

3. Duration: The complete study should take approximately 60-90 minutes.

4. Data Usage and Storage:
   - Your data will be used to analyze human performance on web-based tasks
   - Anonymous, aggregated data may be reported in academic papers, white papers, and other publications

5. You can withdraw your consent and request deletion of your data at any time by emailing support@convergence.ai

6. Risks and Benefits: There are no known risks associated with participating in this study. The benefits include contributing to research on human-computer interaction.

7. Questions: If you have any questions about this study or your rights as a participant, please contact the research team at support@convergence.ai

Do you consent to participate in this study?
"""

_NON_CONSENT_TEXT = """As you do not wish to participate in this study, please return your submission on Prolific by selecting the 'Stop without completing' button 

You can also use this code on Prolific: C187ONKF 

Or click the link below:
https://app.prolific.com/submissions/complete?cc=C187ONKF"""

_PROLIFIC_ID_DESCRIPTION = (
    "Please enter your Prolific ID, so that we can verify your submission."
)

_TASKS_SECTION_DESCRIPTION = """Each linked task The set of tasks should take 60–90 minutes to complete. If you spend more than five minutes on a single task, please move on. You can complete the tasks in any order.

The tasks are all available at https://webgames.convergence.ai/ or linked to from each question."""


def _get_credentials():
    creds = None
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)

    if creds and creds.valid:
        return creds

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not os.path.exists("credentials.json"):
            raise FileNotFoundError(
                "credentials.json not found: cannot authenticate with Google Forms. Read https://developers.google.com/forms/api/guides and https://developers.google.com/workspace/guides/get-started for instructions on how to get credentials to generate this form."
            )
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)

    with open("token.pickle", "wb") as token:
        pickle.dump(creds, token)


@dataclasses.dataclass
class Challenge:
    id: str
    title: str
    description: str
    path: str
    password: str
    tags: list[str]


def _load_challenges() -> Iterator[Challenge]:
    with open("webgames-v0-challenges.jsonl", "r") as f:
        for line in f:
            yield Challenge(**json.loads(line))


def _challenge_to_form_item(challenge: Challenge) -> dict:
    return {
        "title": challenge.title,
        "description": f"https://webgames.convergence.ai/{challenge.path}",
        "questionItem": {
            "question": {
                "required": True,
                "textQuestion": {"paragraph": False},
            },
        },
    }


def _to_update_form_request(challenge: Challenge, index: int) -> dict:
    return {
        "createItem": {
            "item": _challenge_to_form_item(challenge),
            "location": {"index": index},
        },
    }


def _create_sections_req() -> dict:
    return {
        "includeFormInResponse": True,
        "requests": [
            {
                "updateFormInfo": {
                    "info": {
                        "title": "WebGames answer sheet",
                        "documentTitle": "WebGames answer sheet",
                        "description": _FORM_DESCRIPTION,
                    },
                    "updateMask": "*",
                },
            },
            {
                "createItem": {
                    "item": {
                        "title": "Consent form",
                        "pageBreakItem": {},
                    },
                    "location": {"index": 0},
                },
            },
            {
                "createItem": {
                    "item": {
                        "title": "Does not consent",
                        "description": _NON_CONSENT_TEXT,
                        "pageBreakItem": {},
                    },
                    "location": {"index": 1},
                },
            },
            {
                "createItem": {
                    "item": {
                        "title": "Prolific ID",
                        "description": _PROLIFIC_ID_DESCRIPTION,
                        "pageBreakItem": {},
                    },
                    "location": {"index": 2},
                },
            },
            {
                "createItem": {
                    "item": {
                        "title": "Please enter your Prolific ID:",
                        "questionItem": {
                            "question": {
                                "required": True,
                                "textQuestion": {},
                            },
                        },
                    },
                    "location": {"index": 3},
                }
            },
            {
                "createItem": {
                    "item": {
                        "title": "WebGames answer sheet",
                        "description": _TASKS_SECTION_DESCRIPTION,
                        "pageBreakItem": {},
                    },
                    "location": {"index": 4},
                },
            },
        ],
    }


def _get_section_id(form_data: dict, title: str) -> str:
    items = form_data.get("form", {}).get("items", [])
    try:
        return next(item["itemId"] for item in items if item["title"] == title)
    except StopIteration:
        raise ValueError(f"Section with title {title} not found in form data")


def _get_non_consent_section_id(form_data: dict) -> str:
    return _get_section_id(form_data, "Does not consent")


def _get_prolific_id_section_id(form_data: dict) -> str:
    return _get_section_id(form_data, "Prolific ID")


def _create_questions_req(form_data: dict) -> dict:
    non_consent_section_id = _get_non_consent_section_id(form_data)
    prolific_id_section_id = _get_prolific_id_section_id(form_data)

    requests = [
        {
            "createItem": {
                "item": {
                    "title": "Consent form",
                    "description": _CONSENT_TEXT,
                    "questionItem": {
                        "question": {
                            "required": True,
                            "choiceQuestion": {
                                "type": "RADIO",
                                "options": [
                                    {
                                        "value": "Yes, I consent to participate",
                                        "goToSectionId": prolific_id_section_id,
                                    },
                                    {
                                        "value": "No, I do not consent to participate",
                                        "goToSectionId": non_consent_section_id,
                                    },
                                ],
                                "shuffle": False,
                            },
                        }
                    },
                },
                "location": {"index": 1},
            }
        },
    ]

    for index, challenge in enumerate(_load_challenges(), start=6):
        requests.append(_to_update_form_request(challenge, index))

    return {"requests": requests}


def create_form():
    creds = _get_credentials()
    service = build("forms", "v1", credentials=creds)

    # First create the form with sections
    result = (
        service.forms()
        .create(body={"info": {"title": "WebGames answer sheet"}})
        .execute()
    )
    form_id = result["formId"]

    # Create sections and get their IDs
    sections_req = _create_sections_req()
    form_data = service.forms().batchUpdate(formId=form_id, body=sections_req).execute()

    print(form_data)

    # Add questions using section IDs
    questions_req = _create_questions_req(form_data)
    service.forms().batchUpdate(formId=form_id, body=questions_req).execute()

    print(f"Form created successfully! Form ID: {form_id}")
    print(f"You can view it at: https://docs.google.com/forms/d/{form_id}/edit")


if __name__ == "__main__":
    create_form()
