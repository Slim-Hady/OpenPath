#!/usr/bin/env python3
"""Generate the Bruno collections. Every endpoint has one request file."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRUNO = ROOT / ".bruno"
SMOKE = ROOT / ".bruno-smoke"

COLLECTION = """{
  "version": "1",
  "name": "OpenSource-helper API",
  "type": "collection",
  "ignore": ["node_modules", ".git"]
}
"""

ENV = """vars {
  baseUrl: http://localhost:4000
  devToken: dev:dev@osh.dev
  adminToken: dev:admin@osh.dev
  maintainerToken: dev:maintainer@osh.dev
  issueId: REPLACE_WITH_ENCODED_ISSUE_ID
  selectionId: REPLACE_WITH_SELECTION_ID
  notificationId: REPLACE_WITH_NOTIFICATION_ID
  listId: REPLACE_WITH_LIST_ID
  itemId: REPLACE_WITH_ITEM_ID
  handle: sam
  login: octocat
}
"""

REQUESTS = [
    # folder, file, method, name, path, body, token
    ("01-health", "health", "GET", "Health", "/health", None, None),
    ("01-health", "ready", "GET", "Readiness", "/health/ready", None, None),
    ("02-account", "me", "GET", "Me", "/me", None, "devToken"),
    ("02-account", "profile", "GET", "Profile", "/profile", None, "devToken"),
    ("02-account", "profile-update", "PUT", "Update profile", "/profile",
     '{"experienceLevel":"BEGINNER","languages":["TypeScript"],"skills":["React"]}', "devToken"),
    ("02-account", "cv-status", "GET", "CV status", "/cv", None, "devToken"),
    ("02-account", "github-status", "GET", "GitHub status", "/github/status", None, "devToken"),
    ("02-account", "notifications", "GET", "Notifications", "/notifications?perPage=10", None, "devToken"),
    ("02-account", "notification-preferences", "GET", "Notification preferences", "/notifications/preferences", None, "devToken"),
    ("03-discovery", "search-issues", "GET", "Search issues", "/discovery/issues?language=TypeScript&label=good%20first%20issue&activityDays=180", None, "devToken"),
    ("03-discovery", "recommendations", "POST", "Recommendations", "/discovery/recommendations",
     '{"language":"TypeScript","label":"good first issue","activityDays":180}', "devToken"),
    ("03-discovery", "recommendations-latest", "GET", "Latest recommendations", "/discovery/recommendations/latest", None, "devToken"),
    ("03-discovery", "issue-details", "GET", "Issue details", "/discovery/issues/{{issueId}}", None, "devToken"),
    ("03-discovery", "select", "POST", "Select issue", "/selection", '{"issueId":"REPLACE_WITH_ISSUE_ID","confirmed":true}', "devToken"),
    ("03-discovery", "ignore", "POST", "Ignore issue", "/discovery/ignore", '{"issueId":"REPLACE_WITH_ISSUE_ID"}', "devToken"),
    ("04-onboarding-guide", "repository-onboarding", "GET", "Repository onboarding", "/onboarding/repository/{{issueId}}", None, "devToken"),
    ("04-onboarding-guide", "issue-onboarding", "GET", "Issue onboarding", "/onboarding/issue/{{issueId}}", None, "devToken"),
    ("04-onboarding-guide", "guide-conversation", "GET", "Guide conversation", "/guide/conversations/{{issueId}}", None, "devToken"),
    ("04-onboarding-guide", "guide-message", "POST", "Guide message", "/guide/conversations/{{issueId}}/messages",
     '{"content":"How should I investigate this issue?"}', "devToken"),
    ("05-progress-saved", "progress", "GET", "Progress", "/progress", None, "devToken"),
    ("05-progress-saved", "progress-history", "GET", "Progress history", "/progress/{{selectionId}}/history", None, "devToken"),
    ("05-progress-saved", "progress-update", "PATCH", "Update progress", "/progress/{{selectionId}}",
     '{"status":"PR_OPEN","prUrl":"https://github.com/owner/repo/pull/1"}', "devToken"),
    ("05-progress-saved", "progress-sync", "POST", "Sync now", "/progress/sync", None, "devToken"),
    ("05-progress-saved", "saved-lists", "GET", "Saved lists", "/saved/lists", None, "devToken"),
    ("05-progress-saved", "saved-list-create", "POST", "Create saved list", "/saved/lists", '{"name":"Later 2"}', "devToken"),
    ("05-progress-saved", "saved-list-detail", "GET", "Saved list detail", "/saved/lists/{{listId}}", None, "devToken"),
    ("06-achievements", "achievements", "GET", "Achievements", "/achievements", None, "devToken"),
    ("06-achievements", "public-profile-settings", "GET", "Public profile settings", "/public-profile/settings", None, "devToken"),
    ("06-achievements", "public-profile", "GET", "Public profile", "/public/profiles/{{handle}}", None, None),
    ("07-community", "contributors", "GET", "Contributor search", "/community/contributors?repo=octocat/Hello-World", None, "devToken"),
    ("07-community", "contributor-detail", "GET", "Contributor detail", "/community/contributors/{{login}}", None, "devToken"),
    ("07-community", "outreach-list", "GET", "Outreach list", "/outreach", None, "devToken"),
    ("07-community", "outreach-create", "POST", "Send outreach", "/outreach",
     '{"recipientId":"REPLACE_WITH_RECIPIENT_ID","type":"MENTORSHIP","message":"Would you mentor me on my first contribution?"}', "devToken"),
    ("08-admin", "metrics", "GET", "Admin metrics", "/admin/metrics", None, "adminToken"),
    ("08-admin", "users", "GET", "Admin users", "/admin/users", None, "adminToken"),
    ("08-admin", "ai-settings", "GET", "AI settings", "/admin/ai-settings", None, "adminToken"),
    ("08-admin", "ai-settings-update", "PUT", "Update AI settings", "/admin/ai-settings",
     '{"maxTokensPerUser":20000,"temperature":0.4,"usageLimitUsd":5}', "adminToken"),
    ("08-admin", "ai-settings-usage", "GET", "AI settings vs usage", "/admin/ai-settings/usage", None, "adminToken"),
    ("08-admin", "ai-usage", "GET", "AI usage", "/admin/ai-usage", None, "adminToken"),
    ("09-public-learning", "learning", "GET", "Learning search", "/learning?q=git", None, None),
    ("09-public-learning", "learning-article", "GET", "Learning article", "/learning/git-basics", None, None),
]

BRUNO.mkdir(exist_ok=True)
BRUNO.joinpath("bruno.json").write_text(COLLECTION, encoding="utf-8")
(BRUNO / "environments").mkdir(exist_ok=True)
(BRUNO / "environments" / "local.bru").write_text(ENV, encoding="utf-8")

for seq, (folder, name, method, title, path, body, token) in enumerate(REQUESTS, start=1):
    directory = BRUNO / folder
    directory.mkdir(exist_ok=True)
    headers = ""
    if token:
        headers = f"\nheaders {{\n  Authorization: Bearer {{{{{token}}}}}\n  Content-Type: application/json\n}}\n"
    body_block = ""
    if body:
        body_block = f"\nbody:json {{\n  {body}\n}}\n"
    content = f"""meta {{
  name: {title}
  type: http
  seq: {seq}
}}

