<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Requirements](#requirements)
- [Installation](#installation)
- [How To Set Email Account](#how-to-set-email-account)
- [List of Special Permissions](#list-of-special-permissions)
- [TODO](#todo)

<!-- /TOC -->

# Requirements
- The **latest** version (8+) of Node.js
- MariaDB version 10+
  - Mroonga storage engine for fulltext search. `sudo apt install mariadb-plugin-mroonga`
- Nginx
- Redis (optional)

# Installation (Ubuntu / Debian)
```bash
# install dependencies
sudo apt update
sudo apt install mariadb-server
sudo apt install mariadb-plugin-mroonga
sudo apt install nginx
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install nodejs
# install LibertyEngine
git clone https://gitlab.com/librewiki/liberty-engine.git
cd liberty-engine
npm i
# if you are logged in as root, use "npm i --unsasfe-perm" instead.
```

# Start
```bash
npm start
```

# Stop
```bash
npm stop
```

# How To Set Email Account
```node
bin/config mail "{\"host\":\"smtp.gmail.com\",\"port\":587,\"secure\":false,\"user\":\"mailaddress\",\"password\":\"password\"}"
```

# TODO
- parser improving (supporting other parser, easy API)
