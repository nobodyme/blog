---
title: Fetch images from reddit for your desktop wallpaper, python beginners.
date: "2018-07-14T08:40:32.169Z"
---

_“There’s always somebody who’s just began who you can help and there’s always somebody who did the same mistake and can help you”._

Just when I let that sink in, I called up my friend who wanted some wallpapers for her newly installed Ubuntu system. Me being the frequent lurker on reddit loved the pictures in subreddits like [itookapicture](https://www.reddit.com/r/itookapicture/), [cozyplaces](https://www.reddit.com/r/CozyPlaces/) and [wallpapers](https://www.reddit.com/r/wallpapers/) and wrote up a simple program to grab those and then set up as Desktop-slideshow using an app called [Shotwell](http://shotwell-project.org/doc/html/) when I was in the same position. So I just sent her over the link of the [repo from github](https://github.com/nobodyme/reddit-fetch), while she was more than pleased to have it, she wanted to know how it does as well. I thought to myself, well she already knows basics of python so it mustn't be that hard. So I started off with _“so clone the github repo and then do pip3 install -r requirements.txt, oh maybe use the virtualenv as well, so you don’t install the packages globally but just for the project and then we call the reddit’s open-api …“_ and I realized she was already left scratching her head even before the coding part began.

That’s when I realized I was in the same page as well, I couldn't even understand how all the code came together even when I was given the link to the github repo few years back. I wouldn't know where to start, why certain things are done, blindly follow instructions and wouldn't know how to fix it when it breaks. So for all you folks out there who just started learning python variables, if conditions, switch statements and for loops from some website, maybe this article will help you fill the missing parts that’ll get you going.

So what do we have on our plate?

All we need to do is ask reddit to give us the pictures from the subreddits we want so that we could store them somewhere in a file and later use shotwell for slideshow.

But how do we do that?

Understanding APIs and JSON
===========================

What happens generally when you go to a link is that, your browser will send a request to the server like, _“Hey, can I wanna see the contents on this one, send this to me as HTML, please”_ and then server responds to the request as a HTML page like the one you’re viewing right now because HTML is more friendly to humans. But we want our program to fetch the pictures right? So we need a response that’s friendly to parse by code but how does our program talk to the reddit server? We want a interface which our program can talk to, just like we do through our browser. This is called an **API (application programming interface)** and every application these days have an interface where programs can talk to and fetch information, some publicly available, some private, some available with paid subscriptions for their services. What this API commonly returns is data in a format called **JSON** which stands for Javascript Object Notation and it is this format that our program will be easily able to parse and get us our wallpapers and it is just a bunch of key, pair values similar to a dictionary in python which you will all be familiar with.

So how do I get this JSON data from reddit?

It’s easier than you think, reddit follows the [OPEN-API standard](https://en.wikipedia.org/wiki/Open_API) and just placing .json after the link gives you all of the data in JSON format, maybe try this in your browser [https://www.reddit.com/r/wallpapers.json](https://www.reddit.com/r/wallpapers.json) those random data that you see is exactly what we need and if you look closely it will have all the information that you see on the web page in the form of a python dictionary.

<div>
<img src="https://miro.medium.com/max/1400/1*uWXEspsNZwQFieM-cJBt4A.png" width="100%">
<center><i>Json data from reddit prettified using firefox</i></center>
<div>
</br>

Now how do we obtain that data in code? Simple, just import the requests library,

```
import requests
url = ‘https://www.reddit.com/r/wallpapers.json'
response = requests.get(url)
if not response.ok:
 print(“Error”, response.status_code)
 exit()
data = response.json()
print(data)
```

[Requests](http://docs.python-requests.org/en/master/) library just simplifies these HTTP calls for you, requests a url returns a request object with a bunch of information which we can use to know if the request was successful, like we can ask, Was the response ok(200)? Can we parse the data now? If not we can code our program to fail silently. That should print the data you saw on the browser right in your terminal or nope you would probably get an error stating **“No module named requests”** _(or if you already have requests installed you would get a “Too many requests, error 429” which we will be handling down the line. Either way it’s good that you follow along without skipping to that)_

Well if you google, you’d come up with something like do,

`sudo pip install requests`

That sure works, but what this does is, it install the requests library globally for your system. You’d think it’s convenient since it will be available for another program that uses requests as well, you wouldn't have to run the command again but think about the case where different programs use different versions of the same library. That’s a conflict you do not want to handle plus let’s say you’re sharing this code to a friend of yours or posting it on github, you would ideally like to have a list of the packages/libraries your code depends on, so to say, _“Hey, this is the list of packages you will need to run my code, so just install these”_. Convenient right? So that’s what we will do.

Understanding VIRTUALENV and PIP
================================

1.  We need an isolated environment where we can install libraries just for our program.
2.  We will then need the list of libraries our code uses along with the exact version so that we can share it along with our code.

So let’s try and install something called a virtualenv, which let’s us create this nice comfortable isolated environment for our program. _Of course you could also use_ [_pipenv_](https://docs.pipenv.org)_._

So if you’re on ubuntu do follow the instructions below, if you’re on windows or mac you could [try this link here](https://packaging.python.org/guides/installing-using-pip-and-virtualenv/).

```
sudo apt-get install virtualenv
sudo apt-get install python3-pip
```

PIP is the recursive acronym for “Pip install Packages” commonly used for installing python packages or libraries. So since both pip and virtualenv is installed, lets set-up our development environment for our program.

Go to the project folder and then type,

```
# creates directory called env
virtualenv -p python3 env# activates the env directory so that our program's packages will be installed in it
source env/bin/activate
```

You should see a (env) sign before your prompt, if so, we are good to go.
Now that our development environment is setup, let’s install the requests package.

Installing requests module
==========================

```
pip3 install requests
```

Now this will place the package and it’s dependencies in the local folder. Great we have our package installed isolated for our program.

Now if we want to list the packages our program depends on, we can just do,

```
pip3 freeze > requirements.txt
```

This lists out all the dependencies and puts it into a file called requirements.txt. So now you can send over this file and say, _“Hey just install the ones in these files and my program will work fine”_.

Just in case you want to install your friend’s program and he has sent you his file of dependencies, you can just do that by,

```
pip3 install -r requirements.txt
```

Suppose you want to go outside our program’s environment, you can just do type, “deactivate” at the prompt.

Edge Cases
==========

So now that we have installed requests and everything is set, let’s run our program.

You would either see the data printed on your terminal or you would probably be greeted with this error message on testing for quite a while **{‘message’: ‘Too Many Requests’, ‘error’: 429}**.

There are certain limits on how much you can access the reddit API and your python code sets up some default user-agent for accessing the API. Since many people would probably use the default one, you quickly run out with the number of times you can request the data and that error is just reddit’s way of telling you, _“Hey, you’re sending too many requests my way”_. There are two ways to mitigate that,

1.  You can set up a custom header when you request data from the API like, `response = requests.get(url, headers={'User-agent': 'your-bot-name 0.1'})`
2.  Or use the [reddit’s PRAW library](http://praw.readthedocs.io/en/stable/getting_started/quick_start.html) by creating client ID and app ID with reddit.

Although the second one is easier in the long run. For the purpose of our application we will stick with the former.

Now that we reliably get the data, let’s see how we can parse it for the information we need. We basically need the image’s url so that we can use it to download the picture. As we already know, JSON data is similar to a dictionary. So just searching for URL in the data and it’s location should help you understand how to obtain it.

```
# array of posts in the page
data = response.json()['data']['children']
# get first post from array of posts
first_post = data[0]['data']
# get the image url of the first post
image_url = first_post['url']
```

Now that we have the url of the image, let’s download that and store it in a file as well.

```
image = requests.get(image_url)
if(image.status_code == 200):
    output_filehandle = open('image1.jpg',mode='bx')
    output_filehandle.write(image.content)
```

Now we have got the image of the first post in the page. Depending upon a number of things our application could break resulting in an error.

If you look closely we have assumed that the image is of the type “jpg”, secondly we assume that a file called “image1.jpg” is not already present. Now although the first case might not throw you an error, you won’t be able to open up the image since it may not be of the right format and the second case will throw **_file already exists_** error. And for our application we are going to have the tile of the post as the file name of our image.

So our code now looks like,

```
import requests
url = 'https://www.reddit.com/r/wallpapers.json'
response = requests.get(url, headers={'User-agent': 'your-bot-name 0.1'})
if not response.ok:
    print("Error", response.status_code)
    exit()
data = response.json()['data']['children']
first_post = data[0]['data']
image_url = first_post['url']
image = requests.get(image_url)
# checks url and sets appropriate extension for the image file
if '.png' in image_url:
    extension = '.png'
elif '.jpg' in image_url or '.jpeg' in image_url:
    extension = '.jpeg'
if(image.status_code == 200):
    try:
        output_filehandle = open(first_post['title'] + extension, mode='bx')
        output_filehandle.write(image.content)
    except:
        pass
```

Now your program may work or may not still work as intended as we have two other edge cases to handle which you will only discover when you have tried different sets of data. If your program currently doesn't work good for you, you have a set of data that presents you the edge case right at the beginning. Yes, it’s better you stumble upon these at first than build everything and wonder what went wrong. So what’s the error?

The problem with these image links is that a lot of times image links on reddit are from **imgur** and **_sometimes_** imgur links don’t open up as image files but rather as a page with collection of images. Try the blow URLs yourself.

1.  Normal url: [https://i.redd.it/qcqy40krxn911.png](https://i.redd.it/qcqy40krxn911.png) (or .jpeg with extensions)
2.  Imgur url: [https://imgur.com/zXpT3vJ](https://imgur.com/zXpT3vJ)

Therefore in the second case, your program will try to download the HTML file as binary. On trail and error by opening the image on a new tab or by appending “.jpeg” to the URL you will find that it opens up as an image file just like the others, if it already doesn't open as one.

And sometimes the images uploaded are **removed** as well, the link will direct to a thumbnail denoting the image has been removed. We don’t want that to clutter our list of wallpapers. So let’s handle these cases in our code as well.

```
import requests
url = 'https://www.reddit.com/r/wallpapers.json'
response = requests.get(url)
if not response.ok:
    print("Error", response.status_code)
    exit()
data = response.json()['data']['children']
first_post = data[0]['data']
image_url = first_post['url']
if '.png' in image_url:
    extension = '.png'
elif '.jpg' in image_url or '.jpeg' in image_url:
    extension = '.jpeg'
else:
    image_url += '.jpeg'
    extension = '.jpeg'
# prevents thumbnails denoting removed images from being downloaded
image = requests.get(image_url, allow_redirects=False)
if(image.status_code == 200):
    try:
        output_filehandle = open(first_post['title'] + extension, mode='bx')
        output_filehandle.write(image.content)
    except:
        pass
```

Now your code should work perfectly for all cases and now you check the image file that’s downloaded. Since we have successfully downloaded image of the first post, let’s do that for all posts. By default we get a list of 25 posts for more posts say 100, we could modify the url as,

```
url = '[https://www.reddit.com/r/wallpapers.json?&limit=10](https://www.reddit.com/r/wallpapers.json?&limit=10)0['](https://www.reddit.com/r/wallpapers.json')
```

Now that our url is set let’s loop over all posts to retreive all images.

```
import requests
url = 'https://www.reddit.com/r/wallpapers.json?limit=100'
response = requests.get(url)
if not response.ok:
    print("Error", response.status_code)
    exit()
data = response.json()['data']['children']
for i in range(len(data)):
    current_post = data[i]['data']
    image_url = current_post['url']
    if '.png' in image_url:
        extension = '.png'
    elif '.jpg' in image_url or '.jpeg' in image_url:
        extension = '.jpeg'
    elif 'imgur' in image_url:
        image_url += '.jpeg'
        extension = '.jpeg'
    else:
        continue
    image = requests.get(image_url, allow_redirects=False)
    if(image.status_code == 200):
        try:
            output_filehandle = open(current_post['title'] + extension, mode='bx')
            output_filehandle.write(image.content)
        except:
            pass
```

Now that’s it, we have got our sets of images downloaded and I added the else part so that the program doesn't break for cases that we still haven’t encountered. Now that you have the pictures downloaded you can now use Shotwell to [setup a desktop slideshow](http://shotwell-project.org/doc/html/share-background.html) by selecting all of these images in your machine.

Conclusion
==========

But as you know ideally we would want to supply data to the program as a user, we can’t keep modifying the program if we wanted pictures from a different subreddit or more number pictures. Personally, I would even like to supply a series of subreddits to fetch from at a point and download each in a separate folder.

There are few other edge cases that you would face while handling different sets of data as well. For example, we set the file name to the title of the post, sometimes the titles may contain special characters which might not be a accepted file name format in your operating system. Sometimes the title might be too long that your OS doesn't permit it as a valid file name.

You would see all of these improvements handled right here, in my [code on github](https://github.com/nobodyme/reddit-fetch/blob/master/grab_pictures.py). I will also post a snippet below.

You will also find a similar program which fetches the [comments of a reddit post](https://github.com/nobodyme/reddit-fetch/blob/master/fetch_comments.py) in a file in the same repo. Hope it is of some help. Put your questions below. Maybe give me a pull request if something can be improved. Cheers!