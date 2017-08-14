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
- Redis

# Installation
```bash
~$ sudo mysql
```
```sql
create database liberty;
create user '(username)'@'localhost' identified by '(password)';
grant all privileges on liberty.* to (username)@localhost;
flush privileges;
quit
```
```bash
~$ git clone https://gitlab.com/librewiki/liberty-engine.git
~$ cd liberty-engine
~/liberty-engine$ npm i
~/liberty-engine$ bin/install
```

# How To Set Email Account
```node
bin/config mail "{\"host\":\"smtp.gmail.com\",\"port\":587,\"secure\":false,\"user\":\"mailaddress\",\"password\":\"password\"}"
```

# List of Special Permissions
- ACCESS_ADMIN_PANEL

# TODO
- parser improving (supporting other parser, easy API)
