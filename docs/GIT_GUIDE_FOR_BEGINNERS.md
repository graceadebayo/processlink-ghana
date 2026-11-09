# GitHub for Beginners — Step-by-Step Guide

Imagine GitHub is the team's shared school notebook.
- **Git** records the changes made to the code on your computer.
- **GitHub** keeps the shared copy online.
- **Clone** means download the shared project to your computer.
- **Pull** means bring the latest team changes down to your computer.
- **Branch** means make your own safe copy to work on.
- **Commit** means save a named checkpoint.
- **Push** means upload your commits to GitHub.
- **Pull Request (PR)** means ask the team to check your work and add it to the shared main project.
- **Merge** means combine approved work into `main`.

You do not send code to teammates by WhatsApp. You push it to GitHub and they pull it.

## Part A — Angela creates the shared GitHub home (one time)

1. Go to https://github.com and sign in (create an account if needed).
2. Click the **+** near the top-right, then **New repository**.
3. Repository name: `processlink-ghana`.
4. Choose **Private** (recommended while developing).
5. Do not tick “Add a README” because this project already has one.
6. Click **Create repository**.
7. Copy the HTTPS repository address. It looks like `https://github.com/YOUR-USERNAME/processlink-ghana.git`. Use your real address; do not copy this example literally.
8. On the repository page, open **Settings → Collaborators** (sometimes called Collaborators and teams).
9. Click **Add people** and invite each of the three contributors by their GitHub username or email. They must accept the invitation.

## Part B — Put the project on GitHub (Angela does this once)

First install Git and Node.js on your computer:
- Git: https://git-scm.com/downloads
- Node.js: https://nodejs.org/ (use the LTS version; the project requires Node 20.9 or newer).

Unzip the supplied `ProcessLinkGhana` project folder somewhere easy to find, for example Documents. Open that folder in Visual Studio Code.

In VS Code:
1. Click **File → Open Folder** and select `ProcessLinkGhana`.
2. Click **Terminal → New Terminal**.
3. Make sure the terminal is inside the project folder. You should see `package.json` if you type `dir` on Windows or `ls` on Mac.
4. Run these commands one at a time:

```bash
git init -b main
git add .
git commit -m "chore: add ProcessLink Ghana Phase 6 foundation"
git remote add origin https://github.com/YOUR-USERNAME/processlink-ghana.git
git push -u origin main
```

Replace the example repository address with the real HTTPS address copied from GitHub. If Git asks who you are, set your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Then repeat the commit command. GitHub may open a browser sign-in window. Follow it. Never put your password, token or `.env` contents into a source file or chat.

**Important:** Before `git add .`, check that `.env` is not in the folder being committed. The project's `.gitignore` excludes `.env` and `.env.*` except `.env.example`. Never force-add a secret.

## Part C — Each contributor downloads the project (each person does this once)

1. Accept Angela's GitHub invitation.
2. Install Git, Node.js and Visual Studio Code.
3. Open VS Code.
4. Click **Terminal → New Terminal**.
5. Move to the folder where you want the project saved, for example:

```bash
cd Documents
```

6. Download the shared project:

```bash
git clone https://github.com/YOUR-USERNAME/processlink-ghana.git
```

7. Enter the new folder:

```bash
cd processlink-ghana
```

8. Open it in VS Code:

```bash
code .
```

If `code .` does not work, use VS Code → File → Open Folder and select `processlink-ghana`.

## Part D — Start the app on each person's computer

The project uses Node.js, npm and PostgreSQL. Each person needs their own local `.env` file and database connection. Do not share Angela's `.env` file or database password in GitHub.

1. Ask Angela which development database connection the team is using. For a beginner team, use one shared development database only if access is controlled and everyone agrees; otherwise each person can use their own local database.
2. Copy `.env.example` to `.env`.
   - Windows PowerShell: `Copy-Item .env.example .env`
   - Mac/Linux: `cp .env.example .env`
3. Put the correct `DATABASE_URL` and a unique long `SESSION_SECRET` into `.env`.
4. In the terminal, run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

5. Open `http://localhost:3000` in your browser.

`npm run db:seed` deletes and recreates the sample records in the database. Only run it against a disposable development database, never production or a database containing real user data.

Demo accounts are listed in the root README. They are public sample accounts and must never be used as real customer accounts.

## Part E — How a contributor starts work (every task)

Example: Contributor 2 is asked to improve the equipment marketplace.

1. Open VS Code and the `processlink-ghana` folder.
2. Get the latest shared code:

```bash
git switch main
git pull origin main
```

3. Create a separate branch for the task:

```bash
git switch -c feature/equipment-marketplace-improvements
```

4. Make only the changes for that task.
5. Check which files changed:

```bash
git status
```

6. Test the app. Run:

```bash
npm run lint
npm test
npm run build
```

7. Save the changes in Git:

```bash
git add .
git commit -m "feat: improve equipment marketplace filters"
```

8. Upload the branch to GitHub:

```bash
git push -u origin feature/equipment-marketplace-improvements
```

9. Open the GitHub repository in the browser. GitHub usually shows a **Compare & pull request** button. Click it.
10. Explain what changed, how to test it and attach screenshots if useful.
11. Click **Create pull request**. Ask Angela or the assigned reviewer to review it.
12. Do not merge your own PR unless Angela has explicitly assigned you that responsibility.
13. After Angela merges it, go back to VS Code and update your main branch:

```bash
git switch main
git pull origin main
```

14. Delete your old local branch after it is merged:

```bash
git branch -d feature/equipment-marketplace-improvements
```

## Part F — The three commands to remember

Before starting work:
```bash
git switch main
git pull origin main
```

After making changes:
```bash
git add .
git commit -m "describe what you changed"
git push -u origin YOUR-BRANCH-NAME
```

After your work is merged:
```bash
git switch main
git pull origin main
```

## Part G — What if Git says there is a conflict?

A conflict means two people changed the same part of the same file and Git needs a human to choose the correct combined result.

1. Do not panic and do not delete files.
2. Tell Angela and share the exact error message.
3. In VS Code, open the file marked as conflicted.
4. VS Code shows choices such as **Accept Current**, **Accept Incoming**, or **Accept Both**. Do not choose blindly; understand which change should remain.
5. Ask the author of the other change if you are unsure.
6. Save the corrected file.
7. Run `git add path/to/the-file`.
8. Complete the merge/rebase step Git asked for, then run tests.
9. Push the branch again if required.

If you have uncommitted work, do not run `git reset --hard`, `git clean -fd`, or force-push. Those commands can destroy work.

## Part H — Common problems

### “git is not recognized”
Git is not installed or the terminal needs restarting. Install Git, close VS Code and open it again.

### “node is not recognized”
Install Node.js LTS, restart VS Code and check `node -v`.

### “Author identity unknown”
Run the two `git config --global` commands in Part B.

### “remote origin already exists”
Run `git remote -v` to see the current address. If it is wrong, ask Angela before changing it.

### “rejected — fetch first”
Someone has pushed changes you do not have. Run `git pull origin main` while on `main`, or update your feature branch carefully with the team's agreed method. Do not force-push.

### “I cannot see my teammate's work”
They may not have pushed it, or their work may still be in a branch/PR. Ask them for the branch or PR link. Pulling `main` only downloads work that has been merged into `main`.

### “I changed something but Git says nothing to commit”
Check that you saved the file and that you are in the correct project folder. Run `git status`.

## The golden rule
**Pull before you start. Branch before you edit. Commit before you finish. Push so your team can see it. Open a Pull Request so the team can review it.**
