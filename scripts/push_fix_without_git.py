#!/usr/bin/env python3
"""
Push the Next.js App Router build fix to GitHub *without* requiring system `git`.

This uses dulwich (pure-python git) installed under:
  /home/immigrant/work_platform/.pytools/site

It will:
  - stage: procompare-frontend/src/app/page.tsx
  - commit to local main
  - push to origin/main over HTTPS using a GitHub token entered interactively

Security:
  - token is read via getpass (not echoed)
  - token is not written to disk
"""

from __future__ import annotations

import os
import sys
from getpass import getpass
import re
from pathlib import Path


REPO = Path("/home/immigrant/work_platform")
FILE_TO_COMMIT = REPO / "procompare-frontend/src/app/page.tsx"
PACKAGE_JSON = REPO / "procompare-frontend/package.json"
PACKAGE_LOCK = REPO / "procompare-frontend/package-lock.json"
VERCEL_JSON = REPO / "vercel.json"
LEAD_FORM = REPO / "procompare-frontend/src/components/leads/LeadGenerationFormFixed.tsx"
BACKEND_URLS = REPO / "backend/procompare/urls.py"
LEADS_VIEWS = REPO / "backend/leads/views.py"
REMOTE_URL = "https://github.com/paasforest/proconnectsa-platform.git"
NEXT_SAFE_VERSION = "15.5.11"
COMMIT_MESSAGE = f"fix: lead submit + categories + next {NEXT_SAFE_VERSION}"
TARGET_BRANCH = os.getenv("TARGET_BRANCH", "main").strip() or "main"


def _add_local_site_packages() -> None:
    # Ensure we can import dulwich even if it's installed into a local target dir.
    extra_paths = [
        str(REPO / ".pytools/site"),
        str(REPO / ".pytools/local/lib/python3.12/dist-packages"),
    ]
    for p in extra_paths:
        if p not in sys.path:
            sys.path.insert(0, p)


