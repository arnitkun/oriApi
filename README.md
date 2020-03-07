## Steps to run

Go to the root directory.

1. Run `npm install`.
2. Run `npm start`.

The api runs on `localhost:3000`.

Usage:

Make a `post` request to `localhost:3000` with the following data:

`{
	"user_type": "customer" or "admin" or "bot"
	"timezone": any timezone example such as, "Asia/Kolkata" 
	"timescale":"hour" or "day"
}`