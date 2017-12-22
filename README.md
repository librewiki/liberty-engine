# LibertyEngine
[![Build Status](https://travis-ci.org/librewiki/liberty-engine.svg?branch=master)](https://travis-ci.org/librewiki/liberty-engine)

## Table of Contents
- [Requirements](#requirements)
- [Installation (Ubuntu / Debian)](#installation-ubuntu-debian)
- [Start](#start)
- [Stop](#stop)
- [Upgrade](#upgrade)
- [Development](#development)
- [TODO](#todo)

## Requirements
- The **latest** version (8+) of Node.js
- MariaDB version 10+
  - Mroonga storage engine for fulltext search. `sudo apt install mariadb-plugin-mroonga`
- Nginx
- Redis (optional)

## Installation (Ubuntu / Debian)
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
npm run setup
```

## Start
```bash
npm start
```

## Stop
```bash
npm stop
```

## Upgrade
```bash
git pull
npm run upgrade
```

## Development
```bash
npm run dev # runs API development server at http://localhost:3001
```

## TODO
- parser improving (supporting other parser, easy API)