{method.lower()} {{
  url: {{{{baseUrl}}}}{path}
  body: {'json' if body else 'none'}
  auth: none
}}
{headers}{body_block}"""
    (directory / f"{name}.bru").write_text(content, encoding="utf-8")

# A small visible smoke collection: safe GETs only. Useful for the Bruno MCP.
SMOKE.mkdir(exist_ok=True)
SMOKE.joinpath("bruno.json").write_text(
    '{"version":"1","name":"OpenSource-helper smoke","type":"collection","ignore":["node_modules",".git"]}\n',
    encoding="utf-8",
)
(SMOKE / "environments").mkdir(exist_ok=True)
(SMOKE / "environments" / "local.bru").write_text(
    "vars {\n  baseUrl: http://localhost:4000\n  devToken: dev:dev@osh.dev\n  adminToken: dev:admin@osh.dev\n}\n",
    encoding="utf-8",
)
smoke = [
    ("health", "GET", "Health", "/health", None),
    ("ready", "GET", "Readiness", "/health/ready", None),
    ("me", "GET", "Me", "/me", "devToken"),
    ("profile", "GET", "Profile", "/profile", "devToken"),
    ("progress", "GET", "Progress", "/progress", "devToken"),
    ("notifications", "GET", "Notifications", "/notifications", "devToken"),
    ("metrics", "GET", "Admin metrics", "/admin/metrics", "adminToken"),
    ("learning", "GET", "Learning", "/learning?q=git", None),
]
for seq, (name, method, title, path, token) in enumerate(smoke, start=1):
    headers = f"\nheaders {{\n  Authorization: Bearer {{{{{token}}}}}\n}}\n" if token else ""
    (SMOKE / f"{seq:02d}-{name}.bru").write_text(
        f"""meta {{
  name: {title}
  type: http
  seq: {seq}
}}

get {{
  url: {{{{baseUrl}}}}{path}
  body: none
  auth: none
}}
{headers}""",
        encoding="utf-8",
    )

print(f"wrote {len(REQUESTS)} API requests and {len(smoke)} smoke requests")
