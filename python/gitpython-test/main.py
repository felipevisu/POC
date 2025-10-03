import os

import requests
from dotenv import load_dotenv
from git import Repo

load_dotenv()

REPO_PATH = "/home/felipe/Documents/POC"

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_USERNAME = os.environ.get("GITHUB_USERNAME")
GITHUB_REPO = "felipevisu/POC"
REMOTE_URL = f"https://github.com/{GITHUB_REPO}.git"
PR_TITLE = "Add new feature"
PR_BODY = "This PR adds a new feature.\n\n- Feature 1\n- Feature 2"
BASE_BRANCH = "main"
BRANCH_NAME = "feature/new-feature"
COMMIT_MESSAGE = "Add new feature"


def initialize_repo(repo_path):
    try:
        repo = Repo(repo_path)
        print("Repostiry already set")
        return repo
    except:
        repo = Repo.init(repo_path)
        print("Repository was not set")
        return repo


def setup_remote(repo, remote_url, username, token):
    try:
        origin = repo.remote(name="origin")
        print("Remote already exists")
        if username and token:
            auth_url = remote_url.replace(
                "https://github.com/", f"https://{username}:{token}@github.com/"
            )
            origin.set_url(auth_url)
        return origin
    except:
        print("Adding remote")
        if username and token:
            auth_url = remote_url.replace(
                "https://github.com/", f"https://{username}:{token}@github.com/"
            )
        else:
            auth_url = remote_url

        origin = repo.create_remote("origin", auth_url)
        return origin


def create_pull_request(repo_name, head_branch, base_branch, title, body, token):
    url = f"https://api.github.com/repos/{repo_name}/pulls"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    data = {"title": title, "body": body, "head": head_branch, "base": base_branch}
    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 201:
        pr_data = response.json()
        return pr_data
    else:
        raise Exception(
            f"Failed to create PR: {response.status_code} - {response.text}"
        )


def main():
    try:
        print("Setting poth")
        repo_path = os.path.abspath(REPO_PATH)

        print("Setting git")
        repo = initialize_repo(repo_path)

        print("Setting remote")
        origin = setup_remote(repo, REMOTE_URL, GITHUB_USERNAME, GITHUB_TOKEN)

        print("Creating branch")
        repo.git.checkout(BASE_BRANCH)
        new_branch = repo.create_head(BRANCH_NAME)
        new_branch.checkout()

        print("Commiting changes")
        repo.git.add(A=True)
        if repo.is_dirty() or repo.untracked_files:
            repo.index.commit(COMMIT_MESSAGE)

            print("Pushing changes")
            origin.push(new_branch.name)

            pr_data = create_pull_request(
                repo_name=GITHUB_REPO,
                head_branch=BRANCH_NAME,
                base_branch=BASE_BRANCH,
                title=PR_TITLE,
                body=PR_BODY,
                token=GITHUB_TOKEN,
            )

            print(f"Pull Request created successfully!")
            print(f"PR #{pr_data['number']}: {pr_data['title']}")
            print(f"URL: {pr_data['html_url']}")

    except Exception as e:
        print(f"\nError: {e}")
        raise


if __name__ == "__main__":
    main()
