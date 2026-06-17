# Update packages
sudo apt update && sudo apt upgrade -y

# setup nextJs
npx create-next-app@latest app-basics

# formatter
prettier --write --print-width 80 file
# linter
npm run lint -- --fix app/\(auth\)/login/page.tsx

# save project structure
tree ../app-basics/ -I 'node_modules/' > docs/structure.txt

# chadcn setup
npx shadcn@latest init
npx shadcn@latest add avatar

# run sigle ts file
npx ts-node test.ts

# setup redis
sudo apt install redis-server
npm install ioredis

redis-server # run redis server
redis-cli ping  # should return PONG


# search files that used x func
rg "getCartItems" -g '!node_modules' -g '!.next'

# storage files
mkdir -p storage/auth storage/cart && \
touch storage/auth/sessions.json storage/auth/users.json && \
touch storage/cart/carts.json

# dump a dir

{
  find app -type f | while read file; do
    echo "FILE: $file"
    echo "----------------------------------------"
    cat "$file"
    echo
    echo "========================================"
    echo
  done
} > ../dump.txt

# reset storage
find storage -type f \
! -name "emailIndex.json" \
! -name "userCartIndex.json" \
-delete && \
echo "{}" > storage/auth/emailIndex.json && \
echo "{}" > storage/cart/userCartIndex.json

# make files untracked by git
git rm --cached dump.rdb ../dump.txt

npm run build && npm run start

# cron job
which cron
sudo apt install cron # if not installed
sudo service cron start
sudo service cron status
EDITOR=vim crontab -e  # edit/create jobs with vi
crontab -l  # list all jobs
crontab -r  # delete all jobs (careful)
# add that line to job file
# weekly (Sunday 3 AM)
0 3 * * 0 cd /path-to-your-project && /npm-path run cleanup-sessions
# replace placeholders with real paths
pwd && which npm


# ready to release, tag the last commit
git add . && \
git commit -m "chore: prepare release v0.3.51" && \
git tag -a v0.3.51 -m "Release v0.3.51" && \
git push origin master && \
git push origin v0.3.51





# 1. Extract app-basics history into a temporary branch
cd ~/codes/alx-react
git subtree split -P nextLearn/app-basics -b app-basics-branch

# 2. Clone the new empty GitHub repository
cd ~/codes
git clone https://github.com/khalidhub7/next-store-shift.git

# 3. Import app-basics history into the new repo
cd next-store-shift
git remote -v
git fetch ../alx-react app-basics-branch
git checkout -B main FETCH_HEAD

# 4. Verify history in the new repo BEFORE deleting the old one
git log --oneline
git status

# 5. Push the new repo to GitHub
git push -u origin main

# 6. Remove old copy from alx-react (Safe now)
cd ~/codes/alx-react
git rm -r nextLearn/app-basics
git commit -m "chore: move app-basics to dedicated repository"
git push origin master

# 7. Clean up the temporary branch
git branch -D app-basics-branch