# CSE 135 HW4

## Site

~~<https://www.ucsociallydead.com/>~~ Site is no longer being hosted.


## Notes

Our userAPI should be running the background, but if it is not for any reason, please contact us so we can start it again.

We have made our CORS protective to specifically expect the www.reporting... prefix, our provided links reflect this, but just in case you are trying URLs manually, we expect www.... because we want to specifically control what exact urls can access our userAPi. Also, I believe if the API is down, it will say it is a CORS error, but it is not, just the API is not running.

A note on user management, because of how our database assigns a new ID, there can be issues with deleting any row besides the last row, and then having a user register a new account. However since the user management is for admins only, we can trust admins to know of this issue and compensate by either adding a new user which has the ID of the row deleted, or, to delete a user, the admin can replace that row's info with the last row in the database's information, with a full update, and then delete the last row. Also, there are issues with both the partial and full updates that change the ID field, this will not work correctly because of how zing grid uses the id as a number of the row, when you go to update the ID field, it will treat the newly updated value for the ID, as the true id value in the DB, and so the old ID would not get updated to the new one, Also there could be potential clashes with DB if one sets the ID to an existing ID. In short, the ID should be considered a protected characteristic and we should trust the admin to manage the ID's with the database itself, if making any changes directly on the grid. 

Also, there are issues with patch for the ID and admin traits, for ID, it will not work correctly, as mentioned above, and for the admin trait, one cannot patch admin back to 0, after changing it to 1, I believe this is due to how zing grid is reading the number 0 during a patch. However, one can just do a full update and change the admin value back to 0, so the user-admin can just do that.

## Members

Tyler Le
Brendan Devlin
Chia-Han Chen

## Server Details

IP: 147.182.194.101
Username: grader
Password: ThomasPowell135


## Login info for grader(basic)

User name: grader
Email: giveUsAPlz@grade.plz
Password: aPlease135

## Login info for grader(admin)

User name: graderAdmin
Email: giveUsAPlusPlz@grade.plz
Password: aPlusPlease135


## Authentication

We are using JWT authentication with our own custom middleware, (provided in discussion) and bcrypt, rather than outsourcing our middleware to Passport. How it works is firstly a user would register, which, after sanitizing the input, would place that user's info into the user database with basic, nonadmin permissions. During this time, the sanitized password from the user is first encrypted using bcrypt, before the entry is inserted into the database. Then, when a user logs in, our authentication first makes sure the user exists, and if so, we check if the user's logging in password matches the encrypted one in the DB, by comparing them using bcrypt, which compares the hash of the logging in password with the hash in the DB. If these match, then the user is authenticated and we use jwt to sign a token that is associated with that now authenticated user and we respond to the login page with that token, setting a node in session storage to that authentication token, and the (unsigned) admin token also gets set at this time. The signed tokens have a time limit of 10000 seconds, and expire after that.

The user is then directed to the dashboard page. The dashboard page then checks this authentication token on landing, by calling to the API with that token passed in the header, which is associated with that specific user, and that token passes into the middleware to verify the user is authenticated; if it passes, the userAPI responds with a string that says if the user is valid or the middleware will reject with a generic 'no token in header' response, to obfuscate that their token was invalid, and not just missing. Then, if the user is not valid, the dashboard page would redirect the user back to the login. Otherwise, the dashboard would load. If the user is an admin, they will also see the user management link at the top of the page. If an admin goes to that page, the zing grid we are using for CRUD calls to our user api by using a modified version of the middleWare, that also verifies if the user is valid, and also if they are an admin; if they are not an admin, the CRUD grid would not populate with a generic 'unable to read database', if it didn't also redirect the user back to the login page first. If they are not a normal user, and tried to just go to the users page, they would be redirected back to the login page and stop there, since they fail user authentication. If they are a normal user, they would be directed back to the login page, but would then would be quickly directed back to the reporting page, if they already had the credentials, we do a user check to our secure api, like above, on the login page as well, so if a user has logged in recently, they will still have a valid token and will skip the login page and go directly to the dashboard.


