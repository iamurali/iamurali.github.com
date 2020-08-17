---
toc: true
layout: post
description: Template Rendering with Dynamic context
permalink: /2020-08-17-multiple-mysql-versions/
categories: [mysql, database]
image: images/mysql-connector.png
title: Setup Multiple MySql's with homebrew in Mac local machine
---
# Setup Multiple MySql's with homebrew in Mac local machine

Had a specific scenario in my projects where two services are using ```MySql``` but different versions. So had to switch between different ```MySql``` versions on demand.  


* Will try to support for brew version For homebrew version 0.9.5.
```bat
    brew -v # => Homebrew 0.9.5
```

* Install the current/latest version of mysql.  

```bat
    # Install current mysql version
    brew install mysql
    
    # Start agent for current version of mysql (including on login)
    ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
```
* Install the older/Specific version of mysql.  

```bat
      
    # Find older mysql versions
    brew search mysql  
      
    # Install older mysql version
    brew install homebrew/versions/mysql56
    
    # Start agent for older version of mysql (including on login)
    ln -sfv /usr/local/opt/mysql56/*.plist ~/Library/LaunchAgents
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql56.plist
```
    
* Then to switch to the older version.  

```bat
    # Unlink current mysql version
    brew unlink mysql 
    
    # Check older mysql version
    ls /usr/local/Cellar/mysql56 # => 5.6.27
    
    # Link the older version
    brew switch mysql56 5.6.27
```  

* switch back to the current version.    

```bat    
    # Unlink older mysql version
    brew unlink mysql56 
    
    # Check current mysql version
    ls /usr/local/Cellar/mysql # => 5.7.10
    
    # Link the current version
    brew switch mysql 5.7.10
```

* Verify which mysql version you're on at any time.

```bat    
    # Check which version of mysql is currently symlinked
    ls -l /usr/local/bin/mysql # => /usr/local/bin/mysql@ -> ../Cellar/mysql56/5.6.27/bin/mysql
    
    # Or using the mysql command
    mysql --version
```

* unload a mysql agent for a given version.    

```bat
    # Stop agent for current version of mysql
    launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
    rm ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
    
    # Stop agent for older version of mysql
    launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.mysql56.plist
    rm ~/Library/LaunchAgents/homebrew.mxcl.mysql56.plist
```

