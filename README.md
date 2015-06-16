OS Malaria
==========

Background
----------

The opensourcemalaria.org website actually consists of two separate code bases.

### Website Code Base ###

There is a website code base at the Github account/repository https://github.com/OpenSourceMalaria/OSM_Website_Code.
This repository holds the HTML, CSS, images, and javascript of the website.

In order to cut down on excessive web requests to Twitter and GitHub, the following "rules" are implemented in the
browser code:

--- The sponsors and members data is requested only on initial load (or forced reload)
--- The project activity is only requested about every 10 minutes.
--- The twitter feed is only requested about every 10 minutes.

In addition to this browser code, the osm-feeds heroku app (described below) also provides caching of the data.
The approaches are used because they solve two different issues:

The browser code keeps a single browser from making excessive calls to osm_feeds. Three on page load, and then
two every 10 minutes thereafter while the browser has the page loaded.

The osm-feeds code limits the number of requests passed onto GitHub and Twitter when there are many browsers loading
or showing the page.

### osm-feeds Code Base ###

There is a separate code base stored on heroku.com. This repository creates a simple server application
(called osm-feeds) that runs on the heroku platform. The server application is an intermediary between the code running
on the (potentially) many browsers that can be running the website code at the same time.

osm-feeds gets requests from a browser to return one of three things, or to reset its cache.

#### The things that can be returned from osm-feeds are: ####

##### The latest twitter feed for Open Source Malaria. #####
The osm-feeds application authenticates itself to Twitter (requirement of twitter). Since the authentication
requires secret information, this application ensures that the secret information remains secret!

##### The latest Project activity (from the OpenSourceMalaria github account) #####
The osm-feeds application authenticates itself to github to avoid rate limiting on requests per hour. Since the
authentication requires secret information, this application ensures that the secret information remains secret! The
application also caches the information so that requests to github do not occur excessively if there are many users
viewing the site at the same time.

##### The current list of sponsors and members from the OpenSourceMalaria github account) #####
The osm-feeds application authenticates itself to github to avoid rate limiting on requests per hour. Since the
authentication requires secret information, this application ensures that the secret information remains secret!

##### Reset command #####

The reset command is invoked to discard the contents of the cache and force the application to get and return
the current project activity and sponsor/member data from github the next time a request for that data is made.

This is not useful in normal circumstances, but can be used to ensure that additions and updates to the project
activity or sponsor/member feeds are immediately available to visitors to the site. Otherwise, there will be a delay of
about 10 minutes for updated information to become available.

Content Management Solution
---------------------------

The lists of team members, sponsors, and the Github repositories used for populating the Project Activity list
 are maintained on GitHub, in a public repository.

The repository is : https://github.com/OpenSourceMalaria/OSM_Website_Data/issues

There are three items in the issues list. They are "team", "sponsors", and "issue_lists".

Team
----

  The body of the "team" issue contains a JSON array, as follows:

      [
        { "name": "Tim Connor", "affiliation": "El Hefe", "url": "www.cloudcity.io" },
        { "name": "Mat Todd", "affiliation": "University of Sydney",
        "affiliation_url": "sydney.edu.au",
        "url": "openwetware.org/wiki/User:Matthew_Todd",
        "gravatar_email": "matthew.todd@sydney.edu.au",
        "disciplines": "chemistry;consulting;administration"},
        { "name": "Stephanie Geerlings" }
      ]

      The elements of a given team member entry are:
        "name":             The person's name
        "affiliation":      The name of the person's organization
        "affiliation_url":  The url of the person's organization
        "url":              The url of the person's personal web page
        "gravatar_email":   The email address associated with the person's Gravatar image.
        "avatar":           The url of the person's personal image (use this only if they do not have a Gravatar)
        "disciplines":      The semi-colon separated list of disciplines that the person brings to the team

                            The entire set of possible disciplines is:
                                  "chemistry;biology;consulting;administration;informatics"

  The elements: url, affiliation, affiliation_url, disciplines, gravatar_email, and avatar are optional. If name is
  not provided, "Anonymous" is used for their name.

  The different display cases are:

   If name, affiliation, and url provided: "Member Name, letters" as a link to the url.
   If name, url provided: "Member Name" as a link to the url.
   If name, affiliation provided: "Member Name, affiliation" without a link.
   If gravatar_email provided, the member's gravatar is obtained and shown.
      If missing, the "avatar" (if provided) image is shown.

      If neither gravatar_image nor avatar is provided, a default image (blue outline figure) is shown.

      If a gravatar_email is provided but does not correspond to an actual Gravatar (possibly a misspelling),
        a stylistic G image (the gravatar standard) is shown.

   If both gravatar_email and avatar entries are provided for a given team member, the gravatar image is used.

