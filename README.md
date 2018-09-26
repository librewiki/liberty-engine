# LibertyEngine
[![Build Status](https://travis-ci.org/librewiki/liberty-engine.svg?branch=master)](https://travis-ci.org/librewiki/liberty-engine)

## Table of Contents
- [LibertyEngine](#libertyengine)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Installation (Ubuntu / Debian)](#installation-ubuntu--debian)
  - [Start](#start)
  - [Stop](#stop)
  - [Upgrade](#upgrade)
  - [Development](#development)
  - [Migration from Mediawiki (experimental)](#migration-from-mediawiki-experimental)
  - [When Mroonga related error occurs](#when-mroonga-related-error-occurs)

## Requirements
- The **latest** version (10+) of Node.js
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
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install nodejs
# install LibertyEngine
git clone https://github.com/librewiki/liberty-engine.git
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

## Migration from Mediawiki (experimental)
```bash
bin/import-from-mw < your_mw_dump_file.xml
```

## When Mroonga related error occurs
```bash
sudo mysql
mysql> INSTALL SONAME 'ha_mroonga';
```