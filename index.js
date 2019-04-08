var fs 				 = require("fs");
var sslChecker = require('ssl-checker')
var dns				 = require('dns-then');
var Connection = require('tedious').Connection;
var sql				 = require('sequelize');
var key        = require('./key.js')
require('dotenv').config();

var config = {
    host: key.db_host,
    port: "1433",
    dialect: "mssql",
    userName: key.db_username,
    password: key.db_password,
    database: key.db_database
};

var query = key.db_query;
var customerArray;

init();

async function init() {
    await checkResults();
    await getCustomerCnames();
    await loopCustomers();
}

function checkResults() {
    fs.readFile('./Results.txt', function(err, data) {
        if (data) {
            return fs.unlink('Results.txt', function(err) {
                console.log('Results.txt deleting and generating new results file.');
            });
        } else {
            return
        }
    });
}

async function getCustomerCnames() {
    var connection = await new sql(config.database, config.userName, config.password, config);
    await connection.query(query).spread((results) => {
        customerArray = results;
        console.log("Total customers to check: " + results.length);
    })
}

async function loopCustomers() {
    for (const customer of customerArray) {
        try {
            var resolved = await runDnsResolve(customer.hostedlink)
            if (resolved == true) {
                var results = await sslChecker(customer.hostedlink)
                var stringData = customer.customername.replace(/,/g, '') + "," + customer.customer_id + "," + convertDate(results.valid_from) + "," + convertDate(results.valid_to) + "," + results.days_remaining + "\n";
                await writeData(stringData)
            }
            console.log(await "Ran check on customer " + customer.customername + ": " + resolved + ".");
        } catch (e) {
					return
				}
    }
}

async function runDnsResolve(domain) {
    try {
        var result = await dns.resolveCname(domain);
        if (result[0] == 'hostssl.msgapp.com' || result[0] == 'eu.hostssl.msgapp.com') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
      return false;
    }
}

async function checkSSL(domain) {
    return sslChecker(domain)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.log(error);
        });
}

function convertDate(d) {
    var parts = d.split(" ");
    if (parts[1] == '') {
        return parts[0] + "-" + parts[2] + "-" + parts[4];
    } else {
        return parts[0] + "-" + parts[1] + "-" + parts[3];
    }
}

function writeData(resultSet) {
    return fs.appendFileSync("results.txt", resultSet, (err) => {
        if (err) throw err;
    });
}