def main() -> int:
    _add_local_site_packages()

    try:
        from dulwich import porcelain
    except Exception as e:
        print("ERROR: Could not import dulwich. Please run the setup steps first.", file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
        return 2

    if not (REPO / ".git").exists():
        print(f"ERROR: {REPO} is not a git repo (missing .git).", file=sys.stderr)
        return 2

    for required in (FILE_TO_COMMIT, PACKAGE_JSON, PACKAGE_LOCK, VERCEL_JSON, LEAD_FORM, BACKEND_URLS, LEADS_VIEWS):
        if not required.exists():
            print(f"ERROR: Expected file not found: {required}", file=sys.stderr)
            return 2

    # Helper: safe text replace with validation
    def replace_or_fail(path: Path, old: str, new: str) -> None:
        s = path.read_text(encoding="utf-8")
        if old not in s:
            raise RuntimeError(f"Expected pattern not found in {path}: {old!r}")
        path.write_text(s.replace(old, new), encoding="utf-8")

    def replace_if_present(path: Path, old: str, new: str) -> None:
        s = path.read_text(encoding="utf-8")
        if old not in s:
            return
        path.write_text(s.replace(old, new), encoding="utf-8")
        return 2

    # Read token:
    # - Prefer env var to avoid interactive prompts in constrained terminals.
    # - Fall back to getpass; if that fails, fall back to plain input.
    token = (os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN") or "").strip()
    if not token:
        try:
            token = getpass("GitHub PAT (repo write): ").strip()
        except Exception:
            token = input("GitHub PAT (repo write) [WILL ECHO]: ").strip()
    if not token:
        print("ERROR: No token provided.", file=sys.stderr)
        return 2

    # Retry loop: remote main may move while we're preparing a commit.
    # We never force-push. If TARGET_BRANCH != main, we push our local main to a new remote branch.
    for attempt in range(1, 4):
        print(f"\n=== Attempt {attempt}/3 ===")

        # Fetch latest origin/main so we can fast-forward and avoid non-fast-forward errors
        print("Fetching origin/main...")
        try:
            porcelain.fetch(
                str(REPO),
                remote_location=REMOTE_URL,
                username="x-access-token",
                password=token,
            )
        except Exception as e:
            print(f"ERROR: Fetch failed: {e}", file=sys.stderr)
            return 1

        # Reset local main to origin/main to ensure we build on top of latest remote
        try:
            from dulwich.repo import Repo

            r = Repo(str(REPO))
            try:
                remote_main = r.refs[b"refs/remotes/origin/main"]
            except KeyError:
                remote_main = None
            if not remote_main:
                print("ERROR: Could not find refs/remotes/origin/main after fetch.", file=sys.stderr)
                return 1
            remote_main_hex = remote_main.decode()
            print(f"Resetting local main to origin/main ({remote_main_hex[:12]}...)")
            porcelain.reset(str(REPO), mode="hard", treeish=remote_main_hex)
        except Exception as e:
            print(f"ERROR: Reset to origin/main failed: {e}", file=sys.stderr)
            return 1

        # Apply the minimal compatibility patch onto the latest page.tsx (preserve other upstream edits)
        try:
            s = FILE_TO_COMMIT.read_text(encoding="utf-8")

            s2 = s.replace("import Head from 'next/head';\n", "")
            s2 = s2.replace('import Head from "next/head";\n', "")

            # Replace <Head>...</Head> wrapping of the ld+json script with direct script tag
            head_block_re = re.compile(
                r"\n(\s*)<Head>\s*(<script[\s\S]*?>[\s\S]*?</script>|<script[\s\S]*?/>?)\s*</Head>\s*",
                re.M,
            )
            m = head_block_re.search(s2)
            if m:
                indent = m.group(1)
                script_block = m.group(2)
                replacement = (
                    f"\n{indent}{{/* Structured data for SEO - App Router compatible */}}\n"
                    f"{indent}{script_block}\n"
                )
                s2 = head_block_re.sub(replacement, s2, count=1)

            if s2 != s:
                FILE_TO_COMMIT.write_text(s2, encoding="utf-8")
        except Exception as e:
            print(f"ERROR: Failed to patch page.tsx: {e}", file=sys.stderr)
            return 1

        # Apply security update: bump Next.js to patched backport version, and ensure Vercel installs it
        try:
            print(f"Updating Next.js to {NEXT_SAFE_VERSION}...")
            # The repo may already be at 15.5.11; tolerate that by trying multiple old values.
            replace_if_present(PACKAGE_JSON, '"next": "15.5.2"', f'"next": "{NEXT_SAFE_VERSION}"')
            replace_if_present(PACKAGE_JSON, '"next": "15.5.9"', f'"next": "{NEXT_SAFE_VERSION}"')
            replace_if_present(PACKAGE_JSON, '"eslint-config-next": "15.5.2"', f'"eslint-config-next": "{NEXT_SAFE_VERSION}"')
            replace_if_present(PACKAGE_JSON, '"eslint-config-next": "15.5.9"', f'"eslint-config-next": "{NEXT_SAFE_VERSION}"')
        except Exception as e:
            print(f"ERROR: Failed to update procompare-frontend/package.json: {e}", file=sys.stderr)
            return 1

        # Align lockfile pins so Vercel doesn't install an older Next.js
        try:
            print(f"Aligning package-lock.json to Next.js {NEXT_SAFE_VERSION}...")
            replace_if_present(PACKAGE_LOCK, '"next": "15.5.9"', f'"next": "{NEXT_SAFE_VERSION}"')
            replace_if_present(PACKAGE_LOCK, '"eslint-config-next": "15.5.9"', f'"eslint-config-next": "{NEXT_SAFE_VERSION}"')
            # Older commits used 15.5.2; handle that too.
            replace_if_present(PACKAGE_LOCK, '"next": "15.5.2"', f'"next": "{NEXT_SAFE_VERSION}"')
            replace_if_present(PACKAGE_LOCK, '"eslint-config-next": "15.5.2"', f'"eslint-config-next": "{NEXT_SAFE_VERSION}"')
        except Exception as e:
            print(f"ERROR: Failed to update procompare-frontend/package-lock.json: {e}", file=sys.stderr)
            return 1

        try:
            print("Updating Vercel install command (avoid npm ci lockfile pinning)...")
            replace_if_present(VERCEL_JSON, '"installCommand": "npm ci"', '"installCommand": "npm install --no-audit --no-fund"')
        except Exception as e:
            print(f"ERROR: Failed to update vercel.json: {e}", file=sys.stderr)
            return 1

        # Stage files
        paths_to_add = [
            str(FILE_TO_COMMIT.relative_to(REPO)),
            str(PACKAGE_JSON.relative_to(REPO)),
            str(PACKAGE_LOCK.relative_to(REPO)),
            str(VERCEL_JSON.relative_to(REPO)),
            str(LEAD_FORM.relative_to(REPO)),
            str(BACKEND_URLS.relative_to(REPO)),
            str(LEADS_VIEWS.relative_to(REPO)),
        ]
        print("Staging:")
        for pth in paths_to_add:
            print(f"  - {pth}")
        porcelain.add(str(REPO), paths=paths_to_add)

        # Commit (may fail if nothing changed)
        try:
            print("Creating commit on local main...")
            porcelain.commit(
                str(REPO),
                message=COMMIT_MESSAGE,
            )
        except Exception as e:
            msg = str(e)
            if "No changes" in msg or "nothing to commit" in msg.lower():
                print("No changes to commit (already committed). Continuing to push...")
            else:
                print(f"ERROR: Commit failed: {e}", file=sys.stderr)
                return 1

        # Push
        remote_refspec = (
            ["refs/heads/main:refs/heads/main"]
            if TARGET_BRANCH == "main"
            else [f"refs/heads/main:refs/heads/{TARGET_BRANCH}"]
        )
        print(f"Pushing to origin/{'main' if TARGET_BRANCH == 'main' else TARGET_BRANCH}...")
        try:
            porcelain.push(
                str(REPO),
                remote_location=REMOTE_URL,
                refspecs=remote_refspec,
                username="x-access-token",
                password=token,
            )
            if TARGET_BRANCH == "main":
                print("SUCCESS: Pushed to origin/main. Vercel should trigger a deployment.")
            else:
                print(f"SUCCESS: Pushed to origin/{TARGET_BRANCH}. Now open a PR and merge to main to trigger Vercel.")
            return 0
        except Exception as e:
            print(f"Push attempt {attempt} failed: {e}", file=sys.stderr)
            if attempt == 3:
                if TARGET_BRANCH == "main":
                    print(
                        "ERROR: Push failed after retries. Remote main is changing rapidly.\n"
                        "Fix: push to a separate branch instead, then merge via GitHub UI.\n"
                        "Example:\n"
                        "  TARGET_BRANCH=fix/vercel-lockfile python3 scripts/push_fix_without_git.py",
                        file=sys.stderr,
                    )
                else:
                    print("ERROR: Push failed after retries.", file=sys.stderr)
                return 1
            print("Retrying (remote main likely moved)...")

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