We decided this approach because we wanted to have full control over the middleware, and know exactly what is is doing and how it works. Also, since this is a class and a learning experience, we thought it would be better to try and use our own middleware, (used/modified from the code from discussion) so we can better understand middleware and what it is doing, rather than just using someone else's product and assuming it works, without looking under the hood as much. Also, since this was provided code from the discussion, we thought it would be a good choice to use because we can more easily get TA support if needed.




## Dashboard

Firstly, our overall focus of the dashboard, is to question about our users. We will also note that the first metric has two different charts for it, two different views. the first metric is broadly questioning about where our users come from, by using the language/regional indicator as a kind of shorthand for region. The first chart is a pie chart to show the relative amount of users from each region we have. This is useful because it allows an idea to stand out, that most of our users come from 2 regions. The user region is null if they had javascript off. Next to it, we have a very similar chart that shows a concentration gradient of users, in their country on a world map. This is useful because we can now more easily geolocate where our users are actually coming from, and, we now have raw counts of each user by country, when we use the tool tips on mouseover for the map chart. This chart is a static chart, using data collected on 6/3/23, whereas the pie chart is dynamic. From this, we can see that we gained a lot more Taiwanese users these last few days. Fundamentally, we want to know about our users to then improve our site. We would want increase our user base, and improving our site for the users who use it most, could do much in forwarding that goal. These two charts work togther to inform this metric.

Our grid represents our second metric, which questions how many of our users accept the various forms of content on our site. Again, we are wondering how our users behave to hopefully improve our site for them. The grid lists each user, and their acceptance policies for cookies, javascript, CSS, and images. And, we then have an aggregate as part of the grid, which computes the acceptance rate of those 4 main units. It is useful to list the specific values of each of those attributes next to the percentage so the observer can clearly see which categories are being accepted more or less. Moreover the reader can look over and check all entries if they wish to expand out the grid. We believe it can be useful for the reader to have access to the underlying data, listed in an obvious way, next to a computation of that data. This content acceptance is a good query when we want to know who our users are and how they behave in terms of the content of the site. For instance, if we saw many users do not allow cookies, we might want to try and use hidden form fields to better sessionize our users. Yet also, knowing the percent acceptance average is useful for overall content planning, if it was often 50% or lower, that might indicate we should make more radical changes to our site, since we try to use those content types frequently. The overall average user acceptance statistic is on the top of the percent acceptance column. From that, we see that we have 95% content acceptance from our users, which does appear to be good, but again, what content is being accepted, matters, so it is useful to list the specifics as well.

Our third metric is represented by our third chart, which is a scatterplot. It is a scatter chart of recent user mouse locations, including clicks. We note that we have arranged our x and y axes so that it is like we are viewing a user screen. This chart is useful because we again, would like to know how our users use our site, to better optimize it if we can. We might want to rearrange our links so the user doesnt have to move their mouse so much to click on them. Also, we truly see that most of user mouse activity is concentrated in the top left quadrant of the landing screen. Moreover, most of the activity is actually to the right of where our first section of links are. This indicates to us that perhaps we should move those over, so that the user's mouse is right where it could be most useful. However, this bears more investigation and experimentation, because perhaps the users are purposely moving their mouse away from the first section of links, to avoid clicking them as they start to browse the page.

Also, because we are recording so many users with this metric, the colors are repeating themselves and causing some users to wash into other users, making it impossible to tell the difference between two users with the same color. However, this is still very useful for us because we want to know how users overall are behaving with their mouse, and not how any one specific user acts. We should mention, there are potential flaws in this metric, for the previous reason and because we are really only seeing the first screen of our page, and not where our users are if they scroll down. 


We also have a toggleable switch at the bottom of the page, to view the full static, activity, and performance grids from our database, if the reader would like to view for themselves, or investigate something further. We made it toggleable to avoid cluttering the page, but to give the reader the option, if they desire.





