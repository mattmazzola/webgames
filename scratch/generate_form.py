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

The set of 50 tasks should take 60–90 minutes to complete. If you spend more than five minutes on a single task, please move on. You can complete the tasks in any order.

The 50 tasks are available at https://webgames.convergence.ai/
"""


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


def _form_batch_update_req() -> dict:
    return {
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
                        "title": "Your Prolific ID:",
                        "questionItem": {
                            "question": {"textQuestion": {"paragraph": False}},
                        },
                    },
                    "location": {"index": 0},
                },
            },
            *[
                _to_update_form_request(challenge, index)
                for index, challenge in enumerate(_load_challenges(), start=1)
            ],
        ],
    }


def create_form():
    creds = _get_credentials()
    service = build("forms", "v1", credentials=creds)

    result = (
        service.forms()
        .create(
            body={
                "info": {
                    "title": "WebGames answer sheet",
                    "documentTitle": "WebGames answer sheet",
                },
            },
        )
        .execute()
    )
    form_id = result["formId"]
    batch_update_req = _form_batch_update_req()

    service.forms().batchUpdate(formId=form_id, body=batch_update_req).execute()

    print(f"Form created successfully! Form ID: {form_id}")
    print(f"You can view it at: https://docs.google.com/forms/d/{form_id}/edit")


if __name__ == "__main__":
    create_form()
