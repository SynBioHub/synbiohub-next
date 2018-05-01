<b>This repository is for the development of SynBioHub 2.x, which is not yet in a usable state.  If you're looking for SynBioHub 1.x, please go to [synbiohub/synbiohub](https://github.com/synbiohub/synbiohub) instead.</b>

The 2.0.0 release of SynBioHub will feature extensive refactoring, including:

* A conversion of the codebase from old-fashioned JavaScript to modern TypeScript
* Lots of code deduplication and general cleanup so that new features can arrive more quickly
* A new templating engine (Jade -> EJS)
* A new and improved default look and feel, and a theme system so you can develop your own
* Decoupling from Virtuoso/the ability to use alternative triplestores (e.g. blazegraph, rdf4j, jena)

If you'd like to help out, please join our [developer list](https://groups.google.com/forum/#!forum/synbiohub-users) and say hello!

<hr>




<img src="https://synbiohub.org/logo_uploaded.svg" width="100%" />

![](https://david-dm.org/synbiohub/synbiohub.svg) 
![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)


SynBioHub is a Web-based repository for synthetic biology, enabling users to browse, upload, and share synthetic biology designs.

To learn more about the SynBioHub, including installation instructions and documentation, visit [the SynBioHub wiki](http://wiki.synbiohub.org).
 
To access a sample instance of SynBioHub containing enriched _Bacillus subtilis_ data, features from the _Escherichia coli_ genome, and the complete [iGEM Registry of Standard Biological Parts](http://parts.igem.org/Main_Page), visit [synbiohub.org](http://synbiohub.org). To access a bleeding-edge version of SynBioHub, visit [dev.synbiohub.org](https://dev.synbiohub.org).


## Installation

The recommended way to install SynBioHub is via the Docker image.  See [Installation] (http://wiki.synbiohub.org/wiki/Installation) for more information.


## Manual Installation

SynBioHub has both JavaScript (node.js) and Java components.

Prequisites:

* Linux (only tested with Ubuntu 16.04) or macOS
* A JDK
* [Apache Maven](https://maven.apache.org/)
* [node.js](https://nodejs.org/en/) >= 6.10
* [OpenLink Virtuoso](https://github.com/openlink/virtuoso-opensource) 7.x.x
* [rapper](http://librdf.org/raptor/rapper.html) (apt install `raptor2-utils`)
* [jq](https://stedolan.github.io/jq/) (apt install `jq`)

### Ubuntu 16.04:
 1. Add the Comsode source repository to your package manager
    1. Add the Comsode repository `echo 'deb http://packages.comsode.eu/debian jessie main' >> /etc/apt/sources.list`
    2. Download the Comsode GPG key for package verification `wget http://packages.comsode.eu/key/odn.gpg.key`
    3. Add the Comsode key to your keyring `apt-key add odn.gpg.key`
 2. Set up the Node.js repository 
    1. Download the Node setup script `curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`
    2. Update your package repositories `apt update`
 3. Install the necessary packages `apt install default-jdk maven raptor2-utils nodejs virtuoso-opensource jq build-essential python`
 4. Clone the SynBioHub repository `git clone https://github.com/SynBioHub/synbiohub`
 5. Change to the SynBioHub directory `cd synbiohub`
 6. Build the Java components with Maven `cd java && mvn package`
 7. Return to the root directory and install the Node dependencies with NPM `cd ../ && npm install`
 8. Update the necessary libraries **twice** `npm update && npm update`
 9. Start the SynBioHub process `npm start`
