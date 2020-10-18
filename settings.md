build the find communities screen.

send a request from front-end with the point where the user wants to retrive the communities. it can be its real ,location or a serached location. The

Use \$geoWithin, take a look to park your tir places controller, to respond with an array of places within 100 km let's say.

use flatlist in a screen which render all the communities around that place.

please note this is not the same screen as myCommunities. this last is displayng the user active comminties fetched from the myCommunities array in user document.

Render a marker for each community found in taht radius in a Community screen. On clik on a marker, take the user to the MyCommunity screen where the community data is loaded. Use a componet to render thr community data. You make the componmet resuseble for provider on create community also.
