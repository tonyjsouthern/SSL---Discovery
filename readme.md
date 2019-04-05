# SSL - Discovery

### This application performs the following:

  - Runs a query against a database and gathers a list of CNAMES
  - Resolves those CNAMES to ensure they direct to a certain endpoint
  - Resolves the SSL Certificate for those CNAMES
  - Writes the expiration date to Results.txt

### Installation:
  - Install the latest version of Node.Js: https://nodejs.org/en/
  - Download or clone the repository
  - `CD` into project directory or unzipped location
  - run `npm install`

To start the application simply run `npm start`

### Results
Results can be found in the Results.txt file located in the root project directory. This file will automatically be removed and re-created each time the application is ran.

### ENV file
This application uses a .env file to store environment variables. Simply create a file named ".env" in the root directory and use the following format:

DB_HOST=MSSQL server here

DB_USERNAME=MSSQL username here

DB_PASSWORD=MSSQL password here

DB_DATABASE=database name here

DB_QUERY=database query here


### Formatting Results
To format the output copy and paste the results.txt file into Excel and perform the following:
1) On the data column select "Text to Columns"
2) Click Next
3) Check ONLY the comma box and click next
4) Click Finish