Sponsors
--------

  The body of the "sponsors" issue contains a JSON array, as follows:

  [
    {"name": "University of Sydney",
     "url": "sydney.edu.au",
    "image": "f.cloud.github.com/assets/1546321/620163/037d300e-cede-11e2-8e2f-e2dd51ab963c.png"
    },
    { "name": "Medicines for Malaria Venture",
    "url": "www.mmv.org",
    "image": "f.cloud.github.com/assets/1546321/620180/651b7438-cede-11e2-8706-c56f89b70947.jpg"
    },
    {"name": "Australian Research Council",
    "url": "arc.gov.au",
    "image": "f.cloud.github.com/assets/1546321/620173/2663fc4c-cede-11e2-8725-753d3de70430.jpg"
    },
    { "name": "Cloud City Development",
    "url": "cloudcity.io",
    "image": "f.cloud.github.com/assets/1546321/621382/facee53c-cf01-11e2-9456-01eee6ca7577.png"
    }
  ]

    The name and url elements are optional.

    If the name element is omitted, it defaults to the url text, if that is provided.
    If the url element is not specified for a sponsor, only the image is displayed for that sponsor.
    If all three elements are specified for a sponsor, the image is displayed and is a link to the sponsor's url,
    and the hover text is the sponsor name.


Issue_lists
===========

The body of the "issues_lists" issue is just the name9s) of the issue list repositories where each repository
name is on its own line, as follows:

OSM_To_Do_List
Second_Repo
Third_Repo

Setting up for development
==========================

When a person is designated to do further development work, the recommended approach is to set up local git
repositories on the development machine.

The following describes how to set up a developer to maintain the OSM code for the website and the osm-feeds web
application.

The assumption is that the Developer will be working on a Mac. Setting up for a Windows environment is similar, but not
covered in this guide.

Roger Dudler’s site gives a good overview for this process:

http://rogerdudler.github.io/git-guide/

On his page, click Download Git for OSX,

On the the download page, click on the most recent package (at the top of the list),
currently git-1.8.3.2-intel-universal-snow-leopard.dmg .

After it downloads, double click the downloaded packages, and follow the instructions to install it on your Mac.

In a Terminal window,

For the website code:

: create a directory /osm_website_code

: switch to that directory.

: initialize a git repo: git init

: clone the GitHub repository to your machine:

: git clone git@github.com:OpenSourceMalaria/OSM_Website_Code.git


For the osm-feeds code

: create a directory /osm-feeds

: switch to that directory.

: initialize a git repo: git init

: clone the GitHub repository to your machine:
: git clone git@github.com:OpenSourceMalaria/osm-feeds.git

Maintaining and improving the software requires someone familiar with the following:

In general:

: git

: text editing tool of some sort

website:

: JavaScript, CSS, HTML

osm-feeds:

: Ruby, Sinatra framework, heroku.com

Additional Items of interest:
-----------------------------

The website code is actually hosted as a GitHub page, which is served from the gh-pages branch. When making changes to
the website code, make sure to push those changes to the gh-pages branch of the osm_website_code repository. Changes
made on any other branch, such as master,will not be seen on the actual web page.