## Report


Our larger question, from the dashboard, for our chosen metric, (the first one on the dashboard) was "Who are our users/where are they from?". From that larger, guiding question, we developed a more directed compound question. That question was, "Does user region/language affect performance and/or user behavior and does that resulting regional performance in turn, affect user behavior?" We sought to answer that question by first framing or grouping our thoughts around user region/language, since that is a foundational part of our question. 

Our first chart, (which has a toggle for reading options, if the user wishes) is a 2 (or 3) series bar chart which groups by user region, and then displays the the average idle time and average onsite time for each region as bars. This is a very useful chart type for our purposes because we want multiple things; we want the quickdraw hueristic of a user using the areas of the bars to relatively compare the two bars per region, and to be able to compare the regions between each other as well. And we want the raw informational power of a chart with a numbered scale, with the mouseover tooltips for the values of each bar available. We potentially could have made pie charts for each region that would have lots of tool tips and labels, but that is not nearly as scalable as a bar chart. And indeed, even with only 6 regions available, we would need a pie chart for each region as well as 2 overall piecharts to compare between the regions, for each category. This would be very impractical. Clearly, a bar chart is a good choice for all our purposes. The toggled chart is another version of the previous chart, with the difference between idle time now being directly shown on the chart for ease of reading. The data represented by these charts is very informative for us, because we want to know user behavior; and a good baseline conception of user behavior is how much time they they spend actively using the site, vs the time they spent idle. If all our users were to only idle, that might indicate our site is not very usable, or they specifically are having trouble using it, (perhaps region based) or maybe that we have a bot problem. 

This first chart also works in conjunction with my other (extra) chart, which is a 2 series bar chart that also groups by region. This chart shows the average load time with the average onsite time. This, again, is due to asking questions of the first chart, and responding to our second part of the question, which is, does region affect performance which affects behavior? We can see that one region, the english speaking US, not only has the most onsite time by far, but also has nearly the lowest load time. These charts might indicate that regional performance does indeed have an impact on users actually using the site, perhaps due to network constraints. 

We will note that the Onsite time metric might be flawed due to trouble collecting the data accurately, often the user might leave the page without it being recorded; but it is the best metric we have to determine onsite time so far, and we really would like to know onsite time, to gain some baseline ideas about user activity. Onsite time is reflected only by the users who have a valid leaving time, which might be biasing/selecting our data some. 

Our next report section is twofold, firstly, it is a grid with datapoints about the question we are asking, like region, connection type/load time, (which speak to performance) if a user is active or not, and their onsite time. This actively lists the data from which our charts are generated, which again works together with our other charts. Now the reader can know exactly where the data is coming from in an organized fashion. The reader can scour and look through the grid data to better inform their reading of those charts, and to also just gain the useful knowledge the grid displays. This grid is a selected mix of both the activity and static data tables, combining them together in an easier to read way, for our user behavior/region purposes. And, also, it includes a new column, a boolean indicating if a user is active or not. We compute this from our activity data and if the user has absolutely no interaction with the site, (mouse or keyboard interactions) they are not considered active. This grid segues nicely into the second part of this report section, which is the computed bounce rate for our users. We compute this by using the active column created in the aforementioned grid. We compute the bounce rate by using the users who never interacted with the home page at all, if they did not, they are considered bounced. From our bounce rate of ~18%, we can see that most users do not bounce without interaction on our site. This is a good indication to us that our site is useable, which might contradict the data analysis of regions Taiwan and Japan, which have very high idle times, which seems to indicate those regions are having trouble using the site. Ultimately, we would like to do more studying and even deeper questioning of our underlying ideas, to get to more concrete conclusions. 

There is much more analysis of the report charts on the reporting page itself.

As a note, from the grid, we can spot the flaws in the Onsite time metric, as many users do not have a value, since it was not correctly collected. We should perhaps look into how we collect this data, or try to find a better statistic to use. 
