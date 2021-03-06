# earworm

<strong>Team Contributors:</strong> Bryan Isles, Israel Peck, Laura Ward & Rafal Kociolek

Thank you for checking out EarWorm! If this document does not satisfy your curiosity about this project, please visit the website, the source code, or contact a member of the project team.

<strong>Description:</strong> Users can enter the song lyrics stuck in their head, and our site will return the best match for that song (using MusicXMatch), display the lyrics of the song (using MusicXMatch), show informational links for the artist (using Wikipedia), display a picture of the artist (using audioscrobbler), show results for any upcoming shows for that artist - with a link to buy tickets (using Bands in Town), and then map the locations of the concert venues (using Google Maps).

<li>This README will cover:
   <p></p>
   <ul> 1. IDEATION </ul>
   <ul> 2. PROBLEM STATEMENT </ul>
   <ul> 3. PROJECT SCOPE </ul>
   <ul> 4. TEAM ORGANIZATION </ul>
   <ul> 5. TECHNICAL OVERVIEW </ul>
   <ul> 6. PRODUCT RESULT </ul>
   <ul> 7. LESSONS LEARNED </ul>
 </li>
 --------------------------------------------------------------------------------------------------------------------------------------

<strong>Background:</strong> This project was assigned to our team on a quick turn-around deadline (2 weeks). We were a newly formed team that did not have any prior experience working together. We were tasked with creating a user-input-based application, but we were given total freedom in terms of direction and purpose. 

The assignment required that we meet the following specifications:

- Must use at least two APIs
- Must use AJAX to pull data
- Must utilize a new library / technology that we haven't discussed
- Must have a polished frontend /UI
- Must meet good quality coding standards
- Must not use alerts, confirms, or prompts
- Must have some sort of repeating element (table, columns, etc)
- Must use Bootstrap or alternative CSS framework
- Must be deployed on Github pages
- Must have user-validation

 --------------------------------------------------------------------------------------------------------------------------------------

<strong>1. IDEATION</strong>

Our team used the ideation process to accomplish three things: 1) To get acquainted and align on our personal interests, 2) To explore the complements and gaps in our skill-sets, and MOST IMPORTANTLY 3) Agree on a great idea for this project.

In the process, we discussed our backgrounds, our interests and what types of technology inspire us. The topics we touched on included basic ideas such as: "something attractive and fun", "something practical, but cool", "something I could share with friends and family", "something that solves a simple problem". 

In the end, we all agreed that MUSIC was something we all feel passionate about. But what? 

After several more discussions, we settled on a high-level scope, and a name: "EarWorm". 

 --------------------------------------------------------------------------------------------------------------------------------------

<strong>2. PROBLEM STATEMENT</strong>

"No single location for comprehensive band info - based off lyric search"

In other words: Where could you go on the internet, if you wanted to type in a few words, and find out everything you could ever want to know about a song or a band? MusixMatch had some stuff. BandsInTown had some stuff. Wikipedia had some stuff.   

Wouldn't it be cool if someone would combine all of those? 

 --------------------------------------------------------------------------------------------------------------------------------------

<strong>3. PROJECT SCOPE</strong>

Once the problem statement was complete, we needed to begin scoping out the work. We did this in the following steps:
<p></p>
<ul>a. We agreed what features we wanted at a high-level </ul>
<ul>b. We separated to research the plausibility of each of those features </ul>
<ul>c. We reunited to compare the findings from our individual research </ul>
<ul>d. We did some group research on more complex topics or feature decisions </ul>
<ul>e. We refreshed our scope - removing and adding features </ul>

Aaaand we pulled the trigger....

 --------------------------------------------------------------------------------------------------------------------------------------

<strong>4. TEAM ORGANIZATION</strong>

As the team was scoping the work, we began by researching topics that were of interest to us individually. Those early discussions resulted in a natural work-flow, as we began to organize ourselves for the technical build-out of EarWorm. It went like this:

From the onset, <strong>Bryan</strong> was interested in music players and Materialize. When the music players didn't pan out (due to issues out of our control), Bryan doubled-down on the Materialize scope and began to dig into the Wikipedia and last-FM APIs.

Pursuing his interests in live concerts, <strong>Raf</strong> took on the BandsInTown interface, and contacted the company by email to request API access. Once granted, he coded the AJAX for the BIT API and also integrated CORS-anywhere (a critical piece of EarWorm's technology)

As the tip of the spear, <strong>Laura</strong> began testing lyric recognition from MusixMatch. She developed the first critical JS plug-in, which would be required to feed data to the rest of the queries. She finished early and then switched focus to more front-end.

Chasing his wildest dreams, <strong>Israel</strong> tackled the Google Maps API. This challenge proved to be sufficient, and he spent many happy hours fixing errors and chasing bugs on marker displays. The result was also sufficient.

In the beginning, each of the team members focused exclusively on back-end execution with their respective APIs. Once Bryan had the Materialize front-end setup and the basic JS was working, the team members took turns tweaking and enhancing the UI. 

The last step was to ensure a "production grade" launch of the technology. We did this by taking turns and performing a series of front-end user-tests and back-end code reviews (error-checking, bug-fixes, and finalized coding notations). 

 --------------------------------------------------------------------------------------------------------------------------------------

<strong>5. TECHNICAL OVERVIEW</strong>

EarWorm is primarily written in JavaScript, with dynamic HTML & CSS. The styling of the app is drawn from the Materialize framework, which provides the glossy skin. And in the background, an army of APIs deliver everything you want to know about that lyric/song/artist.

<Languages> JavaScript, HTML, CSS
    
<Frameworks> Materialize
    
<APIs> CORS-Anywhere-Heroku, MusixMatch, BandsInTown, Google Maps, Wikipedia & Audioscrobbler

The APIs run in a sequential fashion like such:
<p></p>
<ul>User Input: lyric/song/artist > </ul>
<ul>MusixMatch: finds the song, band and lyrics > </ul>
<ul>BandsInTown: finds the band's touring schedule and available tickets > </ul> 
<ul>Google Maps: plots the upcoming tour venues in a nifty visual > </ul> 
<ul>Wikipedia: provides content about the band > </ul>
<ul>last-fm: provides a photo of the band > </ul>
<ul>Audioscrobbler: provides a band photo> </ul>
<ul>And CORS-Anywhere... well, let's just say there's some magic going on there. </ul>

 --------------------------------------------------------------------------------------------------------------------------------------

<strong>6. PRODUCT RESULT</strong>

See for yourself: https://therealizzi.github.io/earworm/

 --------------------------------------------------------------------------------------------------------------------------------------
 
<strong>7. LESSONS LEARNED</strong>

Taking a step back to reflect on the final product, we concluded a few things to try on our next project:

DO MORE
- Use "feature" naming conventions for GitHub branches - this makes merging and hand-offs much easier
- Collaboration on each other's code - error checking for example
- Use Materialize on other projects - it rocks!

DO LESS
- Manual file-merges (see also: "Don't Do")
- Multi-tasking, trying to get too much done at once
- Rushing and pushing code out

DO INSTEAD
- Establish a project manager in the beginning, to keep ourselves organized
- Add a full "pseudo-coding" phase, to thoroughly think through the technical aspects

DON'T DO
- Merge code outside of the Github environment
- Merge code without using branches
- Merge code manually

 --------------------------------------------------------------------------------------------------------------------------------------

The End
