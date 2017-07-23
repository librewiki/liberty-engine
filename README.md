# Requirements
- The **latest** version (8+) of Node.js
- MariaDB version 10+

# Installation
```bash
sudo mysql
```
```sql
create database liberty;
create user '______(username)'@'localhost' identified by '_______(password)';
grant all privileges on liberty.* to username@localhost;
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
