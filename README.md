# NC-News API

In order to use this API for your front end project you will need to fork this repo and host following the instructions below.

## Hosting a PSQL DB using Heroku

There are many ways to host applications like the one you have created. One of these solutions is Heroku. Heroku provides a service that you can push your code to and it will build, run and host it. Heroku also allows for easy database integration. Their [documentation](https://devcenter.heroku.com/articles/getting-started-with-nodejs) is excellent, so take a look at that. This document is essentially a more condensed, specific version of the steps described in the Heroku docs.

## 1. Install the Heroku CLI

On macOS:

```bash
brew tap heroku/brew && brew install heroku
```

...or Ubuntu:

```bash
sudo snap install --classic heroku
```

## 2. Create a Heroku App

Log into Heroku using their command line interface:

```bash
heroku login
```

Create an app in an active git directory. Doing this in the folder where your server exists is a good start, as this is what you will be hosting.

```bash
heroku create your-app-name
```

Here `your-app-name` should be the name you want to give your application. If you don't specify an app name, you'll get a random one which can sometimes be a bit iffy.

This command will both create an app on Heroku for your account. It will also add a new `remote` to your git repository.
Check this by looking at your git remotes:

```bash
git remote -v
```

## 3. Push Your code up to Heroku

```bash
git push heroku master
```

## 4. Creating a Hosted Database

Go to the heroku site and log in.

- Select your application
- `Configure Add-ons`
- Choose `Heroku Postgres`

The free tier will be adequate for our purposes. This will provide you with a `postgreSQL` pre-created database!

Check that the database exists. Click `settings` on it, and view the credentials. Keep an eye on the URI. Don't close this yet!

## 5. Seeding the Production Database

Check that your database's url is added to the environment variables on Heroku:

```bash
heroku config:get DATABASE_URL
```

If you are in your app's directory, and the database is correctly linked as an add on to Heroku, it should display a DB URI string that is exactly the same as the one in your credentials.

Make sure to **run the seed prod script** from your `package.json`:

```bash
npm run seed:prod
```

Commit your changes, and push to heroku master.

```bash
git push heroku master
```

## 6. Review Your App

```bash
heroku open
```

Any issues should be debugged with:

```bash
heroku logs --tail
```
